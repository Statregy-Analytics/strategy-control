import Ajv2020 from 'ajv/dist/2020.js'
import addFormats from 'ajv-formats'

export const components = ['text', 'number', 'currency', 'select', 'toggle', 'stepper', 'attachment']
export const statusLabels = { Draft: 'Rascunho', Submitted: 'Enviado', Processing: 'Em análise', NeedsCorrection: 'Correção solicitada', Completed: 'Concluído', Rejected: 'Rejeitado' }
export const collection = (value) => Array.isArray(value) ? value : value?.items ?? value?.data ?? []

export function formFields(form) {
  const properties = form?.schema?.properties || {}
  const declared = form?.uiSchema?.fields || {}
  return Object.fromEntries([...new Set([...Object.keys(properties), ...Object.keys(declared)])].map((key) => {
    const schema = properties[key] || {}
    const type = Array.isArray(schema.type) ? schema.type.find((item) => item !== 'null') : schema.type
    const fallback = schema.enum ? 'select' : ({ string: 'text', number: 'number', integer: 'stepper', boolean: 'toggle' })[type]
    return [key, { key, label: schema.title || key, component: fallback, ...declared[key], schema }]
  }))
}

export function formSections(form) {
  const fields = formFields(form)
  const sections = (form?.uiSchema?.sections || []).map((section) => ({ ...section, fields: section.fields.filter((key) => fields[key]) }))
  const assigned = new Set(sections.flatMap((section) => section.fields))
  const remaining = Object.keys(fields).filter((key) => !assigned.has(key))
  if (remaining.length) sections.push({ id: '__remaining', title: 'Dados do formulário', fields: remaining })
  return sections
}

// This is a documented rule of the real-estate form, not a new uiSchema dialect.
export const isDebtField = (form, key) => form?.metadata?.targetAction === 'assets.declare_real_estate' && key === 'restanteParaQuitacao'
export const fieldVisible = (form, key, data) => !isDebtField(form, key) || data.estaQuitado === false

export function cleanFormData(form, data) {
  const result = {}
  for (const key of Object.keys(form?.schema?.properties || {})) {
    const value = data[key]
    if (value !== undefined && value !== null && value !== '' && fieldVisible(form, key, data)) result[key] = value
  }
  return result
}

function withoutRequired(value) {
  if (!value || typeof value !== 'object') return value
  const result = { ...value }
  delete result.required
  for (const key of ['properties', 'patternProperties', '$defs', 'definitions', 'dependentSchemas']) {
    if (result[key]) result[key] = Object.fromEntries(Object.entries(result[key]).map(([name, schema]) => [name, withoutRequired(schema)]))
  }
  for (const key of ['allOf', 'anyOf', 'oneOf', 'prefixItems']) {
    if (Array.isArray(result[key])) result[key] = result[key].map(withoutRequired)
  }
  for (const key of ['items', 'additionalProperties', 'unevaluatedProperties', 'contains', 'if', 'then', 'else', 'not', 'propertyNames']) {
    if (result[key] && typeof result[key] === 'object') result[key] = withoutRequired(result[key])
  }
  return result
}

export function createFormValidator(form) {
  const compile = (schema) => {
    const ajv = new Ajv2020({ allErrors: true, strict: false, validateFormats: true, logger: false })
    addFormats(ajv)
    return ajv.compile(schema)
  }
  const full = compile(form.schema)
  const draft = compile(withoutRequired(form.schema))
  return (data, enforceRequired = true) => {
    const validator = enforceRequired ? full : draft
    validator(data)
    const errors = {}
    for (const error of validator.errors || []) {
      const field = error.params.missingProperty || error.instancePath.split('/')[1]?.replace(/~1/g, '/').replace(/~0/g, '~') || '_form'
      errors[field] = ({ required: 'Campo obrigatório.', type: 'Informe um valor do tipo esperado.', minimum: `O mínimo é ${error.params.limit}.`, maximum: `O máximo é ${error.params.limit}.`, minLength: `Use pelo menos ${error.params.limit} caracteres.`, maxLength: `Use até ${error.params.limit} caracteres.`, enum: 'Selecione uma opção válida.', pattern: 'Confira o formato informado.', format: 'Confira o formato informado.' })[error.keyword] || 'Confira o valor informado.'
    }
    if (enforceRequired && data.estaQuitado === false && isDebtField(form, 'restanteParaQuitacao') && data.restanteParaQuitacao === undefined) errors.restanteParaQuitacao = 'Informe o saldo devedor.'
    return errors
  }
}

export function allowedAction(user, form, action) {
  const roles = collection(user?.roles).map((role) => typeof role === 'string' ? role : role.code || role.name)
  const coarse = action === 'validate' ? ['Admin', 'System'] : ['Admin', 'System', 'Operator', 'Client']
  const required = action === 'validate' ? 'data-intake.validate' : 'data-intake.submit'
  const permissions = user?.permissions
  const hasCoarse = Array.isArray(permissions) ? permissions.includes(required) : roles.some((role) => coarse.includes(role))
  const permittedRoles = form?.metadata?.permissions?.[action]
  return hasCoarse && (!permittedRoles || roles.some((role) => permittedRoles.includes(role)))
}
