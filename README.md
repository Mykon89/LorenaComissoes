# Lorena Comissões

Sistema simples (um único `index.html`, sem instalação) para acompanhar comissões de vendas de planos de saúde.

- **Regra padrão:** 20% sobre as 3 primeiras mensalidades (configurável).
- **Painel:** mesmos indicadores da planilha (total de vendas, quantidade, comissão média, comissão acumulada, falta para a meta, quanto ainda vender e por dia útil), já somando 2ª e 3ª parcelas de vendas anteriores.
- **Vendas:** cadastro com cliente, operadora, vigência, mensalidade e vidas; status por parcela (prevista → recebida → cancelada).
- **Mês a mês:** previsto × recebido × meta.
- **Importar:** colar linhas do Google Sheets (Data, Cliente, Valor) em Configurações.
- **Backup:** exportar/importar JSON e exportar CSV (abre no Excel/Google Sheets).

Os dados ficam no navegador (localStorage). Para usar: abra `index.html` ou publique via GitHub Pages.
