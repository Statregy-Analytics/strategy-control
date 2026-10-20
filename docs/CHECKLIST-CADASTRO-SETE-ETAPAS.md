# Cadastro de sete etapas — checklist de conclusão

Atualizado em 20/10/2026. Referência: Figma BaDXlWpxbIoY4azOaQnXgv, seção 4:25436; variantes da etapa 4 em 37:27141. Este checklist separa tela/validação local de integração e homologação. Nenhuma etapa é concluída integralmente apenas por existir uma tela.

## Ordem e situação

| Etapa | Tela e validação local | Integração e homologação |
| --- | --- | --- |
| 1 · Criar conta | Pronta em prévia local | Pendente: residência, documentos legais e aceite versionado |
| 2 · Confirmar e-mail | Pendente do novo desenho; confirmação pública atual já existe | Reutilizar API atual; confirmação real e passagem à etapa 3 pendentes |
| 3 · Dados pessoais | Pendente | Catálogos, gravação e retomada pendentes |
| 4 · Documento e endereço | Pendente, oito variantes | País real, endereços/documentos e uploads pendentes |
| 5 · Atividade trabalhista | Pendente | Gravação e retomada pendentes |
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

A prévia de desenvolvimento fica em http://localhost:9010/dev/cadastro/etapa-1. Não chama a API, não cria conta, não transmite aceite e não avança como se tivesse salvado. Ela não existe no build de produção; o cadastro atual permanece preservado até a integração suficiente.

## 2. Confirmar e-mail — Figma 4:25620

- [ ] Implementar a composição e o progresso 2/7 usando somente campos/ações do desenho.
- [ ] Reutilizar confirmação/reenvio públicos existentes; validar código e tratar inválido, expirado, já usado e limites de tentativa/reenvio.
- [ ] Preservar endereço em memória e limpar o código ao concluir/sair; não expor código em URL/logs.
- [ ] Confirmar a sessão após o e-mail e o encaminhamento à etapa 3, sem abrir a Home antes da conclusão exigida.
- [ ] Homologar envio/recebimento e retomada real.

## 3. Dados pessoais — Figma 6:25562

- [ ] Implementar nascimento, gênero, estado civil, nacionalidades, país e cidade de nascimento conforme desenho.
- [ ] Validar datas e obrigatórios confirmados, adicionar nacionalidade apenas pela ação existente, sem inventar catálogos/valores HTTP.
- [ ] Validar avançar/voltar e preservação do rascunho em memória.
- [ ] Integrar leitura, gravação e retomada; homologar dados próprios e erros sem perda do rascunho.

## 4. Documento e endereço — Figma 37:27141

- [ ] Brasil (6:25690): endereço/CEP, CPF, identificação ou passaporte e filiação conforme desenho.
- [ ] Estados Unidos e Canadá (37:27142).
- [ ] América do Sul (37:27262).
- [ ] Japão (37:27382).
- [ ] China (37:27502).
- [ ] Europa (37:27622).
- [ ] África (37:27742).
- [ ] Austrália (37:27862).
- [ ] Aplicar somente os campos/formatos de cada variante; documento de identidade ou passaporte, sem solicitar documentos extras.
- [ ] Validar campos e arquivos pelos requisitos confirmados; permitir Não consta no meu documento para filiação conforme Figma.
- [ ] Reutilizar consulta de CEP se disponível, sem reinterpretar complemento como bairro.
- [ ] Integrar país real, número fiscal, endereço, documentos/upload e retomada; homologar falha/reenvio sem duplicação.

## 5. Atividade trabalhista — Figma 9:25789

- [ ] Implementar atividade, renda média mensal individual/familiar e valor aproximado dos bens.
- [ ] Validar preenchimento e números sem inventar faixas, classificações ou conversões monetárias.
- [ ] Preservar valores ao voltar/avançar e integrar gravação/retomada.
- [ ] Homologar moeda e valores efetivamente persistidos.

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
