import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import * as requestContext from '../src/services/requestContext.js';
import { readFileSync } from 'node:fs';
import { ref, reactive, computed } from 'vue';
const source = readFileSync(new URL('../src/components/Clients/ClientPreferencesPanel.vue', import.meta.url), 'utf8').match(/<script setup>([\s\S]*?)<\/script>/)[1];
async function harness(controlled = false) {
  const mounted = [], writes = [], emitted = [];
  const props = { customerId: 'test', hideStatus: true, controlled, editing: true, externalValue: { primaryCurrencyCode: 'BRL', secondaryCurrencyCode: 'EUR' } };
  const options = ['BRL','USD','EUR'].map(code => ({ id: `uuid-${code}`, value: code, label: code }));
  const values = {
    vue: { ref, reactive, computed, onMounted: fn => mounted.push(fn), onScopeDispose() {}, watch() {} },
    'src/services/requestContext': requestContext,
    'src/services/customerService': {
      changeCustomerStatus() {}, getCustomerStatus() {},
      getCustomerPreferences: async () => ({ primaryCurrencyCode: 'BRL', secondaryCurrencyCode: 'EUR' }),
      getPreferenceCatalog: async () => ({ currencies: options }),
      updateCustomerPreferences: async (id, payload) => writes.push({id,payload}),
    },
    'src/services/apiError': { getApiErrorMessage: (_, fallback) => fallback },
    'src/composables/global/useNotification': { default: () => ({ successNotify() {}, errorNotify() {} }) },
  };
  const context = vm.createContext({ defineProps: () => props, defineEmits: () => (...args) => emitted.push(args), defineExpose() {} });
  const mod = new vm.SourceTextModule(source + '\nexport { currencyOptions, setField, savePreferences };', { context });
  await mod.link(name => { const exports = name.endsWith('.vue') ? {default:{}} : values[name]; return new vm.SyntheticModule(Object.keys(exports), function() { for (const [k,v] of Object.entries(exports)) this.setExport(k,v) }, {context}); });
  await mod.evaluate(); await Promise.all(mounted.map(fn => fn()));
  return { m: mod.namespace, writes, emitted, props };
}
test('all six currency pairs send codes even when the catalog contains UUIDs', async () => {
  const {m,writes} = await harness();
  assert.deepEqual(Array.from(m.currencyOptions.value, option => option.value), ['BRL','USD','EUR']);
  for (const primary of m.currencyOptions.value) for (const secondary of m.currencyOptions.value) {
    if (primary.value === secondary.value) continue;
    m.setField('primaryCurrencyCode',primary.value); m.setField('secondaryCurrencyCode',secondary.value); await m.savePreferences();
    assert.equal(writes.at(-1).payload.primaryCurrencyCode, primary.value);
    assert.equal(writes.at(-1).payload.secondaryCurrencyCode, secondary.value);
  }
  assert.equal(writes.length,6);
});
test('controlled profile editing emits the currency code without changing another field', async () => {
  const {m,emitted} = await harness(true);
  m.setField('primaryCurrencyCode', m.currencyOptions.value[1].value);
  assert.equal(emitted.at(-1)[0], 'update:externalValue');
  assert.equal(emitted.at(-1)[1].primaryCurrencyCode, 'USD');
  assert.equal(emitted.at(-1)[1].secondaryCurrencyCode, 'EUR');
});
