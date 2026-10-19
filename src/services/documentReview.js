// C28 specifies this reason. Additional choices need a confirmed design/catalog.
export const rejectionReasons = ['Foto ilegível']
export const documentIdentity = (item) => item?.documentId || item?.document?.id
export const documentAction = (item, action) =>
  Boolean(
    documentIdentity(item) &&
      item.allowedActions?.some((value) => value.toLowerCase() === action.toLowerCase()),
  )
export const canReviewDocument = (item) =>
  ['Pending', 'UnderReview', 'InReview'].includes(item?.status) && documentAction(item, 'Review')
export function documentReviewPayload(status, reason = '', message = '') {
  if (status === 'Approved') return { status, notes: null }
  if (status !== 'Rejected') throw Error('Decisão inválida.')
  if (!rejectionReasons.includes(reason)) throw Error('Selecione o motivo da reprovação.')
  return { status, notes: [reason, message.trim()].filter(Boolean).join('\n') }
}
export function createDocumentReviewer(state, { item, write, updated, errorMessage }) {
  let revision = 0
  const reset = () => {
    revision++
    Object.assign(state, { saving: false, completed: false, error: '', reasonError: '' })
  }
  const submit = async (status, reason, message) => {
    if (state.saving || state.completed) return false
    state.error = ''
    state.reasonError = ''
    const target = item(),
      id = documentIdentity(target),
      operation = revision
    if (!canReviewDocument(target)) {
      state.error = 'Este documento não está disponível para revisão. Atualize a consulta.'
      return false
    }
    let payload
    try {
      payload = documentReviewPayload(status, reason, message)
    } catch (error) {
      state.reasonError = error.message
      return false
    }
    state.saving = true
    try {
      const result = await write(id, payload)
      if (operation !== revision) return false
      if (result?.documentId !== id || result?.status !== status)
        throw Error(
          'A resposta não confirmou a revisão. Atualize a consulta antes de tentar novamente.',
        )
      state.completed = true
      updated(status)
      return true
    } catch (error) {
      if (operation === revision) state.error = errorMessage(error)
      return false
    } finally {
      if (operation === revision) state.saving = false
    }
  }
  reset()
  return { submit, reset }
}
