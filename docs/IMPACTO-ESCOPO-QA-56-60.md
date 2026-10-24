# Impacto de escopo e horas — QA Admin 56–60

Estimativa técnica de esforço humano de referência para comparar propostas e planejar trabalho. Não é medição de horas executadas pelo agente, apontamento de timesheet, preço acordado nem autorização de cobrança. Sem a baseline contratual/desenhos aprovados à época não é possível classificar toda diferença como aditivo.

## O que mudou

C32, C33 e C35 foram declarados novos na devolutiva do QA em 24/10. C32 amplia a edição de identificação com campos e selects; C33 explicita ações/controles de segurança que não têm contrato administrativo completo; C35 fornece o novo pacote de logos. Essa parcela traz aumento/revisão de especificação verificável.

A edição por seção, Descartar/Salvar, dirty state e o motor de persistência já existiam. C15–18, C19, C09/C30 e C10–14 já eram referências anteriores. Adequá-los não equivale a desenvolver cinco módulos novos nem é automaticamente aumento de escopo: inclui correções de aderência e integração que já deveriam ser avaliadas contra a entrega combinada.

## Faixa por frente

| Frente                                                           | Esforço de referência | Enquadramento                                                       |
| ---------------------------------------------------------------- | --------------------- | ------------------------------------------------------------------- |
| 56 — três formulários e integração segura dos campos disponíveis | 6–10 h                | Misto: reaproveitamento/correção mais detalhamento novo C32/C33     |
| 57 — menus de preferências                                       | 1–2 h                 | Adequação a desenho existente                                       |
| 58 — ícone do Deslogar                                           | 0,25–0,5 h            | Correção visual pontual                                             |
| 59 — modal bancário, busca, preenchimento e logos                | 2–4 h                 | Adequação existente; pacote C35 é revisão visual nova               |
| 60 — quatro cards de edição, expansão e documentos/fotos         | 6–10 h                | Adequação/integração existente; extensões de dados exigem definição |
| Regressão, responsivo, publicação e documentação                 | 2–3 h                 | Trabalho transversal deste lote, sem duplicar por tela              |
| **Total aproximado do lote**                                     | **17–30 h**           | Front com os contratos atualmente disponíveis                       |

Dentro do total, uma faixa inicial de **4–8 h** é atribuível ao detalhamento novo C32/C33/C35, sujeita à comparação com a baseline. O restante deve ser tratado como correção, adequação ou integração pendente, conforme o contrato original; não apresentar o total como 17–30 h extras automaticamente.

## Dependências futuras e custo

A liberação dos contratos pessoais/documentais e de segurança exige outra integração e reteste. Reservar provisoriamente **3–6 h de front** após contrato estável, fora do total acima; essa faixa deve ser revista ao conhecer os payloads. Características patrimoniais genéricas e dados adicionais de consórcio precisam de definição antes de estimar. Esforço do backend não está incluído e deve ser estimado por seu responsável.

Para orçamento monetário: horas adicionais aprovadas × valor/hora contratado. Como a taxa e a baseline não foram fornecidas, não há valor em reais confirmado. Registrar cada revisão do Figma com data, itens novos, contrato necessário e aceite do impacto evita que novas solicitações sejam apresentadas indistintamente como bugs de QA.
