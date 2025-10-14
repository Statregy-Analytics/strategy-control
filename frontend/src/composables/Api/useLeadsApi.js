import { ref } from 'vue'

export default function useLeadsApi(baseUrl = null) {
  const rows = ref([])
  const loading = ref(false)
  // Define columns to match the fake adapter shape expected by components
  const columnLeads = [
    {
      name: 'cliente',
      required: true,
      label: 'Lead',
      align: 'left',
      field: 'cliente',
      sortable: true,
    },
    { name: 'cpf', required: true, label: 'CPF', align: 'left', field: 'cpf', sortable: true },
    {
      name: 'phone',
      required: true,
      label: 'Telefone',
      align: 'left',
      field: 'phone',
      sortable: true,
    },
    {
      name: 'profission',
      required: true,
      label: 'Profissão',
      align: 'left',
      field: 'profission',
      sortable: true,
    },
    {
      name: 'situacao_rf',
      required: true,
      label: 'Situação na RF',
      align: 'left',
      field: 'situacao_rf',
      sortable: true,
    },
    {
      name: 'estagio_lead',
      required: true,
      label: 'Estágio do Lead',
      align: 'left',
      field: 'estagio_lead',
      sortable: true,
    },
    { name: 'actions', label: '', field: 'actions', headerStyle: 'width: 10px; text-align: end' },
  ]

  const apiBase =
    baseUrl ||
    (import.meta && import.meta.env && import.meta.env.VITE_API_BASE_URL) ||
    'http://localhost:3333'

  async function fetchLeads(opts = {}) {
    loading.value = true
    try {
      const qs = new URLSearchParams()
      if (opts.q) qs.set('q', String(opts.q))

      const url = qs.toString() ? `${apiBase}/api/leads?${qs.toString()}` : `${apiBase}/api/leads`
      const res = await fetch(url)
      if (!res.ok) throw new Error('Failed to fetch leads')
      const json = await res.json()
      // backend now returns an array; keep compatibility with { rows } shape
      rows.value = Array.isArray(json) ? json : json.rows || []
      return { rows: rows.value }
    } finally {
      loading.value = false
    }
  }

  // Helper to get a single lead from current rows (compat with fakes API)
  function getClientLead(id) {
    if (!rows.value || !rows.value.length) return null
    return (
      rows.value.find(
        (r) => r.id === id || (r.lead && r.id === id) || (r.lead && r.lead.id === id),
      ) || null
    )
  }

  function getLeadOptions() {
    // Return a simple array of { label, value } for selects
    return (rows.value || []).map((r) => {
      const lead = r.lead || r
      return { label: lead.name || lead.cliente?.name || 'Unknown', value: r.id || lead.id }
    })
  }

  return { rows, loading, fetchLeads, columnLeads, getClientLead, getLeadOptions }
}
