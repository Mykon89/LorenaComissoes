// Guarda os dados do sistema no Upstash Redis (Vercel → Storage → Upstash for Redis).
// Variáveis de ambiente: KV_REST_API_URL, KV_REST_API_TOKEN (criadas pela integração) e SENHA.
const URL_ = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const CHAVE = 'lorena-comissoes';

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

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (!URL_ || !TOKEN || !process.env.SENHA) return res.status(503).json({ erro: 'nao_configurado' });
  if (req.headers['x-senha'] !== process.env.SENHA) return res.status(401).json({ erro: 'senha' });
  try {
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
