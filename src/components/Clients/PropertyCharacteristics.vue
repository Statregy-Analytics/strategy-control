<template>
  <div class="property-characteristics">
    <div v-for="(item, index) in modelValue" :key="index" class="property-characteristics__row">
      <label-form text-label="Característica">
        <q-select
          :model-value="item.isCustom ? customOption : item.name"
          :options="optionsFor(item)"
          emit-value
          map-options
          outlined
          dense
          dark
          :disable="disabled"
          :aria-label="`Característica ${index + 1}`"
          :rules="[characteristicNameRule]"
          reactive-rules
          @update:model-value="select(index, $event)"
        />
      </label-form>
      <label-form v-if="item.isCustom" text-label="Nome personalizado">
        <q-input
          :model-value="item.name"
          outlined
          dense
          dark
          :disable="disabled"
          maxlength="80"
          :aria-label="`Nome da característica ${index + 1}`"
          :rules="[characteristicNameRule]"
          reactive-rules
          @update:model-value="update(index, { name: $event })"
        />
      </label-form>
      <label-form text-label="Valor">
        <q-input
          :model-value="item.value"
          outlined
          dense
          dark
          :disable="disabled"
          maxlength="120"
          :aria-label="`Valor da característica ${index + 1}`"
          :rules="[characteristicValueRule]"
          reactive-rules
          @update:model-value="update(index, { value: $event })"
        />
      </label-form>
      <q-btn
        flat
        dense
        icon="delete_outline"
        :disable="disabled"
        :aria-label="`Remover característica ${index + 1}`"
        @click="remove(index)"
      />
    </div>
    <div class="property-characteristics__actions">
      <q-btn
        flat
        dense
        no-caps
        label="+ Adicionar característica"
        :disable="disabled || modelValue.length >= 5"
        @click="add"
      />
      <small>{{ modelValue.length }}/5 características</small>
    </div>
  </div>
</template>
<script setup>
import LabelForm from 'src/components/Form/LabelForm.vue'
import {
  characteristicOptions,
  characteristicNameRule,
  characteristicValueRule,
} from 'src/services/realEstateCharacteristics'
const props = defineProps({ modelValue: { type: Array, default: () => [] }, disabled: Boolean })
const emit = defineEmits(['update:modelValue'])
const customOption = '__custom_characteristic__'
function optionsFor(item) {
  const names = [...characteristicOptions]
  if (!item.isCustom && item.name && !names.includes(item.name)) names.push(item.name)
  return [
    ...names.map((name) => ({ label: name, value: name })),
    { label: 'Personalizada', value: customOption },
  ]
}
function update(index, patch) {
  if (props.disabled) return
  emit(
    'update:modelValue',
    props.modelValue.map((item, i) => (i === index ? { ...item, ...patch } : item)),
  )
}
function select(index, value) {
  update(index, { name: value === customOption ? '' : value, isCustom: value === customOption })
}
function add() {
  if (!props.disabled && props.modelValue.length < 5)
    emit('update:modelValue', [...props.modelValue, { name: '', value: '', isCustom: false }])
}
function remove(index) {
  if (!props.disabled)
    emit(
      'update:modelValue',
      props.modelValue.filter((_, i) => i !== index),
    )
}
</script>
<style scoped>
.property-characteristics {
  width: 100%;
  min-width: 0;
  grid-column: 1 / -1;
}
.property-characteristics__row {
  display: flex;
  flex-wrap: wrap;
  align-items: start;
  gap: 12px;
  margin-bottom: 16px;
}
.property-characteristics__row > div {
  flex: 1 1 150px;
  min-width: 0;
}
.property-characteristics__row > .q-btn {
  margin-top: 20px;
}
.property-characteristics__actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
}
.property-characteristics__actions small {
  color: inherit;
  opacity: 0.72;
}
</style>
