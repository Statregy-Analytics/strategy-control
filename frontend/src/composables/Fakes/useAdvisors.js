import { useAdvisorStore } from 'src/stores/advisor'
import { storeToRefs } from 'pinia'
import { reactive } from 'vue'
import useAdvisorsApi from 'src/composables/Api/useAdvisorsApi'
import { debugLog } from 'src/utils/debugLog'

const useFakes =
  import.meta && import.meta.env && String(import.meta.env.VITE_USE_FAKES) !== 'false'

// If configured to use API, try to initialize API adapter at module load
let apiAdapterLoaded = null
if (!useFakes) {
  try {
    // reuse statically imported adapter when available
    apiAdapterLoaded = useAdvisorsApi()
  } catch (e) {
    console.error('useAdvisors: failed to init api adapter at module load', e && e.message)
    apiAdapterLoaded = null
  }
}

// Debug: report which adapter mode is active (only when VITE_DEBUG=true)
debugLog(
  'useAdvisors',
  'adapter=',
  useFakes ? 'fake' : 'api',
  'apiAdapterLoaded=',
  !!apiAdapterLoaded,
)

// Shared reactive array used when delegating to API so every composable instance
// observes the same list and table updates across the app.
import { reactive as _reactive } from 'vue'
const sharedApiRowsAssessores = _reactive([])

// columnsAssessores is defined at module top-level and reused across both flows

// Shared advisors array so all composable instances see the same data
const globalRowsAssessores = [
  {
    id: 1,
    assessor: {
      name: 'João Silva',
      avatar: 'https://sources.strategyanalytics.com.br/storage/users/_Avatar_.png',
      email: 'joao@gstrategyanalytics.com.br',
    },
    clients_count: 15,
    customers: {
      balance_contract: 50000.0,
      balance_customers: 10000.0,
      captured_customers: 5,
      linked_customers: 15,
    },
    gastos: {
      value: 5000.0,
      limite: 10000.0,
      data: [
        {
          date: '2023-10-01',
          description: 'Gastos mensais do assessor',
          category: 'Marketing',
          amount: 5000.0,
          location: 'São Paulo',
          target: {
            level: 'Cliente A',
            avatar: 'https://sources.strategyanalytics.com.br/storage/users/_Avatar_.png',
            name: 'Fulano de Tal',
            id: 101,
          },
        },
      ],
    },
    commission: {
      received: 5000.0,
      future: 2000.0,
      value: 7000.0,
    },
    comissao_recebida: 3000.0,
    comissao_futura: 1500.0,
    actions: 'Ações',
  },
  {
    id: 2,
    assessor: {
      name: 'Maria Oliveira',
      avatar: 'https://sources.strategyanalytics.com.br/storage/users/_Avatar_.png',
      email: 'maria@gstrategyanalytics.com.br',
    },
    clients_count: 20,
    customers: {
      balance_contract: 60000.0,
      balance_customers: 15000.0,
      captured_customers: 8,
      linked_customers: 20,
    },
    gastos: {
      value: 7000.0,
      limite: 12000.0,
      data: [
        {
          date: '2023-09-15',
          description: 'Evento de networking',
          category: 'Eventos',
          amount: 3000.0,
          location: 'Rio de Janeiro',
          target: {
            level: 'Cliente B',
            avatar: 'https://sources.strategyanalytics.com.br/storage/users/_Avatar_.png',
            name: 'Beltrano da Silva',
            id: 102,
          },
        },
        {
          date: '2023-10-10',
          description: 'Campanha digital',
          category: 'Marketing',
          amount: 4000.0,
          location: 'Online',
          target: {
            level: 'Cliente C',
            avatar: 'https://sources.strategyanalytics.com.br/storage/users/_Avatar_.png',
            name: 'Ciclano Pereira',
            id: 103,
          },
        },
      ],
    },
    commission: {
      received: 4000.0,
      future: 2500.0,
      value: 6500.0,
    },
    comissao_recebida: 2500.0,
    comissao_futura: 2000.0,
    actions: 'Ações',
  },
  {
    id: 3,
    assessor: {
      name: 'Carlos Pereira',
      avatar: 'https://sources.strategyanalytics.com.br/storage/users/_Avatar_.png',
      email: 'carlos@gstrategyanalytics.com.br',
    },
    clients_count: 10,
    customers: {
      balance_contract: 30000.0,
      balance_customers: 8000.0,
      captured_customers: 3,
      linked_customers: 10,
    },
    gastos: {
      value: 3500.0,
      limite: 8000.0,
      data: [
        {
          date: '2023-08-20',
          description: 'Publicidade local',
          category: 'Publicidade',
          amount: 1500.0,
          location: 'Belo Horizonte',
          target: {
            level: 'Cliente D',
            avatar: 'https://sources.strategyanalytics.com.br/storage/users/_Avatar_.png',
            name: 'Joana Souza',
            id: 104,
          },
        },
        {
          date: '2023-09-05',
          description: 'Material promocional',
          category: 'Material',
          amount: 2000.0,
          location: 'Belo Horizonte',
          target: {
            level: 'Cliente E',
            avatar: 'https://sources.strategyanalytics.com.br/storage/users/_Avatar_.png',
            name: 'Marcos Lima',
            id: 105,
          },
        },
      ],
    },
    commission: {
      received: 2000.0,
      future: 1200.0,
      value: 3200.0,
    },
    comissao_recebida: 1500.0,
    comissao_futura: 1000.0,
    actions: 'Ações',
  },
  {
    id: 4,
    assessor: {
      name: 'Ana Costa',
      avatar: 'https://sources.strategyanalytics.com.br/storage/users/_Avatar_.png',
      email: 'ana@gstrategyanalytics.com.br',
    },
    clients_count: 25,
    customers: {
      balance_contract: 80000.0,
      balance_customers: 20000.0,
      captured_customers: 10,
      linked_customers: 25,
    },
    gastos: {
      value: 9000.0,
      limite: 15000.0,
      data: [
        {
          date: '2023-07-12',
          description: 'Viagem de negócios',
          category: 'Viagem',
          amount: 5000.0,
          location: 'Curitiba',
          target: {
            level: 'Cliente F',
            avatar: 'https://sources.strategyanalytics.com.br/storage/users/_Avatar_.png',
            name: 'Patrícia Gomes',
            id: 106,
          },
        },
        {
          date: '2023-08-22',
          description: 'Publicidade digital',
          category: 'Publicidade',
          amount: 4000.0,
          location: 'Online',
          target: {
            level: 'Cliente G',
            avatar: 'https://sources.strategyanalytics.com.br/storage/users/_Avatar_.png',
            name: 'Roberto Nunes',
            id: 107,
          },
        },
      ],
    },
    commission: {
      received: 6000.0,
      future: 3000.0,
      value: 9000.0,
    },
    comissao_recebida: 3500.0,
    comissao_futura: 2500.0,
    actions: 'Ações',
  },
  {
    id: 5,
    assessor: {
      name: 'Pedro Souza',
      avatar: 'https://sources.strategyanalytics.com.br/storage/users/_Avatar_.png',
      email: 'pedro@gstrategyanalytics.com.br',
    },
    clients_count: 18,
    customers: {
      balance_contract: 40000.0,
      balance_customers: 12000.0,
      captured_customers: 6,
      linked_customers: 18,
    },
    gastos: {
      value: 4200.0,
      limite: 9000.0,
      data: [
        {
          date: '2023-09-01',
          description: 'Treinamento',
          category: 'Educação',
          amount: 2200.0,
          location: 'Porto Alegre',
          target: {
            level: 'Cliente H',
            avatar: 'https://sources.strategyanalytics.com.br/storage/users/_Avatar_.png',
            name: 'Luciana Alves',
            id: 108,
          },
        },
        {
          date: '2023-09-20',
          description: 'Publicidade impressa',
          category: 'Publicidade',
          amount: 2000.0,
          location: 'Porto Alegre',
          target: {
            level: 'Cliente I',
            avatar: 'https://sources.strategyanalytics.com.br/storage/users/_Avatar_.png',
            name: 'Eduardo Fernandes',
            id: 109,
          },
        },
      ],
    },
    commission: {
      received: 3000.0,
      future: 1800.0,
      value: 4800.0,
    },
    comissao_recebida: 2800.0,
    comissao_futura: 1700.0,
    actions: 'Ações',
  },
  {
    id: 6,
    assessor: {
      name: 'Fernanda Lima',
      avatar: 'https://sources.strategyanalytics.com.br/storage/users/_Avatar_.png',
      email: 'fernanda@gstrategyanalytics.com.br',
    },
    clients_count: 22,
    customers: {
      balance_contract: 55000.0,
      balance_customers: 14000.0,
      captured_customers: 7,
      linked_customers: 22,
    },
    gastos: {
      value: 6100.0,
      limite: 12000.0,
      data: [
        {
          date: '2023-08-10',
          description: 'Consultoria externa',
          category: 'Consultoria',
          amount: 3100.0,
          location: 'Recife',
          target: {
            level: 'Cliente J',
            avatar: 'https://sources.strategyanalytics.com.br/storage/users/_Avatar_.png',
            name: 'Bruno Castro',
            id: 110,
          },
        },
        {
          date: '2023-09-18',
          description: 'Publicidade digital',
          category: 'Publicidade',
          amount: 3000.0,
          location: 'Online',
          target: {
            level: 'Cliente K',
            avatar: 'https://sources.strategyanalytics.com.br/storage/users/_Avatar_.png',
            name: 'Tatiane Ribeiro',
            id: 111,
          },
        },
      ],
    },
    commission: {
      received: 4100.0,
      future: 2100.0,
      value: 6200.0,
    },
    comissao_recebida: 3200.0,
    comissao_futura: 2100.0,
    actions: 'Ações',
  },
  {
    id: 7,
    assessor: {
      name: 'Ricardo Alves',
      avatar: 'https://sources.strategyanalytics.com.br/storage/users/_Avatar_.png',
      email: 'ricardo@gstrategyanalytics.com.br',
    },
    clients_count: 12,
    customers: {
      balance_contract: 25000.0,
      balance_customers: 6000.0,
      captured_customers: 2,
      linked_customers: 12,
    },
    gastos: {
      value: 3900.0,
      limite: 8000.0,
      data: [
        {
          date: '2023-07-25',
          description: 'Material de escritório',
          category: 'Material',
          amount: 900.0,
          location: 'Salvador',
          target: {
            level: 'Cliente L',
            avatar: 'https://sources.strategyanalytics.com.br/storage/users/_Avatar_.png',
            name: 'Sérgio Martins',
            id: 112,
          },
        },
        {
          date: '2023-08-30',
          description: 'Publicidade local',
          category: 'Publicidade',
          amount: 3000.0,
          location: 'Salvador',
          target: {
            level: 'Cliente M',
            avatar: 'https://sources.strategyanalytics.com.br/storage/users/_Avatar_.png',
            name: 'Débora Farias',
            id: 113,
          },
        },
      ],
    },
    commission: {
      received: 1900.0,
      future: 1200.0,
      value: 3100.0,
    },
    comissao_recebida: 1800.0,
    comissao_futura: 900.0,
    actions: 'Ações',
  },
]

const columnsAssessores = [
  {
    name: 'assessor',
    required: true,
    label: 'Assessor',
    align: 'left',
    field: 'assessor',
    sortable: true,
  },
  {
    name: 'clients_count',
    align: 'right',
    label: 'Clientes Captados',
    field: 'clients_count',
    sortable: true,
    headerStyle: 'text-align: end',
  },
  {
    name: 'gastos',
    align: 'right',
    label: 'Gasto do Assessor(R$)',
    // extract numeric value when 'gastos' is an object like { value: 123, ... }
    field: (row) => {
      try {
        const g = row && row.gastos
        if (g == null) return null
        if (typeof g === 'number') return g
        if (typeof g === 'object') return g.value != null ? g.value : null
        // fallback: attempt numeric coercion
        const n = Number(g)
        return Number.isNaN(n) ? g : n
      } catch {
        return null
      }
    },
    // format as Brazilian currency when rendering/exporting
    format: (val) => {
      if (val === null || val === undefined || val === '') return ''
      const num = typeof val === 'number' ? val : Number(val)
      if (Number.isNaN(num)) return String(val)
      return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
    },
    sortable: true,
    headerStyle: 'text-align: end',
  },
  {
    name: 'comissao_recebida',
    align: 'right',
    label: 'Comissão Recebida (R$)',
    field: 'comissao_recebida',
    headerStyle: 'text-align: end',
  },
  {
    name: 'comissao_futura',
    align: 'right',
    label: 'Comissão Futura (R$)',
    field: 'comissao_futura',
    headerStyle: 'text-align: end',
  },
  {
    name: 'actions',
    label: '',
    field: 'actions',
    headerStyle: 'width: 10px; text-align: end',
  },
]

function addAdvisor(advisor) {
  // if advisor has an id and exists, update in place
  if (advisor && advisor.id) {
    const idx = globalRowsAssessores.findIndex((a) => a.id === advisor.id)
    if (idx !== -1) {
      // merge and replace while keeping reactive reference
      const merged = Object.assign({}, globalRowsAssessores[idx], advisor)
      globalRowsAssessores.splice(idx, 1, merged)
      return merged
    }
  }
  // otherwise create new
  const nextId = globalRowsAssessores.reduce((m, a) => (a.id > m ? a.id : m), 0) + 1
  const newAdvisor = Object.assign({ id: nextId }, advisor)
  // ensure expected shape
  if (!newAdvisor.assessor) newAdvisor.assessor = { name: '', avatar: '', email: '' }
  if (!newAdvisor.gastos) newAdvisor.gastos = { value: 0, limite: 0, data: [] }
  globalRowsAssessores.push(newAdvisor)
  return newAdvisor
}

export default function useAdvisors() {
  const storeAdvisor = useAdvisorStore()
  const { advisorEdit } = storeToRefs(storeAdvisor)

  // reuse module-level columnsAssessores

  // If configured to use API, delegate operations to API composable
  if (!useFakes) {
    const api = apiAdapterLoaded || useAdvisorsApi()
    // use shared reactive array so all composable instances observe updates
    const rowsAssessores = sharedApiRowsAssessores
    const getAdvisor = (id) => rowsAssessores.find((a) => a.id === id) || null
    const getAdvisorsIdNameEmail = () =>
      rowsAssessores.map((advisor) => ({
        id: advisor.id,
        name: advisor.name,
        email: advisor.email,
        avatar: advisor.avatar,
      }))

    // load initial data (synchronous callers expect immediate array; we fill later)
    ;(async () => {
      try {
        const list = await api.list()
        // replace contents of shared array
        rowsAssessores.splice(0, rowsAssessores.length, ...list)
      } catch (e) {
        console.error('Failed to load advisors from API', e && e.message)
      }
    })()

    const addAdvisor = async (payload) => {
      // if payload contains id, try update path (if API supports it)
      if (payload && payload.id) {
        if (typeof api.update === 'function') {
          const updated = await api.update(payload.id, payload)
          // replace existing in shared array
          const idx = rowsAssessores.findIndex((r) => r.id === updated.id)
          if (idx !== -1) rowsAssessores.splice(idx, 1, updated)
          else rowsAssessores.push(updated)
          return updated
        }
        // fallback: call create if no update available
      }
      const created = await api.create(payload)
      rowsAssessores.push(created)
      return created
    }

    const removeAdvisor = async (id) => {
      try {
        debugLog(
          'useAdvisors.removeAdvisor',
          'called id=',
          id,
          'rows snapshot=',
          JSON.parse(JSON.stringify(rowsAssessores)),
        )
        await api.remove(id)
        const idx = rowsAssessores.findIndex((r) => r.id === id)
        debugLog('useAdvisors.removeAdvisor', 'after api.remove, found idx=', idx)
        if (idx !== -1) rowsAssessores.splice(idx, 1)
        return true
      } catch (e) {
        console.error('Failed to remove advisor', e && e.message)
        throw e
      }
    }

    return {
      getAdvisor,
      columnsAssessores,
      rowsAssessores,
      getAdvisorsIdNameEmail,
      addAdvisor,
      removeAdvisor,
    }
  }

  const rowsAssessores = reactive(globalRowsAssessores)
  const getAdvisor = (id) => {
    const advisor = rowsAssessores.find((advisor) => advisor.id === id)
    if (advisor) {
      return {
        ...advisor,
      }
    }
    return null
  }
  const getAdvisorsIdNameEmail = () => {
    let rowAdvisors = rowsAssessores.filter((advisor) => advisor.id !== advisorEdit.value.id)

    const listMap = rowAdvisors.map((advisor) => ({
      id: advisor.id,
      name: advisor.assessor.name,
      email: advisor.assessor.email,
      avatar: advisor.assessor.avatar,
    }))

    return listMap
  }
  return {
    getAdvisor,
    columnsAssessores,
    rowsAssessores,
    getAdvisorsIdNameEmail,
    addAdvisor,
    removeAdvisor: (id) => {
      const idx = rowsAssessores.findIndex((a) => a.id === id)
      if (idx !== -1) rowsAssessores.splice(idx, 1)
      return true
    },
  }
}
