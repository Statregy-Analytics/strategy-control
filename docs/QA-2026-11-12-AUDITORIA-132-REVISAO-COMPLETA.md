# Auditoria 132 — revisão completa — 12/11/2026

Referência: [Figma 2255:283](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI/?node-id=2255-283). Complementa e prevalece sobre a [revisão inicial](QA-2026-11-12-AUDITORIA-132-REVISAO.md) para os estados abaixo.

## Correções do frontend

- [x] Cores, fundo, borda, fonte e espaçamento dos quatro badges conforme os valores do Figma; proporções dos filtros e colunas, data/hora e alvo do olho com 32 px.
- [x] Rótulos selecionados longos permanecem dentro dos controles, com indicação completa no título; sem repetição do placeholder Cliente.
- [x] Nome do cliente não vira UUID enquanto o cabeçalho carrega ou falha. Erro de nome e carregamento da tabela são independentes; pesquisar o mesmo cliente recupera o rótulo e remove o aviso.
- [x] Mudanças rápidas de filtros preservam as escolhas anteriores enquanto a navegação termina. A verificação de Admin ocorre na entrada e quando o token muda; alterações de query na mesma página não repetem GET /auth/me. A API continua autorizando cada leitura.
- [x] Busca dentro de um histórico mantém ResourceType/ResourceId. O olho não aponta para o próprio histórico. Clientes, Contratos e Transações continuam com os destinos administrativos existentes.
- [x] Página fora do intervalo é corrigida também quando não há resultados; rodapé inválido não é mostrado durante a correção.
- [x] Períodos com um só limite mostram A partir de/Até; o calendário retoma o mês/ano escolhido. Datas impossíveis e escopos de recurso incompletos não são enviados à API.
- [x] Erro ao carregar o catálogo de módulos aparece mesmo com opções da página atual; reabrir o seletor tenta novamente. Não foram inventados códigos de módulos.
- [x] Carregamento não mostra uma mensagem vazia antiga; exportação e ações de registros aguardam a atualização dos filtros. Metadados com moeda inválida não quebram a linha; valores e precisão de timestamps nos dados antes/depois são preservados.

Não foram acrescentados campos, ações comerciais ou telas de módulos. Mais Filtros mantém os mesmos cinco controles autorizados. O histórico filtrado continua sendo a alternativa expressamente aprovada para registros sem tela administrativa integrada; não é uma tela de detalhe de Comunicado desenhada no Figma.

## Matriz de validação

| Grupo | Cenários conferidos |
| --- | --- |
| Layout | Cabeçalho, textos, ícones locais 16 px, tabela, alvo do olho, quatro badges e rodapé |
| Autor | Admin, Cliente e Sistema; escolha, resultado e limpeza |
| Ação | Criação, Alteração, Mudança de status e Exclusão; escolha, resultado e limpeza |
| Módulo | Customers/Clientes e Communications/Comunicados, valores reais encontrados; limpeza e recuperação do catálogo |
| Cliente | Nome exato de Jorge na URL, recarga, busca de outro cliente, ID correto no filtro, limpeza, painel e cabeçalho atrasado/indisponível |
| Período | Um dia inclusivo, intervalo no calendário, limites isolados, retomada de mês/ano e limpeza |
| Combinações | Os cinco filtros simultâneos; duas escolhas rápidas com consulta atrasada |
| Busca | Campo, nome do cliente, ID de registro, resultado vazio e limpeza; reinício da paginação |
| CSV | Resultado completo a partir da página 2, busca, exclusão, Sistema vazio, filtros combinados e recuperação de erro |
| Navegação | Menu Configurações, olho, histórico de Cliente expandido, históricos de Contrato/Transação visíveis, Voltar, Avançar e retorno pelo menu |
| Histórico filtrado | Busca mantém o recurso; ausência de olho repetido; fallback de Motor, Empréstimos e Dívidas |
| Falhas | 403, 404, 429 e 503 com repetição mantendo filtros; erro independente de cabeçalho, catálogo, exportação e metadados |
| Corridas e segurança | Resposta antiga não sobrescreve busca atual; dados sensíveis mascarados e texto HTML escapado |
| Responsivo e teclado | 1706, 1440, 1024 e 390 px; filtros preenchidos sem estouro; abrir/fechar painel e foco retornando ao disparador |
| Acesso | Admin consultado na entrada; token diferente, token ausente ou papel não confirmado não reutilizam autorização anterior |

Localmente: 49 verificações na matriz e 8 complementares, incluindo a verificação de console em cada suíte. Os casos que falharam foram corrigidos/retestados antes da consolidação. Evidências: [matriz](evidence/qa-2026-11-12-auditoria-132/revisao-completa/local-matriz.json), [complementares](evidence/qa-2026-11-12-auditoria-132/revisao-completa/local-complementares.json), [filtros preenchidos no desktop](evidence/qa-2026-11-12-auditoria-132/revisao-completa/local-filtros-preenchidos-desktop.png) e [celular](evidence/qa-2026-11-12-auditoria-132/revisao-completa/local-filtros-preenchidos-celular.png).

## Escopo das evidências e backend

Listagem, filtros disponíveis, períodos, buscas, CSV, dados de Cliente e detalhes de Contrato/Transação foram leituras reais da homologação. Para testar links de Contrato/Transação sem alterar finanças, eventos controlados apontaram para registros reais. Motor, Empréstimos e Dívidas usaram eventos controlados para conferir o fallback; isso não certifica a geração de auditoria nesses módulos. Falhas de rede/status, catálogo incompleto, dados sensíveis e corridas também foram controlados no navegador.

A execução intensiva inicial atingiu o limitador real (429). As chamadas foram espaçadas nas suítes e os cenários refeitos; esse limite não foi classificado como endpoint ausente nem como bug do backend. Nenhum novo bloqueio de API foi identificado para a tela 132. A cobertura das gravações e da cláusula 20 em todos os módulos continua fora desta validação do frontend.

## Qualidade e publicação

- [x] Lint, build e testes automatizados locais passaram; 221 testes locais, dos quais oito pertencem ao estudo futuro preexistente e não foram incluídos na entrega.
- [x] Novos testes cobrem datas inválidas, precisão/valores nulos, moeda inválida e reutilização segura da verificação de acesso.
- [x] Detector visual executado; fonte Inter, raios, tamanhos e cores estão presos ao Figma e foram mantidos apesar dos avisos do documento visual legado.
- [x] Alterações não relacionadas do worktree preservadas; whitespace conferido apenas nos arquivos entregues, sem incluir o Swagger preexistente.
- [ ] Publicação e repetição das duas suítes na URL de homologação — registrar o resultado após a ativação.
