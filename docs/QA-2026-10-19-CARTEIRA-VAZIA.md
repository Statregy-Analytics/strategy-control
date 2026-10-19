# QA 17/10 — item 14: visão consolidada vazia

Correção e reteste em 19/10/2026, Admin local na porta 8080 com API real de homologação.

## Interface e integração

Referência: [Figma C29](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI/S.A?node-id=1933-300).

- Mantidos ProfileSection, FormSection, quatro métricas e colunas do desenho. Carteira total zerada usa o gráfico vazio local de 52 px; Extrato usa o ícone do Figma de 16 px.
- Uma carteira consolidada sem moedas mostra os quatro zeros BRL previstos no desenho somente depois de consultas independentes bem-sucedidas: portfolio com moedas vazias, composição sem valores e lista de carteiras vazia. O zero de apresentação não cria carteira nem identificador no servidor.
- Composição vazia mantém os cabeçalhos e mostra “Nenhuma composição ainda”. Extrato vazio mantém as seis colunas e mostra “Nenhum lançamento ainda”.
- Extrato deixou de ser um aviso fixo. Usa GET /admin/customers/{id}/wallets e GET /admin/wallets/{walletId}/statement, percorrendo as páginas de cada carteira. Ordenação por data efetiva, moeda e saldo após cada lançamento preservados por carteira; moedas não são somadas.
- Saldo atual zero não prova ausência de movimentações: carteiras existentes sempre têm o histórico consultado. Falhas, respostas incompletas, duplicadas ou sem paginação não viram extrato vazio.
- Consultas têm loading/erro/retry independentes. Troca de cliente e saída da tela invalidam respostas pendentes. Portfolio e composição exigem o identificador do cliente consultado e uma lista explícita de moedas.
- Exportar permanece a ação existente, no cabeçalho do extrato como no Figma. Não foram incluídos filtros, campos, ações ou identificadores demonstrativos.

## Cenários reais

Jane Austin Doe, cadastro de teste com carteira consolidada, composição e carteiras vazias: quatro valores R$ 0,00, gráfico vazio, “Nenhuma composição ainda” e “Nenhum lançamento ainda” confirmados na ficha.

Cláudio: investimento BRL 261.500,00, investível BRL 25.000,00 e total BRL 286.500,00 preservados. Extrato mostrou o depósito REQ-2026-E0320E63, concluído em 09/10/2026, valor e saldo após o lançamento BRL 25.000,00. O contrato encerrado continuar no investimento permanece uma pendência financeira do backend; não foi subtraído pelo frontend.

A conta client@example.com não serve como carteira consolidada inteiramente zerada no Admin: a API retorna patrimônio imobiliário BRL 850.000,00, embora não tenha carteiras de movimentação. Esse patrimônio foi preservado. A Home do portal usa outra projeção financeira e sua aprovação não implica zerar ativos declarados no Admin.

Revisão em desktop, desktop amplo e celular 390 px: quatro/duas/uma colunas conforme espaço; conteúdo da carteira no celular 309/309 px, sem transbordamento. Ícones locais carregados nas dimensões originais; nenhuma escrita financeira/cadastral ou aprovação documental realizada.

## Verificação e limites

35 testes aprovados, incluindo 7 novos de confirmação de vazio, ativos existentes, histórico com saldo atual zero, paginação, moedas, falhas e invalidação. Lint, build e checagem de espaços dos arquivos do lote aprovados. As alterações anteriores em outros arquivos foram preservadas.

Essa rodada valida o item 14 localmente contra a API de homologação. O deploy administrativo resultante ainda deve ser conferido. Edição por seção (itens 11–13/15), fluxo cadastral de sete etapas, aprovação documental e demais itens da matriz não estão aprovados por esta rodada.

## Home publicada do portal

Antes deste lote, o deploy do portal 908403f foi conferido no domínio hml.strategyanalytics.com.br: execução GitHub Actions 39282955955 concluída com sucesso, incluindo upload/ativação. A conta client@example.com abriu a Home sem bloqueio de preferências; zeros, boas-vindas, contratos vazios, ocultar/mostrar valores, navegação para Contratos e responsividade confirmados. O aviso de depósito indisponível permanece; não foi simulada transação.
