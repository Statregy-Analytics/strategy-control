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

274 testes do portal e 107 do Admin aprovados; lint, build e diff das alterações aprovados. Testes automatizados cobrem os contratos e regressões. Publicado: portal 3392626, pipeline 39856647893; Admin c4f7849, pipeline 39856658075. Ambas concluídas com sucesso em upload e ativação.

Conferência em homologação com a sessão existente do Jorge:

- Perfil carregou dados reais e manteve edição disponível conforme bloqueio oficial.
- Nova conta bancária abriu com os oito controles restantes, sem tipo/nome/documento do titular; formulário descartado sem gravação.
- Patrimônios existentes exibiram BRL, USD e EUR por currencyCode; veículo EUR abriu para edição sem seletor de moeda e foi descartado, preservando dados.
- Etapa 4 exibiu apenas ocupação, empregador e três valores financeiros reais, sem moedas. Etapa 6 leu contato/declaração sem erro. Etapa 7 carregou revisão, checkbox e botão existentes, sem submeter o cadastro.
- Busca do Admin pelo e-mail do Jorge encontrou o mesmo cliente em cartões e tabela; busca limpa e visualização em cartões restauradas. Admin em 390 px: largura do documento 375 px, sem overflow horizontal. Portal conferido no desktop; a nova rodada mobile do portal permanece ao QA.

Não houve novas contas bancárias, patrimônios, uploads, aceite de termos ou envio final durante a revisão no navegador. Os salvamentos e conflitos desta rodada foram cobertos em testes controlados, não apresentados como homologação integrada.

Evidências: retorno-backend-22-conta-bancaria-hml.png e retorno-backend-22-etapa-4-hml.png na pasta de evidências desta conversa. Arquivos prévios PRODUCT.md, MILESTONE-3-INTEGRATION.md e snapshot do Swagger do Admin preservados fora do commit.

## O que não está homologado integralmente

- Envio final real depende de requisitos/consentimentos aceitos. Não registrar aceite legal por conta própria, nem considerar mocks como submissão real. Fluxo final, nova sessão e recusa precisam de rodada integrada com conta própria de teste.
- Imagens patrimoniais: endpoints de upload/vínculo/remoção existem. Atualização de 23/10: Admin integrado e testado com fotos fictícias nos editores C11/C12, sem ações extras; [relatório](QA-2026-10-23-IMAGENS-PATRIMONIO.md). O fluxo de envio da Área do Cliente não foi revalidado nessa rodada. Não solicitar nova API para os casos concluídos no Admin.
- Frente/verso: payload do wizard adaptado; conferir a projeção files e a visualização dos dois arquivos no Admin/portal, além da aprovação única. Não marcar a homologação integrada como concluída só pelo envio dos IDs.
- Ficha do Admin: defaults, status e data de envio agora são devolvidos; conferir a projeção no desenho aprovado com cliente recém-enviado. Não solicitar novamente esses contratos como inexistentes.
- Busca de banco completa já disponível no front; o uso opcional de search do servidor não exige novo campo. Validar código/nome nos dois ambientes.
- Reenvio/vínculo e metadados, valores de contratos, segurança/HttpOnly, consentimentos versionados e módulos restantes mantêm os limites da documentação anterior até reteste específico. A regra exclusiva de CNH e a ausência de moeda patrimonial deixam de ser bloqueios contratuais após este retorno.
