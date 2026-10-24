import { api } from 'src/boot/axios'
const base = (customerId) => `/api/v1/admin/customers/${encodeURIComponent(customerId)}/sessions`
export async function listCustomerSessions(customerId) {
  const { data } = await api.get(base(customerId))
  if (data?.success === false || !Array.isArray(data?.data))
    throw new Error('Não foi possível confirmar as sessões deste cliente.')
  return data.data
}
export async function revokeCustomerSession(customerId, sessionId) {
  const { data } = await api.delete(`${base(customerId)}/${encodeURIComponent(sessionId)}`)
  if (data?.success === false) throw new Error('Não foi possível encerrar a sessão.')
}
