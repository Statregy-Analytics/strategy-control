import { api } from 'src/boot/axios'

const unwrap = (response) => response.data?.data ?? response.data

export const getVerificationCatalog = async () => unwrap(await api.get('/api/v1/admin/customer-verification/catalog'))
export const getCustomerVerificationLevel = async (customerId) => unwrap(await api.get(`/api/v1/admin/customers/${customerId}/verification-level`))
export const updateCustomerVerificationArea = async (customerId, areaId, payload) => unwrap(await api.put(`/api/v1/admin/customers/${customerId}/verification-areas/${areaId}/status`, payload))
export const getCustomerTimeline = async (customerId, params = {}) => unwrap(await api.get(`/api/v1/admin/customers/${customerId}/timeline`, { params }))
