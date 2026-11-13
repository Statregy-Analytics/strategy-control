<template>
  <resource-state :state="resource.state" @retry="load">
    <glass-select
      :model-value="modelValue"
      :options="options"
      option-value="id"
      option-label="label"
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
import { computed, watch, onScopeDispose } from 'vue'
import GlassSelect from 'src/components/Entity/GlassSelect.vue'
import { createRequestContext, readCurrentPages } from 'src/services/requestContext'
import ResourceState from './ResourceState.vue'
import { useFinanceResource } from 'src/composables/useFinanceResource'
import { financeGet } from 'src/services/financeService'
const props = defineProps({
  customerId: { type: String, default: null },
  modelValue: { type: String, default: null },
})
const emit = defineEmits(['update:modelValue']),
  resource = useFinanceResource()
const context = createRequestContext(() => props.customerId)
const options = computed(() =>
  (resource.state.data || []).map((d) => ({
    ...d,
    label: d.file?.fileName || d.documentTypeName || 'Documento',
  })),
)
const load = () => {
  const customerId = props.customerId
  const active = context.capture()
  return resource.load(() =>
    customerId
      ? readCurrentPages(
          (page) => financeGet(`admin/customers/${customerId}/documents`, { page, pageSize: 100 }),
          active,
        )
      : Promise.resolve([]),
  )
}

watch(
  () => props.customerId,
  () => {
    context.invalidate()
    emit('update:modelValue', null)
    load()
  },
  { immediate: true },
)
onScopeDispose(() => {
  context.dispose()
  resource.reset()
})
</script>
