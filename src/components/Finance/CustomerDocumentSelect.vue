<template>
  <resource-state :state="resource.state" @retry="load">
    <q-select
      :model-value="modelValue"
      :options="resource.state.data || []"
      option-value="id"
      :option-label="(d) => d.file?.fileName || d.documentTypeName || 'Documento'"
      emit-value
      map-options
      clearable
      outlined
      dense
      aria-label="Documento do cliente"
      @update:model-value="$emit('update:modelValue', $event)"
    />
    <p v-if="customerId && !resource.state.data?.length" class="text-caption">
      Nenhum documento disponível. Envie o arquivo pelo cadastro do cliente.
    </p>
  </resource-state>
</template>
<script setup>
import { watch } from 'vue'
import ResourceState from './ResourceState.vue'
import { useFinanceResource } from 'src/composables/useFinanceResource'
import { financeGet } from 'src/services/financeService'
const props = defineProps({
  customerId: { type: String, default: null },
  modelValue: { type: String, default: null },
})
const emit = defineEmits(['update:modelValue']),
  resource = useFinanceResource()
const load = () =>
  resource.load(async () => {
    if (!props.customerId) return []
    const path = `admin/customers/${props.customerId}/documents`,
      result = []
    let page = 1,
      totalPages = 1
    do {
      const response = await financeGet(path, { page, pageSize: 100 })
      result.push(...(response.data || []))
      totalPages = Number(response.pagination?.totalPages || 1)
      page++
    } while (page <= totalPages)
    return result
  })
watch(
  () => props.customerId,
  () => {
    emit('update:modelValue', null)
    load()
  },
  { immediate: true },
)
</script>
