<template>
  <label-form :text-label="field.label" :class="{ 'workspace-wide': field.wide }">
    <glass-select
      v-if="field.kind === 'select'"
      :model-value="modelValue"
      :options="options"
      :disable="field.disabled"
      :aria-label="field.label"
      :placeholder="field.placeholder || 'Selecione'"
      @update:model-value="$emit('update:modelValue', $event)"
    />
    <q-checkbox
      v-else-if="field.kind === 'check'"
      :model-value="Boolean(modelValue)"
      :disable="field.disabled"
      :label="field.caption"
      @update:model-value="$emit('update:modelValue', $event)"
    />
    <q-input
      v-else
      :model-value="modelValue"
      outlined
      dense
      dark
      :type="
        field.kind === 'number'
          ? 'number'
          : field.kind === 'date'
            ? 'date'
            : field.kind === 'datetime'
              ? 'datetime-local'
              : field.kind === 'textarea'
                ? 'textarea'
                : 'text'
      "
      :rows="field.kind === 'textarea' ? 3 : undefined"
      :readonly="field.readonly"
      :disable="field.disabled"
      :min="field.min"
      :max="field.max"
      :maxlength="field.maxlength || 2000"
      :placeholder="field.placeholder"
      :aria-label="field.label"
      @update:model-value="$emit('update:modelValue', $event)"
    />
    <small v-if="field.hint">{{ field.hint }}</small>
  </label-form>
</template>
<script setup>
import { computed } from 'vue'
import LabelForm from 'src/components/Form/LabelForm.vue'
import GlassSelect from 'src/components/Entity/GlassSelect.vue'
const props = defineProps({
  field: { type: Object, required: true },
  modelValue: { default: null },
})
defineEmits(['update:modelValue'])
const options = computed(() =>
  (props.field.options || []).map((o) => (typeof o === 'object' ? o : { label: o, value: o })),
)
</script>
