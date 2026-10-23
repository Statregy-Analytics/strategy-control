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
- [ ] Publicação.
- [ ] Repetir upload, retomada e visualização no Admin publicado.

Nenhum bloqueio de backend encontrado nos uploads/vínculos/metadados/URLs exercitados localmente. Isso não encerra pendências históricas dos demais módulos nem homologa exclusão/substituição de fotos, cujas ações não estão nestes controles do Figma.
