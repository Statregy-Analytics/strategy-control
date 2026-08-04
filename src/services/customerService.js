import { api } from 'src/boot/axios'

const unwrap = (response) => response.data?.data ?? response.data

export async function listCustomers(params = {}) {
  const { data } = await api.get('/api/v1/admin/customers', { params })
  return data
}
export async function createCustomer(payload) { return unwrap(await api.post('/api/v1/admin/customers', payload)) }
export async function getCustomerSummary(id) { return unwrap(await api.get(`/api/v1/admin/customers/${id}/summary`)) }
export async function getCustomerHeader(id) { return unwrap(await api.get(`/api/v1/admin/customers/${id}/header`)) }
export async function getCustomerIdentification(id) { return unwrap(await api.get(`/api/v1/admin/customers/${id}/identification`)) }
export async function replaceCustomerNames(id, names) { return unwrap(await api.put(`/api/v1/admin/customers/${id}/names`, { names })) }
export async function replaceCustomerContacts(id, contacts) { return unwrap(await api.put(`/api/v1/admin/customers/${id}/contacts`, { contacts })) }
export async function replaceCustomerAddresses(id, addresses) { return unwrap(await api.put(`/api/v1/admin/customers/${id}/addresses`, { addresses })) }
export async function getCustomerStatus(id) { return unwrap(await api.get(`/api/v1/admin/customers/${id}/status`)) }
export async function changeCustomerStatus(id, status) { return unwrap(await api.patch(`/api/v1/admin/customers/${id}/status`, { status })) }
export async function getCustomerPreferences(id) { return unwrap(await api.get(`/api/v1/admin/customers/${id}/preferences`)) }
export async function updateCustomerPreferences(id, preferences) { return unwrap(await api.patch(`/api/v1/admin/customers/${id}/preferences`, preferences)) }
export async function getPreferenceCatalog() { return unwrap(await api.get('/api/v1/preferences/catalog')) }
export async function getCustomerProfessionalFinancialSecurity(id) { return unwrap(await api.get(`/api/v1/admin/customers/${id}/professional-financial-security`)) }
export async function getCustomerProfessionalProfile(id) { return unwrap(await api.get(`/api/v1/admin/customers/${id}/professional-profile`)) }
export async function updateCustomerProfessionalProfile(id, profile) { return unwrap(await api.put(`/api/v1/admin/customers/${id}/professional-profile`, profile)) }
