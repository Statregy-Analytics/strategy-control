# QA — Admin: contratos CT04 e CT07 — 13/11/2026

Referências: [CT04 — Novo Contrato](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI/?node-id=1484-71334) e [CT07 — Contrato aberto](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI/?node-id=1484-72188). Estes frames, solicitados expressamente, prevalecem sobre a orientação legada de editor lateral. Não houve mudança no menu nem na identidade global.

## Implementação e validações

- [x] Substituir o editor lateral por página completa: cabeçalho e ações, informações básicas, vigência, financeiro/moeda, motor, status, universo de ativos, documentos e coluna de clientes/resumo do CT04. Reutilizados ProfileSection, LabelForm, GlassSelect, MoneyInput e seletores financeiros existentes.
- [x] CT07: cabeçalho com seis indicadores, clientes em cards/lista, seções expansíveis de motor, ativos, dívidas e documentos, aportes, performance e histórico de alterações. Sem números demonstrativos nem conversão de ausência em zero.
- [x] Manter as consultas e escritas reais com autenticação e idempotência existentes. Rascunhos usam POST drafts e PUT draft; contratos criados usam PATCH e a rota separada de status. Prazo e endDate não são enviados juntos no PATCH.
- [x] Salvar desabilitado sem alterações no contrato criado; editar/descartar; campos imutáveis preservados. Respostas atrasadas de ativos não sobrescrevem digitação; seção indisponível não apaga as demais. As expansões são preservadas durante atualização.
- [x] Previsão de término com dias, meses e anos; testes de fevereiro, ano bissexto e virada do ano. A API confirmou 01/01/2026 + 1 ano = 01/01/2027, sem subtrair um dia.
- [x] Criar rascunho fictício pela interface, recarregar, editar observação e retomar. Incluir/remover o cliente Éric, salvar e conferir persistência. Nenhum capital foi movimentado.
- [x] Aplicar conjunto de cinco ativos ao rascunho, salvar, recarregar e remover todos; API confirmou zero ativos e zero participantes ao fim.
- [x] Editar observação de Legacy Prime pela interface, consultar histórico com anterior/novo e restaurar exatamente o texto original. Capital, participantes, moeda e status permaneceram preservados.
- [x] Tabela de aportes consulta transações concluídas, type=ContractOperation e contractId. Não usar ContractContribution no filtro: a API recusa esse enum. Legacy Prime retornou vazio; nenhum aporte foi fabricado para preencher a tabela.
- [x] Histórico reutiliza Auditoria por ResourceType=Contract/ResourceId, com mascaramento e tradução existentes. Registros antigos sem diferenças estruturadas conservam o evento legado; não inventar anterior/novo.
- [x] Documentos: escolher cliente/anexo fictício, vincular, abrir arquivo, liberar/ocultar e desvincular. A seleção usa nomes legíveis, não opções vazias.
- [x] Testes automatizados cobrem criação/finalização controladas, validação antes de escrever, retry sem duplicar contrato, PATCH sem campos imutáveis, falha isolada, resposta tardia, clique duplicado, saída de contexto e filtros reais de auditoria/aportes.
- [x] Conferência visual em desktop (1440 px), intermediário (917 px) e mobile (390 px, área útil 375 px). Sem overflow externo; tabelas mantêm rolagem interna. Cores, efeitos glass e ícones dos frames preservados. Detector mecânico produziu apenas avisos sobre diferenças para o DESIGN.md legado; a referência desta alteração é o Figma atual.

## Limites reais — não declarar fluxo integral de criação homologado

### Designer / definição do fluxo

- [ ] CT05 diz “Continuar para Distribuição”, mas não foi localizado o frame seguinte para distribuir capital por cliente. O usuário pediu registrar questionamento ao Figma/design. Solicitar o desenho e a regra de distribuição/validação. Não inventar rateio igual, novo campo ou etapa. O seletor integrado existente foi preservado; a finalização positiva foi exercitada em teste controlado, não com nova movimentação real.
- [ ] Importar Excel/PDF e baixar modelo aparecem no CT04, mas não há importador/modelo integrado nem especificação de colunas/extrator no projeto. Definir arquivo de referência e mapeamento. Isto não é prova de endpoint ausente: a importação pode ser feita pelo front usando a seleção de ativos existente. Ações ficam desabilitadas até definição/implementação desse fluxo.

### Contrato da API

- [ ] Quatro slots do CT04 (Contrato Digitalizado, Documento Complementar, Termo de Adesão, Outros Documentos): o catálogo consultado não oferece os tipos específicos/definições de upload para esse contexto. Não usar o tipo de contrato de adesão de consórcio, que pertence a Patrimônio. O vínculo, visibilidade e abertura de documentos já existentes funcionam; falta definir o upload tipado e a titularidade no contrato com vários clientes.
- [ ] Composição estratégica Intradiário/Núcleo/Tática: SaveContractDraftRequest e UpdateContractRequest não têm propriedades correspondentes. Campos permanecem indisponíveis, sem simular persistência.
- [ ] Índice/data de conexão são dados de leitura do vínculo de motor; o request de cadastro recebe primaryEngineId, sem esses campos. Legacy Prime retorna conexão pendente e índices ausentes. Não gravar valor manual sem contrato HTTP aprovado.
- [ ] Saldo/performance e retiradas/posição por participante continuam sem dados correspondentes nas respostas consultadas. Performance não abre o histórico de auditoria como substituto. Controles indisponíveis e mensagem de indisponibilidade preservam a composição.

## Massa e limpeza

Rascunho `f3226097-effc-4c0f-ba3f-3eb4d4f01b53`, nome **QA CT04 CT07 — FICTÍCIO**, permanece como massa explícita, sem finalização, clientes, ativos ou capital. Não existe rota de descarte de contrato no catálogo consultado. Legacy Prime teve somente observação temporária, restaurada; vínculo documental temporário removido sem excluir o arquivo do cliente.

## Publicação

- [x] Lint e build aprovados; 265 testes locais, sendo 8 do estudo preexistente adiado. Suíte a publicar: 257 testes, com 9 novos nesta entrega. Diff dos arquivos desta alteração sem whitespace.
- [ ] Commit, pipeline de publicação e conferência da versão servida.
