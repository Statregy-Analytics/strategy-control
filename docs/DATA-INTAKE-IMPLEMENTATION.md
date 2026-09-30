# Formulários dinâmicos — Data Intake

Rota: `/dataManagement/forms`, acessível por **Formulários** no menu.

Esta entrega é posterior ao Marco 2. A exclusão de Data Intake no checklist
daquele marco continua sendo o registro do escopo histórico, não uma restrição
à implementação atual.

## Contratos utilizados

Branch `docs` de `jaquiel/strategy-analytics`, commit
`03208b48c1006cae53559386ee6332b9b5a68892`:

- [Contrato e exemplo de imóvel](https://github.com/jaquiel/strategy-analytics/blob/docs/architecture/data-intake-real-estate-form.md)
- [API Data Intake](https://github.com/jaquiel/strategy-analytics/blob/docs/architecture/data-intake-api.md)
- [Upload administrativo](https://github.com/jaquiel/strategy-analytics/blob/docs/architecture/document-http-api.md)

Nesta branch, `architecture/` fica na raiz; não há o prefixo `docs/`.
O guia `user-guide/backend-workflows/README.md` citado no pedido não está nesta
branch. Os exemplos de uso foram conferidos nos dois contratos acima.

## Comportamento implementado

- Catálogo real de formulários publicados e listagem paginada de submissões,
  com filtro de status. Edição lateral preserva a listagem.
- `schema`, `uiSchema.sections`, `uiSchema.fields` e `metadata` definem o formulário.
  Componentes: text, number, currency, select, toggle, stepper e attachment.
  Campos escalares ausentes do uiSchema têm apresentação derivada do schema.
- Validação JSON Schema Draft 2020-12 por Ajv, inclusive formatos, limites e enums.
  Rascunhos podem ficar incompletos; os valores preenchidos precisam ser válidos.
  Objetos/arrays e componentes sem renderizador bloqueiam a edição explicitamente.
- A regra de saldo devedor do exemplo de imóvel é vinculada a
  `assets.declare_real_estate`, sem inventar propriedades de uiSchema.
- Rascunho fixa `formVersionId`. A reabertura procura essa mesma versão, inclusive
  nas versões arquivadas da definição, sem trocar para a versão ativa atual.
- Escritas usam a instância HTTP e interceptors existentes. Chaves de idempotência
  sobrevivem às tentativas de uma mesma operação no editor aberto.
- Upload multipart administrativo em
  `/admin/customers/{customerId}/documents`; depois, vínculo em
  `/data-intake/submissions/{id}/attachments` enviando **somente**
  `customerUploadedDocumentId`. A rota `/client/profile/documents` atende o portal
  Client; usá-la no painel gravaria no escopo do usuário autenticado.
- Arquivos PDF/JPEG/PNG, não vazios, até 25 MB e até 10 anexos por submissão.
  Restrições de MIME do campo também são consideradas.
- Falha no vínculo preserva o ID do documento já enviado. “Retomar envio de anexos”
  continua sem reenviar os bytes, inclusive quando o Admin não pode editar o
  rascunho após criá-lo. Arquivos nunca entram em `data`.
- Submit, resubmit, aprovação, rejeição, solicitação de correção, histórico e
  download dos documentos vinculados. Rejeição exige observações e confirmação.
- Aprovação que resulta em `NeedsCorrection` é apresentada como correção necessária,
  sem anunciar patrimônio criado. Handler ausente mantém o estado e informa a falha.
- Carregamentos/erros independentes para catálogo, listagem, permissões, schema,
  tipos documentais e histórico. Mensagens não reproduzem payloads/segredos da API.

## Permissões e limites

O exemplo publicado autoriza Admin a criar e validar, mas restringe `submit` e
`updateOwnDraft` a Client. A interface respeita essas declarações; não altera
metadata nem publica versões para contornar a regra. Conforme o contrato,
`resubmit` usa apenas a permissão geral `data-intake.submit`.

No painel, um cliente deve ser selecionado antes de salvar, garantindo o vínculo
necessário para documentos e patrimônio. O servidor continua sendo a autoridade
final para permissões e para `metadata.requiredAttachments`.

O salvamento é explícito. `metadata.autosave` é um hint opcional do contrato e
não habilita gravações automáticas nesta entrega. O catálogo só mostra versões
publicadas; esta tela não é um editor/publicador de definições de formulário.

Se uma submissão antiga não informar `formDefinitionId` e sua definição não
aparecer mais no catálogo, os endpoints documentados não permitem localizar sua
versão diretamente por `formVersionId`. Nesse caso, edição e aprovação são
bloqueadas com aviso; não se usa schema de outra versão.

IDs de uploads e arquivos pendentes ficam apenas na memória do editor. Recarregar
ou fechar durante uma falha parcial exige conferir os documentos já enviados.
Não há exclusão de anexos vinculados no contrato consumido; apenas arquivos ainda
não enviados podem ser removidos da fila.

## Ajuste visual do painel

O [frame de contratos no Figma](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI?node-id=1807-3975)
orientou o acabamento escuro com transparência; ele é uma referência visual de
contratos, não o desenho exato do formulário de imóveis. Foram ajustados campos,
menus, listas e legendas para o tema escuro, com props `dark` nos componentes
compartilhados aplicadas pelo fluxo de Formulários.

O editor mantém 8 px entre rótulo e campo, 16 px na grade principal e 24 px entre
seções. Os campos dinâmicos adaptam as colunas à largura disponível no painel,
reduzindo de três para duas e uma coluna. A identidade e os componentes existentes
foram preservados, sem mudança aprovada no sistema visual global; `DESIGN.md` e
`.impeccable/design.json` permanecem inalterados.

A revisão visual deste ajuste foi realizada em desktop e celular, em localhost
isolado com respostas de API simuladas. Ela não constitui homologação com a
integração real.

## Verificação local e homologação

Testes de modelo: `node --test tests/data-intake-model.test.mjs`.

Teste de navegador: `node tests/data-intake-browser.mjs`, com servidor local
iniciado. Requer Playwright instalado no ambiente; `PLAYWRIGHT_MODULE` pode
apontar para seu módulo ESM, `CHROME_PATH` para o Chrome e `TEST_URL` para a rota.
Todas as requisições de API são interceptadas; nenhum cadastro real é criado.
O fixture reproduz o contrato documentado, com IDs explicitamente de teste.

- [x] Lint e build executados durante a implementação.
- [x] Testes de schema, valores zero/false, rascunho parcial e permissões.
- [x] Navegador: moeda, condição de quitação e bloqueio de envio por metadata.
- [x] Navegador: upload multipart, vínculo falhando e retry com a mesma chave,
      sem duplicação de upload.
- [x] Navegador: submit autorizado e aprovação retornando `NeedsCorrection`.
- [x] Revisão visual desktop (1440 px) e celular (390 px).
- [x] Erros de validação anunciados junto às ações, com foco e rolagem até o
      primeiro campo inválido, verificados em desktop e celular.
- [ ] Homologar com Admin e Client reais, permissões efetivas e workspace correto.
- [ ] Confirmar o formulário publicado e os IDs reais dos tipos de documento.
- [ ] Reabrir rascunho após publicar uma versão nova e confirmar versão original.
- [ ] Homologar mínimos de anexos, país/requisito e documentos arquivados na API.
- [ ] Validar `401`, `403`, `404`, `409`, `422`, `429` e indisponibilidade do storage.
- [ ] Aprovar imóvel e conferir o patrimônio e a moeda preferencial do cliente.
- [ ] Homologar rejeição definitiva, solicitação de correção e reenvio real.

Falhas de integração ainda não reproduzidas não são registradas como bugs de
backend. O checklist manual do Marco 2 não recebe erros de frontend.
