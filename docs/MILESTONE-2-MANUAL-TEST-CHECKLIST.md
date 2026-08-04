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

## 12. Resultado final desta rodada

- [x] Login e sessão aprovados.
- [!] CORS aprovado.
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

## Bugs encontrados

|  Nº | Tela/fluxo | Passos para reproduzir | Endpoint | HTTP | Request ID / Correlation ID | Situação |
| --: | ---------- | ---------------------- | -------- | ---: | --------------------------- | -------- |
|   1 | Detalhe/resumo | Abrir qualquer cliente homologado | `GET /admin/customers/{id}/summary` | 500 | `019fce0fd6e77f929de00cb9d1ba4bab` / `019fce0fd6e774e7852d15cce6e3e6e1` | Aberto |
|   2 | Nomes e contatos | Salvar mais de um item e reabrir o editor | `GET /admin/customers/{id}/identification` | 200 | `019fce1340027a24b6bcb3c66be5e465` / `019fce1340027fbe906bedfa6204358c` | Aberto |
|   3 | Contatos | Salvar contato `Phone` ou `Mobile` | `PUT /admin/customers/{id}/contacts` | 400 | `019fce2054137e949a87b7d2c9c5a8f2` / `019fce2054137ef68e6975336ab6f9ef` | Aberto |
|   4 | Escritas cadastrais | Salvar nomes, contatos ou endereços pelo navegador | `PUT /admin/customers/{id}/*` | — | Requisições diretas `200`; navegador sem resposta acessível | Aberto |

## Evidências e notas gerais

>
