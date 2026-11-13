import { ref, computed, watch, onScopeDispose } from 'vue'
import { useFinanceResource } from './useFinanceResource'
import { financeGet, financeWrite } from 'src/services/financeService'
import { buildDraftPayload, buildContractTerm } from 'src/services/financeModels'
import { readCurrentPages } from 'src/services/requestContext'
import { getApiErrorMessage } from 'src/services/apiError'

export function useContractWorkspace(props, emit, notify) {
  const id = ref(null),
    form = ref({}),
    termValue = ref(null),
    termUnit = ref(null),
    endDate = ref(null)
  const editing = ref(true),
    busy = ref(false),
    error = ref(''),
    stagedAssets = ref([]),
    assetsChanged = ref(false)
  const detail = useFinanceResource(),
    catalog = useFinanceResource(),
    assets = useFinanceResource(),
    documents = useFinanceResource(),
    engines = useFinanceResource(),
    debts = useFinanceResource(),
    history = useFinanceResource(),
    presets = useFinanceResource(),
    contributions = useFinanceResource()
  const resources = {
    detail,
    catalog,
    assets,
    documents,
    engines,
    debts,
    history,
    presets,
    contributions,
  }
  let active = true,
    revision = 0
  const draft = computed(
    () => !id.value || !detail.state.data || detail.state.data.registrationStatus === 'Draft',
  )
  const current = (r) => active && r === revision
  const resetForm = () => {
    const d = detail.state.data
    form.value = d
      ? {
          name: d.name,
          startDate: d.startDate,
          currencyId: d.currency?.id ?? null,
          initialContractualCapital: d.initialContractualCapital,
          initialCapitalOriginId: d.initialCapitalOrigin?.id ?? null,
          financialNotes: d.financialNotes,
          primaryEngineId: d.primaryEngine?.engineId ?? d.primaryEngine?.id ?? null,
          initialContractStatusId: d.businessStatus?.id ?? null,
          clientAllocations: (d.participants || []).map((p) => ({
            clientId: p.clientId,
            allocatedAmount: p.allocatedAmount,
            displayName: p.displayName,
          })),
        }
      : {
          name: null,
          startDate: null,
          currencyId: null,
          initialContractualCapital: null,
          initialCapitalOriginId: null,
          financialNotes: null,
          primaryEngineId: null,
          initialContractStatusId: null,
          clientAllocations: [],
        }
    termValue.value = d?.term?.value ?? null
    termUnit.value = d?.term?.unit ?? null
    endDate.value = d?.expectedEndDate ?? null
    stagedAssets.value = [...(assets.state.data?.items || [])]
    assetsChanged.value = false
  }
  const loadCatalog = () =>
    catalog.load(async () => {
      const [origins, engines, statuses] = await Promise.all(
        ['capital-origins', 'engines', 'statuses'].map((p) =>
          financeGet(`admin/contracts/catalog/${p}`),
        ),
      )
      return {
        origins: origins.data || [],
        engines: engines.data || [],
        statuses: statuses.data || [],
      }
    })
  const loadPresets = () =>
    presets.load(async () => (await financeGet('admin/contracts/catalog/asset-sets')).data || [])
  const loadSection = (resource, suffix, params) => {
    const key = id.value
    if (!key) return Promise.resolve()
    return resource.load(
      async () => (await financeGet(`admin/contracts/${key}/${suffix}`, params)).data,
    )
  }
  const loadAssets = () => loadSection(assets, 'assets', { page: 1, pageSize: 100 })
  const loadDocuments = () => loadSection(documents, 'documents')
  const loadEngines = () => loadSection(engines, 'engines')
  const loadHistory = () => {
    const key = id.value
    if (!key) return Promise.resolve()
    return history.load(async () => {
      const [legacy, changes] = await Promise.all([
        financeGet(`admin/contracts/${key}/history`, { page: 1, pageSize: 100 }),
        financeGet('admin/audit/changes', {
          ResourceType: 'Contract',
          ResourceId: key,
          Page: 1,
          PageSize: 100,
        }),
      ])
      return changes.data?.length ? changes.data : legacy.data
    })
  }
  const loadContributions = () => {
    const key = id.value
    if (!key) return Promise.resolve()
    return contributions.load(async () => {
      const result = await financeGet('admin/transactions', {
        contractId: key,
        type: 'ContractOperation',
        status: 'Completed',
        page: 1,
        pageSize: 100,
      })
      return { items: result.data || [], pagination: result.pagination }
    })
  }
  const loadDebts = () => {
    const contractId = id.value
    if (!contractId) return Promise.resolve()
    const r = revision
    return debts.load(() =>
      readCurrentPages(
        (page) => financeGet('admin/debts', { contractId, page, pageSize: 100 }),
        () => current(r) && id.value === contractId,
      ),
    )
  }
  async function loadDetail(sync = true) {
    const key = id.value,
      r = revision
    if (!key) return
    const d = await detail.load(async () => (await financeGet(`admin/contracts/${key}`)).data)
    if (d && current(r) && sync) resetForm()
    return d
  }
  async function start(value) {
    const r = ++revision
    Object.values(resources).forEach((v) => v.reset())
    id.value = value || null
    error.value = ''
    resetForm()
    editing.value = !value
    loadCatalog()
    loadPresets()
    if (value) {
      const d = await loadDetail()
      if (!d || !current(r)) return
      editing.value = d.registrationStatus === 'Draft'
      loadAssets().then(() => {
        if (current(r) && !assetsChanged.value)
          stagedAssets.value = [...(assets.state.data?.items || [])]
      })
      loadDocuments()
      loadEngines()
      loadDebts()
      loadHistory()
      loadContributions()
    }
  }
  async function save(finalize = false) {
    if (busy.value) return false
    const r = revision
    const wasDraft = draft.value
    const previousStatus = detail.state.data?.businessStatus?.id
    const nextStatus = form.value.initialContractStatusId
    error.value = ''
    let payload
    try {
      const term = buildContractTerm(
        termUnit.value || (termValue.value !== null && termValue.value !== '')
          ? { value: termValue.value, unit: termUnit.value }
          : null,
      )
      if (
        finalize &&
        (!term ||
          !form.value.name?.trim() ||
          !form.value.currencyId ||
          !form.value.primaryEngineId ||
          !form.value.initialCapitalOriginId ||
          !form.value.initialContractStatusId ||
          !form.value.startDate ||
          !(Number(form.value.initialContractualCapital) > 0) ||
          !form.value.clientAllocations.length)
      )
        throw Error(
          'Confira nome, prazo, início, moeda, capital, origem, motor, status e clientes antes de criar o contrato.',
        )
      payload = draft.value
        ? buildDraftPayload(form.value, term)
        : {
            name: form.value.name?.trim() || null,
            financialNotes: form.value.financialNotes?.trim() || null,
            ...(term?.value !== detail.state.data?.term?.value ||
            term?.unit !== detail.state.data?.term?.unit
              ? { term }
              : {}),
          }
      if (draft.value && assetsChanged.value)
        payload.assetUniverse = {
          presetSetId: null,
          assetIds: stagedAssets.value.map((a) => a.assetId || a.id),
          assets: null,
        }
    } catch (e) {
      error.value = e.message
      return false
    }
    busy.value = true
    try {
      const saved = await financeWrite(
        id.value ? (draft.value ? 'put' : 'patch') : 'post',
        id.value
          ? `admin/contracts/${id.value}${draft.value ? '/draft' : ''}`
          : 'admin/contracts/drafts',
        payload,
      )
      if (!current(r)) return false
      id.value = saved.id || id.value
      if (!wasDraft && nextStatus && nextStatus !== previousStatus)
        await financeWrite('post', `admin/contracts/${id.value}/status`, { statusId: nextStatus })
      if (finalize) await financeWrite('post', `admin/contracts/${id.value}/finalize`)
      if (!current(r)) return false
      await loadDetail()
      await loadAssets()
      if (!current(r)) return false
      resetForm()
      editing.value = !detail.state.data || detail.state.data.registrationStatus === 'Draft'
      loadDocuments()
      loadEngines()
      loadDebts()
      loadHistory()
      notify({ type: 'positive', message: finalize ? 'Contrato criado.' : 'Contrato salvo.' })
      emit('saved', id.value)
      return true
    } catch (e) {
      if (current(r))
        error.value = getApiErrorMessage(
          e,
          'Não foi possível salvar o contrato. Revise os dados e tente novamente.',
        )
      return false
    } finally {
      if (current(r)) busy.value = false
    }
  }
  async function writeSection(method, suffix, payload, reload) {
    if (busy.value) return false
    const r = revision,
      key = id.value
    error.value = ''
    busy.value = true
    try {
      await financeWrite(method, `admin/contracts/${key}/${suffix}`, payload)
      if (!current(r)) return false
      if (reload) await reload()
      await loadDetail(false)
      loadHistory()
      notify({ type: 'positive', message: 'Alteração salva.' })
      return true
    } catch (e) {
      if (current(r))
        error.value = getApiErrorMessage(
          e,
          'Não foi possível concluir a alteração. Tente novamente.',
        )
      return false
    } finally {
      if (current(r)) busy.value = false
    }
  }
  watch(() => props.contractId, start, { immediate: true })
  onScopeDispose(() => {
    active = false
    revision++
    Object.values(resources).forEach((v) => v.reset())
  })
  return {
    id,
    form,
    termValue,
    termUnit,
    endDate,
    editing,
    busy,
    error,
    stagedAssets,
    assetsChanged,
    draft,
    ...resources,
    resetForm,
    loadDetail,
    loadCatalog,
    loadAssets,
    loadDocuments,
    loadEngines,
    loadDebts,
    loadHistory,
    loadContributions,
    loadPresets,
    save,
    writeSection,
  }
}
