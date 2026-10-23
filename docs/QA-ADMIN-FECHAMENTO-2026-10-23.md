# Admin — devolutiva consolidada do QA, 23/10/2026

Escopo: itens administrativos do feedback de 17/10 (10–19), complementos administrativos e seleção/ficha de 22/10 (27–38). A referência visual continua sendo o Figma aprovado. Este lote não acrescenta campos, botões, módulos ou fluxos. Itens do portal/cadastro têm checklist próprio e não são aprovados por esta revisão.

## Checklist de entrega do frontend

- [x] Seleção: grade/lista, busca pelo texto aprovado, filtros, Todos, classificação/compliance/nível, A–Z, badges e paginação. API sem documento não gera CPF/CNPJ fictício.
- [x] Ficha: navegação sem overflow, cores/glass, documentos com ícones e revisão, histórico com linha/bolinhas, temas, botões bancários/patrimoniais existentes.
- [x] Edição por seção: uma seção por vez, validações, valores decimais/zero, Salvar só após mudança, descarte confirmado e preservação das coleções.
- [x] Bancos: catálogo completo, busca sem acentos, país legível, iniciais no ícone, PIX completo, principal conforme API e ações na linha. Nenhuma coluna Titularidade extra.
- [x] Preferências e bancos: troca de cliente/saída invalida respostas antigas; salvamento duplicado bloqueado antes da validação assíncrona; cancelamento do formulário bancário não permite que a resposta anterior feche o novo formulário.
- [x] Histórico e contratos: paginação interrompida ao trocar cliente/fechar; detalhes antigos não substituem os atuais.
- [x] Extrato: exportação em andamento não baixa arquivo do cliente anterior depois de trocar de ficha; erros tardios não contaminam a nova ficha.
- [x] Patrimônio: imagens integradas nas rodadas anteriores; moeda de exibição vem do bem. Criação sem carteira agora resolve o UUID de BRL pelo catálogo existente, sem seletor novo ou UUID inventado.
- [x] Contratos: Valor base agora usa `participants[].baseAmount`, já disponível. Ausência permanece indisponível; zero é exibido. Saldo global do contrato não é reutilizado como saldo do cliente.
- [x] Menu mobile: comportamento do drawer acompanha o breakpoint mesmo quando há um formulário aberto durante a redução da tela; sem deslocamento de desktop no mobile.
- [x] Histórico: tradução dos eventos atuais Trusted contact removed e Provided document updated, preservando texto livre e auditoria original.
- [x] Configuração documental e catálogo de bancos: filtros/edição ignoram respostas antigas; fechar/reabrir e validação pendente não afetam outro formulário.
- [ ] Publicação e regressão final em homologação — registrar resultado abaixo.
- [ ] Aceite independente do QA/designer sobre o conjunto publicado.

## Matriz para devolver ao QA

| Item | Situação do frontend | Dependência / limite |
| --- | --- | --- |
| 10 — aprovação e ficha nova | Revisão, motivo, arquivos e contadores implementados; status oficiais consumidos. | Versionamento/reenvio e regras de progresso continuam com reteste próprio. Não reabrir CNH exclusiva: alternativas foram liberadas em 22/10. |
| 11 — identificação | Campos existentes preservados, edição dos contratos disponíveis e validação de data. | Escrita administrativa de estado civil, nacionalidades, filiação e documentos tipados não consta de UpdateCustomerRequest (somente kind/birthDate). |
| 12 — profissional/financeiro | Cinco campos, precisão, zero, destaque e descarte implementados. | Consulta atual e último histórico de Jorge conferidos consistentes em 23/10; divergência antiga de renda não é bloqueio atual. |
| 13 — preferências | Edição dentro da seção, catálogo e salvamento existentes, sem botão isolado. | Revalidação independente do QA. |
| 14 — carteira/extrato | Zero real, composição, extrato, exportação e contratos integrados. Valor base do participante corrigido neste lote. | Valor atual/bloqueado por participante ausentes; Cláudio ainda recebe R$ 261.500 investidos do servidor. Confirmar elegibilidade do contrato encerrado. |
| 15 — editar/salvar/descartar | Fluxos implementados; proteções de concorrência completadas neste lote. | Observação livre sem alerta e campos sem escrita administrativa dependem do contrato. |
| 16 — menu | Telas integradas acessíveis; Bancos, Formulários e Configuração documental em Configurações. | Lógicas/Crédito/Comunicados/Leads/Assessores/LP sem persistência integrada não são apresentados como homologados; exigem contrato, integração futura e QA. |
| 17 — dados/datas/histórico | Datas sem deslocamento, eventos conhecidos em português, catálogos legíveis e busca completa. | Garantia de unicidade de login pertence ao servidor; não repetir cadastro duplicado nesta regressão. |
| 18 — incidente de identidade | Isolamento de respostas, sessão e cliente mantido e ampliado. | Causa do incidente de 17/10 depende dos logs/investigação do backend; testes de front não encerram o incidente. |
| 19 — autorização/HttpOnly | Rotas do editor exigem autenticação e administrador. | HttpOnly/refresh/logout/CSRF e autorização da API dependem de servidor/BFF. |
| 27 — sessões do cliente | Estrutura do desenho e indisponibilidade real. | Não há API administrativa por cliente; users/me/sessions é a sessão do Admin. |
| 28 — contas | Layout, iniciais, PIX, principal real e botões corrigidos. | Três contas únicas ainda retornam isPrimary=false. Normalização é do servidor. |
| 29 — PEP | Sem pergunta ou ação fictícia. | Falta contrato de declaração e projeção para compliance; não criar novo campo sem persistência. |
| 30–33 — seleção | Badges, modos, filtros, busca, ordenação, criação e rodapé implementados. | maskedDocument vazio nos 13 cards. Classificação G/I não deve ser convertida para A/AA/AAA sem regra. |
| Complementos 19/20/23/24/25/26 | Busca de bancos, temas, imagens, moeda, projeção do cadastro e edição por seção integrados nas telas existentes. | Mesmos bloqueios de dados/contratos discriminados nesta matriz; sem exigir ações extras. |
| 34–38 — ficha | Menu, glass/ícones, compliance/histórico, cinco campos e botões patrimoniais corrigidos. | Dados ausentes não são simulados. |

## Bloqueios atuais e verificações da API

Consulta autenticada e Swagger `/openapi/v1.json` em 23/10:

1. `maskedDocument` vazio nos 13 cards, inclusive em cliente com identificação fiscal. Preencher a projeção mascarada.
2. Escritas administrativas faltantes nos campos pessoais existentes; sessões por cliente; observações de compliance sem alerta e declaração PEP.
3. Conta única principal: Carlos, Hercílio e Éric teste novo retornam false; Jane e Cláudio retornam true. Não marcar principal apenas visualmente.
4. Valor atual/bloqueado individual do contrato não fornecido. `baseAmount` existe e está integrado; não pedir novamente valor base como endpoint ausente. API de Cláudio: investido 261.500, investível 25.000 e total 286.500; vínculo ao status encerrado precisa de regra/correção do servidor.
5. Confirmar classificação G/I versus A/AA/AAA do Figma. A UI preserva os valores reais.
6. Segurança de sessão/incident response e persistência dos módulos ainda sem contrato continuam fora do alcance exclusivo do front.

Renda atual de Jorge coincide com o registro mais recente: effectiveTo nulo. A moeda patrimonial tem ID no catálogo e não bloqueia mais a criação por falta de carteira. Essas duas pendências antigas não devem voltar para o backend como ausências atuais. Os relatos históricos de 20/10 e 21/10 permanecem como evidência datada, não como lista atual.

## Validação técnica e limites

161 testes automatizados aprovados no fechamento, incluindo atraso/reordenação de respostas, cancelamento durante validação, saída da tela, proteção de download e criação sem carteira. Registrar resultado final, lint/build/diff e regressão publicada abaixo. Falhas simuladas nos testes não equivalem a provocar indisponibilidade em homologação. Não executar novas movimentações financeiras para demonstrar telas.


## Regressão do lote publicado — em andamento

Primeiro runtime 549e5b7, pipeline 39978542515 concluída com auditoria, 160 testes, lint, build, upload e ativação. Entradas JS do HTML publicado conferidas com o build local.

- [x] Seleção publicada: 13 clientes, página 2 de 2 com três registros; troca para lista retoma página 1; Inativo retorna seis e Todos restaura 13. Cabeçalhos e status/compliance do desenho presentes.
- [x] Conta Homologação Pessoa Física sem carteiras e sem BRL no portfolio: aplicação fictícia de R$ 125 criada pelo formulário publicado, recarregada e confirmada na API com currencyCode BRL. ID 13118905-f763-4e54-9b10-2e4f02ba8513 arquivado pela operação administrativa existente, archivedAtUtc confirmado e status Inactive. Portfolio retornou somente USD/400.000 original e nenhuma carteira foi criada. O registro arquivado permanece no histórico; não foi apagado. Jane não foi usada nessa escrita.
- [x] Cláudio: contrato CTR-403B56CC aparece Encerrado; Valor inicial e Valor base mostram R$ 261.500,00; atual/bloqueado permanecem indisponíveis. Investido ainda 261.500 conforme API, sem subtração artificial. Extrato exportado com cabeçalho CSV e um lançamento de 25.000.
- [x] Histórico expandido/recolhido; busca bancária orama encontra 325 na terceira página do catálogo; cadastro cancelado sem gravar conta.
- [x] Jane: quatro totais zero, composição e extrato vazios e quatro categorias patrimoniais vazias. Nenhuma escrita.
- [x] Regressão encontrou dois rótulos não traduzidos e falha de drawer ao reduzir a tela com formulário aberto; ambos corrigidos antes do fechamento. Mobile local 390px, menu 255px e documento 375px sem overflow, incluindo abrir o menu e cancelar o formulário.
- [ ] Publicação final desses dois ajustes e conferência no Admin publicado.
