# Checklist de implementação — Marco 2

Documento de acompanhamento da integração do Marco 2 do Strategy Analytics nos frontends:

- `strategy-control`: painel administrativo, em `http://localhost:8080`.
- `Strategy-analytics-v2`: autosserviço do cliente, em `http://localhost:9010`.

Contrato de referência: [swagger.json](Api/swagger.json).

## Convenções

- `[x]`: implementado e validado localmente.
- `[ ]`: pendente.
- Cada etapa deve terminar com lint, build, revisão do diff e teste manual do fluxo afetado.
- Operações de escrita devem enviar uma `Idempotency-Key` estável por ação do usuário.
- Quando aplicável, enviar `Authorization: Bearer <token>` e `X-Workspace-Id`.
- Tratar `401`, `403`, `404`, `409`, `422` e `429` com estados de UI distintos.
- Não registrar tokens, senhas, códigos de verificação ou dados bancários integrais em logs.

## 1. Fundação HTTP e autenticação

### Painel administrativo

- [x] Login em `POST /api/v1/auth/login`.
- [x] Persistência de access token e refresh token.
- [x] Inclusão automática do Bearer token.
- [x] Inclusão automática de `Idempotency-Key` nas escritas.
- [x] Persistência e envio de `X-Workspace-Id`.
- [x] Refresh automático com rotação do refresh token.
- [x] Retry único da requisição após `401`.
- [x] Logout e limpeza da sessão local.
- [x] Redirecionar para login com aviso quando o refresh falhar.
- [x] Restaurar usuário com `GET /api/v1/auth/me` ao iniciar a aplicação.
- [x] Carregar sistemas disponíveis com `GET /api/v1/me/systems`.
- [x] Criar seletor de workspace quando o usuário possuir mais de um.

### Portal do cliente

- [x] Login básico conectado à API nova.
- [x] Logout básico conectado à API nova.
- [x] Aplicar a mesma estratégia de refresh e retry único.
- [x] Corrigir o interceptor de `401` para rejeitar o erro após limpar a sessão.
- [x] Restaurar usuário com `GET /api/v1/auth/me`.
- [x] Validar acesso Client com `GET /api/v1/client/auth/ping`.

## 2. CRM administrativo — clientes

### Listagem e criação

- [x] Serviço de clientes separado do serviço de usuários.
- [x] Listar clientes com `GET /api/v1/admin/customers`.
- [x] Paginação server-side.
- [x] Busca por nome.
- [x] Criar cliente com `POST /api/v1/admin/customers`.
- [x] Remover dados fictícios de contratos, saldo e dividendos da tabela.
- [x] Adicionar filtros por status, tipo, contato e documento.
- [x] Implementar ordenação selecionável.
- [x] Implementar grade com `GET /api/v1/admin/customers/cards`.
- [x] Implementar autocomplete/troca rápida com `GET /api/v1/admin/customers/lookup`.
- [x] Atualizar a listagem após alteração de status ou exclusão.
- [x] Avaliar separadamente a criação/vinculação do usuário de acesso do cliente.

### Próxima etapa — detalhe do cliente

- [x] Criar rota administrativa `/dataManagement/clients/:id`.
- [x] Tornar a linha/nome do cliente navegável para o detalhe.
- [x] Carregar a primeira renderização com `GET /api/v1/admin/customers/{id}/summary`.
- [x] Criar estados de loading, vazio, erro e cliente não encontrado.
- [x] Renderizar header com `GET /api/v1/admin/customers/{id}/header`.
- [x] Implementar identificação com `GET /api/v1/admin/customers/{id}/identification`.
- [x] Editar nomes com `PUT /api/v1/admin/customers/{id}/names`.
- [x] Editar contatos com `PUT /api/v1/admin/customers/{id}/contacts`.
- [x] Editar endereços com `PUT /api/v1/admin/customers/{id}/addresses`.
- [x] Consultar e alterar status.
- [x] Implementar preferências e catálogo de preferências.
- [x] Invalidar/recarregar summary e projeções afetadas após cada escrita.

## 3. Perfis profissional, financeiro e segurança

### Painel administrativo

- [x] Carregar visão combinada em `/professional-financial-security`.
- [x] Consultar e editar perfil profissional.
- [x] Consultar perfil financeiro atual.
- [x] Listar histórico de perfis financeiros.
- [x] Criar uma nova versão do perfil financeiro.
- [x] Exibir segurança da conta sem dados sensíveis.
- [x] Não implementar configuração de 2FA neste marco.

### Portal do cliente

- [x] Carregar `GET /api/v1/client/profile/summary`.
- [x] Consultar e atualizar `/client/profile`.
- [x] Consultar e atualizar preferências.
- [x] Consultar e atualizar perfil profissional.
- [x] Consultar e atualizar perfil financeiro.
- [x] Implementar contatos de confiança.

## 4. Contas bancárias

### Painel administrativo

- [x] Listar catálogo com `GET /api/v1/admin/banks`.
- [x] Criar banco com `POST /api/v1/admin/banks`.
- [x] Listar e criar contas do cliente.
- [x] Consultar e editar conta.
- [x] Definir conta principal.
- [x] Alterar status e arquivar conta.
- [x] Exibir valores mascarados nas telas de leitura.

### Portal do cliente

- [x] Consultar bancos ativos com `GET /api/v1/client/banks`.
- [x] Listar e criar contas próprias.
- [x] Consultar e editar conta própria.
- [x] Definir conta principal e arquivar.
- [x] Tratar o guard de onboarding `Deposit`.
- [x] Nunca exibir número integral ou chave Pix bruta.

## 5. Documentos

### Portal do cliente — fluxo prioritário

Usar somente `/api/v1/client/profile/documents/*`. Não integrar o fluxo novo com `/data-intake/submissions/*`.

- [x] Carregar `/documents/overview` para a tela principal.
- [x] Carregar `/documents/progress` para nível, classificação e progresso.
- [x] Carregar catálogo de tipos de documento.
- [x] Carregar definição de dados por tipo e país.
- [x] Implementar upload multipart.
- [x] Aceitar somente PDF, JPEG e PNG, até 25 MB.
- [x] Implementar substituição de documento rejeitado.
- [x] Implementar download direto e URL temporária.
- [x] Recarregar overview, progress e onboarding depois de upload/substituição.
- [x] Tratar explicitamente arquivo inválido, requisito conflitante, rejeição e storage indisponível.

### Painel administrativo

- [x] Configurar categorias e tipos de documentos.
- [x] Configurar país, schemas e definições de upload/dados.
- [x] Criar e listar requisitos documentais do cliente.
- [x] Carregar overview e progress do cliente.
- [x] Fazer upload administrativo.
- [x] Baixar ou gerar URL temporária.
- [x] Revisar, aprovar e rejeitar documentos.
- [x] Alterar status e excluir documento.
- [x] Recarregar summary, cards, overview e progress após revisão.

## 6. Compliance, verificação e timeline

### Painel administrativo

- [x] Implementar card de compliance.
- [x] Listar, criar e editar flags.
- [x] Resolver e descartar flags.
- [x] Exibir alertas e histórico.
- [x] Carregar catálogo de verificação.
- [x] Consultar nível de verificação do cliente.
- [x] Atualizar status das áreas de verificação.
- [x] Implementar timeline paginada.

### Portal do cliente

- [x] Implementar timeline própria.
- [x] Não expor flags, evidências ou controles administrativos de compliance.

## 7. Onboarding e autosserviço de conta

- [x] Carregar `GET /api/v1/client/onboarding/status`.
- [x] Transformar respostas `403` de guard em ações de onboarding.
- [x] Implementar confirmação e reenvio de e-mail.
- [x] Implementar esquecimento e redefinição de senha.
- [x] Implementar alteração de senha autenticada.
- [x] Implementar solicitação e confirmação de telefone.
- [x] Listar e revogar sessões.
- [x] Implementar avatar e assinatura.
- [x] Implementar links de compartilhamento e perfil público.

## 8. Qualidade e homologação

A cada etapa:

- [ ] Executar `npm run lint` no projeto alterado.
- [ ] Executar `npm run build` no projeto alterado.
- [ ] Executar `git diff --check`.
- [ ] Testar perfil Admin e perfil Client separadamente.
- [ ] Testar troca de workspace quando disponível.
- [ ] Testar loading, vazio, sucesso e falha.
- [ ] Testar pelo menos `401`, `403`, `404`, `409` e validação.
- [ ] Confirmar que dados sensíveis não aparecem em logs ou mensagens.
- [ ] Registrar bugs reproduzíveis no Linear.
- [ ] Criar commit pequeno e descritivo após a validação da etapa.

## Fora do escopo do Marco 2

Não implementar nesta fase:

- [ ] Operação completa de contratos e papéis.
- [ ] Transações.
- [ ] Carteira de investimentos.
- [ ] Patrimônio.
- [ ] Motor de variação indexada.
- [ ] Propriedade/vínculo de documento por contrato.
- [ ] Processamento automatizado avançado/OCR de submissões.
- [ ] Novo fluxo baseado em `/data-intake/submissions/*`.
