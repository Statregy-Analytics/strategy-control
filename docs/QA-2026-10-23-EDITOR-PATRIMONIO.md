# QA — ciclo de edição do patrimônio no Admin · 23/10/2026

Correção adicional dos itens 15/17: impedir que respostas pendentes do editor de um bem atualizem o painel depois de fechar, mudar de cliente ou sair da tela. Os editores C11/C12 e demais grupos mantêm os campos, ações, mensagens e composição existentes do Figma.

- [x] Fechar/Descartar invalida a consulta pendente, limpa rascunho, erro e estado de salvamento. Reabrir carrega os dados persistidos.
- [x] Carregamento captura o cliente, o bem e o tipo originais. Uma resposta anterior não preenche o rascunho de outro bem.
- [x] Salvamento captura cliente/bem/editor de fotos; verifica o contexto após cada etapa assíncrona. Resposta antiga não chama o editor de fotos atual, não recarrega documentação de outro cliente e não fecha o novo painel nem emite notificação antiga.
- [x] Troca de cliente e saída invalidam os recursos de lista, editor e documentação já iniciados. Retentativa de falha parcial das fotos mantém a proteção contra duplicação do bem.
- [x] 132 testes aprovados; seis cenários novos controlam respostas atrasadas, falha/sucesso após troca, envio das fotos em andamento e saída da tela. Lint, build e diff do lote aprovados.
- [x] Local 8080: apelido fictício digitado e descartado; reabertura retomou o original. Abrir/fechar veículo e reabrir imóvel manteve o tipo e dados corretos. Nenhuma escrita enviada no navegador.
- [ ] Publicação e reteste no Admin de homologação.

Limites: os atrasos/falhas foram controlados nos testes, sem provocar indisponibilidade no backend. A proteção não desfaz uma escrita que o servidor já recebeu; impede etapas posteriores e efeitos de tela fora do contexto original. Não há nova exigência de endpoint nem homologação integral do Admin por estes cenários.
