import { useLayoutStore } from 'src/stores/layout'
import { storeToRefs } from 'pinia'
import { debugLog } from 'src/utils/debugLog'

// If VITE_USE_FAKES is 'false' we will delegate to the API composable
let useApi = false
try {
  // Vite exposes env vars prefixed with VITE_ to import.meta.env
  useApi = import.meta && import.meta.env && import.meta.env.VITE_USE_FAKES === 'false'
} catch {
  useApi = false
}

// If configured to use API, try to import the API composable now (top-level await)
// so consumers calling the composable synchronously receive the real adapter.
let apiAdapterLoaded = null
if (useApi) {
  try {
    const mod = await import('src/composables/Api/useClienteApi')
    apiAdapterLoaded = mod.default()
  } catch (e) {
    console.error('useCliente: failed to import api adapter at module load', e && e.message)
    apiAdapterLoaded = null
  }
}
// Debug: expose a console log so Playwright can detect which adapter was chosen
debugLog('useCliente', 'adapter=', useApi ? 'api' : 'fake', 'apiAdapterLoaded=', !!apiAdapterLoaded)

export default function useCliente() {
  const storeLayout = useLayoutStore()
  const { clientEdit } = storeToRefs(storeLayout)
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

  // default fake rows (kept for offline / fallback)
  const rowsClient = [
    {
      id: 1,
      newWeLend: {},
      level: 'A',
      weLend: [
        {
          status: 'Ativo',
          valor: 10000,
          data_loan: '01/01/2025',
          value_dividendo: 250.0,
          value_now_dividendo: 250.0,
          value_finish: 10000,
          value_before: 10000,
          number_parcelas: 12,
          date_payment: '01/02/2025',
          contrato: 'Contrato 1',
          vigencia: '31/12/2030',
          saldo: 5000,
        },
      ],
      investment: {
        classification: 'A',
        saldo: 150000,
        assessor: 1,
        data_dividendo: '21/02/2025',
        valor_dividendo: 250.0,
      },
      bank: {},
      residential: {},
      bankRegister: [
        {
          chave_pix: '123456789',
          cpf_cnpj: '123.456.789-00',
          name: 'Banco Exemplo',
          agency: '1234',
          account: '56789-0',
          type: 'Conta Corrente',
          status: 'Ativo',
        },
      ],
      cliente: {
        cpf_cnpj: '123.456.789-00',
        renda: 5000,
        profissao: 'Engenheiro',
        birth: '01/01/1990',
        name: 'Carlos Silva Nunes',
        avatar: 'https://sources.strategyanalytics.com.br/storage/users/_Avatar_.png',
        email: 'carlos@gstrategyanalytics.com.br',
      },
      assessor: 'Joe Doe',
      saldo: 210000,
      contrato: {
        total: 30000.0,
        quantity: '2 contratos',
      },
      dividendo: {
        total: 250.0,
        data: '31/01/2030',
      },
      emprestimo: 'Status',
    },
    {
      id: 2,
      newWeLend: {},
      level: 'A',
      weLend: [
        {
          status: 'Ativo',
          valor: 10000,
          data_loan: '01/01/2025',
          value_dividendo: 250.0,
          value_now_dividendo: 250.0,
          value_finish: 10000,
          value_before: 10000,
          number_parcelas: 12,
          date_payment: '01/02/2025',
          contrato: 'Contrato 1',
          vigencia: '31/12/2030',
          saldo: 5000,
        },
      ],
      investment: {
        classification: 'A',
        saldo: 150000,
        assessor: 1,
        data_dividendo: '21/02/2025',
        valor_dividendo: 250.0,
      },
      bank: {},
      residential: {},
      bankRegister: [
        {
          chave_pix: '123456789',
          cpf_cnpj: '123.456.789-00',
          name: 'Banco Exemplo',
          agency: '1234',
          account: '56789-0',
          type: 'Conta Corrente',
          status: 'Ativo',
        },
      ],
      cliente: {
        cpf_cnpj: '123.456.789-00',
        renda: 5000,
        profissao: 'Engenheiro',
        birth: '01/01/1990',
        name: 'Ana Oliveira',
        avatar: 'https://sources.strategyanalytics.com.br/storage/users/_Avatar_.png',
        email: 'ana@gstrategyanalytics.com.br',
      },
      assessor: 'Joe Doe',
      saldo: 210000,
      contrato: {
        total: 30000.0,
        quantity: '2 contratos',
      },
      dividendo: {
        total: 250.0,
        data: '31/01/2030',
      },
      emprestimo: 'Status',
    },
    {
      id: 3,
      newWeLend: {},
      level: 'A',
      weLend: [
        {
          status: 'Ativo',
          valor: 10000,
          data_loan: '01/01/2025',
          value_dividendo: 250.0,
          value_now_dividendo: 250.0,
          value_finish: 10000,
          value_before: 10000,
          number_parcelas: 12,
          date_payment: '01/02/2025',
          contrato: 'Contrato 1',
          vigencia: '31/12/2030',
          saldo: 5000,
        },
      ],
      investment: {
        classification: 'A',
        saldo: 150000,
        assessor: 1,
        data_dividendo: '21/02/2025',
        valor_dividendo: 250.0,
      },
      bank: {},
      residential: {},
      bankRegister: [
        {
          chave_pix: '123456789',
          cpf_cnpj: '123.456.789-00',
          name: 'Banco Exemplo',
          agency: '1234',
          account: '56789-0',
          type: 'Conta Corrente',
          status: 'Ativo',
        },
      ],
      cliente: {
        cpf_cnpj: '123.456.789-00',
        renda: 5000,
        profissao: 'Engenheiro',
        birth: '01/01/1990',
        name: 'Pedro Santos',
        avatar: 'https://sources.strategyanalytics.com.br/storage/users/_Avatar_.png',
        email: 'pedro@gstrategyanalytics.com.br',
      },
      assessor: 'Joe Doe',
      saldo: 210000,
      contrato: {
        total: 30000.0,
        quantity: '2 contratos',
      },
      dividendo: {
        total: 250.0,
        data: '31/01/2030',
      },
      emprestimo: 'Status',
    },
    {
      id: 4,
      newWeLend: {},
      level: 'A',
      weLend: [
        {
          status: 'Ativo',
          valor: 10000,
          data_loan: '01/01/2025',
          value_dividendo: 250.0,
          value_now_dividendo: 250.0,
          value_finish: 10000,
          value_before: 10000,
          number_parcelas: 12,
          date_payment: '01/02/2025',
          contrato: 'Contrato 1',
          vigencia: '31/12/2030',
          saldo: 5000,
        },
      ],
      investment: {
        classification: 'A',
        saldo: 150000,
        assessor: 1,
        data_dividendo: '21/02/2025',
        valor_dividendo: 250.0,
      },
      bank: {},
      residential: {},
      bankRegister: [
        {
          chave_pix: '123456789',
          cpf_cnpj: '123.456.789-00',
          name: 'Banco Exemplo',
          agency: '1234',
          account: '56789-0',
          type: 'Conta Corrente',
          status: 'Ativo',
        },
      ],
      cliente: {
        cpf_cnpj: '123.456.789-00',
        renda: 5000,
        profissao: 'Engenheiro',
        birth: '01/01/1990',
        name: 'Mariana Costa',
        avatar: 'https://sources.strategyanalytics.com.br/storage/users/_Avatar_.png',
        email: 'mariana@gstrategyanalytics.com.br',
      },
      assessor: 'Joe Doe',
      saldo: 210000,
      contrato: {
        total: 30000.0,
        quantity: '2 contratos',
      },
      dividendo: {
        total: 250.0,
        data: '31/01/2030',
      },
      emprestimo: 'Status',
    },
    {
      id: 5,
      newWeLend: {},
      level: 'A',
      weLend: [
        {
          status: 'Ativo',
          valor: 10000,
          data_loan: '01/01/2025',
          value_dividendo: 250.0,
          value_now_dividendo: 250.0,
          value_finish: 10000,
          value_before: 10000,
          number_parcelas: 12,
          date_payment: '01/02/2025',
          contrato: 'Contrato 1',
          vigencia: '31/12/2030',
          saldo: 5000,
        },
      ],
      investment: {
        classification: 'A',
        saldo: 150000,
        assessor: 1,
        data_dividendo: '21/02/2025',
        valor_dividendo: 250.0,
      },
      bank: {},
      residential: {},
      bankRegister: [
        {
          chave_pix: '123456789',
          cpf_cnpj: '123.456.789-00',
          name: 'Banco Exemplo',
          agency: '1234',
          account: '56789-0',
          type: 'Conta Corrente',
          status: 'Ativo',
        },
      ],
      cliente: {
        cpf_cnpj: '123.456.789-00',
        renda: 5000,
        profissao: 'Engenheiro',
        birth: '01/01/1990',
        name: 'João Pereira',
        avatar: 'https://sources.strategyanalytics.com.br/storage/users/joao_default.png',
        email: 'joao@gstrategyanalytics.com.br',
      },
      assessor: 'Joe Doe',
      saldo: 210000,
      contrato: {
        total: 30000.0,
        quantity: '2 contratos',
      },
      dividendo: {
        total: 250.0,
        data: '31/01/2030',
      },
      emprestimo: 'Status',
    },
    {
      id: 6,
      newWeLend: {},
      level: 'A',
      weLend: [
        {
          status: 'Ativo',
          valor: 10000,
          data_loan: '01/01/2025',
          value_dividendo: 250.0,
          value_now_dividendo: 250.0,
          value_finish: 10000,
          value_before: 10000,
          number_parcelas: 12,
          date_payment: '01/02/2025',
          contrato: 'Contrato 1',
          vigencia: '31/12/2030',
          saldo: 5000,
        },
      ],
      investment: {
        classification: 'A',
        saldo: 150000,
        assessor: 1,
        data_dividendo: '21/02/2025',
        valor_dividendo: 250.0,
      },
      bank: {},
      residential: {},
      bankRegister: [
        {
          chave_pix: '123456789',
          cpf_cnpj: '123.456.789-00',
          name: 'Banco Exemplo',
          agency: '1234',
          account: '56789-0',
          type: 'Conta Corrente',
          status: 'Ativo',
        },
      ],
      cliente: {
        cpf_cnpj: '123.456.789-00',
        renda: 5000,
        profissao: 'Engenheiro',
        birth: '01/01/1990',
        name: 'Luiza Almeida',
        avatar: 'https://sources.strategyanalytics.com.br/storage/users/_Avatar_.png',
        email: 'luiza@gstrategyanalytics.com.br',
      },
      assessor: 'Joe Doe',
      saldo: 210000,
      contrato: {
        total: 30000.0,
        quantity: '2 contratos',
      },
      dividendo: {
        total: 250.0,
        data: '31/01/2030',
      },
      emprestimo: 'Status',
    },
    {
      id: 7,
      newWeLend: {},
      level: 'A',
      weLend: [
        {
          status: 'Ativo',
          valor: 10000,
          data_loan: '01/01/2025',
          value_dividendo: 250.0,
          value_now_dividendo: 250.0,
          value_finish: 10000,
          value_before: 10000,
          number_parcelas: 12,
          date_payment: '01/02/2025',
          contrato: 'Contrato 1',
          vigencia: '31/12/2030',
          saldo: 5000,
        },
      ],
      investment: {
        classification: 'A',
        saldo: 150000,
        assessor: 1,
        data_dividendo: '21/02/2025',
        valor_dividendo: 250.0,
      },
      bank: {},
      residential: {},
      bankRegister: [
        {
          chave_pix: '123456789',
          cpf_cnpj: '123.456.789-00',
          name: 'Banco Exemplo',
          agency: '1234',
          account: '56789-0',
          type: 'Conta Corrente',
          status: 'Ativo',
        },
      ],
      cliente: {
        cpf_cnpj: '123.456.789-00',
        renda: 5000,
        profissao: 'Engenheiro',
        birth: '01/01/1990',
        name: 'Carlos Silva',
        avatar: 'https://sources.strategyanalytics.com.br/storage/users/_Avatar_.png',
        email: 'carlos@gstrategyanalytics.com.br',
      },
      assessor: 'Joe Doe',
      saldo: 210000,
      contrato: {
        total: 30000.0,
        quantity: '2 contratos',
      },
      dividendo: {
        total: 250.0,
        data: '31/01/2030',
      },
      emprestimo: 'Status',
    },
    {
      id: 8,
      newWeLend: {},
      level: 'A',
      weLend: [
        {
          status: 'Ativo',
          valor: 10000,
          data_loan: '01/01/2025',
          value_dividendo: 250.0,
          value_now_dividendo: 250.0,
          value_finish: 10000,
          value_before: 10000,
          number_parcelas: 12,
          date_payment: '01/02/2025',
          contrato: 'Contrato 1',
          vigencia: '31/12/2030',
          saldo: 5000,
        },
      ],
      investment: {
        classification: 'A',
        saldo: 150000,
        assessor: 1,
        data_dividendo: '21/02/2025',
        valor_dividendo: 250.0,
      },
      bank: {},
      residential: {},
      bankRegister: [
        {
          chave_pix: '123456789',
          cpf_cnpj: '123.456.789-00',
          name: 'Banco Exemplo',
          agency: '1234',
          account: '56789-0',
          type: 'Conta Corrente',
          status: 'Ativo',
        },
      ],
      cliente: {
        cpf_cnpj: '123.456.789-00',
        renda: 5000,
        profissao: 'Engenheiro',
        birth: '01/01/1990',
        name: 'Ana Oliveira',
        avatar: 'https://sources.strategyanalytics.com.br/storage/users/_Avatar_.png',
        email: 'ana@gstrategyanalytics.com.br',
      },
      assessor: 'Joe Doe',
      saldo: 210000,
      contrato: {
        total: 30000.0,
        quantity: '2 contratos',
      },
      dividendo: {
        total: 250.0,
        data: '31/01/2030',
      },
      emprestimo: 'Status',
    },
    {
      id: 9,
      newWeLend: {},
      level: 'A',
      weLend: [
        {
          status: 'Ativo',
          valor: 10000,
          data_loan: '01/01/2025',
          value_dividendo: 250.0,
          value_now_dividendo: 250.0,
          value_finish: 10000,
          value_before: 10000,
          number_parcelas: 12,
          date_payment: '01/02/2025',
          contrato: 'Contrato 1',
          vigencia: '31/12/2030',
          saldo: 5000,
        },
      ],
      investment: {
        classification: 'A',
        saldo: 150000,
        assessor: 1,
        data_dividendo: '21/02/2025',
        valor_dividendo: 250.0,
      },
      bank: {},
      residential: {},
      bankRegister: [
        {
          chave_pix: '123456789',
          cpf_cnpj: '123.456.789-00',
          name: 'Banco Exemplo',
          agency: '1234',
          account: '56789-0',
          type: 'Conta Corrente',
          status: 'Ativo',
        },
      ],
      cliente: {
        cpf_cnpj: '123.456.789-00',
        renda: 5000,
        profissao: 'Engenheiro',
        birth: '01/01/1990',
        name: 'Pedro Santos',
        avatar: 'https://sources.strategyanalytics.com.br/storage/users/_Avatar_.png',
        email: 'pedro@gstrategyanalytics.com.br',
      },
      assessor: 'Joe Doe',
      saldo: 210000,
      contrato: {
        total: 30000.0,
        quantity: '2 contratos',
      },
      dividendo: {
        total: 250.0,
        data: '31/01/2030',
      },
      emprestimo: 'Status',
    },
    {
      id: 10,
      newWeLend: {},
      level: 'A',
      weLend: [
        {
          status: 'Ativo',
          valor: 10000,
          data_loan: '01/01/2025',
          value_dividendo: 250.0,
          value_now_dividendo: 250.0,
          value_finish: 10000,
          value_before: 10000,
          number_parcelas: 12,
          date_payment: '01/02/2025',
          contrato: 'Contrato 1',
          vigencia: '31/12/2030',
          saldo: 5000,
        },
      ],
      investment: {
        classification: 'A',
        saldo: 150000,
        assessor: 1,
        data_dividendo: '21/02/2025',
        valor_dividendo: 250.0,
      },
      bank: {},
      residential: {},
      bankRegister: [
        {
          chave_pix: '123456789',
          cpf_cnpj: '123.456.789-00',
          name: 'Banco Exemplo',
          agency: '1234',
          account: '56789-0',
          type: 'Conta Corrente',
          status: 'Ativo',
        },
      ],
      cliente: {
        cpf_cnpj: '123.456.789-00',
        renda: 5000,
        profissao: 'Engenheiro',
        birth: '01/01/1990',
        name: 'Mariana Costa',
        avatar: 'https://sources.strategyanalytics.com.br/storage/users/_Avatar_.png',
        email: 'mariana@gstrategyanalytics.com.br',
      },
      assessor: 'Joe Doe',
      saldo: 210000,
      contrato: {
        total: 30000.0,
        quantity: '2 contratos',
      },
      dividendo: {
        total: 250.0,
        data: '31/01/2030',
      },
      emprestimo: 'Status',
    },
  ]

  // If we were able to load the API adapter at module evaluation time, return it immediately
  if (apiAdapterLoaded) {
    const apiAdapter = apiAdapterLoaded
    return {
      columnsClient: apiAdapter.columnsClient,
      rowsClient: apiAdapter.rowsClient,
      getClient: apiAdapter.getClient,
      getClientIdName: (arrayRemove = []) =>
        apiAdapter.getClientIdName(arrayRemove, clientEdit.value),
      getClientOptions: apiAdapter.getClientOptions,
      refresh: apiAdapter.refresh,
      createClient: apiAdapter.createClient,
      updateClient: apiAdapter.updateClient,
      deleteClient: apiAdapter.deleteClient,
    }
  }

  const getClient = (id) => {
    const client = rowsClient.find((client) => client.id === id)
    if (client) {
      return {
        ...client,
      }
    }
    return null
  }

  const getClientIdName = (arrayRemove = []) => {
    let clientes = null

    if (arrayRemove.length > 0) {
      const lstCompare = arrayRemove.map((client) => client.id)
      clientes = rowsClient.filter((client) => !lstCompare.includes(client.id)) // Exclude clients based on the provided array
    } else {
      clientes = rowsClient.filter((client) => client.id !== clientEdit.value.id) // Exclude the current client being edited
    }

    const listClient = clientes.map((client) => ({
      id: client.id,
      name: client.cliente.name,
      avatar: client.cliente.avatar,
    }))
    return listClient
  }
  const getClientOptions = () => {
    return rowsClient.map((client) => ({
      label: client.cliente.name,
      value: client.id,
      avatar: client.cliente.avatar,
    }))
  }

  // CRUD helpers for fake dataset so UI can use same API
  const createClient = (data) => {
    const nextId = rowsClient.reduce((max, r) => Math.max(max, r.id || 0), 0) + 1
    const item = { id: nextId, ...(data.cliente ? data : { cliente: data }) }
    rowsClient.push(item)
    return item
  }

  const updateClient = (id, data) => {
    const idx = rowsClient.findIndex((r) => r.id === id)
    if (idx === -1) return null
    rowsClient[idx] = { ...rowsClient[idx], ...(data.cliente ? data : { cliente: data }) }
    return rowsClient[idx]
  }

  const deleteClient = (id) => {
    const idx = rowsClient.findIndex((r) => r.id === id)
    if (idx === -1) return false
    rowsClient.splice(idx, 1)
    return true
  }

  return {
    columnsClient,
    rowsClient,
    getClient,
    getClientIdName,
    getClientOptions,
    createClient,
    updateClient,
    deleteClient,
  }
}
