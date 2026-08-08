import { api } from 'src/boot/axios'

const unwrap = (response) => response.data?.data ?? response.data
const base = (customerId) => `/api/v1/admin/customers/${customerId}/compliance`

export const getComplianceCard = async (customerId) => unwrap(await api.get(`${base(customerId)}/card`))
export const listComplianceFlags = async (customerId, params = {}) => unwrap(await api.get(`${base(customerId)}/flags`, { params }))
export const createComplianceFlag = async (customerId, payload) => unwrap(await api.post(`${base(customerId)}/flags`, payload))
export const updateComplianceFlag = async (customerId, flagId, payload) => unwrap(await api.patch(`${base(customerId)}/flags/${flagId}`, payload))
export const resolveComplianceFlag = async (customerId, flagId, description) => unwrap(await api.post(`${base(customerId)}/flags/${flagId}/resolve`, { description }))
export const dismissComplianceFlag = async (customerId, flagId, description) => unwrap(await api.post(`${base(customerId)}/flags/${flagId}/dismiss`, { description }))
export const getComplianceAlerts = async (customerId) => unwrap(await api.get(`${base(customerId)}/alerts`))
export const getComplianceHistory = async (customerId, params = {}) => unwrap(await api.get(`${base(customerId)}/history`, { params }))
