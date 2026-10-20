import test from 'node:test'
import assert from 'node:assert/strict'
import vm from 'node:vm'
import { readFileSync } from 'node:fs'
import { ref, reactive, computed, watch, nextTick } from 'vue'
import { readBankCatalog } from '../src/services/bankCatalog.js'
import * as countryCatalog from '../src/services/countryCatalog.js'
const source = readFileSync(
  new URL('../src/pages/DataManagement/BanksPage.vue', import.meta.url),
  'utf8',
).match(/<script setup>([\s\S]*?)<\/script>/)[1]
const rows = Array.from({ length: 513 }, (_, i) => ({
  id: `bank-${i}`,
  name: `Bank ${i.toString(36)}`,
  code: `code-${i.toString(36)}`,
  countryId: 'br',
  isActive: i !== 1,
}))
rows[512] = {
  ...rows[512],
  code: '325',
  name: 'Órama Distribuidora de Títulos e Valores Mobiliários S.A.',
}
async function harness(fail = false) {
  const mounted = [],
    disposed = [],
    stops = [],
    calls = []
  let shouldFail = fail
  const values = {
    vue: {
      ref,
      reactive,
      computed,
      watch: (...args) => {
        const stop = watch(...args)
        stops.push(stop)
        return stop
      },
      onMounted: (fn) => mounted.push(fn),
      onScopeDispose: (fn) => disposed.push(fn),
    },
    'src/services/customerService': {
      createBank: async () => {
        throw Error('Unexpected write')
      },
      listBanks: async (params) => {
        calls.push(params)
        if (shouldFail && params.page === 2) throw Error('network')
        const items = params.isActive ? rows.filter((r) => r.isActive) : rows
        return {
          data: items.slice((params.page - 1) * 200, params.page * 200),
          pagination: {
            page: params.page,
            totalItems: items.length,
            totalPages: Math.ceil(items.length / 200),
          },
        }
      },
      listCountries: async () => ({
        data: [{ id: 'br', isoCode: 'BR', name: 'Brazil', isActive: true }],
        pagination: { totalPages: 1 },
      }),
    },
    'src/services/countryCatalog': countryCatalog,
    'src/services/bankCatalog': { readBankCatalog },
    'src/services/apiError': { getApiErrorMessage: (_, fallback) => fallback },
    'src/composables/global/useNotification': {
      default: () => ({ successNotify() {}, errorNotify() {} }),
    },
  }
  const context = vm.createContext({})
  const mod = new vm.SourceTextModule(
    source +
      '\nexport { search, onlyActive, pagination, filteredBanks, displayedBanks, totalItems, totalPages, firstItem, lastItem, loading, loadError, load, changePage, changePageSize };',
    { context },
  )
  await mod.link((name) => {
    const exports = name.endsWith('.vue') ? { default: {} } : values[name]
    assert.ok(exports, name)
    return new vm.SyntheticModule(
      Object.keys(exports),
      function () {
        for (const [k, v] of Object.entries(exports)) this.setExport(k, v)
      },
      { context },
    )
  })
  await mod.evaluate()
  await Promise.all(mounted.map((fn) => fn()))
  return {
    m: mod.namespace,
    calls,
    recover: () => {
      shouldFail = false
    },
    dispose: () => {
      stops.forEach((fn) => fn())
      disposed.forEach((fn) => fn())
    },
  }
}
test('search finds a bank on the third API page by code and unaccented name', async (t) => {
  const h = await harness()
  t.after(h.dispose)
  const m = h.m
  assert.equal(m.totalItems.value, 513)
  assert.equal(m.displayedBanks.value.length, 10)
  m.search.value = '325'
  await nextTick()
  assert.equal(m.totalItems.value, 1)
  assert.equal(m.displayedBanks.value[0].id, 'bank-512')
  assert.equal(m.firstItem.value, 1)
  assert.equal(m.lastItem.value, 1)
  m.search.value = 'orama'
  await nextTick()
  assert.equal(m.displayedBanks.value[0].id, 'bank-512')
  assert.equal(h.calls.length, 3)
})
test('search resets the current page and footer counts reflect filtered results', async (t) => {
  const h = await harness()
  t.after(h.dispose)
  const m = h.m
  m.changePage(52)
  assert.equal(m.displayedBanks.value.length, 3)
  assert.equal(m.firstItem.value, 511)
  assert.equal(m.lastItem.value, 513)
  m.search.value = 'no matches'
  await nextTick()
  assert.equal(m.pagination.page, 1)
  assert.equal(m.totalItems.value, 0)
  assert.equal(m.firstItem.value, 0)
  assert.equal(m.lastItem.value, 0)
  m.search.value = null
  await nextTick()
  assert.equal(m.totalItems.value, 513)
  m.changePageSize(20)
  assert.equal(m.displayedBanks.value.length, 20)
  assert.equal(m.totalPages.value, 26)
  assert.equal(h.calls.length, 3)
})
test('failure of a later catalog page never exposes a partial search and retry recovers', async (t) => {
  const h = await harness(true)
  t.after(h.dispose)
  const m = h.m
  assert.ok(m.loadError.value)
  assert.equal(m.loading.value, false)
  assert.equal(m.filteredBanks.value.length, 0)
  h.recover()
  await m.load()
  assert.equal(m.loadError.value, '')
  assert.equal(m.totalItems.value, 513)
})

test('active filter applies to the complete catalog and preserves pagination totals', async t => {
  const h = await harness()
  t.after(h.dispose)
  h.m.changePage(52)
  h.m.onlyActive.value = true
  await new Promise(setImmediate)
  assert.equal(h.m.pagination.page, 1)
  assert.equal(h.m.totalItems.value, 512)
  assert.equal(h.m.filteredBanks.value.every(bank => bank.isActive), true)
  assert.ok(h.calls.slice(3).every(params => params.isActive === true))
  h.m.onlyActive.value = false
  await new Promise(setImmediate)
  assert.equal(h.m.totalItems.value, 513)
})
