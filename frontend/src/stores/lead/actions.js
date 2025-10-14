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

  removeCompareAt(index) {
    if (typeof index !== 'number') return
    const copy = Array.isArray(this.compare) ? [...this.compare] : []
    if (index < 0 || index >= copy.length) return
    copy.splice(index, 1)
    this.compare = copy
  },

  setCompareSelect(payload) {
    this.compare = payload
  },

  setLeadEdit(payload) {
    this.leadEdit = payload
  },
}
export default { ...actions }
