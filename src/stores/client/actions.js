import { listCustomers } from 'src/services/customerService'

const actions = {
  async fetchCustomers(params = {}) {
    this.loading = true
    try {
      const response = await listCustomers(params)
      this.data = response?.data ?? []
      this.pagination = { ...this.pagination, ...(response?.pagination ?? {}) }
      return this.data
    } finally {
      this.loading = false
    }
  },
  setCompare(payload) {
    this.compare.push(...payload)
  },
  setClearCompare() {
    this.compare = []
  },
  setRemoveEmpty() {
    this.compare = this.compare.filter((item) => item.id !== 0)
  },
  setCompareSelect(payload) {
    this.compare = payload
  },
}

export default { ...actions }
