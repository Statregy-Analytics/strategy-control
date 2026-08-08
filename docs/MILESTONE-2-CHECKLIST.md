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
- [ ] Redirecionar para login com aviso quando o refresh falhar.
- [ ] Restaurar usuário com `GET /api/v1/auth/me` ao iniciar a aplicação.
- [ ] Carregar sistemas disponíveis com `GET /api/v1/me/systems`.
- [ ] Criar seletor de workspace quando o usuário possuir mais de um.

### Portal do cliente

- [x] Login básico conectado à API nova.
- [x] Logout básico conectado à API nova.
- [ ] Aplicar a mesma estratégia de refresh e retry único.
- [ ] Corrigir o interceptor de `401` para rejeitar o erro após limpar a sessão.
- [ ] Restaurar usuário com `GET /api/v1/auth/me`.
- [ ] Validar acesso Client com `GET /api/v1/client/auth/ping`.

## 2. CRM administrativo — clientes

### Listagem e criação

- [x] Serviço de clientes separado do serviço de usuários.
- [x] Listar clientes com `GET /api/v1/admin/customers`.
- [x] Paginação server-side.
- [x] Busca por nome.
- [x] Criar cliente com `POST /api/v1/admin/customers`.
- [x] Remover dados fictícios de contratos, saldo e dividendos da tabela.
- [ ] Adicionar filtros por status, tipo, contato e documento.
- [ ] Implementar ordenação selecionável.
- [ ] Implementar grade com `GET /api/v1/admin/customers/cards`.
- [ ] Implementar autocomplete/troca rápida com `GET /api/v1/admin/customers/lookup`.
- [ ] Atualizar a listagem após alteração de status ou exclusão.
- [ ] Avaliar separadamente a criação/vinculação do usuário de acesso do cliente.

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

- [ ] Carregar visão combinada em `/professional-financial-security`.
- [ ] Consultar e editar perfil profissional.
- [ ] Consultar perfil financeiro atual.
- [ ] Listar histórico de perfis financeiros.
- [ ] Criar uma nova versão do perfil financeiro.
- [ ] Exibir segurança da conta sem dados sensíveis.
- [ ] Não implementar configuração de 2FA neste marco.

### Portal do cliente

- [ ] Carregar `GET /api/v1/client/profile/summary`.
- [ ] Consultar e atualizar `/client/profile`.
- [ ] Consultar e atualizar preferências.
- [ ] Consultar e atualizar perfil profissional.
- [ ] Consultar e atualizar perfil financeiro.
- [ ] Implementar contatos de confiança.

## 4. Contas bancárias

### Painel administrativo

- [x] Listar catálogo com `GET /api/v1/admin/banks`.
- [x] Criar banco com `POST /api/v1/admin/banks`.
- [ ] Listar e criar contas do cliente.
- [ ] Consultar e editar conta.
- [ ] Definir conta principal.
- [ ] Alterar status e arquivar conta.
- [ ] Exibir valores mascarados nas telas de leitura.

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

- [ ] Carregar `/documents/overview` para a tela principal.
- [ ] Carregar `/documents/progress` para nível, classificação e progresso.
- [ ] Carregar catálogo de tipos de documento.
- [ ] Carregar definição de dados por tipo e país.
- [ ] Implementar upload multipart.
- [ ] Aceitar somente PDF, JPEG e PNG, até 25 MB.
- [ ] Implementar substituição de documento rejeitado.
- [ ] Implementar download direto e URL temporária.
- [ ] Recarregar overview, progress e onboarding depois de upload/substituição.
- [ ] Tratar explicitamente arquivo inválido, requisito conflitante, rejeição e storage indisponível.

### Painel administrativo

- [ ] Configurar categorias e tipos de documentos.
- [ ] Configurar país, schemas e definições de upload/dados.
- [ ] Criar e listar requisitos documentais do cliente.
- [ ] Carregar overview e progress do cliente.
- [ ] Fazer upload administrativo.
- [ ] Baixar ou gerar URL temporária.
- [ ] Revisar, aprovar e rejeitar documentos.
- [ ] Alterar status e excluir documento.
- [ ] Recarregar summary, cards, overview e progress após revisão.

## 6. Compliance, verificação e timeline

### Painel administrativo

- [ ] Implementar card de compliance.
- [ ] Listar, criar e editar flags.
- [ ] Resolver e descartar flags.
- [ ] Exibir alertas e histórico.
- [ ] Carregar catálogo de verificação.
- [ ] Consultar nível de verificação do cliente.
- [ ] Atualizar status das áreas de verificação.
- [ ] Implementar timeline paginada.

### Portal do cliente

- [ ] Implementar timeline própria.
- [ ] Não expor flags, evidências ou controles administrativos de compliance.

## 7. Onboarding e autosserviço de conta

- [ ] Carregar `GET /api/v1/client/onboarding/status`.
- [ ] Transformar respostas `403` de guard em ações de onboarding.
- [ ] Implementar confirmação e reenvio de e-mail.
- [ ] Implementar esquecimento e redefinição de senha.
- [ ] Implementar alteração de senha autenticada.
- [ ] Implementar solicitação e confirmação de telefone.
- [ ] Listar e revogar sessões.
- [ ] Implementar avatar e assinatura.
- [ ] Implementar links de compartilhamento e perfil público.

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
