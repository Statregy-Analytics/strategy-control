<template>
  <q-select
    :model-value="modelValue"
    :options="normalizedOptions"
    outlined
    dense
    dark
    dropdown-icon="img:/icons/client-selection/status-dropdown.svg"
    popup-content-class="customer-filter-menu"
    options-selected-class="customer-filter-option--selected"
    emit-value
    map-options
    :display-value="modelValue == null ? placeholder : undefined"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <template #option="scope">
      <q-item
        v-bind="scope.itemProps"
        class="customer-filter-option"
        :class="{ 'customer-filter-option--selected': scope.opt.value === modelValue }"
        :aria-selected="scope.opt.value === modelValue"
      >
        <img
          class="customer-filter-option__curve"
          :src="`/icons/client-selection/${scope.opt.value === modelValue ? 'status-option-selected' : 'status-option-curve'}.svg`"
          alt=""
          width="120"
          height="7"
        />
        <q-item-section>{{ scope.opt.label }}</q-item-section>
        <q-item-section v-if="scope.opt.value === modelValue" side>
          <img src="/icons/client-selection/status-selected.svg" alt="" width="16" height="16" />
        </q-item-section>
      </q-item>
    </template>
  </q-select>
</template>
<script setup>
import { computed } from 'vue'
const props = defineProps({
  modelValue: { type: [String, Number], default: null },
  options: { type: Array, default: () => [] },
  placeholder: { type: String, default: '' },
})
defineEmits(['update:modelValue'])
const normalizedOptions = computed(() =>
  props.options.map((option) =>
    typeof option === 'object' ? option : { label: option, value: option },
  ),
)
</script>

<style>
/* QSelect teleports its menu outside the page; scope it by its dedicated class. */
.customer-filter-menu {
  width: 142px;
  padding: 10px;
  color: #fff;
  border: 0.8px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  background: linear-gradient(
    86.19deg,
    rgba(24, 33, 51, 0.2),
    rgba(24, 33, 51, 0.15),
    rgba(24, 33, 51, 0.2)
  );
  backdrop-filter: blur(1.5px);
  box-shadow: 4px 4px 12px rgba(0, 0, 0, 0.13);
}
.customer-filter-menu .q-virtual-scroll__content {
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.customer-filter-menu .customer-filter-option {
  position: relative;
  width: 120px;
  min-height: 26px;
  padding: 3px 10px;
  border-radius: 0 0 6px 6px;
  color: #fff;
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
}
.customer-filter-menu .customer-filter-option--selected {
  background: rgba(255, 255, 255, 0.12);
}
.customer-filter-option__curve {
  position: absolute;
  left: 0;
  bottom: 0;
  pointer-events: none;
}
.customer-filter-menu .q-item__section {
  position: relative;
  min-width: 0;
}
.customer-filter-menu .q-item__section--side {
  padding-left: 4px;
}
</style>
