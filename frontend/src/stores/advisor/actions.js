// import useCliente from 'src/composables/Fakes/useCliente'
// const { getClient } = useCliente()
const actions = {
  setCompare(payload) {
    this.compare.push(...payload)
  },
  setClearCompare() {
    this.compare = []
  },
  setRemoveEmpty() {
    this.compare = this.compare.filter((item) => item.id != 0)
  },
  // setToReplace(newId, remove) {
  //   this.compare = this.compare.filter((item) => item.id !== remove)
  //   console.log('setToReplace', getClient(newId))
  //   this.setCompare([getClient(newId)])
  // },
  setCompareSelect(payload) {
    this.compare = payload
  },
  setAdvisorEdit(payload) {
    try {
      const copy = JSON.parse(JSON.stringify(payload || {}))
      // normalize top-level name/email/avatar into assessor sub-object for compatibility
      try {
        if (copy) {
          if (!copy.assessor || typeof copy.assessor !== 'object') copy.assessor = {}
          if (copy.name && !copy.assessor.name) copy.assessor.name = copy.name
          if (copy.email && !copy.assessor.email) copy.assessor.email = copy.email
          if (copy.avatar && !copy.assessor.avatar) copy.assessor.avatar = copy.avatar
        }
      } catch {
        // ignore normalization errors
      }
      const defaults = {
        id: null,
        assessor: { name: '', avatar: '', email: '' },
        clients_count: 0,
        customers: {
          balance_contract: '',
          balance_customers: '',
          captured_customers: 0,
          linked_customers: 0,
        },
        gastos: { value: 0, limite: 0, data: [] },
        commission: { received: 0, future: 0, value: 0 },
      }
      // fill missing top-level keys
      for (const k of Object.keys(defaults)) {
        if (copy[k] === undefined || copy[k] === null) copy[k] = defaults[k]
      }
      // ensure customers has expected subkeys
      if (!copy.customers || typeof copy.customers !== 'object') copy.customers = defaults.customers
      else {
        for (const ck of Object.keys(defaults.customers)) {
          if (copy.customers[ck] === undefined || copy.customers[ck] === null)
            copy.customers[ck] = defaults.customers[ck]
        }
      }
      // ensure assessor shape
      if (!copy.assessor || typeof copy.assessor !== 'object') copy.assessor = defaults.assessor
      else {
        for (const ak of Object.keys(defaults.assessor)) {
          if (copy.assessor[ak] === undefined || copy.assessor[ak] === null)
            copy.assessor[ak] = defaults.assessor[ak]
        }
      }

      this.advisorEdit = copy
    } catch {
      // fallback
      this.advisorEdit = payload || {}
    }
  },
  setSplenEdit(payload) {
    this.splenEdit = payload
  },
}
export default { ...actions }
