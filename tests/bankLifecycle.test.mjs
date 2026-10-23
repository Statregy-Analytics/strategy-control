import test from 'node:test'
import assert from 'node:assert/strict'
import { componentModel, deferred, tick } from './helpers/componentModel.mjs'
import * as scope from '../src/services/requestContext.js'
import { readBankCatalog } from '../src/services/bankCatalog.js'
const path = 'src/components/Clients/ClientBankAccountsPanel.vue'
async function bank(overrides = {}) {
  const calls = []
  const service = {
    listBanks: async () => ({
      data: [{ id: 'bank', code: '1', name: 'QA' }],
      pagination: { page: 1, totalPages: 1, totalItems: 1 },
    }),
    listCustomerBankAccounts: async (id) => ({ data: [{ id, bankId: 'bank' }] }),
    getCustomerBankAccount: async () => ({ bankId: 'bank' }),
    createCustomerBankAccount: async (id, payload) => {
      calls.push({ id, payload })
    },
    updateCustomerBankAccount: async () => {},
    archiveCustomerBankAccount: async () => {},
    setPrimaryCustomerBankAccount: async () => {},
    ...overrides,
  }
  const h = await componentModel(path, {
    props: { customerId: 'one', embedded: true },
    modules: {
      quasar: { QDialog: {}, QExpansionItem: {} },
      'src/services/requestContext': scope,
      'src/services/bankCatalog': { readBankCatalog },
      'src/services/customerService': service,
    },
    transform: (s) => s.replace(/\nload\(\)\n/, '\nconst initial=load()\n'),
    exports:
      'closeForm,initial,load,accounts,loading,startEdit,formOpen,form,formRef,save,saving,runAction,confirmArchive,archiveDialog',
  })
  return { ...h, calls }
}
test('late account listing cannot replace another customer accounts', async () => {
  const held = deferred(),
    h = await bank({
      listCustomerBankAccounts: async (id) =>
        id === 'one' ? held.promise : { data: [{ id: 'two' }] },
    })
  h.props.customerId = 'two'
  await tick()
  held.resolve({ data: [{ id: 'one' }] })
  await h.m.initial
  assert.equal(h.m.accounts.value[0].id, 'two')
  assert.equal(h.m.loading.value, false)
  h.dispose()
})
test('late edit detail cannot overwrite a newly opened bank form', async () => {
  const held = deferred(),
    h = await bank({ getCustomerBankAccount: () => held.promise })
  await h.m.initial
  const pending = h.m.startEdit({ id: 'old' })
  h.props.customerId = 'two'
  await tick()
  h.exposed.addAccount()
  h.m.form.branch = 'new'
  held.resolve({ bankId: 'old-bank', branch: 'old' })
  await pending
  assert.equal(h.m.form.branch, 'new')
  assert.equal(h.m.formOpen.value, true)
  assert.equal(h.notices.length, 0)
  h.dispose()
})
test('leaving during bank form validation prevents a subsequent write', async () => {
  const held = deferred(),
    h = await bank()
  await h.m.initial
  h.m.formRef.value = { resetValidation() {}, validate: () => held.promise }
  const pending = h.m.save()
  h.dispose()
  held.resolve(true)
  await pending
  assert.equal(h.calls.length, 0)
})
test('accepted old bank save cannot close the new customer form', async () => {
  const held = deferred()
  let calls = 0
  const h = await bank({
    createCustomerBankAccount: async () => {
      calls++
      return held.promise
    },
  })
  await h.m.initial
  h.m.formRef.value = { resetValidation() {}, validate: async () => true }
  const pending = h.m.save()
  await tick()
  await h.m.save()
  assert.equal(calls, 1)
  h.props.customerId = 'two'
  await tick()
  h.exposed.addAccount()
  h.m.form.branch = 'new'
  held.resolve({})
  await pending
  assert.equal(h.m.formOpen.value, true)
  assert.equal(h.m.form.branch, 'new')
  assert.equal(h.notices.length, 0)
  h.dispose()
})
test('late archive cannot dismiss another account confirmation', async () => {
  const held = deferred(),
    h = await bank({ archiveCustomerBankAccount: () => held.promise })
  await h.m.initial
  await h.m.runAction('archive', { id: 'old' })
  const pending = h.m.confirmArchive()
  h.props.customerId = 'two'
  await tick()
  await h.m.runAction('archive', { id: 'new' })
  held.resolve()
  await pending
  assert.equal(h.m.archiveDialog.value, true)
  assert.equal(h.notices.length, 0)
  h.dispose()
})

test('canceling bank form and reopening on the same customer ignores an old accepted save', async () => {
  const old = deferred()
  const h = await bank({ createCustomerBankAccount: () => old.promise })
  await h.m.initial
  h.m.formRef.value = { resetValidation() {}, validate: async () => true }
  const pending = h.m.save()
  await tick()
  h.m.closeForm()
  h.exposed.addAccount()
  h.m.form.branch = 'new-form'
  old.resolve({})
  await pending
  assert.equal(h.m.formOpen.value, true)
  assert.equal(h.m.form.branch, 'new-form')
  assert.equal(h.notices.length, 0)
  h.dispose()
})
