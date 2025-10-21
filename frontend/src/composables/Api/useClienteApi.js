import { reactive } from 'vue'
import { api } from 'src/boot/axios'
import { debugLog } from 'src/utils/debugLog'

// keep a module-level flag so we don't keep trying multipart when backend doesn't support it
// Set to false to force JSON-only uploads (workaround for dev proxy issues that strip multipart)
let multipartSupported = false

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
    // Ensure any selected File objects or file-like items are converted to dataURLs
    await ensureDataUrls(payload)
    // if avatar is a dataURL, send multipart/form-data with payload JSON and avatar file
    let res
    const avatar = payload && payload.cliente && payload.cliente.avatar
    if (multipartSupported && avatar && typeof avatar === 'string' && avatar.startsWith('data:')) {
      const fd = new FormData()
      // include full payload as 'payload'
      fd.append('payload', JSON.stringify(payload))
      // convert dataURL to Blob/File
      const blob = (function (dataurl) {
        const arr = dataurl.split(',')
        const mime = arr[0].match(/:(.*?);/)[1]
        const bstr = atob(arr[1])
        let n = bstr.length
        const u8arr = new Uint8Array(n)
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n)
        }
        return new Blob([u8arr], { type: mime })
      })(avatar)
      // guess extension
      const ext = (avatar.match(/data:image\/(.*?);/) || [])[1] || 'png'
      const filename = `avatar.${ext}`
      fd.append('avatar', blob, filename)
      // DEBUG: inspect FormData entries before sending to help diagnose missing payload/file
      {
        const entries = []
        for (const pair of fd.entries()) {
          const [k, v] = pair
          if (v instanceof Blob) {
            entries.push({ key: k, type: v.type, size: v.size, name: v.name || filename })
          } else {
            const s = String(v)
            entries.push({
              key: k,
              valuePreview: s.length > 200 ? s.slice(0, 200) + '...(' + s.length + ' chars)' : s,
            })
          }
        }
        debugLog('useClienteApi', 'multipart FormData entries', entries)
        if (typeof console !== 'undefined' && typeof console.debug === 'function') {
          console.debug('[useClienteApi] multipart FormData entries', entries)
        }
      }
      try {
        res = await api.post('/clients', fd)
      } catch (err) {
        // If backend doesn't accept multipart/form-data (400), fallback to JSON with dataURL
        if (err && err.response && err.response.status === 400) {
          multipartSupported = false
          debugLog('useClienteApi', 'multipart failed, retrying as JSON payload')
          res = await api.post('/clients', payload)
        } else {
          throw err
        }
      }
    } else {
      res = await api.post('/clients', payload)
    }
    // refresh list and return created
    await refresh()
    return res.data
  }

  async function updateClient(id, data) {
    debugLog('useClienteApi', 'updateClient id=', id, 'data=', data)
    // Ensure any selected File objects or file-like items are converted to dataURLs
    await ensureDataUrls(data)
    // handle avatar dataURL similar to create
    let res
    const avatar = data && data.cliente && data.cliente.avatar
    if (multipartSupported && avatar && typeof avatar === 'string' && avatar.startsWith('data:')) {
      const fd = new FormData()
      fd.append('payload', JSON.stringify(data))
      const blob = (function (dataurl) {
        const arr = dataurl.split(',')
        const mime = arr[0].match(/:(.*?);/)[1]
        const bstr = atob(arr[1])
        let n = bstr.length
        const u8arr = new Uint8Array(n)
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n)
        }
        return new Blob([u8arr], { type: mime })
      })(avatar)
      const ext = (avatar.match(/data:image\/(.*?);/) || [])[1] || 'png'
      const filename = `avatar.${ext}`
      fd.append('avatar', blob, filename)
      try {
        res = await api.put(`/clients/${id}`, fd)
      } catch (err) {
        if (err && err.response && err.response.status === 400) {
          multipartSupported = false
          debugLog('useClienteApi', 'multipart PUT failed, retrying as JSON payload')
          res = await api.put(`/clients/${id}`, data)
        } else {
          throw err
        }
      }
    } else {
      res = await api.put(`/clients/${id}`, data)
    }
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

  // Helper: converts File/Blob or file-like objects in payload.cliente to dataURLs
  async function ensureDataUrls(payload) {
    if (!payload || typeof payload !== 'object') return
    const cliente = payload.cliente || payload
    if (!cliente || typeof cliente !== 'object') return

    const readFileAsDataUrl = (file) =>
      new Promise((resolve, reject) => {
        try {
          // If it's already a dataURL string, return
          if (typeof file === 'string' && file.startsWith('data:')) return resolve(file)
          // If it's a URL already (server-side), return as-is
          if (typeof file === 'string' && file.startsWith('/storage')) return resolve(file)
          // If it's an object with dataUrl property, use it
          if (file && typeof file === 'object' && file.dataUrl) return resolve(file.dataUrl)
          // If it's an object with file property (from component), extract
          const blob = file && (file.file || file)
          if (!blob) return resolve(null)
          const reader = new FileReader()
          reader.onload = (e) => resolve(e.target.result)
          reader.onerror = (e) => reject(e)
          reader.readAsDataURL(blob)
        } catch (err) {
          reject(err)
        }
      })

    const docFields = [
      'avatar',
      'comprovante_endereco',
      'certidao_casamento',
      'certidao_nascimento',
    ]

    for (const f of docFields) {
      const val = cliente[f]
      if (!val) continue
      try {
        if (Array.isArray(val)) {
          const out = []
          for (const v of val) {
            // strings: dataURL or existing url
            if (typeof v === 'string') {
              out.push(v)
              continue
            }
            const dataUrl = await readFileAsDataUrl(v)
            if (dataUrl) out.push(dataUrl)
          }
          if (out.length === 1) cliente[f] = out[0]
          else if (out.length > 1) cliente[f] = out
          else delete cliente[f]
        } else if (typeof val === 'string') {
          // already a string (dataURL or url) - leave as is
          continue
        } else if (typeof val === 'object') {
          // single object with file or dataUrl
          const dataUrl = await readFileAsDataUrl(val)
          if (dataUrl) cliente[f] = dataUrl
          else delete cliente[f]
        }
      } catch (err) {
        if (typeof console !== 'undefined' && console.debug)
          console.debug('ensureDataUrls error for', f, err)
      }
    }
  }

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
