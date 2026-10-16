# Lorena Comissões

Sistema simples (um único `index.html`, sem instalação) para acompanhar comissões de vendas de planos de saúde.

- **Regra padrão:** 20% sobre as 3 primeiras mensalidades (configurável).
- **Painel:** comissão prevista/recebida no mês, meta, quanto falta e quantas vendas faltam.
- **Vendas:** cadastro com cliente, operadora, vigência, mensalidade e vidas; status por parcela (prevista → recebida → cancelada).
- **Mês a mês:** previsto × recebido × meta.
- **Backup:** exportar/importar JSON e exportar CSV (abre no Excel/Google Sheets).

Os dados ficam no navegador (localStorage). Para usar: abra `index.html` ou publique via GitHub Pages.
