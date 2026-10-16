# Lorena Comissões

Sistema simples (um único `index.html`, sem instalação) para acompanhar comissões de vendas de planos de saúde.

## Regras (configuráveis)
- **20%** sobre as **3 primeiras** mensalidades.
- Depois disso, **vitalício**: 20% sobre 2% da mensalidade (0,4%) ao mês enquanto o contrato estiver ativo.
- A comissão cai **1 mês após** o pagamento da parcela (paga em junho → recebe em julho).

## Telas
- **Painel:** mês de recebimento, meta, comissão prevista (1ª parcela / demais / vitalício), recebido, quanto falta, vendas do mês que alimentam a meta e quanto vender por dia útil.
- **Vendas:** cadastro (cliente, operadora, data do 1º pagamento, mensalidade); status por parcela (prevista → recebida → cancelada); cancelar contrato encerra o vitalício.
- **Mês a mês:** histórico e projeção de 12 meses.
- **Configurações:** regras, importar linhas coladas do Google Sheets, backup JSON e exportação CSV.

Os dados ficam no navegador (localStorage).

## Sincronizar entre aparelhos (Vercel)
1. Vercel → projeto → **Storage** → Create → **Upstash for Redis** (plano grátis) → conectar ao projeto.
2. Vercel → projeto → **Settings → Environment Variables** → adicionar `SENHA` com a senha desejada.
3. **Deployments** → Redeploy.

Ao abrir o site, ele pede a senha uma vez por aparelho. O indicador ao lado do título mostra ☁️ sincronizado.
Sem essa configuração (ou abrindo o `index.html` direto), os dados ficam só no navegador.
