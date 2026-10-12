<template>
  <resource-state :state="resource.state" @retry="load">
    <q-select
      :model-value="modelValue"
      :disable="disable"
      :options="options"
      option-value="id"
      option-label="name"
      emit-value
      map-options
      outlined
      dense
      clearable
      aria-label="Moeda"
      @update:model-value="$emit('update:modelValue', $event)"
    />
    <p v-if="!options.length" class="text-caption q-mt-sm">
      {{
        customerId
          ? 'Nenhuma moeda disponível nas carteiras deste cliente.'
          : 'Selecione um cliente para consultar as moedas disponíveis.'
      }}
    </p>
  </resource-state>
</template>
<script setup>
import { computed, watch } from 'vue'
import ResourceState from './ResourceState.vue'
import { useFinanceResource } from 'src/composables/useFinanceResource'
import { financeGet } from 'src/services/financeService'
const props = defineProps({
  disable: Boolean,
  customerId: { type: String, default: null },
  modelValue: { type: String, default: null },
  current: { type: Object, default: null },
})
defineEmits(['update:modelValue'])
const resource = useFinanceResource()
const options = computed(() => {
  const items = (resource.state.data || []).map((w) => ({
    id: w.currencyId,
    name: w.currencyIsoCode,
  }))
  if (props.current?.id) items.push(props.current)
  return [...new Map(items.filter((i) => i.id).map((i) => [i.id, i])).values()]
})
const load = () =>
  resource.load(async () =>
    props.customerId ? (await financeGet(`admin/customers/${props.customerId}/wallets`)).data : [],
  )
watch(() => props.customerId, load, { immediate: true })
</script>
