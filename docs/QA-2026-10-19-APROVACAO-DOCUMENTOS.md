# Revisão documental no perfil administrativo — 19/10/2026

Referência: Figma `i2jizg7UtPyg3KjAOvuFtI`, fluxo `1932:281`, C27 `1932:387` e C28 `1933:281`. Escopo deste lote: aprovação/reprovação de documentos do perfil, parte do QA 10.

## Interface e integração

- Contadores no cabeçalho: Aprovados, Aguardando e Rejeitados. Consulta em carregamento/erro não exibe contadores antigos como atuais.
- Documento pendente exibe Aguardando aprovação e ações Reprovar/Aprovar quando `allowedActions` autoriza Review. Arquivo ausente e estados finais não recebem ações de revisão.
- Visualizar e Baixar na linha, conforme C27. Download usa o endpoint autenticado; os ícones locais do Figma são renderizados em 16 × 16 px.
- Aprovar envia diretamente a decisão. Reprovar abre o diálogo C28 com somente Motivo e Mensagem para o cliente; motivo obrigatório, cancelar sem escrita. Apenas Foto ilegível foi confirmado no desenho e está disponível; não foram inventados outros motivos.
- Escrita por `POST /admin/documents/{id}/reviews`, com autenticação e idempotência existentes. Repetição após falha conserva a chave; cliques concorrentes não duplicam revisão. Erro preserva o formulário, sem notificar sucesso.
- Resposta deve confirmar documento e decisão. Depois do sucesso, são consultados novamente overview, identificação, resumo do cliente e histórico. Não se simula alteração de risco, compliance, nível ou permissão de edição.
- Respostas antigas não atualizam outro cliente ou componente desmontado. A gravação bloqueia as ações e o fechamento do diálogo.

## Contrato e dependências do backend

O Swagger consultado oferece `ReviewDocumentRequest { status, notes }`. Aprovação envia `{ status: Approved, notes: null }`. Na reprovação, o front envia `{ status: Rejected, notes: "<motivo>\n<mensagem>" }`, preservando os dois textos nos controles do desenho; mensagem vazia envia somente o motivo. Gravação e leitura desse conteúdo foram confirmadas na API de homologação.

Ainda precisamos de:

1. Catálogo confirmado dos motivos e, se houver tratamento estruturado/notificações, contrato que distinga motivo e mensagem. O front não acrescentou propriedades HTTP inexistentes.
2. Estado explícito de revisão dos dados cadastrais, data de envio e permissão de edição para C26. O status operacional do cliente e um documento fiscal pendente não provam que todos os dados pessoais estão aguardando revisão.
3. Confirmação de que a revisão do documento de cadastro atualiza a pendência e a permissão de edição no portal. Aprovação documental isolada não autoriza o front a alterar áreas de verificação ou liberar acesso por conta própria.
4. Defaults corretos na criação do cliente (C25): risco sem classificação, compliance pendente, status Prospect e preferências do sistema. Não foram substituídos os dados reais do cadastro por valores visuais presumidos.

O reenvio pelo cliente e o desbloqueio do perfil não foram aprovados por esta rodada. São diferentes do salvamento de uma revisão de arquivo no Admin.

## Homologação executada

Admin em 8080 e API de homologação, com sessão administrativa e cadastro fictício do Cláudio. Dois PDFs descartáveis, sem dados pessoais, foram criados exclusivamente para esta rodada:

- `996aa4fc-4792-47d6-98aa-a3cd369f269d`: reprovação pela tela com Foto ilegível e mensagem de QA. Overview confirmou Rejected e os dois textos; contador de rejeitados atualizado.
- `9188ef5e-f03b-463b-a896-0bae8f951bf1`: aprovação pela tela. Overview confirmou Approved, sem novas ações de revisão; contador de aprovados atualizado. Download concluído.

Ambos foram removidos ao terminar. Overview retornou ao total original: 1 documento, 0 aprovados, 1 pendente e 0 rejeitados. O documento original `07158647-9ca1-4be4-abc9-9c4a3e5af54a` permaneceu Pending durante toda a rodada. O histórico registra os uploads, revisões e limpeza de QA.

Motivo vazio foi bloqueado sem escrita. Cancelamento, desktop e celular 390 px conferidos; diálogo móvel com largura/scroll 326/326 px. Nenhuma transação financeira, alteração de credencial, mudança de área de verificação ou aprovação do documento original foi realizada.

57 testes automatizados passaram, incluindo sete novos para permissão/estado, payload, motivo obrigatório, concorrência, falha/repetição, confirmação de identidade e resposta após troca de cliente. Lint, build e checagem de espaços dos arquivos do lote também fazem parte da validação final.
