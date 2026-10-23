# QA — Reenvio pelo upload do perfil — 23/10/2026

Conta fictícia: client@example.com. Nenhum documento pessoal real ou dado da conta do usuário utilizado.

## Primeiro teste em homologação

- Controle existente Upload de arquivo de um RG antigo rejeitado abriu Substituir documento. Arquivo PNG marcado FICTÍCIO/SEM VALIDADE escolhido pelo seletor do navegador e enviado. A tela confirmou envio e exibiu o novo arquivo.
- Backend preservou o lado Back e vínculo ao provided-document antigo 60c4c5da-716d-48f2-91df-ecd176b9df8e. Novo arquivo 7f1824b2-5502-4799-8f00-904e77364dd7. O provided-document atual é b532bff0-eac0-437c-b557-0bddc15fc091, que mantinha os dois arquivos Approved.
- Apesar disso, progresso passou de 100% para 0% e submission voltou para UnderReview/lock=true. A consulta do perfil manteve a identificação atual com evidências aprovadas. Solicitar ao backend que desconsidere/bloqueie substituição de identificação histórica no cálculo e no estado de onboarding. Não mascarar no front a porcentagem real devolvida pela API.

## Correções do front

- [x] Leitura de files do overview preserva IDs, lados e vínculos de cada arquivo. Frente e verso ficam sob uma única identificação na tabela existente, sem criar colunas/campos/ações.
- [x] Identificações antigas divergentes do documento atual retornado pelo perfil deixam de oferecer reenvio. Seus arquivos não reaparecem como anexos soltos nem por requisitos de progresso antigos. Outros anexos legítimos são preservados.
- [x] Antes de substituir uma evidência vinculada, reconsultar perfil e overview; impedir envio se a identificação mudou ou o arquivo já foi aprovado. Erro mantém o arquivo selecionado e o diálogo existente.
- [x] 288 testes, lint e build aprovados. Testes cobrem lados, histórico, obrigação alternativa, preflight e preservação do rascunho.
- [x] Publicação 65fc601; pipeline 39894409091 concluída com sucesso em testes/lint/build/upload/ativação. Tabela publicada mostra apenas RG atual e reúne os dois lados.
- [x] Reenvio dos dois lados atuais feito pelo upload do perfil em homologação. Conferência de metadados/vínculos, aprovação única e nova consulta aprovadas.

Preparação do segundo teste: revisão administrativa via API reprova somente o RG fictício atual (resposta 201). A rodada anterior já homologou a ação de reprovação pela tela do Admin. Os dois uploads seguintes foram feitos pelo navegador da Área do Cliente.

## Reenvio pela tela publicada

- Seletor real do navegador escolheu qa-perfil-frente-corrigida.png e qa-perfil-verso-corrigido.png em dois envios pelo controle existente Upload de arquivo. Nenhum POST de upload foi feito por script nesta segunda rodada.
- Enviar sem arquivo exibiu Selecione um arquivo e manteve o diálogo; após seleção válida, o envio concluiu normalmente.
- Overview retornou somente os novos IDs f121ab47-6ada-4c15-a63a-22bfeaa39921 (Front) e 9a1f6fb1-6413-411d-b613-4b68fd44f4e9 (Back) no provided-document atual b532bff0-eac0-437c-b557-0bddc15fc091, ambos Uploaded. Evidências antigas saíram desse vínculo.
- Hash dos campos de identificação antes/depois confirmou preservação de ID, tipo, número mascarado, emissor/UF, datas, país e versão de schema. Nenhum dado foi inventado ou redigitado no reenvio.
- A tela retirou os motivos antigos e apresentou ambos os novos arquivos Enviado. Submission retornou UnderReview/lock=true, esperado até a revisão.

## Aprovação e persistência

- Ação Aprovar do RG atual executada uma única vez pela tela do Admin, no arquivo 9a1f6fb1-6413-411d-b613-4b68fd44f4e9. API confirmou Front e Back Approved no mesmo grupo.
- GET documents/progress retornou 100%; onboarding/status retornou Approved e profileEditingLocked=false. Nenhuma aprovação da CNH ou envio de passaporte foi necessário.
- Nova comparação após aprovação confirmou os metadados da identificação iguais à linha de base. Recarga da Documentação mostrou os dois nomes novos aprovados e sem motivos de rejeição antigos.
- Evidência dos envios pela tela: perfil-reenvio-frente-verso-pendente-hml.png. A conferência final da apresentação é registrada abaixo.

O fluxo atual de reenvio pelo upload do perfil foi homologado. Permanece somente a pendência de API descrita no primeiro teste: permitir substituir um provided-document histórico ainda pode afetar progresso/onboarding da identificação atual. O front agora evita esse caminho e não altera a porcentagem recebida do servidor.

## Conferência final

Em 23/10, nova abertura da página publicada confirmou os dois arquivos novos Approved e progresso 100%, sem documentos antigos rejeitados como opções de reenvio. Desktop conferido no padrão existente; a medição responsiva em viewport 390 px retornou documento 378 px, sem overflow da página. Viewport restaurado ao final.

Evidência final: perfil-reenvio-frente-verso-aprovado-hml.png, na pasta de evidências desta conversa. Conta fictícia preservada com RG atual aprovado; CNH e passaporte não foram aprovados/enviados nesta rodada. A conta pessoal do usuário não foi modificada.
