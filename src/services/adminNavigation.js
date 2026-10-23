const asset = (name) => `/icons/admin-menu/${name}.svg`
export const adminNavigation = [
  {
    label: 'Clientes',
    icon: asset('clients'),
    activeIcon: '/icons/client-selection/clients-active.svg',
    to: '/dataManagement',
  },
  {
    label: 'Contratos',
    icon: asset('contracts'),
    activeIcon: asset('contracts-active'),
    to: '/contracts',
  },
  { label: 'Lógicas', icon: asset('logics'), to: null },
  {
    label: 'Transações',
    icon: asset('transactions'),
    activeIcon: asset('transactions-active'),
    to: '/transaction',
  },
  { label: 'Crédito', icon: asset('credit'), to: null },
  { label: 'Comunicados', icon: asset('communications'), to: null },
]
export const adminSettings = [
  { label: 'Formulários', to: '/dataManagement/forms' },
  { label: 'Bancos', to: '/dataManagement/banks' },
  { label: 'Configuração documental', to: '/dataManagement/document-settings' },
]
export function navigationIsActive(item, path) {
  path = path.replace(/\/+$/, '') || '/'
  if (!item.to) return false
  if (item.to === '/dataManagement')
    return path === item.to || path.startsWith('/dataManagement/clients/')
  return path === item.to || path.startsWith(item.to + '/')
}
// Only implemented destinations may be opened; never follow arbitrary server URLs.
export const systemDefinitions = [
  {
    id: 'data-intake',
    label: 'Inserção de Dados',
    icon: asset('data-system'),
    description:
      'Acesse o ambiente administrativo para gestão de clientes, contratos, lógicas, transações, crédito e comunicados.',
    tags: ['Clientes', 'Contratos', 'Lógicas', 'Transações', 'Crédito', 'Comunicados'],
    to: '/dataManagement',
  },
  {
    id: 'landing-page-editor',
    label: 'Edição de Landing Page',
    icon: asset('landing-system'),
    description:
      'Acesse o painel de edição da landing page, com visualização da edição em tempo real e prévia do site em tempo real.',
    tags: ['Editor Visual', 'Preview Live', 'Seções', 'Mídia'],
    to: null,
  },
]
export function availableSystemRoute(definition, response) {
  const system = response?.systems?.find((item) => item.id === definition.id)
  return system?.status === 'available' ? definition.to : null
}
