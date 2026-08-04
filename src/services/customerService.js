import { api } from 'src/boot/axios'

export async function listCustomers(params = {}) {
  const { data } = await api.get('/api/v1/admin/customers', { params })
  return data
}

export async function createCustomer(payload) {
  const { data } = await api.post('/api/v1/admin/customers', payload)
  return data?.data ?? data
}

export async function getCustomerSummary(customerId) {
  const { data } = await api.get(`/api/v1/admin/customers/${customerId}/summary`)
  return data?.data ?? data
}

export async function getCustomerHeader(customerId) {
  const { data } = await api.get(`/api/v1/admin/customers/${customerId}/header`)
  return data?.data ?? data
}
