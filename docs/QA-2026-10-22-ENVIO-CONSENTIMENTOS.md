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
- [x] Aceite explícito dos dois termos e envio real com conta fictícia client@example.com, autorizados pelo usuário.
- [x] Confirmado bloqueio após envio/reenvio e desbloqueio após rejeição/aprovação documental.
- [x] Logout e novo login no portal recuperaram a confirmação de envio e a aprovação; API também confirmou o status na nova sessão.

Nenhuma aprovação integrada é presumida a partir de testes automatizados.

## Pendência real do backend

GET /client/onboarding/status informou requiredConsentsCompleted=true, mas GET /client/consents/requirements?context=Onboarding&locale=pt-BR informou isSatisfied=false, Termos de Uso e Política de Privacidade Pending na mesma conta fictícia. Alinhar as projeções. O front consulta as versões atuais antes de enviar.

Contrato validado sem aceite: source inválido retorna 400 consents.invalid_source; source Web + decisão inválida retorna 400 consents.invalid_decision; source Web + Accepted para UUID inexistente retorna 409 consents.version_not_applicable. Não foi registrado aceite nesses testes.

Preparação integrada: conta fictícia client@example.com, sem identidade informada anterior. Criados dois PNGs marcados DOCUMENTO FICTICIO - SEM VALIDADE - TESTE QA; uploads Front e Back e agrupamento em provided-documents retornaram 201. Nenhum documento existente foi substituído.

Conferência publicada: revisão final carregou o RG fictício; links abriram textos reais versão 1.0. Bloco de aceite, confirmação de veracidade e ações existentes preservados. O usuário autorizou especificamente o aceite e envio da conta fictícia; teste integrado executado conforme os resultados abaixo.

## Resultado integrado após autorização

- Pela etapa 7 de homologação, aceitos apenas terms-of-use e privacy-policy, versão 1.0. GET requirements retornou isSatisfied=true e ambos Accepted; cookie-policy e marketing-communications permaneceram Pending.
- Envio real confirmado em /cadastro/enviado. GET status: UnderReview, profileEditingLocked=true; data de envio e veracidade 22/10/2026 às 23:44:50 (UTC-3). Recarga manteve a confirmação consultando a API.
- No perfil, os botões de edição ficaram bloqueados com aviso de análise. PUT professional-profile com os mesmos dados retornou 409 onboarding.profile_locked_under_review.
- Reprovação do RG fictício pela ação existente do Admin: uma análise rejeitou os dois lados. GET status mudou para UpdateRequired e profileEditingLocked=false; PUT dos mesmos dados profissionais retornou 200. Motivo Foto ilegível e mensagem fictícia apareceram na Documentação da Área do Cliente.
- Dois novos uploads fictícios Front/Back retornaram 201 e vínculo no mesmo provided-document retornou 200, preservando os metadados de teste. Este preparo do reenvio foi via API; não é homologação do controle de upload do perfil. Status voltou automaticamente a UnderReview com bloqueio true, conferido também na interface.
- Aprovação única pelo Admin aprovou as duas evidências reenviadas. GET status retornou Approved, profileEditingLocked=false, documentLevel=1; PUT profissional com os mesmos dados retornou 200. A CNH preexistente e os demais documentos da conta foram preservados.
- Edição de Atividade Trabalhista aberta no portal, ocupação fictícia alterada para Software Engineer QA, salva e retomada após recarga. Consulta independente confirmou a gravação. Ocupação original Software Engineer restaurada pelo mesmo formulário, mantendo os valores financeiros existentes.

Limite desta rodada: a visualização agrupada dos dois arquivos e a remoção do histórico rejeitado das listas continuam fora deste reteste de envio/bloqueio. A aprovação dos dois lados foi confirmada na API, sem pressupor que todas as telas de arquivos estejam homologadas.

- Nova sessão do navegador: saída pelo menu existente e login com a mesma conta fictícia. Acesso direto a /cadastro/enviado recuperou o envio real e informou acesso ao perfil, sem mensagem de edição bloqueada. Consulta independente confirmou Approved/lock=false, ocupação original e empregador preservados.

Evidências desta rodada: cadastro-enviado-hml.png; perfil-bloqueado-apos-envio-hml.png; rg-reprovado-motivo-hml.png; cadastro-confirmado-nova-sessao-hml.png. Pasta de evidências da conversa. O reteste identificou uma indicação visual incorreta de Passaporte obrigatório, apesar de o RG aprovado satisfazer o grupo IDENTITY. O front foi corrigido para usar alternativeGroup na indicação individual, sem criar campos/ações ou alterar o layout. Obrigações independentes continuam identificadas. 284 testes aprovados, incluindo alternativa versus obrigação independente.

Após aprovação do RG, a Área do Cliente exibiu 100% de progresso, sem aprovação da CNH ou passaporte. GET progress confirmou 1/1 requisito, alternativeGroup=IDENTITY para RG/CNH/passaporte e countsAsComplete=true para o RG. Não é mais bloqueio de obrigatoriedade exclusiva de CNH.

## Encerramento do reteste — 23/10/2026

Ajuste visual 76d2b06 publicado: pipeline 39892601211 concluída com sucesso em testes/lint/build/upload/ativação. Na versão publicada, Documentação manteve 100% com RG aprovado e o passaporte deixou de aparecer como obrigação individual. Evidência adicional: rg-aprovado-progresso-100-hml.png. Perfil liberado registrado em perfil-liberado-apos-aprovacao-hml.png. Sem novos campos ou ações.

Concluído o cenário integrado de envio, bloqueio e desbloqueio após análise. Não equivale à aprovação de todo o QA: continuam separados o agrupamento/visualização de arquivos e o reenvio pelo controle do perfil. O roteiro não alterou a conta pessoal do usuário, contratos ou transações.

Atualização de 23/10: o controle de reenvio pelo upload do perfil foi homologado posteriormente; ver QA-2026-10-23-REENVIO-PERFIL.md para correções, envios reais pelo navegador, aprovação e pendência histórica da API.
