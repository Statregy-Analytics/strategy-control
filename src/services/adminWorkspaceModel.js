import { auditAction } from './auditModel.js'

export const workspaceTypes = {
  logic: {
    title: 'Painel de Motores / Lógicas Contratuais',
    subtitle:
      'Controle operacional dos motores de variação indexada vinculados a papéis e contratos.',
    create: 'Novo Motor',
    path: 'admin/contracts/catalog/engines',
  },
  credit: {
    title: 'Crédito',
    subtitle:
      'Gestão de operações, parceiros, regras comerciais, comissões e propostas vinculadas a crédito e consórcio.',
    create: 'Nova Operação',
    path: 'admin/loans',
  },
  communication: {
    title: 'Gestão de Publicações',
    subtitle: '',
    create: 'Criar Novo Conteúdo',
    path: 'admin/announcements',
  },
}
export const creditTypes = [
  'Crédito com garantia de imóvel / Home Equity / CGI',
  'Crédito com garantia de veículo / Auto Equity',
  'Financiamento imobiliário',
  'Financiamento de veículo',
  'Consórcio',
  'Crédito PJ',
  'Outro',
]
export const contentTypes = ['Insight', 'Comunicado Oficial', 'Relatório']
export const partnerTypes = [
  'Banco / Financeira',
  'Administradora de Consórcio',
  'Banco + Consórcio',
  'Correspondente / Intermediador',
  'Plataforma de crédito',
  'Plataforma imobiliária / funding',
  'Outro',
]
export const partnerProducts = [
  'Crédito com garantia de imóvel / Home Equity / CGI',
  'Crédito com garantia de veículo / Auto Equity',
  'Financiamento imobiliário',
  'Financiamento de veículos',
  'Consórcio imóvel',
  'Consórcio veículo',
  'Consórcio serviço',
  'Crédito PJ',
  'Consignado',
  'Garantia locatícia',
  'Seguro residencial',
  'Seguro auto',
  'Conta digital',
  'Investimentos',
  'Operações com recebíveis',
  'Plano empresário',
  'Empréstimo ponte',
  'Financiamento de obras',
  'Antecipação de carteira',
  'Antecipação de fornecedor',
  'Equity / Sociedade em SPE',
  'Risco sacado',
  'Estruturação',
  'Intermediação',
  'Consultoria financeira',
  'Due diligence',
  'Outros',
]
export const logicStatuses = ['Em Análise', 'Ativo', 'Pausado', 'Encerrado']
export const publicationStatuses = [
  { label: 'Publicado', value: 'Published' },
  { label: 'Rascunho', value: 'Draft' },
  { label: 'Em Revisão', value: 'UnderReview' },
  { label: 'Arquivado', value: 'Archived' },
]
export function workspaceStatus(value) {
  return (
    publicationStatuses.find((o) => o.value === value)?.label ||
    {
      Active: 'Ativo',
      Pending: 'Pendente',
      Settled: 'Quitado',
      Cancelled: 'Cancelado',
      Closed: 'Encerrado',
      Leverage: 'Alavancagem',
      Loan: 'Empréstimo',
    }[value] ||
    value ||
    '—'
  )
}
export function foldSearch(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('pt-BR')
}
export function filterWorkspace(rows, { search = '', status = null, sort = 'az' } = {}) {
  const q = foldSearch(search)
  return rows
    .filter(
      (r) =>
        (!status || r.status === status) &&
        (!q ||
          [r.name, r.title, r.code, r.publicCode, r.client?.displayName, r.kind].some((v) =>
            foldSearch(v).includes(q),
          )),
    )
    .sort((a, b) =>
      sort === 'recent'
        ? String(b.updatedAtUtc || b.createdAtUtc || '').localeCompare(
            String(a.updatedAtUtc || a.createdAtUtc || ''),
          )
        : String(a.name || a.title || a.publicCode || '').localeCompare(
            String(b.name || b.title || b.publicCode || ''),
            'pt-BR',
          ),
    )
}
export async function readWorkspaceCollection(read, module, current = () => true) {
  const type = workspaceTypes[module]
  if (!type) throw Error('Consulta indisponível.')
  const rows = new Map()
  let page = 1,
    pages = 1
  do {
    if (!current()) return null
    const result = await read(
      type.path,
      module === 'logic' ? { includeNonSelectable: true } : { page, pageSize: 100 },
    )
    if (!Array.isArray(result?.data) || result.success === false)
      throw Error('Consulta indisponível.')
    if (!current()) return null
    for (const row of result.data) if (row.id) rows.set(row.id, row)
    pages = module === 'logic' ? 1 : Math.max(1, Number(result.pagination?.totalPages || 1))
    if (!Number.isInteger(pages) || pages > 10000) throw Error('Refine a consulta.')
    page++
  } while (page <= pages)
  return [...rows.values()]
}
export function requiredText(value) {
  return typeof value === 'string' && value.trim().length > 0
}
function validDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) return false
  const date = new Date(value + 'T00:00:00Z')
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value
}
export function validateLogic(form) {
  if (!requiredText(form.name)) return 'Informe o nome do motor.'
  if (!form.currency || !form.engineType) return 'Selecione a moeda e o tipo do motor.'
  if (!validDate(form.startDate) || !validDate(form.endDate) || form.endDate <= form.startDate)
    return 'O fechamento deve ser posterior ao início do ciclo.'
  if (
    !(Number(form.initialIndex) > 0) ||
    form.target == null ||
    form.target === '' ||
    !Number.isFinite(Number(form.target))
  )
    return 'Revise o índice inicial e o alvo do ciclo.'
  if (!form.interval) return 'Selecione o intervalo operacional.'
  if (
    [form.positive, form.negative].some(
      (v) =>
        v == null || v === '' || !Number.isFinite(Number(v)) || Number(v) < 0 || Number(v) > 100,
    ) ||
    Math.abs(Number(form.positive) + Number(form.negative) - 100) > 0.000001
  )
    return 'As chances positiva e negativa devem somar 100%.'
  for (const [lower, upper] of [
    [form.dailyFloor, form.dailyCeiling],
    [form.monthlyFloor, form.monthlyCeiling],
  ])
    if (
      lower == null ||
      upper == null ||
      lower === '' ||
      upper === '' ||
      !Number.isFinite(Number(lower)) ||
      !Number.isFinite(Number(upper)) ||
      Number(lower) > 0 ||
      Number(upper) < 0 ||
      Number(lower) > Number(upper)
    )
      return 'Revise os pisos e tetos diário e mensal.'
  if (
    form.intensity == null ||
    form.intensity === '' ||
    !Number.isFinite(Number(form.intensity)) ||
    Number(form.intensity) < 0 ||
    Number(form.intensity) > 100
  )
    return 'Informe uma intensidade entre 0 e 100%.'
  if (
    Number(form.dailyCeiling) >= Number(form.monthlyCeiling) ||
    Math.abs(Number(form.dailyFloor)) >= Math.abs(Number(form.monthlyFloor))
  )
    return 'Os limites diários devem ser menores que os mensais.'
  if (
    Number(form.intensity) >= Number(form.dailyCeiling) ||
    Number(form.intensity) >= Math.abs(Number(form.dailyFloor))
  )
    return 'A intensidade deve ser menor que os limites diários.'
  return ''
}
export function initialLogic() {
  return {
    name: '',
    description: '',
    status: 'Em Análise',
    currency: null,
    engineType: null,
    icon: 'chart-pie',
    color: '#153d49',
    initialIndex: 100,
    target: null,
    startDate: '',
    endDate: '',
    interval: null,
    positive: 50,
    negative: 50,
    intensityMode: null,
    intensity: null,
    dailyFloor: null,
    dailyCeiling: null,
    monthlyFloor: null,
    monthlyCeiling: null,
    buffer: false,
    contracts: [],
  }
}
export function projectedFinalIndex(form) {
  return Number(form.initialIndex) > 0 &&
    form.target !== null &&
    form.target !== '' &&
    Number.isFinite(Number(form.target))
    ? Number(form.initialIndex) * (1 + Number(form.target) / 100)
    : null
}
export function validatePublication(form, kind) {
  if (!requiredText(form.title)) return 'Informe o título do conteúdo.'
  if (!form.themes?.length) return 'Informe pelo menos um tema.'
  if (kind === 'Relatório' && !form.pdf) return 'Selecione o PDF principal do relatório.'
  if (kind !== 'Relatório' && !requiredText(form.body)) return 'Informe o conteúdo da publicação.'
  if (kind === 'Comunicado Oficial' && !requiredText(form.code))
    return 'Informe o código do comunicado.'
  if (form.schedule === 'scheduled' && !form.scheduledAt)
    return 'Informe a data e a hora do agendamento.'
  return ''
}
export function announcementTextPayload(source, form) {
  if (!source?.id || !requiredText(form.title) || !requiredText(form.body))
    throw Error('Revise título e conteúdo.')
  // Preserve the server's audience and category; UI editorial groups are not their enums.
  if (!source.category || !source.audience?.type)
    throw Error('Não foi possível confirmar as configurações da publicação.')
  return {
    title: form.title.trim(),
    summary: form.summary?.trim() || null,
    body: form.body,
    category: source.category,
    audience: source.audience.type,
    clientIds: (source.audience.clients || []).map((c) => c.clientId || c.id),
    contractIds: (source.audience.contracts || []).map((c) => c.contractId || c.id),
  }
}
export function historyAction(row) {
  return auditAction(row.action).label
}
