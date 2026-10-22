# Retorno do backend — integração de 22/10/2026

## Implementado nesta rodada

- Conta bancária do cliente: removidos tipo, nome e documento do titular do cadastro e edição. Allowlist também na camada HTTP impede enviar esses campos antigos. Conflito de documento fiscal ausente recebe mensagem para corrigir o perfil. Contas antigas não são alteradas durante leitura.
- Etapa 4: mantidos ocupação, empregador opcional e três valores financeiros; moedas retiradas do formulário/revisão e do PATCH da etapa. A moeda da conta é responsabilidade do backend ao definir residência. Financeiro não envia effectiveTo.
- Etapa 6: checkbox de ausência existente salva PUT trusted-contacts/declaration e recupera GET após nova sessão. Contatos existentes são preservados; a opção não os apaga.
- Etapa 7: confirmação já existente envia POST onboarding/submit com apenas truthfulnessConfirmed=true, via escrita idempotente. Sem confirmação não há POST. Sucesso navega ao perfil e limpa só a retomada dessa conta; erro mantém rascunhos.
- Edição do perfil/cadastro usa submission.profileEditingLocked, inclusive desbloqueio após recusa. Falha da consulta usa o erro existente da seção e não libera escrita implicitamente.
- Wizard documental envia Front/Back nos uploads e reúne os IDs em evidenceDocumentIds. Passaporte permanece com o arquivo único. Não se inventa tipo documental para países sem catálogo.
- Países no cadastro e perfil são traduzidos pelo isoCode no idioma salvo da conta, preservando o label real da API quando não há tradução.
- Patrimônio: criação sem currencyId permite usar a moeda principal da conta; edição preserva o ID original; apresentação prioriza currencyCode. Retirado seletor que impedia conta sem carteira de salvar.
- Admin: busca existente da tabela e cartões usa search para nome/e-mail/ID/documento/assessor, sem restringir simultaneamente por nome.

## Validação

274 testes do portal e 107 do Admin aprovados; lint, build e diff das alterações aprovados. Testes automatizados cobrem os contratos e regressões. Publicação e conferência visual em andamento. Arquivos prévios PRODUCT.md, MILESTONE-3-INTEGRATION.md e snapshot do Swagger do Admin preservados fora do commit.

## O que não está homologado integralmente

- Envio final real depende de requisitos/consentimentos aceitos. Não registrar aceite legal por conta própria, nem considerar mocks como submissão real. Fluxo final, nova sessão e recusa precisam de rodada integrada com conta própria de teste.
- Imagens patrimoniais: endpoints de upload/vínculo/remoção existem; a galeria atual é de leitura. Integração das ações previstas no desenho ainda é trabalho do front, não endpoint ausente.
- Frente/verso: payload do wizard adaptado; conferir a projeção files e a visualização dos dois arquivos no Admin/portal, além da aprovação única. Não marcar a homologação integrada como concluída só pelo envio dos IDs.
- Ficha do Admin: defaults, status e data de envio agora são devolvidos; conferir a projeção no desenho aprovado com cliente recém-enviado. Não solicitar novamente esses contratos como inexistentes.
- Busca de banco completa já disponível no front; o uso opcional de search do servidor não exige novo campo. Validar código/nome nos dois ambientes.
- Reenvio/vínculo e metadados, valores de contratos, segurança/HttpOnly, consentimentos versionados e módulos restantes mantêm os limites da documentação anterior até reteste específico. A regra exclusiva de CNH e a ausência de moeda patrimonial deixam de ser bloqueios contratuais após este retorno.
