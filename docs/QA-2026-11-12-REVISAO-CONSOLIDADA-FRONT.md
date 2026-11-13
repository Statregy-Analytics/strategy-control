# QA — revisão consolidada do frontend — 12/11/2026

## Correção do incidente de sessão — 12/11, 22h

O relato de falha em Selecionar Sistema levou à reprodução de uma lacuna do front: a instância usada para renovar sessão não incluía Idempotency-Key. A API respondeu 400 idempotency.key_required; essa falha chegava às consultas de usuário e sistemas, explicando a combinação de aviso de verificação de sessão e erro genérico. O 403 administrativo da conta Cliente do Éric é outro cenário e não explica sozinho o incidente. A verificação anterior com sessão válida não cobria essa renovação.

- [x] Incluir chave UUID no POST de refresh, mantendo a renovação única para requisições simultâneas e as chaves das operações originais.
- [x] Reproduzir 400 sem o cabeçalho e 200 com ele na API publicada, usando sessão fictícia do Éric.
- [x] Executar o interceptor real com Axios contra a API: token de acesso propositalmente inválido + refresh válido → duas consultas 401 → refresh 200 → usuário/sistemas 200. Executado para Éric e Admin; sessões criadas pelo teste encerradas com 204.
- [x] Confirmar autorização preservada: cards administrativos retornam 403 para Éric/Cliente e 200 para Admin. Não alterar papéis de usuário para contornar a falha de renovação.
- [x] Regressão: dois testes novos falham contra o código anterior e passam com a correção. Lint, 249 testes locais (241 versionados) e build aprovados.
- [x] **9c47bb4 publicada**, [pipeline 43346452576](https://github.com/Statregy-Analytics/strategy-control/actions/runs/43346452576) aprovada com 241 testes, lint, build, upload e ativação. Bundle index-CBVV5KWG.js conferido na URL pública.
- [x] Navegador publicado: recarga da sessão existente; novo login do Éric, seleção de sistema sem erro/aviso e mensagem específica de permissão nos clientes; saída da sessão de teste; novo login Admin com 14 clientes e retorno à seleção sem aviso de sessão. Não houve concessão de papel Admin à conta Cliente.

[Evidências reduzidas sem credenciais](evidence/qa-2026-11-12-consolidada/session-refresh.json). O teste de renovação foi de transporte com a API real e storage isolado; não se declara expiração natural no navegador. Nenhum campo, ação, estilo ou permissão de negócio foi alterado. Os registros anteriores abaixo mantêm as versões e resultados de suas rodadas.


Este é o ponto único de entrega para a rodada atual. Reúne os resultados anteriores com as correções desta revisão; não transforma caixas históricas em novos pedidos de API. As evidências específicas permanecem vinculadas abaixo. Uma aprovação automatizada não equivale a uma homologação integrada, e uma tela publicada não equivale à aprovação de todos os estados do negócio.

## Correções finais desta rodada

- [x] Admin: abrir documento reserva a aba durante o clique, antes de consultar a URL. Falha e URL inválida fecham a reserva; nova tentativa funciona. Popup bloqueado não dispara consulta inútil.
- [x] Trocar cliente/documento ou sair da ficha invalida a resposta anterior e fecha somente a aba ainda pendente. Documento já aberto permanece aberto. Destino sem opener e sem Referer, reutilizando a solução já publicada no portal.
- [x] Falhas de rede, 429 e 5xx ao verificar/renovar sessão não apagam credenciais. A verificação de acesso continua obrigatória: falha temporária cancela a navegação administrativa, sem conceder acesso. 401/403 continuam tratados como autenticação inválida.
- [x] Histórico do cliente traduz o evento de arquivamento dos dados do documento. Auditoria traduz módulos e vínculos de anexos patrimoniais/contratuais observados no reteste. Valores e identificadores da auditoria são preservados.
- [x] Composição, estilos, campos e ações existentes preservados. Textos do rodapé da tabela de sessões e status documental da revisão traduzidos. Não há nova composição visual nem ativação do estudo futuro de países/preferências.

## Matriz única de entrega

| Área / itens do QA | Front implementado e evidência integrada disponível | Limite vigente |
| --- | --- | --- |
| Admin: seleção e ficha, 39–55 | Cards/lista, máscaras, badges, filtros, paginação, menu e componentes glass. [39–55](QA-2026-10-24-ADMIN-39-55.md), [sessões e conta principal](QA-2026-10-24-CARDS-SESSOES-CONTA-PRINCIPAL.md). | Escala de classificação depende de decisão do Éric. Exibir valor real; principal é isPrimary da API. |
| Admin: edição por seção e preferências, 56–58 | Inputs inline, Salvar condicionado à alteração, descarte, bloqueio entre seções, selects glass e ícone Deslogar. [56–60](QA-2026-10-24-ADMIN-56-60.md). | Escritas pessoais/documentais parciais e ações de segurança delimitadas abaixo. |
| Bancos, 59 e 121–130 | Modal existente, busca, máscaras, titular derivado e principal da API. Fluxo integrado positivo com Éric registrado no [121–130](QA-2026-11-04-PERFIL-DOCUMENTACAO-121-130.md). | Cláudio sem documento fiscal: pré-condição da massa, não novo bug bancário. |
| Patrimônio, 60 e 121–130 | Edição/expansão, imagens, vínculos/desvínculos e abertura de arquivos. [Imagens Admin](QA-2026-10-23-IMAGENS-PATRIMONIO.md), [56–60](QA-2026-10-24-ADMIN-56-60.md), [abertura portal](QA-2026-11-12-PATRIMONIO-DOCUMENTOS-ABERTURA.md). | Campos/tipos ausentes e mínimo obrigatório dependem de API/produto. Sem dados fictícios na implementação. |
| Perfil, Documentação e tema, 121–130 | Dados reais, nível oficial, renda persistida/restaurada, termos, abas, prévias e galeria. [Reteste perfil/contratos](QA-2026-11-12-RETESTE-PERFIL-CONTRATOS.md), [termos/abas](QA-2026-11-12-PERFIL-TERMOS-E-ABAS.md), [prévias](QA-2026-11-12-PERFIL-PREVIAS-DOCUMENTOS.md). | Versão documental e elegibilidade dos contadores vêm da API. Nível não é concedido pelo front. |
| Cadastro 1–7 | Integrações existentes, profissional antes dos documentos, CEP/retomada, declaração sem contato, consentimentos na revisão, envio e bloqueio/desbloqueio. [Envio real e nova sessão](QA-2026-10-22-ENVIO-CONSENTIMENTOS.md), [reenvio pelo perfil](QA-2026-10-23-REENVIO-PERFIL.md). | Não reenviar submit, declaração, alternativas de identificação ou profissional como endpoints ausentes. Casos históricos de outubro não representam a situação atual. |
| Home/carteira/extrato | Estados vazios e valores reais, totais por moeda e extratos. [Carteira vazia](QA-2026-10-19-CARTEIRA-VAZIA.md), [carteira](QA-95-PORTFOLIO-INTEGRATION.md), [reteste atual](QA-2026-11-12-RETESTE-PERFIL-CONTRATOS.md). | Contrato encerrado no investido e motor de variação dependem do backend. Não subtrair nem converter ausência em zero no front. |
| Contratos e documentos | Participação individual, lista/detalhe, paginação, navegação, estados vazios e liberação/ocultação real de anexo. [Lista](QA-2026-11-12-LISTA-CONTRATOS.md), [navegação](QA-2026-11-12-CONTRATOS-NAVEGACAO.md), [ciclo integrado](QA-2026-11-12-RETESTE-PERFIL-CONTRATOS.md). | baseAmount já existe; métricas individuais atuais/bloqueadas ainda indisponíveis. |
| Comunicados e transferência ID Strategy | Interface e integração preservadas conforme [relatório](QA-2026-11-12-COMUNICADOS-TRANSFERENCIAS.md). | Sucesso de Comunicados exige massa nível 2; confirmação de transferência e metadados continuam abaixo. |
| Auditoria, 132 | Cinco filtros, busca, exportação, históricos, navegação e tratamento de falhas. [Revisão completa](QA-2026-11-12-AUDITORIA-132-REVISAO-COMPLETA.md). | Nenhum novo endpoint ausente no cenário validado. Cobertura de todos os eventos/módulos não se presume por uma amostra. |

## Pendências reais remanescentes

Esta relação consolida o último reteste documentado; não declara que todos esses pontos foram reconsultados hoje. Detalhes HTTP e evidências no [reteste de perfil e contratos](QA-2026-11-12-RETESTE-PERFIL-CONTRATOS.md) e em [Comunicados/transferência](QA-2026-11-12-COMUNICADOS-TRANSFERENCIAS.md).

### Backend

- Contrato encerrado do Cláudio ainda computado no investido; métricas atuais/resultado e valores atuais/bloqueados individuais indisponíveis. Valor base individual já entregue.
- Identificação da versão documental vigente e esclarecimento da contagem elegível de cinco documentos. Não substituir os contadores oficiais por contagem local.
- Tipos de comprovantes de renda e alternativas civis do Figma ausentes no catálogo; suítes e início do consórcio sem campo correspondente. Compatibilidade do mínimo obrigatório dos bens precisa de alinhamento.
- Escrita administrativa de dados pessoais adicionais; atualização parcial de metadados de RG sem exigir reenviar o número sensível; declaração PEP/observação e ações administrativas de segurança conforme desenho. Leituras e recuperação pública já existem.
- Transferência: própria senha do usuário retorna 409 withdrawal_password_not_set, em desacordo com a confirmação informada. Não criar cadastro de outra senha sem desenho/regra aprovada.
- Comunicados: autor/capa/versão/índice/anexos e correspondência dos grupos do Figma ainda sem contrato completo.

### Massa, decisão e escopo

- Éric/Cláudio com celular não confirmado e nível 0: não certificam liberação positiva de níveis 1–3; disponibilizar massa elegível para Comunicados.
- Documento fiscal do Cláudio ausente: corrigir massa para reteste bancário positivo; o fluxo já passou com Éric.
- Escala A/AA/AAA depende do Éric; preservar escala real recebida até a decisão.
- Moedas/idioma/fuso/países da entrega final seguem adiados. Não são requisito novo desta correção.

## Verificação e publicação

- [x] Admin: lint, 249 testes locais e build aprovados; 8 testes pertencem ao estudo local adiado e não entram no commit. Suíte versionada: 241 testes, incluindo os dois casos da correção de refresh descrita no início.
- [x] Portal: lint, 420 testes e build aprovados. Complementos de tradução do rodapé de sessões e do status na revisão do cadastro, sem alterar estrutura/campos/ações.
- [x] Diff das alterações sem erros de whitespace; arquivos locais não relacionados preservados.
- [x] Testes novos executam scripts reais de App/router/interceptor e do componente documental: rede, 429, 500/503, 401/403, navegação bloqueada, retry e mudança de contexto. Falhas controladas não são chamadas defeituosas provocadas no backend.
- [x] Admin **78074f7** publicado: [pipeline 43330858099](https://github.com/Statregy-Analytics/strategy-control/actions/runs/43330858099) aprovada, incluindo 239 testes, lint, build, upload e ativação. Correção de sessão/documentos incluída desde 198d709.
- [x] Portal **6e013a3** publicado: [pipeline 43331638337](https://github.com/WillTbn/Strategy-analytics-v2/actions/runs/43331638337) aprovada; complemento de sessões 73dad5f incluído. Testes, lint, build, upload e ativação aprovados.
- [x] Navegador em homologação: login Admin; arquivo IRPF fictício do Éric aberto e preservado ao sair da ficha; contratos/transações; Jane com quatro carteiras zeradas e extrato vazio; Cláudio com depósito de R$ 25.000 e Beta Growth encerrado ainda no investido; preferências abertas/descartadas sem gravar; Auditoria com rótulos traduzidos e histórico sem link para ele mesmo.
- [x] Portal com conta fictícia Client já autenticada: Home sem contratos; dados pessoais, Documentação e nível oficial 0; conta bancária mascarada/principal; Contratos e Termos com três termos e contratos vazios; lista de contratos vazia; restrição de Comunicados/Alavancagem pelos níveis exigidos. Nenhuma liberação de nível foi presumida.
- [x] Cadastro: etapa 6 vazia recusada; etapa 4 retomou profissão/rendas sem moedas extras; etapa 5 retomou número 10, emissor/máscara e indicação dos arquivos existentes; etapa 7 revisou dados sem novo envio. Status Active traduzido para Ativo confirmado na versão publicada.
- [x] Rodapé de sessões publicado em português: 1–5 de 16 → 6–10 de 16 → primeira página. Sem revogar sessões. Console sem erros nas duas abas publicadas observadas ao final.

[Resumo reduzido dos testes](evidence/qa-2026-11-12-consolidada/validation-summary.json). O smoke de navegação não é repetição integral de todos os CRUDs e operações financeiras: os ciclos integrados anteriores constam na matriz por área. O override de viewport do navegador não foi aplicado à aba do portal nesta rodada; não declarar uma nova certificação mobile de todas as telas. A ficha publicada do Admin foi conferida em 375 px sem overflow externo; as evidências mobile anteriores continuam nos relatórios específicos.

A primeira tentativa da revisão ampla encontrou 429 na verificação de sessão e páginas seguintes redirecionadas ao login. Essa tentativa não conta como aprovação dessas páginas; motivou a correção de sessão, seguida dos testes automatizados e das conferências publicadas acima.

A revisão visual desta alteração confirma preservação da composição aprovada; não é uma nova certificação pixel a pixel de todos os frames do Figma. Nenhuma operação financeira, novo aceite, alteração de senha ou aprovação de identidade é necessária para validar as correções de sessão/abertura desta rodada.
