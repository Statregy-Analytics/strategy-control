<template>
  <q-select
    :model-value="modelValue"
    outlined
    dense
    use-input
    clearable
    input-debounce="350"
    :options="options"
    :loading="loading"
    option-value="customerId"
    option-label="displayName"
    emit-value
    map-options
    aria-label="Cliente"
    @filter="search"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <template #no-option
      ><q-item
        ><q-item-section>{{
          error || 'Nenhum cliente encontrado. Digite um nome.'
        }}</q-item-section></q-item
      ></template
    >
  </q-select>
</template>
<script setup>
import { ref, watch } from 'vue'
import { lookupCustomers } from 'src/services/customerService'
const props = defineProps({
  modelValue: { type: String, default: null },
  current: { type: Object, default: null },
})
defineEmits(['update:modelValue'])
const options = ref([]),
  loading = ref(false),
  error = ref('')
watch(
  () => props.current,
  (value) => {
    if (value) options.value = [value]
  },
  { immediate: true },
)
let sequence = 0
async function search(value, update) {
  const current = ++sequence
  loading.value = true
  error.value = ''
  try {
    const result = await lookupCustomers({ search: value, limit: 20 })
    if (current === sequence)
      update(() => {
        options.value = [
          ...new Map(
            [...(props.current ? [props.current] : []), ...(result.customers || [])].map((c) => [
              c.customerId,
              c,
            ]),
          ).values(),
        ]
      })
  } catch {
    if (current === sequence) {
      error.value = 'Falha na busca. Digite novamente para tentar.'
      update(() => {
        options.value = []
      })
    }
  } finally {
    if (current === sequence) loading.value = false
  }
}
</script>
