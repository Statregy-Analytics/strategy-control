<template>
  <q-input
    ref="control"
    v-bind="$attrs"
    :model-value="display"
    type="text"
    inputmode="numeric"
    :rules="numericRules"
    @update:model-value="update"
    @keydown="onKeydown"
    @paste.prevent="paste"
  >
    <template v-for="(_, name) in $slots" #[name]="scope"
      ><slot :name="name" v-bind="scope || {}"
    /></template>
  </q-input>
</template>
<script setup>
import { computed, nextTick, ref } from 'vue'
defineOptions({ inheritAttrs: false })
const props = defineProps({
  modelValue: { type: [Number, String], default: null },
  currency: { type: String, default: 'BRL' },
  modelFormat: { type: String, default: 'number' },
  rules: { type: Array, default: () => [] },
})
const emit = defineEmits(['update:modelValue'])
const control = ref(null)
const numericValue = computed(() => {
  if (props.modelValue == null || props.modelValue === '') return null
  const value =
    props.modelFormat === 'localized'
      ? String(props.modelValue).replace(/\./g, '').replace(',', '.')
      : props.modelValue
  return Number(value)
})
const display = computed(() =>
  new Intl.NumberFormat(props.currency === 'BRL' ? 'pt-BR' : 'en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(numericValue.value) ? numericValue.value : 0),
)
const numericRules = computed(() =>
  props.rules.map((rule) => (typeof rule === 'function' ? () => rule(props.modelValue) : rule)),
)
function emitDigits(value) {
  const digits =
    String(value)
      .replace(/\D/g, '')
      .replace(/^0+(?=\d)/, '') || '0'
  // Stay within exact integer cents for the numeric HTTP models used by these forms.
  if (digits.length <= 15) {
    const padded = digits.padStart(3, '0')
    emit(
      'update:modelValue',
      props.modelFormat === 'localized'
        ? `${padded.slice(0, -2).replace(/\B(?=(\d{3})+(?!\d))/g, '.')},${padded.slice(-2)}`
        : Number(digits) / 100,
    )
  }
  nextTick(() => {
    const input = control.value?.getNativeElement()
    if (input) {
      input.value = display.value
      input.setSelectionRange(input.value.length, input.value.length)
    }
  })
}
function update(value) {
  emitDigits(value)
}
function onKeydown(event) {
  if (
    event.target.readOnly ||
    event.target.disabled ||
    event.ctrlKey ||
    event.metaKey ||
    event.altKey
  )
    return
  if (event.key === 'Backspace' || event.key === 'Delete') {
    event.preventDefault()
    const allSelected =
      event.target.selectionStart === 0 && event.target.selectionEnd === event.target.value.length
    emitDigits(allSelected ? '0' : display.value.replace(/\D/g, '').slice(0, -1))
  } else if (event.key.length === 1 && !/^\d$/.test(event.key)) event.preventDefault()
}
function paste(event) {
  if (event.target.readOnly || event.target.disabled) return
  const value = event.clipboardData?.getData('text') || ''
  if (/^[\d\s.,]+$/.test(value)) emitDigits(value)
}
defineExpose({
  focus: () => control.value?.focus(),
  validate: () => control.value?.validate(),
  resetValidation: () => control.value?.resetValidation(),
})
</script>
