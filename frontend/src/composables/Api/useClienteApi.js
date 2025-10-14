import { reactive } from 'vue'
import { api } from 'src/boot/axios'
import { debugLog } from 'src/utils/debugLog'

export default function useClienteApi() {
  // Keep same columns as fake implementation so UI doesn't need changes
  const columnsClient = [
    {
      name: 'cliente',
      required: true,
      label: 'Cliente',
      align: 'left',
      field: 'cliente',
      sortable: true,
    },
    {
      name: 'assessor',
      align: 'right',
      label: 'Assessor',
      field: 'assessor',
      sortable: true,
      headerStyle: 'text-align: end',
    },
    {
      name: 'saldo',
      align: 'right',
      label: 'Saldo Para Investir(R$)',
      field: 'saldo',
      sortable: true,
      headerStyle: 'text-align: end',
    },
    {
      name: 'contrato',
      align: 'right',
      label: 'Contratro (R$)',
      field: 'contrato',
      headerStyle: 'text-align: end',
    },
    {
      name: 'dividendo',
      align: 'right',
      label: 'Dividendo (R$)',
      field: 'dividendo',
      headerStyle: 'text-align: end',
    },
    { name: 'emprestimo', align: 'left', label: 'Empréstimo', field: 'emprestimo' },
    {
      name: 'actions',
      label: '',
      field: 'actions',
      headerStyle: 'width: 10px; text-align: end',
    },
  ]

  // reactive array so existing code that uses array methods keeps working
  const rowsClient = reactive([])

  async function refresh() {
    try {
      const res = await api.get('/clients')
      const list = Array.isArray(res.data) ? res.data : []
      // replace contents of reactive array
      rowsClient.splice(0, rowsClient.length, ...list)
      return rowsClient
    } catch (err) {
      console.error('useClienteApi.refresh error', err && err.message)
      return rowsClient
    }
  }

  function getClient(id) {
    const n = Number(id)
    return rowsClient.find((c) => c.id === n) || null
  }

  function getClientIdName(arrayRemove = [], clientEdit = { id: null }) {
    let clientes = null
    if (arrayRemove && arrayRemove.length > 0) {
      const lstCompare = arrayRemove.map((client) => client.id)
      clientes = rowsClient.filter((client) => !lstCompare.includes(client.id))
    } else {
      clientes = rowsClient.filter((client) => client.id !== (clientEdit && clientEdit.id))
    }
    return clientes.map((client) => ({
      id: client.id,
      name: client.cliente && client.cliente.name,
      avatar: client.cliente && client.cliente.avatar,
    }))
  }

  function getClientOptions() {
    return rowsClient.map((client) => ({
      label: client.cliente && client.cliente.name,
      value: client.id,
      avatar: client.cliente && client.cliente.avatar,
    }))
  }

  async function createClient(data) {
    const payload = data
    debugLog('useClienteApi', 'createClient payload', payload)
    const res = await api.post('/clients', payload)
    // refresh list and return created
    await refresh()
    return res.data
  }

  async function updateClient(id, data) {
    debugLog('useClienteApi', 'updateClient id=', id, 'data=', data)
    const res = await api.put(`/clients/${id}`, data)
    await refresh()
    return res.data
  }

  async function deleteClient(id) {
    debugLog('useClienteApi', 'deleteClient id=', id)
    await api.delete(`/clients/${id}`)
    await refresh()
    return true
  }

  // initial load (don't await here to keep composable sync)
  refresh()

  return {
    columnsClient,
    rowsClient,
    getClient,
    getClientIdName,
    getClientOptions,
    refresh,
    createClient,
    updateClient,
    deleteClient,
  }
}
