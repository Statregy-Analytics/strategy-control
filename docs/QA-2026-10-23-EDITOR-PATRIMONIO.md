# QA — ciclo de edição do patrimônio no Admin · 23/10/2026

Correção adicional dos itens 15/17: impedir que respostas pendentes do editor de um bem atualizem o painel depois de fechar, mudar de cliente ou sair da tela. Os editores C11/C12 e demais grupos mantêm os campos, ações, mensagens e composição existentes do Figma.

- [x] Fechar/Descartar invalida a consulta pendente, limpa rascunho, erro e estado de salvamento. Reabrir carrega os dados persistidos.
- [x] Carregamento captura o cliente, o bem e o tipo originais. Uma resposta anterior não preenche o rascunho de outro bem.
- [x] Salvamento captura cliente/bem/editor de fotos; verifica o contexto após cada etapa assíncrona. Resposta antiga não chama o editor de fotos atual, não recarrega documentação de outro cliente e não fecha o novo painel nem emite notificação antiga.
- [x] Troca de cliente e saída invalidam os recursos de lista, editor e documentação já iniciados. Retentativa de falha parcial das fotos mantém a proteção contra duplicação do bem.
- [x] 132 testes aprovados; seis cenários novos controlam respostas atrasadas, falha/sucesso após troca, envio das fotos em andamento e saída da tela. Lint, build e diff do lote aprovados.
- [x] Local 8080: apelido fictício digitado e descartado; reabertura retomou o original. Abrir/fechar veículo e reabrir imóvel manteve o tipo e dados corretos. Nenhuma escrita enviada no navegador.
- [x] Runtime **073253d** publicado; [pipeline 39970596392](https://github.com/Statregy-Analytics/strategy-control/actions/runs/39970596392), tentativa 2, aprovada com auditoria, 132 testes, lint/build, upload e ativação. A primeira tentativa passou nas verificações de código, mas falhou no SSH com Connection timed out/255; repetição do mesmo commit resolveu, sem alterar segurança ou configuração SSH.
- [x] Admin publicado: rascunho fictício no apelido do imóvel EUR descartado; reabertura retomou o nome original e 325000.75. Editor fechado, cliente alterado pelo seletor para Cláudio: painel anterior ausente e nenhum rascunho/bem do Jorge na seção carregada. Voltar ao Jorge e reabrir o imóvel manteve os dados originais.
- [x] Nenhuma gravação cadastral/financeira no navegador. Console sem erros de execução. Evidência local: admin-editor-patrimonio-retomada-hml-23-10.png.

Limites: os atrasos/falhas foram controlados nos testes, sem provocar indisponibilidade no backend. A proteção não desfaz uma escrita que o servidor já recebeu; impede etapas posteriores e efeitos de tela fora do contexto original. Não há nova exigência de endpoint nem homologação integral do Admin por estes cenários.
