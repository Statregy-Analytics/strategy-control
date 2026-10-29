# QA 117 — CPF e NIF (29/10/2026)

## Contrato conferido

Swagger público consultado em https://strategyanalytics.codebiz.com.br/openapi/v1.json (Strategy Analytics API, build 1.2.0-rc.1). Snapshot antigo preservado.

- Upload admin: POST /api/v1/admin/customers/{customerId}/documents.
- Upload portal: POST /api/v1/client/profile/documents.
- Substituição portal: POST /api/v1/client/profile/documents/{documentId}/replace.
- Multipart: file e documentTypeId para envio; file para substituição, preservando issuedOn/expiresOn quando informados. IDs vêm da API. Nenhum CPF/NIF é inventado ou reenviado como metadado.
- Catálogo DocumentTypeResponse expõe allowsFileUpload; overview expõe allowedActions. CPF/NIF confirmados habilitados pelo fluxo real.
- Não há rota administrativa de substituição no Swagger consultado; as entradas fiscais existentes/rejeitadas consultadas no admin não oferecem Upload. Não chamar endpoint do cliente com sessão administrativa nem tratar novo upload como substituição.

## Alterações entregues

- Admin: Upload deixa de ser ocultado por Baixar quando as duas ações estão autorizadas. Envio preserva countryId conhecido do item/documento.
- Portal: CPF/NIF opcionais aparecem no grupo documental a partir do catálogo habilitado, sem requisito fictício nem duplicação de linha existente. Tipos explicitamente sem upload são removidos do seletor e bloqueados antes do HTTP. Ação de upload da linha respeita allowedActions quando informado.
- Substituição usa a rota existente e o ID exato do arquivo, preservando datas, bloqueio de duplo envio, rascunho após erro e isolamento de sessão.

## Homologação real

Usuário autorizou qualquer conta de homologação com arquivos fictícios. Arquivos qa-117-ficticio-envio.png e qa-117-ficticio-substituicao.png, sem dados pessoais, usados em contas de teste.

- [x] Portal: envio de CPF e NIF; arquivos retornam Enviado e aparecem no admin.
- [x] Admin: envio de CPF e NIF em outra conta; documentos aparecem com visualização/baixar/revisão.
- [x] Rejeição controlada dos arquivos fictícios do portal pelo admin, com motivo e mensagem explicitamente de QA.
- [x] Portal: substituição dos dois arquivos rejeitados; novos nomes/status Enviado persistem e aparecem no admin.
- [x] Revisão visual da tabela fiscal do portal e das ações fiscais no admin.
- [x] 205 testes admin (incluem 8 testes preexistentes não versionados) e 308 portal; lint e builds aprovados, diff de src/tests sem whitespace.
- [ ] Substituição administrativa: depende de contrato/ação autorizada do backend.
- [ ] Encerramento do histórico substituído: os arquivos anteriores continuam Rejeitado, no contador do admin e com ação de reenvio no portal, mesmo após recarga. Novos arquivos estão Enviado. Confirmar com backend a marcação/relação de substituição e a projeção de arquivos vigentes; não deduplicar por tipo porque outros documentos permitem frente/verso e vários arquivos legítimos.

Evidência: qa-117-portal-substituicoes.png na pasta de visualizações da conversa. Publicação pelo workflow Deploy production; confirmar a conclusão para o commit desta entrega.
