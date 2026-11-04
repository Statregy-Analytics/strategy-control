<template>
  <div class="asset-document-overview" :aria-busy="loading">
    <q-linear-progress
      v-if="loading"
      indeterminate
      aria-label="Carregando documentos dos patrimônios"
    />
    <div v-if="error" role="alert">
      {{ error }}<q-btn flat no-caps label="Tentar novamente" @click="load" />
    </div>
    <p v-if="loaded && !loading && !assets.length">Nenhum patrimônio registrado.</p>
    <section v-for="asset in assets" :key="asset.id" class="asset-document-block">
      <h4>{{ asset.nickname || 'Patrimônio' }}</h4>
      <p v-if="errors[asset.id]" role="alert">
        {{ errors[asset.id]
        }}<q-btn flat dense no-caps label="Tentar novamente" @click="loadDocuments(asset)" />
      </p>
      <p v-else-if="documents[asset.id] && !documents[asset.id].length">
        Nenhum documento enviado.
      </p>
      <profile-document-item
        v-for="doc in documents[asset.id] || []"
        :key="doc.documentId"
        :customer-id="customerId"
        :item="itemFor(doc)"
        @updated="updated(asset)"
      />
    </section>
  </div>
</template>
<script setup>
import { ref, watch, onScopeDispose } from 'vue'
import { financeGet } from 'src/services/financeService'
import { getApiErrorMessage } from 'src/services/apiError'
import ProfileDocumentItem from './ProfileDocumentItem.vue'
import { assetDocumentOverviewItem } from 'src/services/clientProfileProjection'
const props = defineProps({
  customerId: { type: String, required: true },
  overview: { type: Object, default: () => ({}) },
})
const emit = defineEmits(['updated'])
const assets = ref([]),
  documents = ref({}),
  errors = ref({}),
  error = ref(''),
  loading = ref(false),
  loaded = ref(false)
let revision = 0,
  active = true
const base = () => `admin/customers/${props.customerId}/assets`
async function loadDocuments(asset) {
  const version = revision,
    path = base()
  try {
    const result = await financeGet(`${path}/${asset.id}/documents`)
    if (active && version === revision) {
      documents.value = { ...documents.value, [asset.id]: result.data || [] }
      errors.value = { ...errors.value, [asset.id]: '' }
    }
  } catch (e) {
    if (active && version === revision)
      errors.value = {
        ...errors.value,
        [asset.id]: getApiErrorMessage(e, 'Não foi possível carregar os anexos deste bem.'),
      }
  }
}
async function load() {
  if (loading.value) return
  const version = ++revision,
    path = base()
  loading.value = true
  error.value = ''
  assets.value = []
  documents.value = {}
  errors.value = {}
  try {
    const rows = [],
      ids = new Set()
    let page = 1,
      totalPages = 1,
      totalItems = null
    do {
      const result = await financeGet(path, { page, pageSize: 100 })
      if (!active || version !== revision) return
      const data = result.data,
        pages = Number(result.pagination?.totalPages),
        total = Number(result.pagination?.totalItems)
      if (
        !Array.isArray(data) ||
        !Number.isSafeInteger(pages) ||
        pages < 0 ||
        !Number.isSafeInteger(total) ||
        total < 0 ||
        (totalItems !== null && totalItems !== total)
      )
        throw Error('Consulta patrimonial incompleta.')
      totalItems = total
      totalPages = pages
      for (const row of data) {
        if (!row.id || ids.has(row.id)) throw Error('Consulta patrimonial inconsistente.')
        ids.add(row.id)
        rows.push(row)
      }
      if (page < totalPages && !data.length) throw Error('Consulta patrimonial incompleta.')
      page++
    } while (page <= totalPages)
    if (rows.length !== totalItems) throw Error('Consulta patrimonial incompleta.')
    assets.value = rows.filter((row) => row.status !== 'Archived')
    await Promise.all(assets.value.map(loadDocuments))
    if (active && version === revision) loaded.value = true
  } catch (e) {
    if (active && version === revision)
      error.value = getApiErrorMessage(e, 'Não foi possível carregar os patrimônios.')
  } finally {
    if (active && version === revision) loading.value = false
  }
}
function itemFor(doc) {
  return assetDocumentOverviewItem(doc, props.overview)
}
async function updated(asset) {
  emit('updated')
  await loadDocuments(asset)
}
watch(
  () => props.customerId,
  () => {
    const reload = loaded.value || loading.value
    revision++
    loading.value = false
    loaded.value = false
    assets.value = []
    documents.value = {}
    errors.value = {}
    error.value = ''
    if (reload) load()
  },
)
onScopeDispose(() => {
  active = false
  revision++
})
defineExpose({ load })
</script>
<style scoped>
.asset-document-block {
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.16);
}
.asset-document-block h4 {
  font-size: 14px;
  line-height: 1.4;
  font-weight: 600;
  margin: 0 0 12px;
  color: #fafafa;
  overflow-wrap: anywhere;
}
.asset-document-overview p {
  color: #989898;
  font-size: 12px;
}
</style>
