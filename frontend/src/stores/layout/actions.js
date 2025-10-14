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
