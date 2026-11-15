<template>
  <label-form
    :text-label="label"
    :label-size="labelSize"
    class="percent-input"
    :class="{
      'percent-input--negative': negativeTone && numericValue !== null && numericValue < 0,
    }"
    :style="{ gap: '8px', '--percent-label-line-height': labelLineHeight + 'px' }"
  >
    <div class="percent-input-control">
      <q-input
        :model-value="displayValue"
        :type="localized ? 'text' : 'number'"
        :inputmode="inputMode || (localized ? 'decimal' : undefined)"
        :min="min"
        :max="max"
        step="any"
        outlined
        dense
        dark
        hide-bottom-space
        :disable="disabled"
        :aria-label="label"
        :aria-invalid="invalid"
        @update:model-value="update"
        @focus="startEditing"
        @blur="editing = false"
      />
      <span class="percent-input-suffix" aria-hidden="true">%</span>
    </div>
  </label-form>
</template>
<script setup>
import { computed, ref, watch } from 'vue'
import LabelForm from './LabelForm.vue'
import {
  numberInputValue,
  decimalInputValue,
  decimalInputDisplay,
} from 'src/services/numberInputValue'
const props = defineProps({
  modelValue: { type: [Number, String], default: null },
  label: { type: String, required: true },
  labelSize: { type: [Number, String], default: 14 },
  labelLineHeight: { type: Number, default: 14 },
  disabled: Boolean,
  negativeTone: Boolean,
  localized: Boolean,
  inputMode: { type: String, default: null },
  min: { type: [Number, String], default: undefined },
  max: { type: [Number, String], default: undefined },
})
const emit = defineEmits(['update:modelValue'])
const editing = ref(false),
  editingText = ref('')
const displayValue = computed(() =>
  props.localized
    ? editing.value
      ? editingText.value
      : decimalInputDisplay(props.modelValue)
    : props.modelValue,
)
function startEditing() {
  if (!props.localized) return
  editingText.value = decimalInputDisplay(props.modelValue)
  editing.value = true
}
function update(value) {
  if (props.localized) editingText.value = String(value ?? '')
  emit('update:modelValue', props.localized ? decimalInputValue(value) : numberInputValue(value))
}
watch(
  () => props.disabled,
  (value) => {
    if (value) editing.value = false
  },
)
const numericValue = computed(() => numberInputValue(props.modelValue))
const invalid = computed(() => {
  if (
    props.localized &&
    editing.value &&
    editingText.value.trim() &&
    decimalInputValue(editingText.value) === null
  )
    return true
  if (numericValue.value === null) return false
  const min = numberInputValue(props.min),
    max = numberInputValue(props.max)
  return (min !== null && numericValue.value < min) || (max !== null && numericValue.value > max)
})
</script>
<style scoped>
.percent-input {
  min-width: 0;
}
.percent-input > :deep(span:first-child) {
  line-height: var(--percent-label-line-height);
}
.percent-input-control {
  position: relative;
  min-width: 0;
}
.percent-input-control :deep(.q-field__control) {
  height: 36px;
  min-height: 36px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
}
.percent-input-control :deep(.q-field__native) {
  min-height: 36px;
  padding-right: 22px;
  font-size: 14px;
  line-height: 20px;
  color: rgba(255, 255, 255, 0.72);
}
.percent-input-control :deep(input[type='number']) {
  appearance: textfield;
}
.percent-input-control :deep(input::-webkit-inner-spin-button),
.percent-input-control :deep(input::-webkit-outer-spin-button) {
  appearance: none;
  margin: 0;
}
.percent-input-suffix {
  position: absolute;
  right: 12px;
  top: 8px;
  font-size: 14px;
  font-weight: 700;
  line-height: 20px;
  pointer-events: none;
}
.percent-input--negative :deep(.q-field__native) {
  color: #ff8a8a !important;
}
</style>
