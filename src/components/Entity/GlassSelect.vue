<template>
  <q-select
    ref="select"
    class="glass-select"
    :model-value="modelValue"
    :options="options"
    outlined
    dense
    dark
    hide-bottom-space
    emit-value
    map-options
    dropdown-icon="img:/icons/client-profile/form-chevron.svg"
    popup-content-class="profile-glass-menu"
    behavior="menu"
    :options-dense="true"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <template v-if="$slots.prepend" #prepend><slot name="prepend" /></template>
    <template #option="scope"
      ><slot name="option" v-bind="scope">
        <q-item
          v-bind="scope.itemProps"
          class="profile-glass-option"
          :class="{ 'profile-glass-option--selected': scope.selected }"
        >
          <q-item-section>{{ optionText(scope.opt) }}</q-item-section>
          <q-item-section v-if="scope.selected" side
            ><q-icon name="check" size="14px"
          /></q-item-section> </q-item
      ></slot>
    </template>
    <template #no-option
      ><slot name="no-option"
        ><q-item><q-item-section>Nenhuma opção disponível.</q-item-section></q-item></slot
      ></template
    >
  </q-select>
</template>
<script setup>
import { ref } from 'vue'
const select = ref(null)
const optionText = (option) =>
  typeof option === 'object' ? (option.label ?? option.name ?? option.value) : option
defineExpose({ hidePopup: () => select.value?.hidePopup() })
defineProps({
  modelValue: { type: [String, Number, Boolean, Array], default: null },
  options: { type: Array, default: () => [] },
})
defineEmits(['update:modelValue'])
</script>
<style>
.profile-glass-menu {
  padding: 6px;
  color: #d8e2ee;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  backdrop-filter: blur(20px);
  box-shadow: 4px 4px 12px rgba(0, 0, 0, 0.13);
  max-width: calc(100vw - 24px);
}
.profile-glass-menu .q-virtual-scroll__content {
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.profile-glass-menu .profile-glass-option {
  min-height: 36px;
  padding: 6px 10px;
  border: 0.8px solid transparent;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.02);
  font-size: 12px;
}
.profile-glass-menu .profile-glass-option--selected {
  color: #fff;
  border-color: rgba(255, 255, 255, 0.2);
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.12),
    rgba(255, 255, 255, 0.04),
    rgba(255, 255, 255, 0.1)
  );
}
.profile-glass-menu .q-item__section--side {
  color: #fff;
  padding-left: 8px;
}
.glass-select .q-select__dropdown-icon {
  width: 10px;
  height: 10px;
  font-size: 10px;
}
.glass-select .q-field__native > span {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
