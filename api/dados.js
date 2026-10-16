// Guarda os dados do sistema num Redis ligado ao projeto na Vercel (Storage).
// Aceita REDIS_URL (Redis Cloud / integração "Redis") ou KV_REST_API_URL + KV_REST_API_TOKEN (Upstash).
// SENHA é opcional: sem ela, a senha digitada no primeiro acesso fica gravada (hash) no banco.
import { createHash, timingSafeEqual } from 'crypto';
import { createClient } from 'redis';

const REST_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const REST_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const REDIS_URL = process.env.REDIS_URL || process.env.KV_URL;
const CHAVE = 'lorena-comissoes';
const CHAVE_SENHA = 'lorena-comissoes:senha';
const hash = (s) => createHash('sha256').update(`lorena:${s}`).digest('hex');
const iguais = (a, b) => a.length === b.length && timingSafeEqual(Buffer.from(a), Buffer.from(b));

async function rest(path, body) {
  const r = await fetch(`${REST_URL}/${path}`, {
    method: body === undefined ? 'GET' : 'POST',
    headers: { Authorization: `Bearer ${REST_TOKEN}` },
    body,
  });
  if (!r.ok) throw new Error(`redis ${r.status}`);
  return (await r.json()).result;
}

let cliente; // reaproveitado entre execuções da função
async function tcp() {
  if (!cliente) {
    cliente = createClient({ url: REDIS_URL });
    cliente.on('error', () => {});
    await cliente.connect();
  }
  return cliente;
}

const get = async (k) => (REST_URL ? rest(`get/${k}`) : (await tcp()).get(k));
const set = async (k, v) => (REST_URL ? rest(`set/${k}`, v) : (await tcp()).set(k, v));
const ler = async () => JSON.parse((await get(CHAVE)) || '{"ver":0,"db":null}');

async function senhaOk(senha) {
  if (!senha) return false;
  if (process.env.SENHA) return iguais(hash(senha), hash(process.env.SENHA));
  const salva = await get(CHAVE_SENHA);
  if (salva) return iguais(hash(senha), salva);
  if (senha.length < 4) return false;
  await set(CHAVE_SENHA, hash(senha)); // primeiro acesso define a senha
  return true;
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (!(REST_URL && REST_TOKEN) && !REDIS_URL) return res.status(503).json({ erro: 'nao_configurado' });
  const senha = String(req.headers['x-senha'] || '');
  try {
    if (!(await senhaOk(senha))) {
      const nova = !process.env.SENHA && !(await get(CHAVE_SENHA));
      return res.status(401).json({ erro: 'senha', nova });
    }
    if (req.method === 'GET') return res.status(200).json(await ler());
    if (req.method === 'PUT') {
      const atual = await ler();
      const { ver, db } = req.body || {};
      if (!db || !Array.isArray(db.vendas)) return res.status(400).json({ erro: 'dados_invalidos' });
      // outro aparelho salvou antes: devolve a versão atual para o navegador recarregar
      if (ver !== atual.ver) return res.status(409).json(atual);
      const novo = { ver: atual.ver + 1, db, em: new Date().toISOString() };
      await set(CHAVE, JSON.stringify(novo));
      return res.status(200).json({ ver: novo.ver });
    }
    return res.status(405).json({ erro: 'metodo' });
  } catch (e) {
    return res.status(502).json({ erro: 'banco', detalhe: String(e.message || e) });
  }
}
