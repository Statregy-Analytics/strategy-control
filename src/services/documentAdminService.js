import { api } from 'src/boot/axios'

const unwrap = (response) => response.data?.data ?? response.data
const base = '/api/v1/admin/document-types'

export const listDocumentCategories = async () => unwrap(await api.get('/api/v1/admin/document-categories'))
export const createDocumentCategory = async (payload) => unwrap(await api.post('/api/v1/admin/document-categories', payload))
export const listDocumentTypes = async (params = {}) => unwrap(await api.get(base, { params }))
export const createDocumentType = async (payload) => unwrap(await api.post(base, payload))
export const listDocumentTypeCountries = async (typeId) => unwrap(await api.get(`${base}/${typeId}/countries`))
export const setDocumentTypeCountry = async (typeId, countryId, payload) => unwrap(await api.put(`${base}/${typeId}/countries/${countryId}`, payload))
export const deactivateDocumentTypeCountry = async (typeId, countryId) => unwrap(await api.delete(`${base}/${typeId}/countries/${countryId}`))
export const listMetadataSchemas = async (typeId, countryId, params = {}) => unwrap(await api.get(`${base}/${typeId}/countries/${countryId}/metadata-schemas`, { params }))
export const createMetadataSchema = async (typeId, countryId, payload) => unwrap(await api.post(`${base}/${typeId}/countries/${countryId}/metadata-schemas`, payload))
export const validateMetadataSchema = async (typeId, countryId, schemaId) => unwrap(await api.post(`${base}/${typeId}/countries/${countryId}/metadata-schemas/${schemaId}/validate`))
export const validateMetadataInstance = async (typeId, countryId, schemaId, payload) => unwrap(await api.post(`${base}/${typeId}/countries/${countryId}/metadata-schemas/${schemaId}/validate-instance`, payload))
export const publishMetadataSchema = async (typeId, countryId, schemaId) => unwrap(await api.post(`${base}/${typeId}/countries/${countryId}/metadata-schemas/${schemaId}/publish`))
export const retireMetadataSchema = async (typeId, countryId, schemaId) => unwrap(await api.post(`${base}/${typeId}/countries/${countryId}/metadata-schemas/${schemaId}/retire`))
export const getDocumentUploadDefinition = async (typeId, countryId) => unwrap(await api.get(`${base}/${typeId}/countries/${countryId}/upload-definition`))
export const getDocumentDataDefinition = async (typeId, countryId) => unwrap(await api.get(`${base}/${typeId}/countries/${countryId}/data-definition`))
