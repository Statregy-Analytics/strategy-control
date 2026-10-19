# QA de 17/10 — triagem e primeiro lote de correções

Atualizado em 19/10/2026. Referência: feedback de homologação enviado pelo usuário, com 19 itens. Este registro não aprova integralmente o Marco 3 nem substitui o checklist de homologação integrada.

## Correções deste lote

- Portal: `/system/` redireciona para a Home; login confirmado entra diretamente na Home.
- Portal: nova tentativa de login limpa o estado anterior; antes de entrar, compara o e-mail digitado e o usuário do login com `/auth/me`, e valida `/client/auth/ping`.
- Portal: respostas e renovações de token de uma sessão anterior são rejeitadas. Uma renovação antiga não pode sobrescrever cookies de outro login nem encerrar a nova sessão. Requisições simultâneas compartilham uma renovação.
- Portal: logout e falha de validação limpam o estado do usuário; foi removido o log bruto do erro de logout.
- Portal: textos do campo de senha, link de cadastro e banner corrigidos conforme o QA.
- Admin: `/landing-page` e `/edit-lp` exigem sessão e papel `Admin`, consultado em `/auth/me`. Isso protege a navegação; a autorização dos endpoints continua obrigatória no servidor.
- Admin: removidos logs de query da autenticação; menu inclui Transações e Contratos existentes.
- Admin: datas sem horário preservam o dia informado pela API na listagem de clientes. Datas com horário continuam respeitando o fuso local.

## Situação por item

| QA | Situação em 19/10 | Próximo passo |
| --- | --- | --- |
| 1 | Redirecionamento corrigido; login com Éric e Cláudio abre a Home. | Repetir o fluxo completo de registro e confirmação no ambiente do QA; cadastro novo não foi criado neste lote. |
| 2 | Preferências integradas no segundo lote de 19/10; Cláudio desbloqueado após salvar o país já registrado no endereço residencial principal. Home e contratos HTTP 200. | Estados e comparações de conta nova continuam pendentes. País ausente também no cadastro exige o fluxo do Figma ou correção na origem, sem campo extra em Preferências. Exibir zero apenas quando confirmado pela API. |
| 3 | Pendente de implementação dos estados e regras de período. | Conferir o novo Figma e dados de criação da conta/primeiro depósito; não confundir série indisponível com ausência de depósito. |
| 4 | Pendente do convite e ação no estado vazio. | Seguir o Figma e confirmar o destino de Solicitar contrato. |
| 5 | Pendente da distinção entre dívida inexistente e consulta indisponível. | Ocultar somente quando ausência de dívida for confirmada. |
| 6 | Estado vazio do Figma aplicado na página e na Home; mocks, filtros e contadores fictícios retirados das listagens. | Integração de publicações depende de contrato HTTP; o Swagger consultado não contém endpoint de conteúdo. |
| 7 | Novo fluxo de sete etapas ainda não implementado. | Conferir Figma e contrato para persistência, retomada, países, documentos e aceite versionado. Não inventar payloads. |
| 8 | Confirmado: nome acompanha a conta, mas resumo, ajustes e sessões ainda contêm exemplos. | Integrar dados próprios, revisão cadastral, estados pendentes e bloqueio de edição conforme o Figma. |
| 9 | Três correções de texto concluídas. | Foto de perfil ainda precisa de validação e correção. |
| 10 | C27–C28 implementadas e integradas: Aprovar/Reprovar no documento pendente, motivo obrigatório, mensagem, atualização de contadores e download. Testados com arquivos descartáveis. | C25–C26 e desbloqueio cadastral ainda dependem de estado explícito do cadastro e efeito da revisão no servidor. Motivo/mensagem usam notes; falta catálogo de motivos. Ver QA-2026-10-19-APROVACAO-DOCUMENTOS.md. |
| 11 | Campos de identificação preservados durante edição, no mesmo bloco. | Edição de documentos e dados pessoais sem contrato de escrita continua bloqueada; ver QA-2026-10-19-EDICAO-POR-SECAO.md. |
| 12 | Composição profissional/financeira mantida, com cinco campos do Figma C24. | Salvamento integrado e restauração dos dados fictícios conferidos em 8080. |
| 13 | Preferências migradas para edição por seção, sem salvamento isolado. | Preservar país e demais metadados da API sem criar campos adicionais. |
| 14 | Corrigido e retestado em 19/10 no Admin local e publicado: Jane com quatro saldos zero, composição e extrato vazios conforme C29; depósito e saldo do Cláudio conferidos. | Deploy 8c64763 confirmado. Evidências e limites em QA-2026-10-19-CARTEIRA-VAZIA.md. |
| 15 | Edição global substituída por uma seção por vez: rascunho, salvar, descartar, bloqueio e proteção de saída implementados conforme C24. | Limites de escrita de identificação/segurança/compliance documentados; aprovação integral depende desses contratos e reteste do QA. |
| 16 | Menu do Figma com Clientes, Contratos e Transações; telas integradas de Formulários, Bancos e Configuração documental acessíveis em Configurações. Trocar Sistema consulta a API e abre a seleção A02. | Parcial: Dashboard sem página; Lógicas, Leads, Assessores e editor de LP ainda são protótipos; Crédito e Comunicados sem implementação. Contratos HTTP desses fluxos ainda precisam ser confirmados. Ver PENDENCIAS-BACKEND-QA.md. |
| 17 | Data sem horário preservada; histórico atual traduzido para português; países dos bancos resolvidos pelo catálogo real, sem UUID na tela. Paginação do catálogo ajustada para exibir a página recebida inteira. | Unicidade de e-mail continua no servidor. Observações e auditoria são preservadas; títulos novos sem tradução mantêm o texto fornecido. |
| 18 | Proteções de identidade e concorrência implementadas e testadas. Incidente original não reproduzido. | Correlacionar logs de autenticação e acesso do QA em 17/10 às 18:16 e retestar no deploy corrigido. Não solicitar senha pessoal do QA. |
| 19 | Rotas de LP protegidas no front por sessão e papel. Tokens ainda usam o transporte atual. | Validar autorização da API e implementar sessão com cookies HttpOnly no servidor/BFF, seguida da adaptação dos dois fronts. |

## Validações deste lote

- Admin na porta 8080; portal na porta 9010.
- Portal: login do Éric abriu a Home e exibiu investimento em USD 250.000,00 e saldo investível BRL 47.500,00. Resumo do perfil identificou Éric.
- Portal: após sair, login do Cláudio abriu a Home e exibiu Banking BRL 25.000,00. Carteira consolidada e contratos ficaram bloqueados por `PreferencesRequired`; não foram considerados aprovados.
- Admin: acesso sem sessão à LP redirecionou para autenticação; sessão administrativa e atalhos conferidos no navegador.
- Testes automatizados: 5 cenários no Admin (acesso administrativo e data no fuso de São Paulo); 13 cenários/testes no portal, incluindo os existentes e 7 novos de isolamento de sessão. Todos passaram.
- `npm run build`: aprovado nos dois projetos, com avisos preexistentes de dependências/chunks/fontes.
- `npm run lint`: aprovado no Admin. No portal, a configuração legada é incompatível com ESLint 9 e eslint-plugin-vue 10 instalados. A avaliação temporária com configuração compatível também revelou 18 erros preexistentes em outros componentes. A configuração e esses componentes não foram alterados neste lote; o lint global do portal permanece pendente.
- Os arquivos alterados do portal foram avaliados com as regras essenciais compatíveis do plugin Vue: nenhum erro. `git diff --check` passou nos arquivos deste lote. O comando global ainda aponta finais de linha em três arquivos que já estavam modificados antes deste trabalho e foram preservados.

## Encaminhamento ao backend

### Ambientes do QA e conferência do deploy em 19/10

O usuário confirmou os endereços: portal `https://hml.strategyanalytics.com.br/` e Admin `https://admin.strategyanalytics.com.br/`.

- Sem sessão, `/landing-page` no Admin redirecionou para `/auth`. Com a conta administrativa, `/edit-lp` abriu o editor. A listagem de Transações foi acessada pelo novo menu.
- Éric entrou diretamente na Home; investimento USD 250.000,00, saldo investível BRL 47.500,00 e os dois contratos foram exibidos. O resumo identificou Éric, mas preserva os dados demonstrativos já apontados no item 8.
- Após logout do Éric, Cláudio entrou diretamente na Home e seu nome foi confirmado no resumo. Banking exibiu BRL 25.000,00; carteira consolidada e contratos exibiram o bloqueio de preferências. Não houve troca indevida de identidade nesse cenário; isso não reproduz nem encerra a investigação do incidente original.
- Os assets públicos consultados contêm os marcadores das proteções: `ERR_SESSION_CHANGED` e validação de identidade no portal; `requiresAdmin` e negativa de acesso administrativo no Admin. Isso confirma a presença dessas proteções no deploy consultado, sem atestar que os 19 itens estejam resolvidos.
- Não foram realizadas operações financeiras, alterações cadastrais ou aprovações documentais nesta conferência.

### Pendências do servidor

1. Investigar o incidente de identidade de 17/10 às 18:16, correlacionando login, refresh, usuário autenticado e último acesso. O endurecimento do front não prova a causa do incidente.
2. Definir o contrato de sessão HttpOnly para Admin e portal: criação e remoção por `Set-Cookie`, refresh/logout, `/auth/me`, credenciais CORS para 8080/9010 e proteção CSRF adequada à implantação. O front não consegue criar cookies HttpOnly.
3. Confirmar autorização administrativa nos endpoints de LP, com negativa para visitante e cliente comum. Fechar a rota não substitui isso.
4. Confirmar como resolver `PreferencesRequired` e como consultar contas novas com saldos efetivamente zero, sem ocultar saldos existentes.
5. Garantir unicidade de e-mail no servidor e revisar dados duplicados existentes.
6. Confirmar contratos HTTP dos fluxos novos: cadastro por etapas, retomada, aceite, revisão de documentos, defaults de risco/compliance/preferências e permissões de edição após aprovação.

O Figma é a referência da interface; disponibilidade de endpoints adicionais não autoriza criar campos ou ações fora do desenho.
