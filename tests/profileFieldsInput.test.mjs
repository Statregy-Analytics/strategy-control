import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { parse, compileTemplate } from '@vue/compiler-sfc'
import * as Vue from 'vue'
import { renderToString } from '@vue/server-renderer'
import { createSectionEditor } from '../src/services/sectionEditor.js'
import {
  sectionValues,
  sectionValidation,
  sectionPlan,
  sectionHasChanges,
} from '../src/services/clientSectionModel.js'

const { descriptor } = parse(
  readFileSync(new URL('../src/components/Entity/ProfileFields.vue', import.meta.url), 'utf8'),
)
const compiled = compileTemplate({
  source: descriptor.template.content,
  filename: 'ProfileFields.vue',
  id: 'profile-input-test',
  compilerOptions: { mode: 'function' },
})
assert.deepEqual(compiled.errors, [])
const render = new Function('Vue', compiled.code)(Vue)
async function input(value, values) {
  const emitted = []
  const component = {
    props: ['fields', 'values', 'editing', 'busy', 'editable', 'columns', 'errors'],
    emits: ['update:values'],
    setup: () => ({ changed: () => false, QInput: Vue.resolveComponent('QInput') }),
    components: {
      LabelForm: {
        render() {
          return Vue.h('label', this.$slots.default?.())
        },
      },
      QInput: {
        inheritAttrs: false,
        setup(_, { attrs }) {
          attrs['onUpdate:modelValue'](value)
          return () => Vue.h('input')
        },
      },
      QTooltip: {
        render() {
          return null
        },
      },
    },
    render,
  }
  await renderToString(
    Vue.createSSRApp(component, {
      fields: [
        {
          label: 'Renda mensal individual',
          editKey: 'individualMonthlyIncome',
          inputType: 'number',
        },
      ],
      values,
      editing: true,
      busy: false,
      editable: ['individualMonthlyIncome'],
      columns: 3,
      errors: {},
      'onUpdate:values': (payload) => emitted.push(payload),
    }),
  )
  assert.equal(emitted.length, 1)
  return emitted[0]
}
test('the actual input template preserves precise decimal text, explicit zero and nullable clears', async () => {
  const original = {
    individualMonthlyIncome: '10',
    employerName: 'Empresa teste',
    declaredNetWorth: null,
  }
  for (const [typed, expected] of [
    ['9007199254740993.02', '9007199254740993.02'],
    ['0.00', '0.00'],
    [0, 0],
    ['', null],
  ]) {
    const changed = await input(typed, original)
    assert.equal(changed.individualMonthlyIncome, expected)
    assert.equal(changed.employerName, original.employerName)
    assert.equal(original.individualMonthlyIncome, '10')
  }
})
test('an amount typed through the real template reaches the section HTTP plan without rounding', async () => {
  const source = {
    customerId: 'fixture',
    professional: {
      occupation: 'Analista',
      employerName: 'Empresa teste',
      validFrom: '2026-01-01',
      validTo: null,
      isCurrent: true,
    },
    financial: {
      individualMonthlyIncome: '9007199254740993.01',
      householdMonthlyIncome: '9007199254740993.10',
      declaredNetWorth: 0,
      currencyCode: 'BRL',
      effectiveFrom: '2026-01-01',
      effectiveTo: null,
    },
  }
  const values = sectionValues('professional', source),
    state = {},
    writes = []
  const editor = createSectionEditor(state, {
    read: async () => ({ source, values }),
    validate: sectionValidation,
    plan: sectionPlan,
    hasChanges: sectionHasChanges,
    write: async (step) => writes.push(step),
    saved() {},
    refresh: async () => {},
    errorMessage: (error) => error.message,
  })
  await editor.start('professional')
  state.draft = await input('9007199254740993.02', state.draft)
  assert.equal(await editor.save(), true)
  assert.equal(writes.length, 1)
  assert.equal(writes[0].payload.individualMonthlyIncome, '9007199254740993.02')
  assert.equal(writes[0].payload.declaredNetWorth, '0')
  assert.equal(writes[0].payload.currencyCode, 'BRL')
})
