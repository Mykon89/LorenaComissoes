// Guarda os dados do sistema no Upstash Redis (Vercel → Storage → Upstash for Redis).
// Variáveis de ambiente: KV_REST_API_URL, KV_REST_API_TOKEN (criadas pela integração).
// SENHA é opcional: sem ela, a senha digitada no primeiro acesso fica gravada (hash) no banco.
const URL_ = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
import { createHash, timingSafeEqual } from 'crypto';

const CHAVE = 'lorena-comissoes';
const CHAVE_SENHA = 'lorena-comissoes:senha';
const hash = (s) => createHash('sha256').update(`lorena:${s}`).digest('hex');
const iguais = (a, b) => a.length === b.length && timingSafeEqual(Buffer.from(a), Buffer.from(b));

async function redis(path, body) {
  const r = await fetch(`${URL_}/${path}`, {
    method: body === undefined ? 'GET' : 'POST',
    headers: { Authorization: `Bearer ${TOKEN}` },
    body,
  });
  if (!r.ok) throw new Error(`redis ${r.status}`);
  return (await r.json()).result;
}
const ler = async () => JSON.parse((await redis(`get/${CHAVE}`)) || '{"ver":0,"db":null}');

async function senhaOk(senha) {
  if (!senha) return false;
  if (process.env.SENHA) return iguais(hash(senha), hash(process.env.SENHA));
  const salva = await redis(`get/${CHAVE_SENHA}`);
  if (salva) return iguais(hash(senha), salva);
  if (senha.length < 4) return false;
  await redis(`set/${CHAVE_SENHA}`, hash(senha)); // primeiro acesso define a senha
  return true;
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (!URL_ || !TOKEN) return res.status(503).json({ erro: 'nao_configurado' });
  const senha = String(req.headers['x-senha'] || '');
  try {
    if (!(await senhaOk(senha))) return res.status(401).json({ erro: 'senha' });
    if (req.method === 'GET') return res.status(200).json(await ler());
    if (req.method === 'PUT') {
      const atual = await ler();
      const { ver, db } = req.body || {};
      if (!db || !Array.isArray(db.vendas)) return res.status(400).json({ erro: 'dados_invalidos' });
      // outro aparelho salvou antes: devolve a versão atual para o navegador recarregar
      if (ver !== atual.ver) return res.status(409).json(atual);
      const novo = { ver: atual.ver + 1, db, em: new Date().toISOString() };
      await redis(`set/${CHAVE}`, JSON.stringify(novo));
      return res.status(200).json({ ver: novo.ver });
    }
    return res.status(405).json({ erro: 'metodo' });
  } catch (e) {
    return res.status(502).json({ erro: 'banco', detalhe: String(e.message || e) });
  }
}
