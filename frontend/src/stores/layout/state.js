const state = () => {
  return {
    painel: null,
    dialogTransictionDeposit: false,
    dialogConfirmAction: false,
    dialogConfirmHeader: 'Solicitação enviada com sucesso!',
    dialogConfirmBody:
      'A solicitação foi enviada com sucesso, você pode acompanhar o status dela na aba "Solicitações".',
  dialogOpengHeader: '',
    dialogLabelButton: null,
    dataSolicitacao: {
      bank: '',
      type: 'deposit',
      destination: 'movimentar',
    },
    dialogCompare: false,
    projection: false,
    projectionStatus: 1,
    paramentroLogic: false,
    clientDialog: false,
    clientEdit: {},
    clientCompare: {},
    advisorsDialog: false,
    splenDialog: false,
    splentHistoricDialog: false,
    commissionDialog: false,
    leadDialog: false,
    maximizedPreview: false,
  }
}

export default state
