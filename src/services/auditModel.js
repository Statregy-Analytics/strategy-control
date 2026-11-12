export const auditActors = [
  { label: 'Admin', value: 'Admin' },
  { label: 'Cliente', value: 'Client' },
  { label: 'Sistema', value: 'System' },
]
export const auditActions = [
  { label: 'Criação', value: 'Created', tone: 'created' },
  { label: 'Alteração', value: 'Updated', tone: 'updated' },
  { label: 'Mudança de status', value: 'StatusChanged', tone: 'status' },
  { label: 'Exclusão', value: 'deletion', tone: 'deleted' },
]
export const isAuditDeletion = (action) =>
  ['Archived', 'Deleted', 'Exclusão', 'Arquivado'].includes(action)
export const auditAction = (action) =>
  auditActions.find((item) => item.value === (isAuditDeletion(action) ? 'deletion' : action)) || {
    label: action || '—',
    tone: 'unknown',
  }
const modules = {
  Customers: 'Clientes',
  Assets: 'Patrimônio',
  Contracts: 'Contratos',
  Debts: 'Dívidas',
  ContractDebts: 'Dívidas',
  Transactions: 'Transações',
  Communications: 'Comunicados',
  Loans: 'Empréstimos',
  Engines: 'Motor',
  Engine: 'Motor',
  LandingPage: 'Landing Page',
}
export const auditModule = (value) => modules[value] || value || '—'
const fields = {
  Title: 'Título',
  Summary: 'Resumo',
  Body: 'Conteúdo',
  Name: 'Nome',
  Status: 'Status',
  Amount: 'Valor',
  Balance: 'Saldo',
  AllocatedAmount: 'Valor aplicado',
  BankId: 'Banco',
  AccountNumber: 'Número da conta',
  PixKey: 'Chave Pix',
  IsPrimary: 'Principal',
  PublishedAtUtc: 'Publicado em',
  PublishedBy: 'Publicado por',
  ArchivedAtUtc: 'Arquivado em',
  ArchivedBy: 'Arquivado por',
  LinkedAtUtc: 'Vinculado em',
  LinkedBy: 'Vinculado por',
  UnlinkedAtUtc: 'Desvinculado em',
  UnlinkedBy: 'Desvinculado por',
  IndividualMonthlyIncome: 'Renda mensal individual',
  FamilyMonthlyIncome: 'Renda familiar',
  DeclaredAssets: 'Patrimônio declarado',
}
export const auditField = (value) =>
  fields[value] || String(value || '').replace(/([a-z])([A-Z])/g, '$1 $2')
const sensitive =
  /password|senha|secret|token|account.?number|document.?number|holder.?document|pix.?key|tax.?id|cpf|cnpj|nif|identification.?number/i
function protect(field, value, depth = 0) {
  if (value == null || value === '') return '—'
  if (sensitive.test(field)) {
    if (/password|senha|secret|token/i.test(field)) return '••••'
    const text = String(value)
    return /[*•]/.test(text) ? text : '****' + text.slice(-4)
  }
  if (typeof value === 'object') {
    if (depth > 5) return '…'
    if (Array.isArray(value)) return value.slice(0, 100).map((v) => protect(field, v, depth + 1))
    return Object.fromEntries(
      Object.entries(value)
        .slice(0, 100)
        .map(([key, v]) => [key, protect(key, v, depth + 1)]),
    )
  }
  return value
}
export function auditValue(field, value, currency) {
  let parsed = value
  if (typeof value === 'string' && /^[\x5b{]/.test(value.trim())) {
    try {
      parsed = JSON.parse(value)
    } catch {
      /* Preserve unstructured text safely. */
    }
  }
  const safe = protect(field || '', parsed)
  if (typeof safe === 'object') return JSON.stringify(safe, null, 2)
  if (typeof safe === 'boolean' || safe === 'true' || safe === 'false')
    return safe === true || safe === 'true' ? 'Sim' : 'Não'
  if (/status$/i.test(field || ''))
    return (
      {
        Draft: 'Rascunho',
        Published: 'Publicado',
        Archived: 'Arquivado',
        Active: 'Ativo',
        Inactive: 'Inativo',
        Approved: 'Aprovado',
        Rejected: 'Reprovado',
        Completed: 'Concluído',
        Pending: 'Pendente',
      }[safe] || String(safe)
    )
  if (
    currency &&
    /^(Amount|Balance|AllocatedAmount|Value)$/i.test(field || '') &&
    /^-?\d+(\.\d+)?$/.test(String(safe))
  ) {
    try {
      return new Intl.NumberFormat('pt-BR', { style: 'currency', currency }).format(Number(safe))
    } catch {
      /* Keep the real value when currency metadata is invalid. */
    }
  }
  return String(safe)
}
export function auditDate(value) {
  const date = new Date(value)
  return value && Number.isFinite(date.getTime())
    ? new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short', timeZone: 'UTC' })
        .format(date)
        .replace(',', '')
    : '—'
}
const uuid = (value) =>
  typeof value === 'string' && /^[a-f\d]{8}(-[a-f\d]{4}){3}-[a-f\d]{12}$/i.test(value)
export function auditTarget(row, scope = {}) {
  const query = { history: '1' }
  if (
    row.module === 'Customers' &&
    uuid(row.customerId || (row.resourceType === 'Customer' ? row.resourceId : null))
  )
    return { name: 'ClienteDetalhe', params: { id: row.customerId || row.resourceId }, query }
  if (row.resourceType === 'Contract' && uuid(row.resourceId))
    return { name: 'contracts', query: { ...query, contractId: row.resourceId } }
  if (row.resourceType === 'Transaction' && uuid(row.resourceId))
    return { name: 'Transações', query: { ...query, transactionId: row.resourceId } }
  if (scope.resourceType === row.resourceType && scope.resourceId === row.resourceId) return null
  return {
    name: 'Auditoria',
    query: {
      resourceType: String(row.resourceType || ''),
      resourceId: String(row.resourceId || ''),
    },
  }
}
export function auditRecord(row, metadata) {
  if (metadata?.label) return metadata.label
  const names = {
    Customer: 'Cliente',
    CustomerPersonalDetails: 'Dados pessoais',
    CustomerBankAccount: 'Conta bancária',
    CustomerAsset: 'Patrimônio',
    CustomerAssetDocumentLink: 'Anexo do patrimônio',
    Announcement: 'Comunicado',
    AnnouncementTarget: 'Público do comunicado',
    Contract: 'Contrato',
    Transaction: 'Transação',
  }
  return `${names[row.resourceType] || row.resourceType || 'Registro'} · ${String(row.resourceId || '—').slice(0, 8)}`
}
const clean = (value, max = 200) => (typeof value === 'string' ? value.slice(0, max).trim() : '')
const day = (v) =>
  /^\d{4}-\d{2}-\d{2}$/.test(v || '') &&
  Number.isFinite(Date.parse(v)) &&
  new Date(v).toISOString().slice(0, 10) === v
    ? v
    : ''
export function auditFilters(query = {}) {
  return {
    search: clean(query.search),
    from: day(query.from),
    to: day(query.to),
    actor: auditActors.some((x) => x.value === query.actor) ? query.actor : '',
    module: clean(query.module, 64),
    action: auditActions.some((x) => x.value === query.action) ? query.action : '',
    customer: uuid(query.customer) ? query.customer : '',
    resourceType: clean(query.resourceId) ? clean(query.resourceType, 100) : '',
    resourceId: clean(query.resourceType, 100) ? clean(query.resourceId) : '',
  }
}
export function auditParams(filters) {
  if (filters.from && filters.to && filters.from > filters.to)
    throw new Error('Revise o período informado.')
  const map = {
    search: 'Search',
    from: 'From',
    to: 'To',
    actor: 'ActorType',
    module: 'Module',
    action: 'Action',
    customer: 'CustomerId',
    resourceType: 'ResourceType',
    resourceId: 'ResourceId',
  }
  return Object.fromEntries(
    Object.entries(map)
      .filter(([key]) => filters[key] && !(key === 'action' && filters.action === 'deletion'))
      .map(([key, api]) => [api, filters[key]]),
  )
}
export const auditRouteQuery = (filters, page = 1) =>
  Object.fromEntries([
    ...Object.entries(filters).filter(([, value]) => value),
    ...(page > 1 ? [['page', String(page)]] : []),
  ])
