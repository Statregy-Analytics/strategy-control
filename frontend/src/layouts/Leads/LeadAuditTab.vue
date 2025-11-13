<template>
  <div class="q-pa-md LeadAuditTab">
    <div class="row items-center q-mb-sm">
      <div class="col">
        <div class="text-h6">Histórico</div>
      </div>
      <div class="col-auto">
        <q-btn dense flat icon="refresh" @click="onRefresh" />
      </div>
    </div>

    <div class="row q-gutter-sm q-mb-md">
      <div class="col-2">
        <q-select dense clearable v-model="filters.action" :options="actionOptions" label="Ação" />
      </div>
      <div class="col-2">
        <q-input dense v-model="filters.from" type="date" label="De" />
      </div>
      <div class="col-2">
        <q-input dense v-model="filters.to" type="date" label="Até" />
      </div>
      <div class="col-3">
        <q-input dense v-model="filters.userId" label="User ID / Email" clearable />
      </div>
      <div class="col-auto">
        <q-btn dense color="primary" label="Filtrar" @click="applyFilters" />
      </div>
    </div>

    <q-spinner v-if="loading" />
    <div v-else>
      <div v-if="rows.length === 0" class="text-caption text-grey">Nenhum histórico encontrado</div>
      <q-list v-else>
        <q-item v-for="r in rows" :key="r.audit_id" clickable>
          <q-item-section>
            <q-item-label>{{ r.action }} - {{ r.created_at }}</q-item-label>
            <q-item-label caption>{{ formatPayload(r.payload) }}</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>

      <div class="row items-center q-mt-md">
        <div class="col">
          <q-select
            dense
            v-model.number="pageSize"
            :options="pageSizeOptions"
            label="Por página"
            style="width: 120px"
          />
        </div>
        <div class="col-auto">
          <q-pagination v-model.number="page" :max="totalPages" max-pages="7" boundary-numbers />
        </div>
        <div class="col-auto text-caption text-grey">Total: {{ total }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { useQuasar } from 'quasar'
const props = defineProps({ leadId: { type: [String, Number], required: true } })
const $q = useQuasar()
const rows = ref([])
const loading = ref(false)
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)
const filters = ref({ action: null, from: null, to: null, userId: null })
const actionOptions = ref([
  { label: 'Todas', value: null },
  { label: 'create', value: 'create' },
  { label: 'update', value: 'update' },
  { label: 'delete', value: 'delete' },
])
const pageSizeOptions = ref([10, 20, 50, 100])

async function fetchAudit() {
  if (!props.leadId) return
  loading.value = true
  try {
    const token = btoa(JSON.stringify({ id: 'admin', role: 'admin' }))
    const base =
      (import.meta && import.meta.env && import.meta.env.VITE_API_BASE_URL) ||
      (import.meta && import.meta.env && import.meta.env.DEV ? '' : 'http://localhost:3333')
    const qs = new URLSearchParams()
    qs.set('page', String(page.value))
    qs.set('pageSize', String(pageSize.value))
    if (filters.value.action) qs.set('action', filters.value.action)
    if (filters.value.from) qs.set('from', filters.value.from)
    if (filters.value.to) qs.set('to', filters.value.to)
    if (filters.value.userId) qs.set('userId', filters.value.userId)
    const url = `${base}/api/leads/${props.leadId}/audit?${qs.toString()}`
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
    if (res.ok) {
      const json = await res.json()
      rows.value = json.rows || json || []
      total.value = json.total != null ? Number(json.total) : json.length || 0
    } else {
      rows.value = []
      total.value = 0
    }
  } catch (err) {
    console.error('fetchAudit error', err)
    $q.notify({ message: 'Erro ao buscar histórico', color: 'negative' })
    rows.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

watch(
  () => props.leadId,
  () => {
    page.value = 1
    fetchAudit()
  },
  { immediate: true },
)
watch([page, pageSize], () => fetchAudit())

function formatPayload(p) {
  try {
    const obj = typeof p === 'string' ? JSON.parse(p) : p
    return JSON.stringify(obj, null, 2)
  } catch (err) {
    console.error('formatPayload parse error', err)
    return String(p)
  }
}

function applyFilters() {
  page.value = 1
  fetchAudit()
}

function onRefresh() {
  fetchAudit()
}

const totalPages = computed(() =>
  Math.max(1, Math.ceil((total.value || 0) / (pageSize.value || 1))),
)
</script>

<style scoped>
.LeadAuditTab .q-item-label {
  white-space: pre-wrap;
  font-family: monospace;
}
</style>
