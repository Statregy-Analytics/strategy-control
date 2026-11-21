<template>
  <div>
    <div class="composition-fields">
      <label-form v-for="field in compositionFields" :key="field.key" :text-label="field.label"
        ><q-input
          :model-value="display(field.key)"
          outlined
          dense
          inputmode="decimal"
          :readonly="readonly"
          :aria-label="field.label"
          placeholder="—"
          @update:model-value="$emit('update:modelValue', { ...modelValue, [field.key]: $event })"
      /></label-form>
    </div>
    <p class="composition-note">
      <information-icon /><span>A soma dos três percentuais deve fechar exatamente 100%.</span>
    </p>
  </div>
</template>
<script setup>
import LabelForm from 'src/components/Form/LabelForm.vue'
import InformationIcon from 'src/components/Entity/InformationIcon.vue'
import { compositionFields } from 'src/services/contractComposition'
const props = defineProps({ modelValue: { type: Object, default: () => ({}) }, readonly: Boolean })
defineEmits(['update:modelValue'])
const display = (key) =>
  props.modelValue?.[key] == null ? '' : String(props.modelValue[key]).replace('.', ',')
</script>
<style scoped>
.composition-fields {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}
.composition-note {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 12px;
  margin-top: 16px;
  color: #ffffff99;
}
@media (max-width: 500px) {
  .composition-fields {
    grid-template-columns: 1fr;
  }
}
</style>
