# QA — Envio final e consentimentos — 22/10/2026

## Implementação

- [x] Bloco de aceite dos Termos de Uso e da Política de Privacidade reutilizado na etapa 7, autorizado pelo usuário. Identidade visual e confirmação de veracidade existentes preservadas.
- [x] Textos e versões reais consultados em GET /client/consents/requirements?context=Onboarding&locale=pt-BR. Consulta é autenticada.
- [x] Somente aceite explícito das versões exibidas gera POST /client/consents/decisions (source Web; decision Accepted). Cookies e marketing não são aceitos automaticamente.
- [x] Nova versão ou falha na consulta impede o envio sem perder os dados. A flag legada requiredConsentsCompleted não substitui o aceite versionado.
- [x] POST /client/onboarding/submit envia somente truthfulnessConfirmed=true, usando o transporte idempotente existente.
- [x] Confirmação visual /cadastro/enviado exige status real com data de envio; acesso direto sem envio volta à revisão. Consulta com erro não mostra sucesso.
- [x] Cadastro bloqueado usa submission.profileEditingLocked, sem deduzir bloqueio por nível documental. Cadastro já enviado e bloqueado não é reenviado.
- [x] 283 testes aprovados. Lint/build aprovados antes da publicação. Revisão local desktop e 390 px: sem overflow horizontal.

## Homologação integrada

- [x] Publicado em hml: commit fdd90d2, pipeline 39889717046 concluída com sucesso, incluindo Upload release e Activate release.
- [ ] Aceite explícito dos dois termos e envio real com conta fictícia client@example.com.
- [ ] Confirmar bloqueio de edição após envio e desbloqueio após rejeição/aprovação documental.
- [ ] Nova sessão/consulta recupera status enviado.

Nenhuma aprovação integrada é presumida a partir de testes automatizados.

## Pendência real do backend

GET /client/onboarding/status informou requiredConsentsCompleted=true, mas GET /client/consents/requirements?context=Onboarding&locale=pt-BR informou isSatisfied=false, Termos de Uso e Política de Privacidade Pending na mesma conta fictícia. Alinhar as projeções. O front consulta as versões atuais antes de enviar.

Contrato validado sem aceite: source inválido retorna 400 consents.invalid_source; source Web + decisão inválida retorna 400 consents.invalid_decision; source Web + Accepted para UUID inexistente retorna 409 consents.version_not_applicable. Não foi registrado aceite nesses testes.

Preparação integrada: conta fictícia client@example.com, sem identidade informada anterior. Criados dois PNGs marcados DOCUMENTO FICTICIO - SEM VALIDADE - TESTE QA; uploads Front e Back e agrupamento em provided-documents retornaram 201. Nenhum documento existente foi substituído.

Conferência publicada: revisão final carregou o RG fictício; links abriram textos reais versão 1.0. Bloco de aceite, confirmação de veracidade e ações existentes preservados. Aceite e envio real aguardam confirmação específica do usuário; não há comprovação integrada de bloqueio/desbloqueio nesta rodada até essa ação.
