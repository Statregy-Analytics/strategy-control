# Checklist manual de homologação — Marco 2

Roteiro de implementação e homologação dos fluxos do Marco 2 nos dois frontends.

- Painel administrativo (`strategy-control`): `http://localhost:8080`
- Portal do cliente (`Strategy-analytics-v2`): `http://localhost:9010`

Data da homologação: \_**\_/\_\_**/**\_\_\_\_**

Responsável: **\*\***\*\***\*\***\_\_**\*\***\*\***\*\***
Versão/commit testado: **\*\***\*\***\*\***\_\_**\*\***\*\***\*\***

## Como preencher

- Marque `[x]` quando aprovado.
- Marque `[!]` quando houver falha.
- Registre o bug na tabela ao final, sem copiar tokens ou senhas.
- Para falhas de API, anote endpoint, status HTTP, `requestId` e `correlationId`.
- Esta tabela deve conter somente erros do backend. Erros do frontend devem ser
  corrigidos e o cenário deve ser executado novamente antes de avançar.
- Uma falha do backend bloqueia somente a homologação integrada daquele cenário;
  as demais telas e fluxos do frontend podem continuar sendo implementados e testados.
- Em cada escrita, confirme o envio de `Idempotency-Key`; quando aplicável,
  confirme também `Authorization` e `X-Workspace-Id`.

## 1. Login e sessão

URL: `http://localhost:8080/auth`

- [x] Login com credenciais válidas.
- [x] Credenciais inválidas mostram mensagem amigável.
- [x] Login redireciona para uma área autenticada.
- [x] Rota protegida sem sessão redireciona para o login.
- [x] Logout remove a sessão e retorna ao login.
- [x] Requisições autenticadas enviam `Authorization: Bearer`.
- [x] Requisições atuais não enviam `X-Workspace-Id` automaticamente.
- [x] A chave antiga `sa_workspace_id` não permanece no Local Storage.
- [x] Não ocorre erro de CORS ao carregar clientes.

Observações:

>

## 2. Listagem de clientes

URL: `http://localhost:8080/dataManagement`

- [x] A tabela carrega dados reais da API.
- [x] O loading aparece durante a consulta.
- [x] Nome do cliente é exibido.
- [x] Contato principal é exibido ou aparece como não informado.
- [x] Pessoa física aparece como “Pessoa física”.
- [x] Pessoa jurídica aparece como “Pessoa jurídica”.
- [x] Status Prospect é apresentado corretamente.
- [x] Status Active aparece como “Ativo”.
- [ ] Status Suspended aparece como “Suspenso”.
- [ ] Status Archived aparece como “Arquivado”.
- [x] Busca por nome funciona.
- [x] Limpar a busca restaura a listagem.
- [ ] Paginação consulta a página correta.
- [x] Alterar itens por página funciona.
- [ ] Erro de API mostra mensagem amigável.

Endpoint esperado:

`GET /api/v1/admin/customers`

Observações:

> A API carregou três clientes reais e a coluna de cliente exibiu o contato
> principal (e-mail) junto ao nome.
>
> Nenhum erro do backend foi identificado na listagem nesta rodada.

## 3. Cadastro de pessoa física

Na listagem, clicar em “Cadastrar Novo Cliente”.

- [x] Selecionar “Pessoa física” envia `kind: "Person"`.
- [x] Nome obrigatório é validado.
- [x] E-mail obrigatório é validado.
- [x] E-mail inválido é rejeitado antes do envio.
- [x] Data de nascimento fica habilitada.
- [x] Cadastro com dados válidos é concluído.
- [x] Mensagem de sucesso é exibida.
- [x] Dialog fecha após o sucesso.
- [x] Listagem é atualizada.
- [x] Cliente criado aparece na tabela.
- [ ] Erro do backend é exibido em português.
- [x] Requisição envia `Idempotency-Key`.

Endpoint esperado:

`POST /api/v1/admin/customers`

Dados usados no teste:

- Nome: `Homologação Pessoa Física`
- E-mail: `homologacao.pf.20260804.1405@example.com`
- Data de nascimento: `15/01/1990`
- ID retornado: `23b8042b-a4e2-40fd-9b90-a670fa276c0b`

Observações:

> Nenhum erro do backend foi identificado no cadastro válido desta rodada.

## 4. Cadastro de pessoa jurídica

- [x] Selecionar “Pessoa jurídica” envia `kind: "Organization"`.
- [x] Campo de data de nascimento fica desabilitado.
- [x] Cadastro com dados válidos é concluído.
- [x] Listagem é atualizada.
- [x] Pessoa jurídica aparece corretamente na tabela.
- [ ] Erro de duplicidade/validação recebe mensagem amigável.

Dados usados no teste:

- Razão/nome: `Homologação Pessoa Jurídica Ltda`
- E-mail: `homologacao.pj.20260804.1410@example.com`
- ID retornado: `101044c1-60c2-4039-b4bb-3235a913217a`

Observações:

> Nenhum erro do backend foi identificado no cadastro válido desta rodada.

## 5. Abertura do detalhe

Abrir o cliente pelo nome ou pela seta.

URL esperada:

`http://localhost:8080/dataManagement/clients/{id}`

- [x] Clicar no nome abre o cliente correto.
- [x] Clicar na seta abre o cliente correto.
- [x] Botão voltar funciona.
- [x] Loading aparece durante as consultas.
- [x] Header mostra nome, contato e status.
- [x] Identificação mostra os dados disponíveis.
- [x] Cliente inexistente apresenta “Cliente não encontrado”.
- [x] Falha temporária apresenta opção de tentar novamente.

Endpoints esperados:

- `GET /api/v1/admin/customers/{id}/summary`
- `GET /api/v1/admin/customers/{id}/header`
- `GET /api/v1/admin/customers/{id}/identification`

Observações:

> Nenhum erro adicional do backend foi identificado na abertura do detalhe.

## 6. Degradação quando summary falha

Usar um cliente cujo `/summary` retorne erro, se ainda houver o bug no backend.

- [x] O erro `500` de `/summary` não bloqueia toda a tela.
- [x] Header continua visível quando sua chamada funciona.
- [x] Identificação continua visível quando sua chamada funciona.
- [x] A tela mostra aviso de resumo temporariamente indisponível.
- [x] A mensagem técnica “An unexpected error occurred” não é exibida diretamente.
- [x] O botão “Tentar novamente” repete as consultas.
- [x] `requestId` e `correlationId` foram anotados para o backend.

Cliente testado: `101044c1-60c2-4039-b4bb-3235a913217a`

Status do `/summary`: `500` — `internal.server_error`

Request ID: `019fce0fd6e77f929de00cb9d1ba4bab`

Correlation ID: `019fce0fd6e774e7852d15cce6e3e6e1`

Observações:

> **Erro do backend:** `GET /api/v1/admin/customers/{id}/summary` retornou
> `500` com a mensagem técnica `An unexpected error occurred`. O frontend
> degradou corretamente e manteve header e identificação utilizáveis.

## 7. Dados cadastrais — nomes

No detalhe, abrir “Dados cadastrais”.

- [!] Nomes existentes são carregados.
- [x] Adicionar nome funciona.
- [x] Tipos Legal, Preferred e Social estão disponíveis.
- [x] Apenas um nome permanece como principal.
- [!] Salvar nomes funciona.
- [x] Header é atualizado depois de salvar.
- [x] Dados persistem após `Ctrl+F5`.
- [x] Não é possível remover o único nome restante.
- [x] Erros são apresentados de forma amigável.

Endpoint:

`PUT /api/v1/admin/customers/{id}/names`

Observações:

> **Erro do backend — projeção incompleta:** após salvar os nomes `Legal` e
> `Preferred`, os endpoints de leitura de header/identificação retornaram
> somente o nome principal (`primaryName`/`fullName`), sem IDs, tipos ou a
> coleção completa. Ao reabrir, o editor não consegue reconstruir os nomes já
> cadastrados com segurança.
>
> **Erro do backend — CORS no navegador:** o `PUT /names` foi bloqueado no
> fluxo do navegador e o frontend apresentou a mensagem amigável de falha de
> conexão. A mesma requisição autenticada, com `Idempotency-Key`, executada
> diretamente contra a API retornou `200`, provando que o payload e o endpoint
> são válidos. Request ID da confirmação direta:
> `019fce15833f7b32b1d040bd95c91beb`; correlation ID:
> `019fce15833f772e9c9d24e00f493562`.

## 8. Dados cadastrais — contatos

- [!] Contatos existentes são carregados.
- [x] Adicionar contato funciona.
- [x] Remover contato funciona.
- [x] Tipos Email, Phone e Mobile estão disponíveis.
- [x] Apenas um contato permanece como principal.
- [!] Salvar contatos funciona.
- [x] Header é atualizado quando o contato principal muda.
- [x] Dados persistem após `Ctrl+F5`.

Endpoint:

`PUT /api/v1/admin/customers/{id}/contacts`

Observações:

> **Erro do backend — tipos rejeitados:** `Phone` e `Mobile` retornaram `400`
> com `customers.invalid_contact_kind`, embora sejam os tipos previstos para o
> fluxo. Para `Mobile`: request ID
> `019fce2054137e949a87b7d2c9c5a8f2`, correlation ID
> `019fce2054137ef68e6975336ab6f9ef`. Para `Phone`: request ID
> `019fce20c3ce70b4afff11994e6b5f94`, correlation ID
> `019fce20c3ce7d72a4c4d24a45a20396`.
>
> **Erro do backend — projeção incompleta:** depois de salvar dois contatos de
> e-mail, a identificação retornou apenas `primaryEmail`. Não há coleção com
> todos os contatos, IDs e tipos para reconstruir o editor após recarregar.
>
> **Erro do backend — CORS no navegador:** o `PUT /contacts` não concluiu no
> fluxo do navegador. A chamada direta com dois contatos `Email` válidos
> retornou `200` e atualizou o header. Request ID:
> `019fce20fff8703cb90519a1389425c7`; correlation ID:
> `019fce20fff870d2af031aae4635fca7`.

## 9. Dados cadastrais — endereços

- [x] Estado sem endereços é exibido corretamente.
- [x] Adicionar endereço funciona.
- [x] Endereço, complemento, cidade, estado e CEP podem ser preenchidos.
- [x] Tipos Residential, Commercial e Correspondence estão disponíveis.
- [x] Apenas um endereço permanece como principal.
- [x] Remover endereço funciona.
- [!] Salvar endereços funciona.
- [x] Dados persistem após `Ctrl+F5`.

Endpoint:

`PUT /api/v1/admin/customers/{id}/addresses`

Observações:

> **Erro do backend — CORS no navegador:** o `PUT /addresses` não concluiu no
> fluxo do navegador. A mesma operação direta, com endereço `Residential`
> válido, retornou `200`; após recarregar, o endereço foi projetado em
> `residentialAddress` e carregado corretamente no editor. Request ID:
> `019fce22aebc724ea369afaab26ffa09`; correlation ID:
> `019fce22aebc721fb97cb3dde16c9360`.

## 10. Status do cliente

No detalhe, abrir “Status e preferências”.

- [x] Status atual é carregado.
- [x] Botão fica desabilitado sem alteração.
- [x] Alterar para Prospect funciona.
- [x] Alterar para Active funciona.
- [x] Alterar para Suspended funciona.
- [x] Alterar para Archived funciona em cliente de teste.
- [x] Status do header é atualizado.
- [x] Status da tabela é atualizado ao retornar.
- [x] Status persiste após recarregar a página.

Endpoints:

- `GET /api/v1/admin/customers/{id}/status`
- `PATCH /api/v1/admin/customers/{id}/status`

Observações:

> Os quatro estados foram aceitos pela API. O fluxo no navegador foi validado
> com `Prospect` e `Active`; o cliente de homologação foi restaurado para
> `Active`. Nenhum erro do backend foi identificado nesta seção.

## 11. Preferências

- [x] Catálogo de preferências é carregado.
- [x] Preferências atuais são carregadas.
- [x] Moeda principal pode ser alterada.
- [x] Moeda secundária pode ser alterada ou removida.
- [x] Idioma pode ser alterado.
- [x] Fuso horário pode ser alterado.
- [x] Tema pode ser alterado.
- [x] Salvar apresenta confirmação.
- [x] Valores persistem após `Ctrl+F5`.
- [ ] Falha do catálogo apresenta botão para tentar novamente.

Endpoints:

- `GET /api/v1/preferences/catalog`
- `GET /api/v1/admin/customers/{id}/preferences`
- `PATCH /api/v1/admin/customers/{id}/preferences`

Observações:

> Preferências persistidas: moeda principal `BRL`, moeda secundária removida,
> idioma `pt-BR`, fuso `America/Sao_Paulo` e tema `Dark`.
>
> O estado de falha do catálogo permanece pendente porque o serviço
> compartilhado não foi interrompido artificialmente. Nenhum erro do backend
> foi identificado no fluxo disponível.

## 12. Resultado da rodada — CRM administrativo

- [x] Login e sessão aprovados.
- [!] CORS das escritas cadastrais reprovado.
- [ ] Listagem aprovada.
- [x] Cadastro de pessoa física aprovado.
- [x] Cadastro de pessoa jurídica aprovado.
- [x] Detalhe aprovado.
- [x] Degradação do summary aprovada.
- [!] Nomes aprovados.
- [!] Contatos aprovados.
- [!] Endereços aprovados.
- [x] Status aprovado.
- [x] Preferências aprovadas.
- [x] Nenhum token ou senha foi registrado nas evidências.
- [ ] Podemos avançar para perfil profissional/financeiro.

## 13. Perfil profissional — painel administrativo

URL: `http://localhost:8080/dataManagement/clients/{id}`

Pré-condição: usar um cliente `Active` e abrir a área de perfil profissional.

1. [ ] Abrir a visão combinada e conferir loading, sucesso e campos sem dados.
2. [ ] Comparar os dados combinados com a consulta do perfil profissional.
3. [ ] Entrar em edição, alterar profissão, empresa e demais campos disponíveis.
4. [ ] Salvar e confirmar mensagem de sucesso.
5. [ ] Recarregar com `Ctrl+F5` e confirmar persistência.
6. [ ] Limpar um campo opcional, salvar e confirmar que ele permanece vazio.
7. [ ] Simular falha da API e confirmar mensagem amigável e nova tentativa.

Endpoints esperados:

- `GET /api/v1/admin/customers/{id}/professional-financial-security`
- `GET /api/v1/admin/customers/{id}/professional-profile`
- `PUT /api/v1/admin/customers/{id}/professional-profile`

Observações:

>

## 14. Perfil financeiro e segurança — painel administrativo

1. [ ] Abrir o perfil financeiro atual e conferir moeda e valores formatados.
2. [ ] Abrir o histórico e confirmar a ordem da versão mais recente para a mais antiga.
3. [ ] Criar uma versão alterando pelo menos um valor válido.
4. [ ] Confirmar que a versão anterior continua no histórico.
5. [ ] Recarregar e confirmar que a nova versão é a atual.
6. [ ] Tentar valores inválidos e confirmar validação amigável.
7. [ ] Abrir segurança da conta e conferir somente informações mascaradas.
8. [ ] Confirmar que senha, tokens, códigos e segredos de 2FA não aparecem.
9. [ ] Confirmar que a tela não oferece configuração de 2FA neste marco.

Endpoints esperados:

- `GET /api/v1/admin/customers/{id}/financial-profile/current`
- `GET /api/v1/admin/customers/{id}/financial-profile`
- `GET|POST /api/v1/admin/customers/{id}/financial-profiles`
- `GET /api/v1/admin/customers/{id}/account-security`

Observações:

>

## 15. Autenticação e perfil — portal do cliente

URL: `http://localhost:9010`

Pré-condição: entrar com um usuário Client vinculado ao cliente de homologação.

1. [ ] Fazer login e validar o acesso com `GET /api/v1/client/auth/ping`.
2. [ ] Recarregar a página e confirmar a restauração por `/auth/me`.
3. [ ] Forçar access token expirado e confirmar refresh com retry único.
4. [ ] Forçar refresh inválido e confirmar limpeza da sessão e retorno ao login.
5. [ ] Abrir o resumo do próprio perfil.
6. [ ] Abrir e editar os dados pessoais permitidos.
7. [ ] Salvar preferências de idioma, moeda, fuso e tema.
8. [ ] Recarregar e confirmar que perfil e preferências persistiram.
9. [ ] Confirmar que o cliente não consegue consultar outro cliente por ID.

Endpoints esperados:

- `GET /api/v1/auth/me`
- `GET /api/v1/client/auth/ping`
- `GET /api/v1/client/profile/summary`
- `GET|PATCH /api/v1/client/profile`
- `GET|PATCH /api/v1/client/profile/preferences`

Observações:

>

## 16. Perfis e contatos de confiança — portal do cliente

1. [ ] Abrir, editar e recarregar o perfil profissional.
2. [ ] Abrir, editar e recarregar o perfil financeiro.
3. [ ] Validar campos obrigatórios e formatos antes do envio.
4. [ ] Listar contatos de confiança no estado vazio e no estado preenchido.
5. [ ] Cadastrar um contato de confiança válido.
6. [ ] Editar o contato e confirmar persistência após recarregar.
7. [ ] Excluir o contato após confirmação explícita.
8. [ ] Confirmar que falhas não removem os dados que estavam no formulário.

Endpoints esperados:

- `GET|PUT /api/v1/client/profile/professional-profile`
- `GET|PUT /api/v1/client/profile/financial-profile`
- `GET|POST /api/v1/client/profile/trusted-contacts`
- `PUT|DELETE /api/v1/client/profile/trusted-contacts/{contactId}`

Observações:

>

## 17. Catálogo de bancos — painel administrativo

1. [ ] Abrir o catálogo e confirmar loading, vazio, sucesso e erro.
2. [ ] Cadastrar um banco com código e nome válidos.
3. [ ] Confirmar que o banco aparece sem duplicar a lista.
4. [ ] Tentar cadastrar o mesmo código e validar o conflito `409`.
5. [ ] Confirmar que somente bancos ativos aparecem no portal do cliente.

Endpoints esperados:

- `GET /api/v1/admin/banks`
- `POST /api/v1/admin/banks`

Observações:

>

## 18. Contas bancárias — painel administrativo

1. [ ] Abrir um cliente sem contas e validar o estado vazio.
2. [ ] Cadastrar uma conta válida usando um banco do catálogo.
3. [ ] Confirmar que agência, conta e chave Pix aparecem mascaradas.
4. [ ] Abrir o detalhe, editar um campo permitido e salvar.
5. [ ] Cadastrar uma segunda conta e defini-la como principal.
6. [ ] Confirmar que apenas uma conta permanece principal.
7. [ ] Alterar o status e confirmar atualização da lista.
8. [ ] Arquivar a conta secundária após confirmação.
9. [ ] Recarregar e confirmar persistência de todas as alterações.

Endpoints esperados:

- `GET|POST /api/v1/admin/customers/{id}/bank-accounts`
- `GET|PATCH /api/v1/admin/customers/{id}/bank-accounts/{bankAccountId}`
- `POST /api/v1/admin/customers/{id}/bank-accounts/{bankAccountId}/set-primary`
- `PATCH /api/v1/admin/customers/{id}/bank-accounts/{bankAccountId}/status`
- `POST /api/v1/admin/customers/{id}/bank-accounts/{bankAccountId}/archive`

Observações:

>

## 19. Contas bancárias — portal do cliente

1. [ ] Listar somente bancos ativos.
2. [ ] Validar o estado vazio das próprias contas.
3. [ ] Cadastrar uma conta e confirmar mascaramento na resposta e na tela.
4. [ ] Editar a conta e confirmar persistência.
5. [ ] Cadastrar uma segunda conta e torná-la principal.
6. [ ] Arquivar a conta secundária.
7. [ ] Confirmar que número integral e chave Pix bruta nunca aparecem em tela ou log.
8. [ ] Em usuário bloqueado pelo guard `Deposit`, exibir a ação de onboarding correta.

Endpoints esperados:

- `GET /api/v1/client/banks`
- `GET|POST /api/v1/client/profile/bank-accounts`
- `GET|PATCH /api/v1/client/profile/bank-accounts/{bankAccountId}`
- `POST /api/v1/client/profile/bank-accounts/{bankAccountId}/primary`
- `POST /api/v1/client/profile/bank-accounts/{bankAccountId}/archive`

Observações:

>

## 20. Documentos — portal do cliente (fluxo prioritário)

Usar somente `/api/v1/client/profile/documents/*`; não usar
`/data-intake/submissions/*`.

1. [ ] Abrir a tela e conferir overview, progresso e requisitos pendentes.
2. [ ] Conferir o catálogo de tipos e a definição de dados para tipo/país.
3. [ ] Selecionar PDF, JPEG e PNG válidos e visualizar nome e tamanho.
4. [ ] Rejeitar no frontend formato não permitido e arquivo maior que 25 MB.
5. [ ] Enviar um arquivo válido por multipart e acompanhar loading/progresso.
6. [ ] Confirmar atualização de overview, progress e onboarding após o upload.
7. [ ] Baixar diretamente e abrir o arquivo correto.
8. [ ] Gerar URL temporária e confirmar que ela funciona dentro da validade.
9. [ ] Usar um documento rejeitado e substituí-lo por outro arquivo válido.
10. [ ] Confirmar que requisito conflitante, rejeição e storage indisponível têm mensagens distintas.
11. [ ] Recarregar e confirmar que status e progresso persistem.

Endpoints esperados:

- `GET /api/v1/client/profile/documents/overview`
- `GET /api/v1/client/profile/documents/progress`
- `GET /api/v1/client/profile/document-types`
- `GET /api/v1/client/profile/document-types/{documentTypeId}/countries/{countryId}/data-definition`
- `POST /api/v1/client/profile/documents`
- `POST /api/v1/client/profile/documents/{documentId}/replace`
- `GET /api/v1/client/profile/documents/{documentId}/download`
- `GET /api/v1/client/profile/documents/{documentId}/temporary-url`

Observações:

>

## 21. Configuração documental — painel administrativo

1. [ ] Listar e cadastrar categoria documental.
2. [ ] Listar e cadastrar tipo de documento.
3. [ ] Configurar país para o tipo selecionado.
4. [ ] Criar schema de metadados, validar o schema e uma instância.
5. [ ] Publicar o schema e confirmar que passa a ser usado na definição.
6. [ ] Consultar definições de upload e dados.
7. [ ] Retirar um schema somente após confirmação e validar o estado resultante.
8. [ ] Confirmar mensagens específicas para conflito e validação.

Endpoints esperados: `/api/v1/admin/document-categories`,
`/api/v1/admin/document-types` e os sub-recursos de país e `metadata-schemas`.

Observações:

>

## 22. Requisitos e revisão documental — painel administrativo

1. [ ] Criar e listar um requisito documental para o cliente.
2. [ ] Abrir overview, progresso e agrupamento de documentos.
3. [ ] Fazer upload administrativo de um documento válido.
4. [ ] Abrir o detalhe e baixar o arquivo diretamente.
5. [ ] Gerar e testar a URL temporária.
6. [ ] Rejeitar com motivo obrigatório e confirmar o status no portal do cliente.
7. [ ] Substituir o documento rejeitado pelo portal.
8. [ ] Aprovar a nova versão no painel administrativo.
9. [ ] Confirmar atualização de summary, cards, overview e progress.
10. [ ] Alterar status e excluir somente um documento descartável de homologação.

Endpoints esperados: `/api/v1/admin/customers/{customerId}/document-requirements`,
`/documents`, `/documents/overview`, `/documents/progress` e
`/api/v1/admin/documents/{id}` com seus sub-recursos.

Observações:

>

## 23. Compliance — painel administrativo

1. [ ] Abrir o card sem flags e validar o estado saudável.
2. [ ] Criar uma flag com os campos obrigatórios.
3. [ ] Confirmar atualização do card, alertas e histórico.
4. [ ] Editar a flag e recarregar a página.
5. [ ] Resolver uma flag e confirmar que ela deixa de estar pendente.
6. [ ] Criar outra flag, descartá-la e conferir o histórico.
7. [ ] Confirmar que o portal do cliente não expõe flags nem evidências internas.

Endpoints esperados: `/api/v1/admin/customers/{id}/compliance/card`, `/flags`,
`/alerts`, `/history`, `/flags/{flagId}/resolve` e `/dismiss`.

Observações:

>

## 24. Verificação e timeline

1. [ ] No painel, carregar o catálogo de áreas de verificação.
2. [ ] Consultar o nível atual do cliente.
3. [ ] Alterar o status de uma área e confirmar atualização do nível.
4. [ ] Abrir a timeline administrativa e validar paginação e ordem cronológica.
5. [ ] No portal, abrir a timeline própria.
6. [ ] Confirmar que o cliente vê apenas eventos permitidos da própria conta.

Endpoints esperados:

- `GET /api/v1/admin/customer-verification/catalog`
- `GET /api/v1/admin/customers/{customerId}/verification-level`
- `PUT /api/v1/admin/customers/{customerId}/verification-areas/{areaId}/status`
- `GET /api/v1/admin/customers/{id}/timeline`
- `GET /api/v1/client/profile/timeline`

Observações:

>

## 25. Onboarding e autosserviço de conta

1. [ ] Consultar o onboarding e conferir etapa atual, pendências e ações.
2. [ ] Para cada resposta `403` de guard, exibir a ação necessária em vez de erro genérico.
3. [ ] Solicitar confirmação de e-mail e concluir com código válido.
4. [ ] Validar código inválido/expirado e reenvio com controle de repetição.
5. [ ] Solicitar recuperação de senha e concluir a redefinição.
6. [ ] Alterar a senha autenticada e entrar novamente com a senha nova.
7. [ ] Solicitar e confirmar telefone; validar código inválido/expirado.
8. [ ] Listar sessões, revogar uma sessão secundária e revogar todas as demais.
9. [ ] Confirmar que senha, códigos e tokens não aparecem em logs ou mensagens.

Endpoints esperados: `/api/v1/client/onboarding/status`, rotas de confirmação de
e-mail e reset de senha, `/api/v1/users/me/password`, `/phone-verification/*` e
`/api/v1/users/me/sessions`.

Observações:

>

## 26. Avatar, assinatura e compartilhamento

1. [ ] Enviar avatar válido, recarregar e abrir sua URL.
2. [ ] Excluir o avatar e confirmar o estado vazio.
3. [ ] Enviar assinatura válida, recarregar e abrir sua URL.
4. [ ] Excluir a assinatura e confirmar o estado vazio.
5. [ ] Criar um link de compartilhamento com o escopo disponível.
6. [ ] Abrir `/api/v1/public/profiles/{token}` sem sessão e conferir somente dados autorizados.
7. [ ] Revogar o link e confirmar que o token deixa de funcionar.
8. [ ] Confirmar que uploads inválidos e storage indisponível têm mensagens amigáveis.

Endpoints esperados: `/api/v1/client/profile/avatar`, `/signature`,
`/share-links` e `/api/v1/public/profiles/{token}`.

Observações:

>

## 27. Regressão e aceite final do Marco 2

Executar com perfis Admin e Client separados.

- [ ] Reexecutar as seções 1 a 26 sem regressão.
- [ ] Testar loading, vazio, sucesso e falha nas telas novas.
- [ ] Testar respostas `401`, `403`, `404`, `409`, `422` e `429` aplicáveis.
- [ ] Testar troca de workspace quando o usuário possuir mais de um.
- [ ] Confirmar que toda escrita envia `Idempotency-Key` estável por ação.
- [ ] Confirmar que dados sensíveis estão mascarados e ausentes dos logs.
- [ ] Executar lint e build nos dois frontends.
- [ ] Executar `git diff --check` nos dois repositórios.
- [ ] Confirmar que contratos, transações, investimentos, patrimônio, OCR avançado
  e `/data-intake/submissions/*` não foram incluídos neste marco.
- [ ] Todos os bugs de backend deste documento foram corrigidos e revalidados,
  ou formalmente aceitos como impedimento externo com responsável definido.
- [ ] Checklist técnico `MILESTONE-2-CHECKLIST.md` está integralmente atualizado.
- [ ] Marco 2 aprovado pelo responsável da homologação.

Resultado final:

- Data: ____/____/________
- Commit do `strategy-control`: ________________________________
- Commit do `Strategy-analytics-v2`: ___________________________
- Responsável: ________________________________________________
- Situação: [ ] Aprovado  [ ] Reprovado  [ ] Aprovado com ressalvas
- Ressalvas:

>

## Bugs encontrados

|  Nº | Tela/fluxo | Passos para reproduzir | Endpoint | HTTP | Request ID / Correlation ID | Situação |
| --: | ---------- | ---------------------- | -------- | ---: | --------------------------- | -------- |
|   1 | Detalhe/resumo | Abrir qualquer cliente homologado | `GET /admin/customers/{id}/summary` | 500 | `019fce0fd6e77f929de00cb9d1ba4bab` / `019fce0fd6e774e7852d15cce6e3e6e1` | Aberto |
|   2 | Nomes e contatos | Salvar mais de um item e reabrir o editor | `GET /admin/customers/{id}/identification` | 200 | `019fce1340027a24b6bcb3c66be5e465` / `019fce1340027fbe906bedfa6204358c` | Aberto |
|   3 | Contatos | Salvar contato `Phone` ou `Mobile` | `PUT /admin/customers/{id}/contacts` | 400 | `019fce2054137e949a87b7d2c9c5a8f2` / `019fce2054137ef68e6975336ab6f9ef` | Aberto |
|   4 | Escritas cadastrais | Salvar nomes, contatos ou endereços pelo navegador | `PUT /admin/customers/{id}/*` | — | Requisições diretas `200`; navegador sem resposta acessível | Aberto |

## Evidências e notas gerais

>
