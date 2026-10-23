# QA — ciclo das ações documentais no Admin · 23/10/2026

Correção adicional do QA 10/17 no componente documental existente: ao mudar cliente/documento durante Visualizar/Baixar/Upload, o carregamento anterior podia ficar preso; o upload não verificava se o card ainda era o mesmo ao concluir. Nenhum campo, ação, texto ou composição do Figma foi acrescentado.

- [x] Troca de cliente/documento/status e saída limpam carregamento, download, arquivo selecionado e diálogos transitórios.
- [x] Upload verifica o contexto após a API: resposta antiga não fecha o novo diálogo, não limpa o novo arquivo e não notifica/atualiza outro cliente. A resposta antiga também não encerra o carregamento da operação atual.
- [x] Visualizar e Baixar continuam protegidos contra respostas antigas; o novo card pode iniciar uma operação sem ficar preso ao loading anterior.
- [x] Upload respeita a permissão Upload recebida e impede envio duplicado enquanto está em andamento; HTTP/interceptors e payload existentes preservados.
- [x] 137 testes, lint/build e diff do lote aprovados. Cinco testes novos cobrem respostas atrasadas nas três ações, saída durante erro de upload, permissão e envio duplicado.
- [x] Local 8080: Visualizar CNH abriu o PNG fictício já existente; Visualizar/Baixar voltaram habilitados ao concluir. Nenhuma revisão, novo upload ou download realizado nesta conferência de navegador.
- [x] Publicado **eb53be3**; [pipeline 39973080495](https://github.com/Statregy-Analytics/strategy-control/actions/runs/39973080495) aprovada com auditoria, 137 testes, lint/build, upload e ativação.
- [x] Admin publicado: Visualizar CNH abriu cnh-ficticia-teste-progresso.png; Visualizar/Baixar disponíveis após conclusão. Aba do arquivo fechada ao concluir o teste. Diálogo Reprovar aberto e cancelado, sem decisão enviada.
- [x] Alternância Jorge → Cláudio fechou os diálogos; retorno ao Jorge manteve os controles disponíveis. Tab a partir de Visualizar CNH moveu o foco a Baixar CNH. Contadores 3 aprovados/1 aguardando/3 rejeitados preservados; console sem erros.
- [x] Evidência local: admin-ciclo-documentos-hml-23-10.png. Nenhuma revisão, novo upload ou download na UI publicada; esses cenários de concorrência ficaram nos testes controlados.

Atrasos, troca de contexto durante upload/download e falhas foram exercitados de forma controlada nos testes. Não foi provocada falha de rede/API publicada nem alterada a situação de documentos reais. A proteção não desfaz uma requisição já recebida pelo servidor. Não é uma nova pendência de backend nem homologação integral dos documentos.
