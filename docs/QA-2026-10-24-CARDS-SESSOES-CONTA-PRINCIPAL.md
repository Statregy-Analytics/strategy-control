# Admin — retorno de cards, sessões e conta principal, 24/10/2026

Continuação das pendências atuais do QA. O estudo de moedas/idioma/fuso/países para entrega final permanece adiado, local e desconectado. Não integra este deploy.

## API conferida em homologação

- [x] GET /admin/customers/cards: 13 registros, três com maskedDocument no formato de sufixo; os demais sem documento retornam null. O front exibe **** e os caracteres finais efetivamente recebidos, sem reconstruir dígitos nem aplicar a máscara antiga que esconderia três dos quatro visíveis.
- [x] Conta única dos três clientes apontados (Carlos, Hercílio e Éric teste novo): isPrimary=true. Conferência por leitura, sem cadastrar/editar conta ou aplicar correção de dados pelo front.
- [x] GET /admin/customers/{id}/sessions responde com sessões dos usuários vinculados ao cliente. Não usa users/me/sessions e não confunde com as sessões do Admin.
- [x] Swagger confirma DELETE individual e DELETE de todas as sessões. Escrita individual usa a instância axios existente com autenticação/idempotência, inclusive resposta 204.

O PR #225 é referência informada pelo backend; não foi revisado/alterado neste trabalho. O resultado observado nos três clientes já confirma a normalização em homologação.

## Front integrado no desenho existente

Referência: [Figma C19](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI/S.A?node-id=1484-69131). Consulta da referência com imagem e contexto de alta fidelidade realizada antes da implementação.

- [x] Expansão Gerenciamento de status de login carrega a tabela real, com Data e hora, IP, Local, Equipamento e Ação/Deslogar.
- [x] Ação Deslogar por linha; bloqueio de envio repetido; recarga e confirmação após DELETE. Não foi criado botão de encerramento em massa, que não está no desenho.
- [x] Loading, vazio real, erro e retentativa independentes da identificação/financeiro/bancos.
- [x] Trocar cliente, fechar a expansão ou sair invalida os efeitos tardios de leitura/escrita. Não tenta desfazer no servidor uma requisição já recebida.
- [x] IP mascarado. Equipamento resumido a partir de dados reconhecíveis do user-agent, sem inventar modelo. Datas inválidas/atributos ausentes ficam como Não informado.
- [x] Tabela contida no card, com rolagem própria no mobile e cores da ação conforme o Figma. Nenhum campo extra.

## Limites que continuam para backend/QA

- **Localização da sessão:** CustomerSessionResponse não fornece cidade/região/país. Coluna Local permanece Não informado; não inferir por IP nem usar serviço externo de geolocalização.
- **Empresas/CNPJ:** o backend informa que não existe tipo CNPJ. CPF/NIF/documento pessoal mascarado pode aparecer quando cadastrado; isso não comprova suporte a documento fiscal de pessoa jurídica. Não rotular um documento pessoal como CNPJ. Se o aceite exigir CNPJ empresarial, falta catálogo/vínculo de documento fiscal no backend.
- Quem não tem documento continua com Documento não informado, conforme null real. Não é falha de exibição do card.
- A remoção da sessão foi conferida na listagem; não foi afirmado que um JWT de acesso já emitido perde validade instantaneamente. A política de expiração/revogação é do servidor.
- O DELETE em massa existe na API, mas não recebeu ação nova no front nem foi exercitado contra sessões existentes. Fica fora do escopo visual aprovado.

Os demais bloqueios anteriores de edição administrativa, PEP/observações, contratos, autorização/HttpOnly e investigação de identidade não são encerrados por estes três retornos.

## Checklist de validação

- [x] Nove testes novos para apresentação/serviço/ciclo de sessões e atualização dos testes da máscara dos cards. Suíte local 179: 171 do escopo publicado + oito da preparação adiada, que não serão versionados neste lote.
- [x] Lint, build e diff das alterações aprovados antes da publicação.
- [x] Local 8080: conta fictícia client@example.com, sessão de teste criada com user-agent identificável, removida pela ação da tabela; GET confirmou a sessão removida e as 24 anteriores preservadas. Sessões de Jorge/Admin não encerradas.
- [x] Mobile local 390px: documento 375px; tabela rola dentro do card e não estoura a página. Desktop revisado com a imagem C19; cores e padding corrigidos no mesmo lote.
- [x] Publicação e regressão no Admin de homologação.
- [ ] Aceite independente do QA sobre os cenários liberados.


## Publicação e reteste concluídos

Runtime **5ef50f4**, [pipeline 40057494980](https://github.com/Statregy-Analytics/strategy-control/actions/runs/40057494980) aprovada em auditoria, **171 testes**, lint, build, upload e ativação. Entrada publicada index-DXIvJmOp.js conferida contra o build local. Os oito testes do estudo futuro não entraram no commit/deploy.

- [x] Grade publicada mostra os quatro caracteres de sufixo recebidos e ausência real. Conferência da Jane com documento mascarado, sem reconstituir prefixo ou aplicar a máscara antiga.
- [x] Conta fictícia client@example.com: tabela carregou sessões dos usuários vinculados. Encerradas duas sessões nessa conta durante o reteste publicado (a sessão fictícia criada nesta rodada e uma sessão anterior de teste). GET confirmou a remoção da sessão nova 0c5961ae-2280-46b3-bb32-4e26b8ee3946, com 23 sessões restantes. Não foi acionado encerramento em massa nem revogação na conta de Jorge ou no Admin.
- [x] Jane: API sem sessões e conta vinculada; tabela mostrou Nenhuma sessão ativa vinculada a este cliente, sem erro ou linhas demonstrativas.
- [x] Desktop 1280px: documento 1265px e tabela 597px sem overflow interno. Mobile 390px: documento 375px, tabela 307px com conteúdo de 560px rolando somente dentro da tabela. Viewport restaurado.
- [x] Leitura da ficha de Jorge para conferir a mesma integração sem encerrar suas sessões.

A UI de logout foi retestada sem alterar nome, documentos, preferências, saldos ou contas bancárias. A migração de conta principal veio do backend; nenhuma gravação administrativa tentou substituir esse resultado. Evidência visual final: admin-sessoes-cliente-hml-24-10.png, na pasta de evidências desta conversa.
