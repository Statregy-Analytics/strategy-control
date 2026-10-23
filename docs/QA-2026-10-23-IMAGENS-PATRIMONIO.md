# QA — Imagens do patrimônio no Admin · 23/10/2026

Escopo: item 23 da devolutiva. Usar somente arquivos fictícios, os controles dos editores C11/C12 do Figma e os endpoints existentes. Não acrescentar campos de tipo/categoria/posição, ações de exclusão ou dados pessoais reais.

## Implementação e contrato

- [x] Imóvel: seção Fotos do Imóvel, miniaturas de 160×160, contador e Adicionar foto, conforme C11 (1484:69408).
- [x] Veículo: cinco posições da vistoria conforme C12 (1484:69564): Diagonal Dianteira, Diagonal Traseira, Lateral Motorista, Lateral Passageiro e Foto do Chassi.
- [x] Seleções locais enviadas ao Salvar; Descartar não envia os arquivos. Prévia abre pelo cartão existente, sem novos botões no desenho.
- [x] Tipos FOTOS_IMOVEL/FOTOS_VISTORIA_VEICULO resolvidos pelo catálogo. Upload multipart em /admin/customers/{customerId}/documents e vínculo em /admin/customers/{customerId}/assets/{assetId}/documents.
- [x] Posição da vistoria persistida em metadata.assetPhotoSlot e consultada pelo detalhe documental. Não inferir posição pela ordem ou pelo nome do arquivo. Fotos legadas sem posição continuam visíveis com seu nome, sem atribuir ângulo falso.
- [x] URL temporária renovada ao abrir a foto. Falha da galeria permanece independente dos demais campos do editor.
- [x] Retentativa de vínculo reutiliza o ID já enviado; bem recém-criado é preservado se uma foto falhar, evitando outro POST de patrimônio.
- [x] Arquivo inválido/vazio e imagem acima de 10 MB rejeitados antes do upload; aceitos JPG, PNG e WebP.

## Verificação local na porta 8080

- [x] Conta de homologação do Jorge, bens fictícios BRL já existentes: uma foto de imóvel e cinco fotos de veículo enviadas pelos seletores reais do navegador, salvas e retomadas ao reabrir.
- [x] Cinco posições do veículo retomadas pelos metadados; todas as miniaturas carregadas. Foto do chassi aberta com sucesso pela URL da API.
- [x] TXT fictício rejeitado no seletor do imóvel; imagem já persistida preservada. Nenhuma alteração dos valores monetários dos bens.
- [x] Layout de fotos em 390px sem overflow (largura e scrollWidth de 342px); viewport restaurado. Controle desktop revisado.
- [x] 124 testes aprovados, incluindo falha parcial de vínculo, resposta após fechamento, posição por metadados, renovação de URL e indisponibilidade independente do catálogo. Lint e build aprovados; diff do lote sem erros.
- [x] Novo imóvel: selecionar foto, Descartar e reabrir retomou zero seleções, sem criar outro bem. Retentativa após criação com falha de foto coberta em teste controlado; não apresentada como falha provocada no servidor.
- [x] Contador lateral calcula somente os quatro grupos exibidos no Figma. Fotos PATRIMONIO continuam no bem e não inflam Aguardando da documentação pessoal. API local: resumo geral com 10 pendentes, mas card correto com 1 aguardando; aprovados/rejeitados mantidos em 3/3.

## Publicação e reteste

- [x] Build/diff finais aprovados.
- [x] Runtime final **6eab47c**, [pipeline 39959274171](https://github.com/Statregy-Analytics/strategy-control/actions/runs/39959274171) aprovada: auditoria, 124 testes, lint, build, upload e ativação. Integração inicialmente publicada em 45f8de2; atualização dos vínculos em fb637b3 (pipeline 39958230842 aprovada). A execução inicial 39957961259 foi cancelada por substituição, antes de publicar.
- [x] https://admin.strategyanalytics.com.br: upload pela UI de uma foto no imóvel EUR e duas no veículo EUR (Diagonal Dianteira e Foto do Chassi) da conta fictícia do Jorge. Salvamentos concluídos; recarga e reabertura preservaram arquivos e posições, com três espaços restantes vazios no veículo.
- [x] Fotos do imóvel e do chassi abertas e carregadas pela URL temporária. Conferência adicional de API confirmou vínculos, metadata das duas posições e valores EUR dos bens inalterados.
- [x] Versão final recarregada: documentação lateral mostrou 3 aprovados, 1 aguardando e 3 rejeitados, sem somar as nove fotos patrimoniais ao card. Foto do imóvel retomada/aberta novamente; seção em 390px com ambos os cartões acessíveis e sem overflow. Viewport restaurado.
- [x] Evidências locais: admin-fotos-vistoria-hml-23-10.png, admin-fotos-imovel-hml-23-10.png, admin-foto-patrimonio-preview-hml-23-10.png e admin-fotos-patrimonio-mobile-hml-23-10.png.

Nenhum bloqueio de backend encontrado nos uploads/vínculos/metadados/URLs exercitados localmente e no Admin publicado. Isso não encerra pendências históricas dos demais módulos nem homologa exclusão/substituição de fotos, cujas ações não estão nestes controles do Figma.

Limites: criação de bem seguida de falha no vínculo, catálogo indisponível, URL inválida e retorno tardio foram cobertos em testes controlados, sem provocar falhas na API de homologação. Exclusão/substituição não ganharam ações extras. Área do Cliente não foi alterada nem revalidada nesta rodada; seu fluxo não deve ser considerado homologado por estes testes do Admin.
