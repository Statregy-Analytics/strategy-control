<template>
  <resource-state :state="resource.state" @retry="reload">
    <q-table
      flat
      dense
      hide-pagination
      :rows="rows"
      :columns="columns"
      :row-key="rowKey"
      :pagination="{ rowsPerPage: 0 }"
      no-data-label="Nenhum registro encontrado"
    >
      <template v-for="(_, name) in $slots" #[name]="scope"
        ><slot :name="name" v-bind="scope"
      /></template>
    </q-table>
    <entity-table-footer
      :page="page"
      :page-size="pageSize"
      :total-items="total"
      :total-pages="pages"
      :first-item="total ? (page - 1) * pageSize + 1 : 0"
      :last-item="Math.min(page * pageSize, total)"
      @page="page = $event"
      @page-size="setPageSize"
    />
  </resource-state>
</template>
<script setup>
import { computed, ref, watch } from 'vue'
import { financeGet } from 'src/services/financeService'
import { useFinanceResource } from 'src/composables/useFinanceResource'
import ResourceState from './ResourceState.vue'
import EntityTableFooter from 'src/components/Entity/EntityTableFooter.vue'
const props = defineProps({
  path: { type: String, required: true },
  params: { type: Object, default: () => ({}) },
  columns: { type: Array, required: true },
  rowKey: { type: String, default: 'id' },
})
const resource = useFinanceResource(),
  page = ref(1),
  pageSize = ref(10)
const rows = computed(() => {
  const data = resource.state.data?.data
  return Array.isArray(data) ? data : data?.items || []
})
const meta = computed(() => resource.state.data?.pagination || resource.state.data?.data || {})
const total = computed(() => Number(meta.value.totalItems ?? rows.value.length))
const pages = computed(() =>
  Number(meta.value.totalPages ?? Math.ceil(total.value / pageSize.value)),
)
function setPageSize(value) {
  pageSize.value = value
  page.value = 1
}
const reload = () =>
  resource.load(() =>
    financeGet(props.path, { ...props.params, page: page.value, pageSize: pageSize.value }),
  )
watch(
  () => [props.path, props.params],
  () => {
    page.value = 1
    reload()
  },
  { deep: true },
)
watch([page, pageSize], reload)
reload()
defineExpose({ reload })
</script>
