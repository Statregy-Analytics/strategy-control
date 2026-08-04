import { api } from 'src/boot/axios'

const unwrap = (response) => response.data?.data ?? response.data

export async function listCustomers(params = {}) {
  const { data } = await api.get('/api/v1/admin/customers', { params })
  return data
}
export async function createCustomer(payload) {
  return unwrap(await api.post('/api/v1/admin/customers', payload))
}
export async function getCustomerSummary(customerId) {
  return unwrap(await api.get(`/api/v1/admin/customers/${customerId}/summary`))
}
export async function getCustomerHeader(customerId) {
  return unwrap(await api.get(`/api/v1/admin/customers/${customerId}/header`))
}
export async function getCustomerIdentification(customerId) {
  return unwrap(await api.get(`/api/v1/admin/customers/${customerId}/identification`))
}
export async function replaceCustomerNames(customerId, names) {
  return unwrap(await api.put(`/api/v1/admin/customers/${customerId}/names`, { names }))
}
export async function replaceCustomerContacts(customerId, contacts) {
  return unwrap(await api.put(`/api/v1/admin/customers/${customerId}/contacts`, { contacts }))
}
export async function replaceCustomerAddresses(customerId, addresses) {
  return unwrap(await api.put(`/api/v1/admin/customers/${customerId}/addresses`, { addresses }))
}
