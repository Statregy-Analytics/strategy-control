# Pendências do backend para homologação

A interface segue o Figma. Precisamos dos estados e operações abaixo sem acrescentar campos ou ações às telas.

## Aprovação de documentos e edição do perfil

O front de Aprovar/Reprovar documentos está integrado conforme C27–C28. Falta confirmar:

- Aprovar o documento do cadastro remove a pendência e libera a edição do perfil?
- Como consultar o estado da revisão cadastral, a data de envio e a permissão de edição, para apresentar C26 corretamente?
- Na reprovação, motivo e mensagem chegam ao cliente e permitem reenvio? Hoje enviamos os dois juntos em `notes`, pois esse é o contrato disponível.
- Qual é o catálogo de motivos de reprovação? O front usa apenas “Foto ilegível”, confirmado no Figma.

Confirmar também os defaults do cliente novo em C25: risco sem classificação, compliance pendente, status Prospect e preferências do sistema. O front preserva os valores reais retornados e não simula desbloqueio ou classificação.

Referência: [Figma C25 a C28](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI/S.A?node-id=1932-281). Evidências técnicas e limites em [Aprovação de documentos](QA-2026-10-19-APROVACAO-DOCUMENTOS.md).

## Edição dos campos existentes no perfil

- Confirmar escrita para documentos tipados, estado civil, nacionalidade, filiação, bairro e preferência de contato que já aparecem no desenho. Os campos sem operação confirmada permanecem somente leitura.
- Definir edição das observações de compliance sem obrigar a criação de um alerta. Hoje só é possível alterar a descrição de um alerta existente.
- Confirmar as operações previstas para segurança e sessões. O front não altera senha, 2FA ou status por meio de endpoints de outro domínio.

Detalhamento: [Edição por seção](QA-2026-10-19-EDICAO-POR-SECAO.md).

## Contratos e carteira

- Corrigir ou esclarecer o contrato encerrado do Cláudio ainda incluído no saldo investido. Na conferência de 19/10, a API retornou R$ 261.500,00 investidos e R$ 286.500,00 no total; o front não desconta valores por conta própria.
- Disponibilizar valor base, atual e bloqueado por participante para os campos do Figma. Capital e saldo do contrato inteiro não substituem o saldo do cliente.

Evidências: [Carteira e extrato](QA-2026-10-19-CARTEIRA-VAZIA.md) e [Devolutiva do Marco 3](MARCO-3-DEVOLUTIVA-BACKEND.md).

## Cadastro e autenticação

- Garantir unicidade do e-mail usado como login e revisar as duplicidades apontadas pelo QA.
- Definir o contrato de sessão com cookies HttpOnly para Admin e portal: login, refresh, logout, CORS e proteção CSRF. Essa proteção exige suporte do servidor/BFF.
- Investigar o incidente de identidade relatado em 17/10 às 18:16. As proteções adicionadas ao front não encerram a análise da causa.

Referência e contexto: [Triagem do QA](QA-2026-10-17-TRIAGEM.md).

## Menu e módulos do Admin — QA 16

O menu segue os itens do Figma; Clientes, Contratos e Transações usam as telas integradas. Formulários, Bancos e Configuração documental existentes ficam em Configurações. A seleção de sistema consulta `GET /me/systems`; esse endpoint já existe e não é bloqueio do backend.

- Confirmar os contratos HTTP dos fluxos de Lógicas, Crédito e Comunicados previstos no Figma. Não foram encontrados nos Swagger consultados. Crédito e Comunicados também precisam de implementação no front; Lógicas ainda usa dados locais.
- Confirmar os contratos HTTP para Leads e Assessores antes de substituir as telas locais/fictícias por dados reais. Esses protótipos não foram apresentados como módulos homologados no menu.
- O endpoint de sistemas anuncia o editor de landing page como disponível, mas a tela atual do front é um protótipo sem persistência. Confirmar as operações de rascunho, mídia e envio para revisão/publicação previstas no desenho; depois será necessário integrar o front. O cartão permanece indisponível na seleção para não oferecer um fluxo sem gravação.

As entradas vazias eram falhas de navegação do front: `/dashboard` agora abre Clientes e `/landing-page` mostra a seleção A02, mantendo a exigência de administrador. Não foi criado dashboard ou painel de métricas fora do desenho. O item 16 permanece parcial pelos módulos sem integração.

## Portal: perfil e cadastro — QA 7 e 8

O login da seção nova (4:25438) foi concluído no front usando a autenticação existente, sem contrato novo. As telas do perfil já usam dados próprios, sem exemplos; o que falta abaixo deve preencher os campos e fluxos do Figma, sem seletores extras:

- Confirmar campo de bairro e catálogos/valores aceitos de gênero, estado civil, nacionalidade e atividade. Os seletores preservam o valor recebido enquanto não houver opções confirmadas.
- Contatos de confiança: o Figma pede nome e telefone, mas a escrita exige `relationship`. Confirmar a gravação e múltiplos contatos sem acrescentar esse campo à interface.
- Confirmar consulta e operações do patrimônio próprio do cliente. As seções não mostram bens fictícios e não usam endpoints administrativos para contornar autorização.
- Informar o `context` correto dos consentimentos/termos do perfil. A consulta sem contexto retorna HTTP 400; o Swagger não enumera os valores. Não assumir um contexto de cadastro nem adicionar seletor.
- Confirmar Compartilhar Perfil: a projeção pública documentada só contém `customerId` e `avatarUrl`; não permite reproduzir o conteúdo completo do desenho.
- Confirmar persistência/retomada das sete etapas, aceite versionado, documentos por país e estado de envio/revisão cadastral. O cadastro de sete etapas também continua pendente de implementação no front; não é falha exclusivamente do backend.

Referência de evidências: repositório Strategy-analytics-v2, `docs/QA-2026-10-19-PERFIL.md`. Avatar já usa a URL recebida e fallback neutro; uma foto válida precisa estar disponível na API para homologar seu carregamento, sem criar upload fora do Figma.

## Portal: Home — QA 2 a 6

Estado vazio já validado com conta real de homologação, com zeros confirmados pela API e Solicitar contrato abrindo Contratos. Permanecem:

- Fonte de comparação com período anterior e série do motor de variação. Não fabricar percentual, inclusive 0,00%, quando a API não o fornece.
- Iniciação de depósito pelo cliente conforme o botão do desenho. Hoje a ação exibe o aviso existente de indisponibilidade; não simula movimentação.
- Fonte de dívida para decidir a seção de empréstimos; o resumo demonstrativo foi removido do front.
- Contrato de conteúdo para as publicações. Os estados sem comunicação já seguem o Figma, mas não homologam leitura de publicações reais.

As paletas e o relógio dos Ajustes preservam a persistência local existente. Se precisarem sincronizar entre dispositivos, confirmar contrato correspondente; os temas `Light`, `Dark`, `System` da API não equivalem automaticamente às três paletas do Figma.

## Situação do frontend — atualização de 20/10

O bloqueio de lint global do portal foi corrigido; 52 testes e build passaram. A pipeline passa a validar lint e testes antes da publicação. Não há solicitação nova ao backend decorrente desse lote técnico. As dependências acima continuam abertas; as correções de sintaxe/reatividade nos componentes legados não homologam os protótipos.

## Cadastro de sete etapas — primeira tela local, 20/10

A Etapa 1 possui tela e validações locais conforme 4:25513, isoladas em prévia de desenvolvimento. O cadastro integrado atual não foi substituído. País de residência (incluindo o tratamento dos agrupamentos do Figma), URLs/textos/versões legais e registro do aceite continuam sem contrato confirmado; não serão descartados nem enviados como campos presumidos.

Acompanhar tela, validações, integração e homologação de cada etapa no [Checklist do cadastro](CHECKLIST-CADASTRO-SETE-ETAPAS.md). Etapas 1 e 2 possuem telas e validações locais; etapas 3 a 7 e retomada integrada permanecem abertas.

## Cadastro de sete etapas — confirmação de e-mail, 20/10

A tela 2/7 (4:25620) reutiliza os serviços públicos POST /auth/email-confirmation/confirm e /request sob /api/v1, sem campo de e-mail adicional. A lógica é compartilhada com a confirmação pública atual. A prévia local bloqueia o transporte; envio/recebimento e retomada reais ainda não foram homologados neste lote.

- Definir como a confirmação bem-sucedida permite continuar à etapa 3: a resposta documentada contém somente succeeded/message, sem sessão ou estado de progresso. Precisamos do contrato de sessão de cadastro, consulta/gravação e próxima etapa, sem pedir senha novamente ou criar campo/ação fora do Figma. O front não armazena a senha para fazer login automático.
- O código é string sem tamanho/formato documentado. Se houver restrição, informar a regra; o placeholder 000000 do desenho não foi transformado em validação arbitrária.
- Permanecem as dependências da etapa 1: país real/agrupamentos, textos/URLs/versões legais e aceite versionado. O fluxo integrado atual não foi substituído por prévias.

Evidências no portal: docs/QA-2026-10-20-CADASTRO-ETAPA-2.md. Checklist atualizado com a separação entre validação local e homologação integrada.