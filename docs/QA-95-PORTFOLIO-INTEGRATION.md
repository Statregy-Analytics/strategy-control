# Item 95 — integração do Marco 3 (29/10/2026)

Entrega do item 95. Publicação pelo workflow Deploy production; confirmar a conclusão do workflow para o commit desta entrega.

- Admin: projeção de `/admin/customers/{id}/portfolio`, separando Free (saldo, reservado e disponível), contratos (`invested`), Applied parado e patrimônio (`baseEquity`, valores bruto/financiado e `assetCount`). Composição montada no frontend, sem depender de mudança em `/portfolio/composition`.
- Total calculado por moeda, sem dupla contagem de reservado e sem conversão presumida entre moedas. Resposta válida vazia mostra zero; falha ou campo ausente permanece indisponível.
- Área do Cliente: `/client/home` e `/client/wallets` alimentam Depósito e Strategy. Não há `/client/portfolio` no Swagger atual; endpoints administrativos não são usados no portal.

## Dependências do backend

1. Expor ou confirmar um agregado equivalente de patrimônio por moeda e quantidade de bens em uma fonte autorizada para o cliente (baseEquity/assetCount ou equivalente). Sem esses dados, patrimônio e total completo do portal permanecem indisponíveis.
2. Rendimentos reais dependem do motor do Marco 4. Applied é exibido como saldo parado, sem simulação de rendimento.
3. Caso seja exigido um único total convertido para a moeda principal, fornecer cotação/base/data ou agregado com contrato explícito. Os totais por moeda já podem ser exibidos.

## Validação

Lint aprovado nos dois projetos; 204 testes no admin e 306 no portal aprovados. Builds e git diff --check dos arquivos alterados aprovados nos dois projetos.

Testes automatizados cobrem separação de carteiras, reservas sem dupla contagem, múltiplas moedas, vazio confirmado, campos ausentes, moeda inconsistente e respostas parciais do cliente. Conferência visual integrada ainda pendente: localhost recusou conexão no navegador de teste. Não registrar essa limitação local como bug do backend.
