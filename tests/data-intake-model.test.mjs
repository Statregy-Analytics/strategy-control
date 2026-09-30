import test from 'node:test'
import assert from 'node:assert/strict'
import { allowedAction, cleanFormData, createFormValidator, formFields, formSections } from '../src/components/DataIntake/formModel.js'

const form = {
  schema: { $id: 'https://example.test/real-estate', type: 'object', additionalProperties: false, required: ['name', 'paid', 'value'], properties: { name: { type: 'string', minLength: 3 }, paid: { type: 'boolean' }, value: { type: 'number', minimum: 0 }, count: { type: 'integer', maximum: 50 }, cep: { type: 'string', pattern: '^[0-9]{5}-?[0-9]{3}$' } } },
  uiSchema: { sections: [{ id: 'main', title: 'Main', fields: ['name', 'file'] }], fields: { name: { component: 'text', label: 'Nome' }, file: { component: 'attachment' } } },
  metadata: { permissions: { create: ['Admin', 'Client'], updateOwnDraft: ['Client'], submit: ['Client'], validate: ['Admin'] } },
}
test('schema defaults cover omitted UI fields and attachments never enter data', () => {
  assert.equal(formFields(form).paid.component, 'toggle')
  assert.deepEqual(formSections(form).flatMap((s) => s.fields).sort(), ['name', 'file', 'paid', 'value', 'count', 'cep'].sort())
  assert.deepEqual(cleanFormData(form, { name: '', paid: false, value: 0, file: 'not-data', unknown: 'discard' }), { paid: false, value: 0 })
})
test('drafts may be incomplete but invalid supplied values fail', () => {
  const validate = createFormValidator(form)
  assert.deepEqual(validate({}, false), {})
  assert.ok(validate({ value: -1 }, false).value)
  assert.ok(validate({ count: 1.5 }, false).count)
  assert.ok(validate({ cep: 'invalid' }, false).cep)
  assert.ok(validate({}).name)
  assert.deepEqual(validate({ name: 'Casa', paid: false, value: 0 }), {})
})
test('real-estate conditional debt is required only when unpaid and removed when paid', () => {
  const estate = { schema: { type: 'object', properties: { estaQuitado: { type: 'boolean' }, restanteParaQuitacao: { type: 'number' } } }, metadata: { targetAction: 'assets.declare_real_estate' } }
  const validate = createFormValidator(estate)
  assert.ok(validate({ estaQuitado: false }).restanteParaQuitacao)
  assert.deepEqual(validate({ estaQuitado: false, restanteParaQuitacao: 0 }), {})
  assert.deepEqual(cleanFormData(estate, { estaQuitado: true, restanteParaQuitacao: 123 }), { estaQuitado: true })
})
test('published metadata narrows coarse role permissions', () => {
  const admin = { roles: ['Admin'] }, client = { roles: ['Client'] }
  assert.equal(allowedAction(admin, form, 'create'), true)
  assert.equal(allowedAction(admin, form, 'submit'), false)
  assert.equal(allowedAction(admin, form, 'updateOwnDraft'), false)
  assert.equal(allowedAction(client, form, 'validate'), false)
  assert.equal(allowedAction(admin, form, 'validate'), true)
  assert.equal(allowedAction({ roles: ['Admin'], permissions: [] }, form, 'validate'), false)
})
test('a property literally named required is preserved when relaxing draft validation', () => {
  const validate = createFormValidator({ schema: { type: 'object', additionalProperties: false, properties: { required: { type: 'integer' } }, required: ['required'] } })
  assert.deepEqual(validate({ required: 1 }, false), {})
  assert.ok(validate({ required: 'wrong' }, false).required)
})
