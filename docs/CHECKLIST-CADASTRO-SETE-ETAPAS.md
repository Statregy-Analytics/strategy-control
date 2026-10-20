# Cadastro de sete etapas — checklist de conclusão

Atualizado em 20/10/2026. Referência: Figma BaDXlWpxbIoY4azOaQnXgv, seção 4:25436; variantes da etapa 4 em 37:27141. Este checklist separa tela/validação local de integração e homologação. Nenhuma etapa é concluída integralmente apenas por existir uma tela.

## Ordem e situação

| Etapa | Tela e validação local | Integração e homologação |
| --- | --- | --- |
| 1 · Criar conta | Tela disponível em homologação | Pendente: residência, documentos legais e aceite versionado |
| 2 · Confirmar e-mail | Tela disponível em homologação; lógica pública reutilizada | Serviços existentes reutilizados; envio real e sessão para etapa 3 pendentes |
| 3 · Dados pessoais | Tela e validações locais prontas; opções/obrigatórios pendentes | Catálogos, país de nascimento, múltiplas nacionalidades, gravação e retomada pendentes |
| 4 · Documento e endereço | Oito variações do Figma prontas para conferência em homologação | País real, catálogos, gravação, consulta postal e envio dos arquivos pendentes |
| 5 · Atividade trabalhista | Tela e validações monetárias prontas em homologação | Catálogo, obrigatórios, datas de vigência, gravação e retomada pendentes |
| 6 · Contatos de confiança | Pendente | Resolver relationship obrigatório sem campo extra |
| 7 · Revisão e envio | Pendente | Envio, estado da revisão e bloqueio de edição pendentes |

## 1. Criar conta — Figma 4:25513

- [x] Mapear apenas nome completo, e-mail, residência, senha, confirmar senha, indicação opcional e aceite.
- [x] Criar componentes reutilizáveis de estrutura/progresso e formulário; sem campos extras ou senha em armazenamento/URL.
- [x] Validar obrigatórios, e-mail, senha com pelo menos oito caracteres, confirmação exata, uma residência válida e aceite explícito. Não impor complexidade de senha ou regras de nome não confirmadas.
- [x] Conferir desktop, celular, teclado, erros, seleção única e formulário válido no navegador.
- [x] 59 testes, lint e build aprovados; revisão do diff sem erros nos arquivos do lote.
- [ ] Integrar residência e aceite versionado com contrato confirmado. América do Sul/Europa/África do desenho são agrupamentos, não IDs de país aceitos pela API.
- [ ] Disponibilizar textos/URLs e versões reais dos Termos e da Política; não inventar documentos nem registrar aceite fictício.
- [ ] Homologar criação real e vínculo com a etapa 2, sem descartar os dados novos.

Validações locais conferidas: vazio, senha divergente, aceite ausente, residência única e preenchimento válido. Fonte local licenciada preserva as bandeiras do Figma também no Windows. Assets de logo/máscara/seta existentes reutilizados nos tamanhos originais. Nenhum dado foi enviado ao servidor.

A tela de homologação fica em http://localhost:9010/cadastro/etapa-1. Não chama a API, não cria conta, não transmite aceite e não avança como se tivesse salvado. Ela está incluída no build de homologação; o cadastro integrado atual permanece preservado até a integração suficiente.

## 2. Confirmar e-mail — Figma 4:25620

- [x] Implementar a composição e o progresso 2/7 usando somente campos/ações do desenho.
- [x] Reutilizar serviços e lógica de confirmação/reenvio públicos existentes; validar código e tratar inválido, expirado, já usado e limites de tentativa/reenvio, com transporte controlado nos testes.
- [x] Preservar endereço em memória e limpar o código ao concluir/sair; descartar respostas tardias e impedir pedidos simultâneos, sem código em URL/logs.
- [ ] Confirmar a sessão após o e-mail e o encaminhamento à etapa 3, sem abrir a Home antes da conclusão exigida.
- [ ] Homologar envio/recebimento e retomada real.

- [x] Conferir desktop/celular, código obrigatório, entrada alfanumérica, reenvio bloqueado na prévia e retorno à etapa 1; 70 testes, lint, build e diff aprovados.

Prévia: http://localhost:9010/cadastro/etapa-2. Usa endereço demonstrativo mascarado e bloqueia o transporte; não envia e-mail, não confirma código nem simula sucesso/avanço. A rota está incluída no build publicado em homologação. A confirmação pública atual permanece disponível e usa a mesma lógica e os mesmos serviços HTTP. O placeholder 000000 não define tamanho/formato do código; o contrato aceita string sem restrição documentada.

A próxima tela incremental é a etapa 6. A confirmação real e a sessão para continuar o cadastro ainda precisam ser homologadas; a resposta de confirmação atual contém somente succeeded/message.

## 3. Dados pessoais — Figma 6:25562

- [x] Implementar nascimento, gênero, estado civil, nacionalidades, país e cidade de nascimento conforme desenho, reutilizando estrutura, rótulos, inputs e assets existentes.
- [x] Validar data real, ano bissexto e ausência de data futura; conferir escolhas contra opções fornecidas e impedir nacionalidades repetidas.
- [x] Adicionar nacionalidade somente pela ação do desenho, após preencher a anterior; linha adicional vazia não bloqueia o formulário, pois não há ação de remoção no Figma.
- [ ] Confirmar catálogos e obrigatórios do cadastro. O perfil aceita campos nulos e não define essas regras; a tela recebe as regras por propriedades, sem assumir obrigatoriedade ou idade mínima.
- [x] Validar Voltar para etapa 2 e retorno à etapa 3 preservando o rascunho somente em memória, sem armazenamento, URL ou chamada HTTP.
- [x] Conferir desktop/celular, teclado/foco, opções indisponíveis e Continuação bloqueada com aviso; 77 testes, lint, build e diff do lote aprovados.
- [ ] Homologar avanço integrado para etapa 4 após persistência real; a prévia não simula conclusão.
- [ ] Integrar leitura, gravação e retomada; homologar dados próprios e erros sem perda do rascunho.

Tela de homologação: http://localhost:9010/cadastro/etapa-3, incluída no build publicado. Nenhuma opção fictícia foi colocada nos seletores; fixture de catálogo existe apenas nos testes automatizados. A composição aceita opções e obrigatórios confirmados por propriedades. O botão Continuar não avança nem informa gravação quando os catálogos estão ausentes. Não foi alterado o cadastro integrado ou o perfil atual.

## 4. Documento e endereço — Figma 37:27141

- [x] Brasil (6:25690): endereço/CEP, CPF, identificação ou passaporte e filiação conforme desenho.
- [x] Estados Unidos e Canadá (37:27142).
- [x] América do Sul (37:27262).
- [x] Japão (37:27382).
- [x] China (37:27502).
- [x] Europa (37:27622).
- [x] África (37:27742).
- [x] Austrália (37:27862).
- [x] Aplicar somente os campos/formatos de cada variante; documento de identidade ou passaporte, sem solicitar documentos extras.
- [x] Validar calendário nos três formatos, expedição não futura e validade não anterior à expedição. Filiação ausente desabilita o campo sem perder o rascunho ao desmarcar.
- [x] Seleção local de um arquivo por lado; rejeitar vazio/múltiplos, sem upload/progresso fictício. Limites e MIME entram por regras confirmadas, sem impor restrições arbitrárias.
- [x] Preservar campos/arquivos por tipo e país em memória; passaporte tem os quatro campos descritos no desenho e uma página, sem misturar arquivos da identificação.
- [x] Conferir oito telas desktop, Brasil/Japão no celular, foco/teclado, troca de tipo e retorno à etapa 3. 85 testes, lint, build e diff do lote aprovados.
- [ ] Confirmar obrigatórios, formatos fiscais/dígitos, política de validade e limites/tipos de arquivos no contexto do cadastro.
- [ ] Integrar consulta postal Brasil/Japão. Não há consulta reutilizável confirmada; ao sair do campo, o aviso informa indisponibilidade e permite preenchimento manual. Complemento e bairro permanecem separados.
- [ ] Integrar país real, número fiscal, endereço, documentos/upload e retomada; homologar falha/reenvio sem duplicação.

URLs de conferência no hml.strategyanalytics.com.br (sem seletor extra na tela):

| Variação desenhada | Caminho |
| --- | --- |
| Brasil | /cadastro/etapa-4 (ou /br) |
| Estados Unidos, frame EUA/Canadá | /cadastro/etapa-4/us-ca |
| Argentina, referência América do Sul | /cadastro/etapa-4/south-america |
| Japão | /cadastro/etapa-4/jp |
| China | /cadastro/etapa-4/cn |
| Portugal, referência Europa | /cadastro/etapa-4/europe |
| África do Sul, referência África | /cadastro/etapa-4/africa |
| Austrália | /cadastro/etapa-4/au |

Essas URLs selecionam frames para QA, não IDs reais nem a residência autenticada do cliente. O frame EUA/Canadá mostra campos dos Estados Unidos; não foi inventada uma adaptação canadense. Os grupos regionais não autorizam aplicar regras do país de referência a todos os países. Continuar mantém a etapa com aviso de integração, sem simular gravação ou envio.

## 5. Atividade trabalhista — Figma 9:25789

- [x] Implementar somente atividade, renda média mensal individual/familiar e valor aproximado dos bens, com texto de orientação e ações do Figma.
- [x] Validar valores em formato brasileiro, não negativos e com até duas casas de centavos; rejeitar formatos ambíguos sem arredondar ou converter moeda. Distinguir campo vazio de zero explícito e preservar precisão decimal como texto.
- [x] Reutilizar estrutura, primitiva de campo, estilos e assets existentes; conferir desktop/celular, foco, catálogo indisponível e retorno à etapa 4. 91 testes, lint, build e diff do lote aprovados.
- [ ] Confirmar catálogo/valores aceitos de atividade e obrigatórios do onboarding; não inventar opções, faixas de renda ou relação mínima entre os valores.
- [x] Preservar os valores digitados em memória ao voltar à etapa 4 e retornar, sem localStorage, URL ou envio HTTP.
- [ ] Integrar leitura/gravação/retomada e avanço à etapa 6, preservando metadados existentes e sem acrescentar campos de vigência à tela.
- [ ] Homologar moeda e valores efetivamente persistidos.

URL de conferência: https://hml.strategyanalytics.com.br/cadastro/etapa-5. R$ 0,00 é placeholder, não saldo/renda inicial. Os serviços de perfil profissional/financeiro já existem; o catálogo da atividade e o contexto de datas/progresso do cadastro ainda precisam de confirmação. Continuar mostra a pendência e mantém os dados na etapa, sem simular gravação.

## 6. Contatos de confiança — Figma 9:25883

- [ ] Implementar nome/telefone, múltiplos contatos e Não possuo contato de confiança conforme desenho.
- [ ] Validar registros incompletos e coerência com a opção de ausência; preservar contatos ao navegar.
- [ ] Resolver a exigência de relationship no backend sem criar campo adicional.
- [ ] Integrar gravação e retomada; homologar ausência e múltiplos contatos reais.

## 7. Revisão e envio — Figma 9:25964; enviado 9:26067

- [ ] Apresentar somente os dados das etapas anteriores e ações do desenho, com documentos mascarados e sem senha.
- [ ] Impedir envio com pendências e concorrência; preservar rascunho após erro.
- [ ] Integrar envio final e ler o estado real da revisão, sem fabricar Cadastro enviado para análise.
- [ ] Exibir Pendente e bloquear edição no perfil conforme a resposta confirmada do servidor.
- [ ] Homologar revisão/aprovação/reprovação e reenvio sem perder o progresso.

## Critério para fechar cada etapa

- [ ] Tela comparada ao seu nó do Figma; desktop/celular, teclado e estados relevantes revisados.
- [ ] Validações e erros com mensagens locais, sem dados sensíveis em logs/URLs/armazenamento.
- [ ] Testes apropriados, lint, build e diff aprovados.
- [ ] Persistência, retomada e integração confirmadas quando a etapa exigir backend.
- [ ] Reteste do QA com conta de homologação e evidência registrada.

Dependências consolidadas em [Pendências do backend](PENDENCIAS-BACKEND-QA.md). O aceite legal e o envio final não são executados automaticamente nesta rodada de telas/validações locais.

## Publicação em homologação — decisão de 20/10

A pedido do usuário, as telas implementadas 1–3 estão incluídas no build publicado e acessíveis em https://hml.strategyanalytics.com.br/cadastro/etapa-1, /cadastro/etapa-2 e /cadastro/etapa-3. Os endereços antigos /dev/cadastro/etapa-* permanecem como aliases para não quebrar links já usados. Não é necessário executar o servidor local para o QA conferir as telas.

Os avisos de homologação identificam as dependências sem criar novos campos/ações no card. Essa publicação não confirma persistência: etapas 1 e 2 ainda usam os adaptadores de apresentação já documentados; etapa 3 aguarda catálogos e contrato de gravação/progresso. O cadastro integrado existente continua em /register.

Publicação conferida em 20/10: portal 8d3bb93, pipeline 39428877610 concluída com sucesso. As três rotas /cadastro/etapa-1, /cadastro/etapa-2 e /cadastro/etapa-3 abriram em homologação. Data inválida da etapa 3 mostrou erro/foco; Voltar abriu as etapas 2 e 1 nos endereços normais. Essa conferência confirma publicação e validação local, mantendo a gravação/progresso como pendências.

Publicação da etapa 4 conferida em 20/10: portal ff59268, pipeline 39432053951 concluída com sucesso. Brasil e Japão abriram em hml.strategyanalytics.com.br/cadastro/etapa-4 e /cadastro/etapa-4/jp. Passaporte trocou para um arquivo e os quatro campos; data inválida exibiu erro e foco. Persistência, envio real e avanço integrado continuam pendentes, conforme descrito acima.
