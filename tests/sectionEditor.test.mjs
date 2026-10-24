import test from 'node:test'
import assert from 'node:assert/strict'
import { createSectionEditor } from '../src/services/sectionEditor.js'
import {
  sectionValues,
  sectionPlan,
  sectionValidation,
  sectionEditable,
  sectionHasChanges,
  sectionChanged,
} from '../src/services/clientSectionModel.js'

const setup = (overrides = {}) => {
  const state = {},
    writes = [],
    refreshed = [],
    saved = []
  const controller = createSectionEditor(state, {
    read: async () => ({
      source: {},
      values: { occupation: 'Analista' },
      editable: ['occupation'],
    }),
    validate: () => ({}),
    plan: () => [{ method: 'put', path: 'first', payload: {} }],
    write: async (step) => writes.push(step),
    errorMessage: (error) => error.message,
    refresh: async (key) => refreshed.push(key),
    saved: (key) => saved.push(key),
    ...overrides,
  })
  return { state, controller, writes, refreshed, saved }
}
test('only one section; unchanged drafts never write; discard keeps original independent', async () => {
  const { state, controller, writes } = setup()
  assert.equal(await controller.start('professional'), true)
  assert.equal(await controller.start('preferences'), false)
  assert.equal(await controller.save(), false)
  state.draft.occupation = 'Engenheiro'
  assert.equal(state.original.occupation, 'Analista')
  assert.equal(controller.dirty(), true)
  await controller.discard()
  assert.equal(state.active, null)
  assert.deepEqual(state.editable, [])
  assert.equal(writes.length, 0)
})
test('late reads after dispose cannot reopen a former customer', async () => {
  let resolve
  const { state, controller } = setup({ read: () => new Promise((done) => (resolve = done)) })
  const pending = controller.start('professional')
  controller.dispose()
  resolve({ source: {}, values: { occupation: 'Late' } })
  assert.equal(await pending, false)
  assert.equal(state.draft, null)
})
test('late successful write cannot announce success after dispose', async () => {
  let resolve
  const { state, controller, saved, refreshed } = setup({
    write: () => new Promise((done) => (resolve = done)),
  })
  await controller.start('professional')
  state.draft.occupation = 'Outro'
  const pending = controller.save()
  controller.dispose()
  resolve()
  assert.equal(await pending, false)
  assert.equal(state.active, null)
  assert.deepEqual(saved, [])
  assert.deepEqual(refreshed, [])
})
test('saving locks discard and other sections and validates before writing', async () => {
  let resolve
  const { state, controller } = setup({ write: () => new Promise((done) => (resolve = done)) })
  await controller.start('professional')
  state.draft.occupation = 'Engenheiro'
  const pending = controller.save()
  assert.equal(state.saving, true)
  assert.equal(await controller.discard(), false)
  assert.equal(await controller.start('preferences'), false)
  resolve()
  assert.equal(await pending, true)
  assert.equal(state.active, null)
  const invalid = setup({ validate: () => ({ occupation: 'Informe a profissão.' }) })
  await invalid.controller.start('professional')
  invalid.state.draft.occupation = ''
  assert.equal(await invalid.controller.save(), false)
  assert.match(invalid.state.error, /Revise/)
  assert.equal(invalid.writes.length, 0)
})
test('partial saves retain draft; retry skips accepted operation and maps server field', async () => {
  let fail = true
  const calls = []
  const { state, controller, saved } = setup({
    plan: () => ['put', 'post'].map((method) => ({ method, path: method, payload: {} })),
    write: async (step) => {
      calls.push(step.method)
      if (step.method === 'post' && fail)
        throw Object.assign(Error('Falha'), {
          response: { data: { errors: [{ field: 'Profile.Occupation', message: 'Inválido' }] } },
        })
    },
  })
  await controller.start('professional')
  state.draft.occupation = 'Engenheiro'
  assert.equal(await controller.save(), false)
  assert.match(state.error, /Parte das alterações/)
  assert.equal(state.fields.occupation, 'Inválido')
  assert.equal(state.draft.occupation, 'Engenheiro')
  assert.deepEqual(saved, [])
  fail = false
  assert.equal(await controller.save(), true)
  assert.deepEqual(calls, ['put', 'post', 'post'])
  assert.deepEqual(saved, ['professional'])
})
test('discard after partial save refreshes real server data without claiming success', async () => {
  const { state, controller, refreshed, saved } = setup({
    plan: () => [{ path: 'accepted' }, { path: 'failed' }],
    write: async ({ path }) => {
      if (path === 'failed') throw Error('Falha')
    },
  })
  await controller.start('professional')
  state.draft.occupation = 'Outro'
  await controller.save()
  await controller.discard()
  assert.deepEqual(refreshed, ['professional'])
  assert.deepEqual(saved, [])
})
test('accepted fields become the baseline so a partial save can be corrected back', async () => {
  const calls = []
  let fail = true
  const { state, controller } = setup({
    read: async () => ({ source: {}, values: { occupation: 'A', employerName: 'Original' } }),
    plan: (_key, _source, draft, original) =>
      Object.keys(draft)
        .filter((field) => draft[field] !== original[field])
        .map((field) => ({ path: field, payload: { [field]: draft[field] }, fields: [field] })),
    write: async (step) => {
      calls.push(step.payload)
      if (step.path === 'employerName' && fail) throw Error('Falha')
    },
  })
  await controller.start('professional')
  Object.assign(state.draft, { occupation: 'B', employerName: 'Nova' })
  await controller.save()
  assert.equal(state.original.occupation, 'B')
  assert.equal(state.original.employerName, 'Original')
  state.draft.occupation = 'A'
  fail = false
  assert.equal(await controller.save(), true)
  assert.deepEqual(calls, [
    { occupation: 'B' },
    { employerName: 'Nova' },
    { occupation: 'A' },
    { employerName: 'Nova' },
  ])
})

const professional = {
  customerId: 'customer',
  professional: {
    occupation: 'Analista',
    employerName: 'Empresa',
    validFrom: '2026-01-01',
    validTo: null,
    isCurrent: true,
  },
  financial: {
    individualMonthlyIncome: 0,
    householdMonthlyIncome: 100,
    declaredNetWorth: null,
    currencyCode: 'BRL',
    effectiveFrom: '2026-01-01',
    effectiveTo: null,
  },
}
test('financial save preserves zero, null, currency and dates without adding UI fields', () => {
  const original = sectionValues('professional', professional)
  const draft = { ...original, householdMonthlyIncome: 200 }
  const steps = sectionPlan('professional', professional, draft, original)
  assert.equal(steps.length, 1)
  assert.equal(steps[0].method, 'post')
  assert.deepEqual(steps[0].payload, { ...professional.financial, individualMonthlyIncome: '0', householdMonthlyIncome: '200' })
  assert.equal(Object.keys(original).length, 5)
  assert.ok(
    sectionValidation('professional', { ...draft, householdMonthlyIncome: -1 })
      .householdMonthlyIncome,
  )
  assert.throws(
    () => sectionPlan('professional', { ...professional, financial: {} }, draft, original),
    /Moeda e vigência/,
  )
})
test('professional, preferences, account and compliance preserve required hidden metadata', () => {
  const original = sectionValues('professional', professional)
  assert.deepEqual(
    sectionPlan('professional', professional, { ...original, employerName: 'Nova' }, original)[0]
      .payload,
    { ...professional.professional, employerName: 'Nova' },
  )
  const preferences = {
    customerId: 'customer',
    countryId: 'BR',
    primaryCurrencyCode: 'BRL',
    secondaryCurrencyCode: null,
    languageCode: 'pt-BR',
    timeZoneId: 'America/Sao_Paulo',
    theme: 'Dark',
  }
  assert.equal(
    sectionPlan('preferences', preferences, {
      ...sectionValues('preferences', preferences),
      theme: 'Light',
    })[0].payload.countryId,
    'BR',
  )
  const user = { id: 'user', name: 'Teste', email: 'test@example.com', workspaceId: 'workspace' }
  assert.deepEqual(sectionPlan('security', user, { userName: 'Outro' })[0].payload, {
    name: 'Outro',
    email: user.email,
    workspaceId: 'workspace',
  })
  const flag = {
    customerId: 'customer',
    id: 'flag',
    severity: 'Low',
    status: 'Open',
    description: 'Nota',
    monitoringFrequency: 'Annual',
    relatedPepDescription: null,
    relatedPepRelationship: null,
  }
  const payload = sectionPlan('compliance', flag, { description: 'Outra' })[0].payload
  assert.equal(payload.severity, 'Low')
  assert.equal(payload.status, 'Open')
  assert.equal(payload.description, 'Outra')
})
test('identification replaces collections without dropping secondary records or sending documents', () => {
  const source = {
    customerId: 'customer',
    kind: 'Person',
    birthDate: null,
    names: [
      {
        id: 'name',
        kind: 'Legal',
        displayName: 'Teste',
        validFrom: '2026-01-01',
        validTo: null,
        isPrimary: true,
      },
    ],
    personalDocuments: [{ value: 'never-send' }],
    contacts: [
      { id: 'email', kind: 'Email', value: 'old@example.com', isPrimary: true },
      { id: 'other', kind: 'Phone', value: '123', isPrimary: false },
    ],
    addresses: [
      {
        id: 'home',
        kind: 'Residential',
        line1: 'Rua',
        line2: null,
        city: 'São Paulo',
        stateOrProvince: 'SP',
        postalCode: '01000',
        countryId: 'BR',
        isPrimary: true,
      },
      { id: 'work', kind: 'Commercial', line1: 'Empresa', countryId: 'BR', isPrimary: false },
    ],
  }
  const original = sectionValues('identification', source)
  const draft = {
    ...original,
    fullName: 'Teste Dois',
    primaryEmail: 'new@example.com',
    line2: 'Ap 1',
  }
  const steps = sectionPlan('identification', source, draft, original)
  assert.equal(steps.length, 3)
  assert.equal(steps[0].payload.names[0].validFrom, '2026-01-01')
  assert.deepEqual(steps[1].payload.contacts[1], source.contacts[1])
  assert.equal(steps[2].payload.addresses[0].countryId, 'BR')
  assert.equal(steps[2].payload.addresses[1].id, 'work')
  assert.ok(!JSON.stringify(steps).includes('never-send'))
  assert.equal(source.addresses[0].line2, null)
  const accepted = { ...original, primaryEmail: 'accepted@example.com' }
  const retry = sectionPlan('identification', source, { ...accepted, mobilePhone: '456' }, accepted)
  assert.equal(
    retry[0].payload.contacts.find((row) => row.id === 'email').value,
    'accepted@example.com',
  )
  assert.ok(sectionEditable('identification', { ...source, addresses: [] }).includes('line1'))
  assert.deepEqual(
    sectionValidation('identification', { ...original, fullName: '' }, { names: [] }),
    {},
  )
})


test('financial strings retain decimal precision without rewriting equivalent formatting', () => {
  const source = { ...professional, financial: {
    ...professional.financial, individualMonthlyIncome: '9007199254740993.01',
    householdMonthlyIncome: '9007199254740993.02', declaredNetWorth: null,
  } }
  const original = sectionValues('professional', source)
  const equivalent = { ...original, individualMonthlyIncome: '09007199254740993.0100', declaredNetWorth: '' }
  assert.equal(sectionHasChanges('professional', equivalent, original), false)
  assert.equal(sectionChanged(equivalent, original, 'individualMonthlyIncome'), false)
  assert.deepEqual(sectionPlan('professional', source, equivalent, original), [])
  const changed = { ...original, individualMonthlyIncome: '9007199254740993.02' }
  const [step] = sectionPlan('professional', source, changed, original)
  assert.equal(step.payload.individualMonthlyIncome, '9007199254740993.02')
  assert.equal(step.payload.householdMonthlyIncome, '9007199254740993.02')
  assert.equal(step.payload.declaredNetWorth, null)
  assert.equal(step.payload.currencyCode, source.financial.currencyCode)
  assert.equal(step.payload.effectiveFrom, source.financial.effectiveFrom)
})
test('decimal validation preserves the existing household rule without floating point rounding', () => {
  const values = { ...sectionValues('professional', professional),
    individualMonthlyIncome: '9007199254740993.02', householdMonthlyIncome: '9007199254740993.01' }
  assert.match(sectionValidation('professional', values).householdMonthlyIncome, /menor/)
  for (const bad of ['-1', '1,23', 'abc', Infinity, {}, true]) {
    const draft = { ...values, individualMonthlyIncome: bad }
    assert.ok(sectionValidation('professional', draft).individualMonthlyIncome)
    assert.equal(sectionHasChanges('professional', draft, values), true)
  }
})
test('format-only financial editing stays clean and never writes or announces a save', async () => {
  const values = sectionValues('professional', professional)
  const h = setup({
    read: async () => ({ source: professional, values, editable: Object.keys(values) }),
    plan: sectionPlan, validate: sectionValidation, hasChanges: sectionHasChanges,
  })
  await h.controller.start('professional')
  h.state.draft.individualMonthlyIncome = '0.00'
  h.state.draft.householdMonthlyIncome = '00100.000'
  h.state.draft.declaredNetWorth = ''
  assert.equal(h.controller.dirty(), false)
  assert.equal(await h.controller.save(), false)
  assert.equal(h.writes.length, 0)
  assert.deepEqual(h.saved, [])
  assert.deepEqual(h.refreshed, [])
  h.state.draft.householdMonthlyIncome = '100.01'
  assert.equal(h.controller.dirty(), true)
  assert.equal(await h.controller.save(), true)
  assert.equal(h.writes[0].payload.householdMonthlyIncome, '100.01')
})

test('identification rejects impossible and future birth dates without changing optionality', () => {
  const today = new Date(2026, 9, 20, 15, 0)
  for (const birthDate of [
    '2026-10-21',
    '2027-01-01',
    '2025-02-29',
    '1900-02-29',
    '2026-04-31',
    '2026-13-01',
    '0000-01-01',
    '20/10/2026',
    'invalid',
  ]) {
    assert.match(
      sectionValidation('identification', { birthDate }, {}, today).birthDate,
      /nascimento válida/,
    )
  }
  for (const birthDate of [
    null,
    undefined,
    '',
    '2026-10-20',
    '2000-02-29',
    '1989-01-01',
    '0099-01-01',
  ])
    assert.equal(sectionValidation('identification', { birthDate }, {}, today).birthDate, undefined)
})
test('birth date validation blocks all section writes and correction can then be saved', async () => {
  const source = {
    customerId: 'customer',
    kind: 'Person',
    birthDate: '1989-01-01',
    names: [],
    contacts: [],
    addresses: [],
  }
  const { state, controller, writes } = setup({
    read: async () => ({
      source,
      values: sectionValues('identification', source),
      editable: ['birthDate'],
    }),
    validate: (key, value, source) => sectionValidation(key, value, source, new Date(2026, 9, 20)),
    plan: sectionPlan,
  })
  await controller.start('identification')
  state.draft.birthDate = '2026-10-21'
  assert.equal(await controller.save(), false)
  assert.equal(writes.length, 0)
  assert.match(state.fields.birthDate, /sem ser no futuro/)
  assert.equal(state.active, 'identification')
  state.draft.birthDate = '1990-01-01'
  assert.equal(await controller.save(), true)
  assert.equal(writes.length, 1)
  assert.equal(writes[0].payload.birthDate, '1990-01-01')
  assert.equal(source.birthDate, '1989-01-01')
})

test('neighborhood edits use the existing address contract and preserve secondary addresses', () => {
  const source = {customerId:'customer',kind:'Person',names:[],contacts:[],addresses:[
    {id:'home',kind:'Residential',isPrimary:true,countryId:'br',line1:'Rua',line2:'Sala',neighborhood:'Centro',city:'Cidade',postalCode:'123'},
    {id:'other',kind:'Work',isPrimary:false,countryId:'pt',line1:'Outra',neighborhood:'Bairro secundário'},
  ]}
  const original=sectionValues('identification',source)
  const draft={...original,neighborhood:'Bairro QA'}
  assert.ok(sectionEditable('identification',source).includes('neighborhood'))
  assert.equal(sectionValidation('identification',draft,source).neighborhood,undefined)
  assert.ok(sectionValidation('identification',{...draft,neighborhood:'a'.repeat(121)},source).neighborhood)
  const [step]=sectionPlan('identification',source,draft,original)
  assert.equal(step.payload.addresses[0].neighborhood,'Bairro QA')
  assert.equal(step.payload.addresses[0].line2,'Sala')
  assert.equal(step.payload.addresses[1].neighborhood,'Bairro secundário')
  assert.ok(step.fields.includes('neighborhood'))
  assert.equal(source.addresses[0].neighborhood,'Centro')
})
