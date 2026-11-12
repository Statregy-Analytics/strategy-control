# QA — ciclo de navegação e documentos dos contratos — 12/11/2026

## Revisão do checklist

Complemento do [reteste de perfil e contratos](QA-2026-11-12-RETESTE-PERFIL-CONTRATOS.md). A triagem considerou os checklists atuais de perfil, documentação, Comunicados/transferência e Auditoria. Bloqueios de API, pré-condições de massa e aceite independente do QA não foram tratados como tarefas de programação já aprovadas.

A regressão encontrou defeitos de front ao concluir uma abertura de documento depois de trocar de contrato ou sair. Não exige novos endpoints. Não foram acrescentados campos, mensagens, botões, ações comerciais, assets ou estilos. O template e CSS do detalhe são idênticos ao commit anterior, comprovados em [layout preservado](evidence/qa-2026-11-12-contratos-navegacao/layout-preservado.json). Esta rodada preserva a composição existente; não certifica telas de módulos sem referência aprovada.

## Corrigido e testado

- [x] Uma abertura por vez, inclusive ativação duplicada antes de o botão atualizar.
- [x] Trocar contrato fecha somente a aba ainda aguardando a URL. Resposta antiga não abre o arquivo nem altera erro/loading do contrato novo.
- [x] Sair para a listagem encerra o contexto e limpa as projeções da tela. Não consulta contrato com undefined ou ID de outra rota.
- [x] Mudança de sessão impede apresentação de dados, mensagens e documentos da sessão anterior. Usa a mesma proteção central que reconhece refresh legítimo.
- [x] Aba bloqueada usa a mensagem existente, sem consultar URL temporária inutilmente.
- [x] Falha ou URL inválida fecha a aba vazia e permite tentar novamente.
- [x] Arquivo aberto com sucesso permanece disponível ao usuário ao sair da tela; não é fechado indevidamente.
- [x] Detalhe, documentos e histórico mantêm carregamentos/falhas independentes. Falha documental não vira lista vazia e retry recupera somente a seção.
- [x] Revisão desktop 1440 px e celular 390 px, inclusive nome extenso de arquivo, sem overflow da página.

Antes da correção, sete cenários de regressão falharam. Após o ajuste, os 14 testes específicos passaram, incluindo verificação adicional de saída para rotas de outra entidade. Suíte total: 359 testes, lint e build locais aprovados. Diff dos arquivos alterados passou; whitespace anterior em PRODUCT.md e notas locais não relacionadas foi preservado.

## Navegador: separar dados controlados de API real

[Resultados locais](evidence/qa-2026-11-12-contratos-navegacao/local-contract-lifecycle-results.json): respostas controladas para detalhes, anexos e falhas. Incluem atraso de URL, troca de contrato, saída durante espera, popup bloqueado, sucesso, erro, retry e vazio. Nenhum desses erros foi provocado no servidor; não são bugs do backend.

Runtime **f1e939d** publicado: [pipeline 43296230100](https://github.com/WillTbn/Strategy-analytics-v2/actions/runs/43296230100) aprovada com auditoria de dependências, lint, 359 testes, build, upload e ativação.

Na versão publicada passaram [11 verificações controladas](evidence/qa-2026-11-12-contratos-navegacao/hml-contract-lifecycle-results.json), sem erros de JavaScript ou consultas com ID inválido. Atraso, recusa, popup bloqueado e dados extensos são fixtures de teste, sem provocar falha no backend.

[API e navegação reais](evidence/qa-2026-11-12-contratos-navegacao/hml-contract-lifecycle-real-results.json): login de Éric e Cláudio, lista → detalhe, histórico, anexo fictício por URL temporária 200, preservação da aba já aberta ao voltar à lista e nova entrada sem erro residual. Cláudio manteve Encerrado, participação R$ 261.500 e documentos vazios; mobile sem overflow. Nove verificações incluindo a preparação do vínculo; nenhuma exceção de JavaScript. O vínculo temporário do arquivo de teste foi removido (204), mantendo o documento no perfil e os contratos/valores intactos.

## Pendências antigas encerradas no checklist

- [x] Lista múltipla de contatos de confiança: na conta fictícia Client, dois contatos foram criados pelo formulário existente (dois POSTs 201), retomados após recarga e um foi editado isoladamente (um PUT 200). A consulta após nova recarga confirmou o outro intacto. Os contatos temporários foram removidos e a lista vazia original foi confirmada; histórico de teste preservado. Telefones reservados de exemplo, sem dados pessoais reais. [Resultado reduzido](evidence/qa-2026-11-12-contratos-navegacao/hml-profile-multiple-trusted-contacts-results.json).
- [x] Referência de contatos: Figma portal BaDXlWpxbIoY4azOaQnXgv, 1:66213, bloco nome/telefone/Adicionar/Salvar/Descartar. Nenhum campo ou ação foi acrescentado. O perfil não teve alteração de runtime neste cenário.
- [x] Marcação antiga de renda vigente divergente atualizada com o reteste de 12/11 já documentado: salvar/recarga/restauração passaram. Não permanece como bug aberto do backend.
- [x] Tabelas de lacunas de 12/10 foram identificadas como históricas; não são lista atual de solicitações à API. Revisões atuais prevalecem.
- [ ] Aceite independente do QA/designer continua aberto. Não foi convertido em aprovação técnica por este reteste.

## Bloqueios e limites

- Nenhuma nova pendência de API foi identificada nesta correção; são falhas de ciclo do front.
- Mantidos os bloqueios do relatório anterior: contrato encerrado do Cláudio no investido, métricas individuais indisponíveis, versão/contagem documental, tipos/campos ausentes e escritas pessoais/metadados com limites contratuais. Não foram revalidados integralmente por este lote.
- Celular não confirmado, falta de documento fiscal e conta insuficiente para Comunicados são pré-condições de massa; não conceder nível ou inventar documento/saldo no front.
- Itens históricos de “API ausente” não prevalecem sobre as entregas já comprovadas. Os módulos administrativos ainda sem tela integrada não foram apresentados como entregues pela existência dos endpoints.
- Este lote não repete submit/consentimentos, análise de identidade, movimentação financeira nem validação de todos os módulos. O aceite independente do QA/designer permanece separado dos testes técnicos.

No Admin, este lote altera apenas documentação/evidências; lint e build também passaram. O diff global ainda aponta whitespace anterior no Swagger do Admin e em PRODUCT.md do portal; ambos foram preservados fora dos commits. O diff do lote passou.
