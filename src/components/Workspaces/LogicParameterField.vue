<template>
  <label-form
    :text-label="label"
    :label-size="10"
    class="logic-parameter-field"
    :class="{
      'logic-parameter-field--tall': tall,
      'logic-parameter-field--highlight': highlight,
      'logic-parameter-field--dimmed': dimmed,
    }"
  >
    <template #label
      >{{ label }}<img v-if="info" class="logic-parameter-info" :src="info" alt="" /><q-tooltip
        v-if="info"
        >{{ description || label }}</q-tooltip
      ></template
    >
    <q-input
      v-if="editable"
      :model-value="raw"
      placeholder="Indisponível"
      :type="kind === 'date' ? 'date' : 'text'"
      :inputmode="kind === 'number' ? 'decimal' : undefined"
      :aria-label="label"
      :aria-invalid="invalid"
      outlined
      dense
      dark
      hide-bottom-space
      @focus="start"
      @blur="finish"
      @update:model-value="update"
    />
    <div
      v-else
      class="logic-parameter-value"
      :class="display === unavailable ? '' : tone"
      :aria-label="label"
    >
      {{ display }}
    </div>
    <small v-if="previous !== undefined" class="logic-parameter-previous"
      >Atual:
      <span :class="previous === unavailable ? '' : previousTone">{{ previous }}</span></small
    ><small v-if="hint" class="logic-parameter-hint">{{ hint }}</small>
  </label-form>
</template>
<script setup>
import { computed, ref, watch } from 'vue'
import LabelForm from 'src/components/Form/LabelForm.vue'
import { decimalInputValue, numberInputValue } from 'src/services/numberInputValue'
import { structuralNumber, structuralDate, unavailable } from 'src/services/logicStructuralModel'
const props = defineProps({
  modelValue: { default: null },
  label: { type: String, required: true },
  editable: Boolean,
  kind: { type: String, default: 'number' },
  digits: { type: Number, default: 2 },
  tall: Boolean,
  highlight: Boolean,
  dimmed: Boolean,
  grouped: Boolean,
  tone: { type: String, default: '' },
  info: { type: String, default: '' },
  description: { type: String, default: '' },
  previous: { default: undefined },
  previousTone: { type: String, default: '' },
  hint: { type: String, default: '' },
  min: { type: Number, default: undefined },
  max: { type: Number, default: undefined },
})
const emit = defineEmits(['update:modelValue'])
const editing = ref(false),
  raw = ref('')
const invalid = computed(() => {
  const n = numberInputValue(props.modelValue)
  return (
    props.editable &&
    props.kind === 'number' &&
    (n === null ||
      (props.min !== undefined && n < props.min) ||
      (props.max !== undefined && n > props.max))
  )
})
const display = computed(() =>
  props.kind === 'date'
    ? structuralDate(props.modelValue)
    : props.kind === 'text'
      ? (props.modelValue ?? unavailable)
      : structuralNumber(props.modelValue, props.digits, false, props.grouped),
)
const inputDisplay = computed(() => (display.value === unavailable ? '' : display.value))
watch(
  () => props.modelValue,
  () => {
    if (!editing.value) raw.value = String(inputDisplay.value)
  },
  { immediate: true },
)
function start() {
  editing.value = true
}
function finish() {
  editing.value = false
  raw.value = String(inputDisplay.value)
}
function update(value) {
  raw.value = String(value ?? '')
  emit('update:modelValue', props.kind === 'number' ? decimalInputValue(value) : value)
}
</script>
<style scoped>
.logic-parameter-field {
  position: relative;
  min-width: 0;
  align-content: start;
  gap: 8px !important;
}
.logic-parameter-field :deep(> span:first-child) {
  min-height: 15px;
  padding-right: 18px;
  font-size: 10px !important;
  line-height: 15px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.25px;
  color: rgba(255, 255, 255, 0.6);
}
.logic-parameter-info {
  display: inline-block;
  vertical-align: middle;
  margin-left: 4px;
}
.logic-parameter-value {
  display: flex;
  align-items: center;
  min-height: 36px;
  padding: 6px 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
  font-size: 12px;
  line-height: 20px;
  color: rgba(255, 255, 255, 0.72);
  overflow-wrap: anywhere;
}
.logic-parameter-field--tall .logic-parameter-value {
  min-height: 48px;
  justify-content: center;
}
.logic-parameter-field :deep(.q-field__control),
.logic-parameter-field :deep(.q-field__marginal) {
  height: 36px;
  min-height: 36px;
}
.logic-parameter-field--tall :deep(.q-field__control),
.logic-parameter-field--tall :deep(.q-field__marginal) {
  height: 48px;
  min-height: 48px;
}
.logic-parameter-field :deep(input) {
  font-size: 12px;
  text-align: center;
  color: white;
  font-weight: 600;
}
.logic-parameter-field :deep(.q-field__control) {
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
}
.logic-parameter-field :deep(.q-field__control:before) {
  border-color: rgba(255, 255, 255, 0.2);
}
.logic-parameter-previous,
.logic-parameter-hint {
  display: block;
  margin-top: -2px;
  font-size: 10px;
  line-height: 15px;
  text-align: center;
  color: rgba(255, 255, 255, 0.6);
}
.logic-parameter-previous {
  text-transform: uppercase;
}
.logic-parameter-value.positive,
.positive {
  color: #66e59e;
}
.logic-parameter-value.negative,
.negative {
  color: #ff6467;
}
.logic-parameter-value.strong {
  color: white;
  font-weight: 700;
}
.logic-parameter-field--highlight :deep(> span:first-child) {
  color: #bedbff;
  font-size: 12px !important;
  line-height: 16px;
  letter-spacing: 0;
  text-transform: none;
  font-weight: 700;
}
.logic-parameter-field--dimmed .logic-parameter-value {
  opacity: 0.5;
}
</style>
