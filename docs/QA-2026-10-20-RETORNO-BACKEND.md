# Retorno do backend — integração e reteste, 20/10/2026

Este registro atualiza a situação das rodadas anteriores. Os campos necessários de patrimônio foram autorizados pelo usuário; a interface mantém os componentes e o padrão visual do projeto.

## Implementado e verificado

- [x] Financeiro: não enviar effectiveTo no PUT, inclusive ao editar um perfil antigo. Teste real com Cláudio alterou a renda em R$ 0,01, confirmou o último valor no GET e restaurou os valores originais; ambas as versões ficaram sem data final.
- [x] Cadastro: profissional e financeiro continuam antes dos documentos; duas moedas são gravadas nas preferências. Esse fluxo já existia e não precisa de nova etapa.
- [x] Gênero e estado civil: seletores usam value/label do catálogo.
- [x] País de nascimento e até três nacionalidades distintas: envio e retomada por IDs de countries, preservando os demais dados.
- [x] Bairro: campo separado do complemento, limite de 120 caracteres, envio e retomada no portal; edição da seção de endereço também integrada no Admin.
- [x] Contatos novos aceitam nome e telefone sem inventar relationship; valores existentes são preservados.
- [x] Patrimônio próprio: consulta paginada, criação, edição, documentos e URL temporária usando clientApi. Sem ação de arquivar no portal. Formulários dos quatro tipos reutilizam o padrão visual; incluem os campos exigidos pelo contrato, autorizados pelo usuário.
- [x] Compartilhamento: Basic/Full e compatibilidade de Profile para Basic; projeção pública limitada aos campos autorizados. Nenhum link público foi criado no teste.
- [x] Progresso documental: permanece calculado pelo backend, sem simular percentual.

## Evidências e limites

Portal: 201 testes automatizados; Admin: 100. Lint e build de ambos executados. Criação e retomada de veículo fictício do Cláudio verificadas pela interface local na porta 9010, com backend de homologação. Os demais subtipos têm testes de payload, mas não foram todos criados manualmente nesta rodada. Edição do veículo também confirmada pela API após salvar na tela. O único registro fictício criado foi arquivado pelo endpoint administrativo após o teste; não há ação de arquivar no portal. Upload de documentos patrimoniais não foi exercitado nesta rodada. Publicação do commit 7648262 concluída: [pipeline](https://github.com/Statregy-Analytics/strategy-control/actions/runs/39524117575) com sucesso. Versões recarregadas nas URLs de homologação.

## Pendências reais preservadas

- Moeda do patrimônio: a API exige currencyId. O catálogo de preferências informa código/label; o portal resolve IDs das carteiras. Clientes sem carteira precisam de uma fonte de IDs acessível ao cliente (ou aceitação de código na escrita). Não fabricar UUID nem consultar rota administrativa.
- CNH continua obrigatória e RG opcional no cálculo. Isso explica o percentual, mas ainda exige alinhamento de negócio com as alternativas do desenho.
- Reenvio documental: vínculo de substituição e preservação de metadados permanecem pendentes até reteste após correção específica.
- Persistência da declaração de ausência de contato, aceite legal versionado e envio final/recibo da revisão cadastral continuam sem contrato confirmado.
- Novos campos de personalDetails no cliente não ampliam o UpdateCustomerRequest do Admin. Edição administrativa de documentos tipados, filiação, estado civil e nacionalidades ainda precisa de contrato próprio.
- Contexto dos consentimentos do perfil, segurança/sessões, valores por participante e contrato encerrado no investido continuam sujeitos às pendências consolidadas.

Não são mais solicitações de endpoint: renda atual, catálogo de gênero/estado civil, bairro, nacionalidades, contato sem relacionamento, patrimônio do cliente e escopos Basic/Full.


## Reteste publicado na conta do usuário

- Catálogo de gênero abriu as quatro opções reais; edição descartada sem alterar os dados pessoais.
- Patrimônio carregou os quatro estados vazios e abriu o veículo com os campos obrigatórios. Confirmado o bloqueio de moeda: esta conta sem carteiras não recebe currencyId. Salvar permanece desabilitado; nada fictício foi criado nela.
- Na virada do dia UTC, a conta voltou a ProfileIncomplete: o último registro financeiro do histórico tinha effectiveTo=2026-10-20. Pela operação administrativa documentada foram repetidos os valores da última versão do histórico, com nova vigência e sem data final. O perfil voltou a carregar e habilitar edição no portal. Não é uma nova falha do PUT corrigido; é saneamento dos dados antigos. Outros cadastros gravados com vigência vencida podem precisar do mesmo tratamento.
- A tentativa de repor valores pela seção do Admin foi impedida pela ausência de moeda/vigência no perfil atual vazio; rascunho descartado. O histórico administrativo forneceu os dados para a recuperação. Melhorar a criação a partir de perfil financeiro ausente exige fonte de moeda/vigência definida, sem inventar valores.

- Bairro em homologação: gravação fictícia pela seção do Admin confirmada no portal após recarga; valor original vazio restaurado ao final. Nenhum outro campo da seção foi alterado.
