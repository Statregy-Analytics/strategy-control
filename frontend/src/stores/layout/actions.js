import { normalizeClientForDisplay, titleCase } from 'src/utils/normalize'

const actions = {
  setPainel(payload) {
    this.painel = payload
  },
  setDialogTransactionDeposit(payload) {
    this.dialogTransictionDeposit = payload
  },
  setDialogConfirmAction(payload) {
    this.dialogConfirmAction = payload
  },
  setDialogConfirmHeader(payload) {
    this.dialogConfirmHeader = payload
  },
  setDialogConfirmBody(payload) {
    this.dialogConfirmBody = payload
  },
  setDialogactionHeaderBody(action = false, header, body, button = null) {
    this.dialogConfirmAction = action
    this.dialogConfirmHeader = header
    this.dialogConfirmBody = body
    this.dialogLabelButton = button
  },
  setDataSolicitacao(payload) {
    console.log('setDataSolicitacao', payload)
    this.dataSolicitacao = payload
  },
  setDialogOpengHeader(payload) {
    this.dialogOpengHeader = payload
  },
  setParamentroLogic(payload) {
    this.paramentroLogic = payload
  },
  setProjection(payload) {
    this.projection = payload
  },
  setProjectionStatus(payload) {
    this.projectionStatus = payload
  },
  setClientDialog(payload) {
    this.clientDialog = payload
  },
  setClientEdit(payload) {
    // Normalize payload so frontend forms that expect cliente.cpf get a value
    try {
      console.log('setClientEdit: incoming payload', payload)
      const copy = JSON.parse(JSON.stringify(payload || {}))
      if (copy && copy.cliente) {
        // if backend/adapter uses cpf_cnpj but form bindings expect cpf, map it
        const src = copy.cliente.cpf_cnpj || copy.cpf_cnpj || null
        if (src && !copy.cliente.cpf) {
          // keep digits-only value when possible
          const digits = String(src).replace(/\D/g, '')
          // prefer formatted CPF (###.###.###-##) when 11 digits
          if (digits.length === 11) {
            copy.cliente.cpf = `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`
          } else {
            // fallback to raw value
            copy.cliente.cpf = src
          }
        }
      }
      // If residential data is nested under cliente (cliente.residential), copy it to top-level
      try {
        if (
          copy.cliente &&
          copy.cliente.residential &&
          (!copy.residential || Object.keys(copy.residential).length === 0)
        ) {
          // shallow clone to avoid mutating original nested object reference
          copy.residential = JSON.parse(JSON.stringify(copy.cliente.residential || {}))
        }
      } catch {
        console.debug('copy cliente.residential failed')
      }
      // Map alternative keys from backend (street/number/neighborhood/city/state) to our expected keys
      try {
        const r = copy.residential || {}
        if (r) {
          if (r.street && !r.address) r.address = r.street
          if ((r.number || r.num) && !r.address_number) r.address_number = r.number || r.num
          if (r.complement && r.complement !== '' && !r.property) r.property = r.complement
          if (r.neighborhood && !r.address_neighborhood) r.address_neighborhood = r.neighborhood
          if (r.city && !r.address_city) r.address_city = r.city
          if (r.state && !r.address_state) r.address_state = r.state
          if ((r.registration || r.register) && !r.register)
            r.register = r.registration || r.register
        }
      } catch {
        console.debug('residential key mapping failed')
      }
      // Debug: show exactly what residential contains after mapping
      try {
        console.log(
          'setClientEdit: residential after mapping',
          JSON.parse(JSON.stringify(copy.residential || {})),
        )
      } catch {
        console.log('setClientEdit: residential after mapping', copy.residential)
      }
      // Ensure residential object exists with expected fields so DataResidentialLayout v-models work
      try {
        const residentialDefaults = {
          register: '',
          property: '',
          number_redisential: '',
          real_state_registration: '',
          address: '',
          address_number: '',
          address_neighborhood: '',
          address_city: '',
          address_state: '',
          dividendo: null,
        }
        if (!copy.residential || typeof copy.residential !== 'object') {
          copy.residential = { ...residentialDefaults }
        } else {
          // fill missing keys with defaults
          for (const k of Object.keys(residentialDefaults)) {
            if (copy.residential[k] === undefined || copy.residential[k] === null) {
              copy.residential[k] = residentialDefaults[k]
            }
          }
        }
      } catch {
        // ignore residential normalization errors
        console.debug('residential normalize failed')
      }
      console.log('setClientEdit: normalized copy', copy)
      // Normalize textual fields for display (title case, UF uppercase)
      try {
        if (copy && copy.cliente) normalizeClientForDisplay(copy.cliente)
        if (copy && copy.residential && typeof copy.residential === 'object') {
          // normalize common residential/address fields for display
          if (copy.residential.city) copy.residential.city = titleCase(copy.residential.city)
          if (copy.residential.street) copy.residential.street = titleCase(copy.residential.street)
          if (copy.residential.neighborhood)
            copy.residential.neighborhood = titleCase(copy.residential.neighborhood)
        }
      } catch (e) {
        void e
      }
      // Normalize phones: remove leading '+' and non-digits for display
      try {
        if (copy.cliente) {
          if (copy.cliente.telefone && typeof copy.cliente.telefone === 'string') {
            copy.cliente.telefone = String(copy.cliente.telefone).replace(/\D/g, '')
          }
          if (copy.cliente.contato_telefone && typeof copy.cliente.contato_telefone === 'string') {
            copy.cliente.contato_telefone = String(copy.cliente.contato_telefone).replace(/\D/g, '')
          }
        }
      } catch (e) {
        console.debug('phone normalization failed', e && e.message)
      }

      // Normalize birth/date fields to ISO yyyy-mm-dd when possible (handle mm/dd/yyyy and dd/mm/yyyy)
      try {
        if (copy.cliente && copy.cliente.birth && typeof copy.cliente.birth === 'string') {
          const b = String(copy.cliente.birth).trim()
          // already ISO
          if (/^\d{4}-\d{2}-\d{2}$/.test(b)) {
            // ok
          } else if (/^\d{2}\/\d{2}\/\d{4}$/.test(b)) {
            // ambiguous dd/mm or mm/dd; assume stored as mm/dd (current issue) and convert to ISO by trying both and choosing valid date
            const parts = b.split('/')
            const p1 = Number(parts[0])
            const p2 = Number(parts[1])
            const year = parts[2]
            // If p1 > 12 treat as day (dd/mm)
            if (p1 > 12 && p2 <= 12) {
              // dd/mm
              copy.cliente.birth = `${year}-${String(p2).padStart(2, '0')}-${String(p1).padStart(2, '0')}`
            } else if (p2 > 12 && p1 <= 12) {
              // mm/dd -> convert assuming mm/dd -> yyyy-mm-dd
              copy.cliente.birth = `${year}-${String(p1).padStart(2, '0')}-${String(p2).padStart(2, '0')}`
            } else {
              // both <=12 ambiguous; prefer dd/mm (user locale): convert dd/mm -> ISO
              copy.cliente.birth = `${year}-${String(p2).padStart(2, '0')}-${String(p1).padStart(2, '0')}`
            }
          } else {
            // try Date parse as fallback
            try {
              const d = new Date(b)
              if (!isNaN(d.getTime())) {
                copy.cliente.birth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
              }
            } catch (e) {
              void e
            }
          }
        }
      } catch (e) {
        console.debug('birth normalization failed', e && e.message)
      }

      // Ensure some nested objects exist to avoid render errors when components read properties
      try {
        if (!copy.investment || typeof copy.investment !== 'object')
          copy.investment = {
            classification: null,
            saldo: 0,
            assessor: null,
            data_dividendo: null,
            valor_dividendo: 0,
          }
        if (!copy.contrato || typeof copy.contrato !== 'object')
          copy.contrato = { total: 0, quantity: '' }
        if (!copy.weLend || !Array.isArray(copy.weLend)) copy.weLend = []
        if (!copy.bankRegister || !Array.isArray(copy.bankRegister)) copy.bankRegister = []
        if (copy.saldo === undefined || copy.saldo === null) copy.saldo = 0
      } catch (e) {
        console.debug('ensure nested defaults failed', e && e.message)
      }
      // Merge into existing reactive object to preserve references held by components
      try {
        if (
          this.clientEdit &&
          typeof this.clientEdit === 'object' &&
          Object.keys(this.clientEdit).length > 0
        ) {
          // replace keys on the existing object
          Object.keys(this.clientEdit).forEach((k) => delete this.clientEdit[k])
          Object.assign(this.clientEdit, copy)
        } else {
          // initial empty object: assign directly
          this.clientEdit = copy
        }
      } catch {
        // fallback
        this.clientEdit = copy
      }
    } catch (err) {
      // fallback to direct assignment on error
      console.debug('setClientEdit normalize failed', err && err.message)
      this.clientEdit = payload
    }
  },
  setClientCompare(payload) {
    this.clientCompare = payload
  },
  setDialogCompare(payload) {
    this.dialogCompare = payload
  },
  seAdvisorsDialog(payload) {
    this.advisorsDialog = payload
  },
  setSplenDialog(payload) {
    this.splenDialog = payload
  },
  setSplentHistoricDialog(payload) {
    this.splentHistoricDialog = payload
  },
  setCommissionDialog(payload) {
    this.commissionDialog = payload
  },
  setLeadDialog(payload) {
    this.leadDialog = payload
  },
  setMaximizedPreview(payload) {
    this.maximizedPreview = payload
  },
}
export default { ...actions }
