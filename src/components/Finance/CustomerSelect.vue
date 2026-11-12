<template>
  <q-select
    :model-value="selection"
    outlined
    dense
    use-input
    clearable
    input-debounce="350"
    :options="options"
    :loading="loading || resolving"
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
import { computed, ref, watch, onScopeDispose } from 'vue'
import { lookupCustomers } from 'src/services/customerService'
const props = defineProps({
  modelValue: { type: String, default: null },
  current: { type: Object, default: null },
  selectedLabel: { type: String, default: null },
  resolving: Boolean,
})
const emit = defineEmits(['update:modelValue', 'resolved'])
const options = ref([]),
  loading = ref(false),
  error = ref('')
const selection = computed(() =>
  props.modelValue && props.selectedLabel !== null
    ? {
        customerId: props.modelValue,
        displayName:
          props.selectedLabel ||
          options.value.find((option) => option.customerId === props.modelValue)?.displayName ||
          '',
      }
    : props.modelValue,
)
watch(
  () => props.current,
  (value) => {
    if (value) options.value = [value]
  },
  { immediate: true },
)
watch(
  [() => props.modelValue, options],
  () => {
    const option = options.value.find((item) => item.customerId === props.modelValue)
    if (option?.displayName) emit('resolved', option)
  },
  { immediate: true },
)
let sequence = 0
onScopeDispose(() => {
  sequence++
})
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
