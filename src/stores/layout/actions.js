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
    this.clientEdit = payload
  },
  setClientCompare(payload) {
    this.clientCompare = payload
  },
  setDialogCompare(payload) {
    this.dialogCompare = payload
  },
  setCreateClientDialog(payload) {
    this.createClientDialog = payload
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
