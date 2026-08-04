# Checklist manual de homologação — Marco 2

Checklist focado nas funcionalidades já implementadas no `strategy-control`.

Ambiente: `http://localhost:8080`

Data da homologação: \_**\_/\_\_**/**\_\_\_\_**

Responsável: **\*\***\*\***\*\***\_\_**\*\***\*\***\*\***
Versão/commit testado: **\*\***\*\***\*\***\_\_**\*\***\*\***\*\***

## Como preencher

- Marque `[x]` quando aprovado.
- Marque `[!]` quando houver falha.
- Registre o bug na tabela ao final, sem copiar tokens ou senhas.
- Para falhas de API, anote endpoint, status HTTP, `requestId` e `correlationId`.

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

- [ ] Contatos existentes são carregados.
- [ ] Adicionar contato funciona.
- [ ] Remover contato funciona.
- [ ] Tipos Email, Phone e Mobile estão disponíveis.
- [ ] Apenas um contato permanece como principal.
- [ ] Salvar contatos funciona.
- [ ] Header é atualizado quando o contato principal muda.
- [ ] Dados persistem após `Ctrl+F5`.

Endpoint:

`PUT /api/v1/admin/customers/{id}/contacts`

Observações:

>

## 9. Dados cadastrais — endereços

- [ ] Estado sem endereços é exibido corretamente.
- [ ] Adicionar endereço funciona.
- [ ] Endereço, complemento, cidade, estado e CEP podem ser preenchidos.
- [ ] Tipos Residential, Commercial e Correspondence estão disponíveis.
- [ ] Apenas um endereço permanece como principal.
- [ ] Remover endereço funciona.
- [ ] Salvar endereços funciona.
- [ ] Dados persistem após `Ctrl+F5`.

Endpoint:

`PUT /api/v1/admin/customers/{id}/addresses`

Observações:

>

## 10. Status do cliente

No detalhe, abrir “Status e preferências”.

- [ ] Status atual é carregado.
- [ ] Botão fica desabilitado sem alteração.
- [ ] Alterar para Prospect funciona.
- [ ] Alterar para Active funciona.
- [ ] Alterar para Suspended funciona.
- [ ] Alterar para Archived funciona em cliente de teste.
- [ ] Status do header é atualizado.
- [ ] Status da tabela é atualizado ao retornar.
- [ ] Status persiste após recarregar a página.

Endpoints:

- `GET /api/v1/admin/customers/{id}/status`
- `PATCH /api/v1/admin/customers/{id}/status`

Observações:

>

## 11. Preferências

- [ ] Catálogo de preferências é carregado.
- [ ] Preferências atuais são carregadas.
- [ ] Moeda principal pode ser alterada.
- [ ] Moeda secundária pode ser alterada ou removida.
- [ ] Idioma pode ser alterado.
- [ ] Fuso horário pode ser alterado.
- [ ] Tema pode ser alterado.
- [ ] Salvar apresenta confirmação.
- [ ] Valores persistem após `Ctrl+F5`.
- [ ] Falha do catálogo apresenta botão para tentar novamente.

Endpoints:

- `GET /api/v1/preferences/catalog`
- `GET /api/v1/admin/customers/{id}/preferences`
- `PATCH /api/v1/admin/customers/{id}/preferences`

Observações:

>

## 12. Resultado final desta rodada

- [ ] Login e sessão aprovados.
- [ ] CORS aprovado.
- [ ] Listagem aprovada.
- [ ] Cadastro de pessoa física aprovado.
- [ ] Cadastro de pessoa jurídica aprovado.
- [ ] Detalhe aprovado.
- [ ] Degradação do summary aprovada.
- [ ] Nomes aprovados.
- [ ] Contatos aprovados.
- [ ] Endereços aprovados.
- [ ] Status aprovado.
- [ ] Preferências aprovadas.
- [ ] Nenhum token ou senha foi registrado nas evidências.
- [ ] Podemos avançar para perfil profissional/financeiro.

## Bugs encontrados

|  Nº | Tela/fluxo | Passos para reproduzir | Endpoint | HTTP | Request ID / Correlation ID | Situação |
| --: | ---------- | ---------------------- | -------- | ---: | --------------------------- | -------- |
|   1 |            |                        |          |      |                             | Aberto   |
|   2 |            |                        |          |      |                             | Aberto   |
|   3 |            |                        |          |      |                             | Aberto   |
|   4 |            |                        |          |      |                             | Aberto   |

## Evidências e notas gerais

>
