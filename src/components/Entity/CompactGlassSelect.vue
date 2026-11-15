<template>
  <glass-select
    :model-value="modelValue"
    :options="options"
    :placeholder="placeholder"
    popup-class="compact-glass-menu"
    :popup-content-style="{ width: `${menuWidth}px` }"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <template #option="scope">
      <div class="compact-glass-row">
        <div v-if="scope.opt.groupLabel" class="compact-glass-group" role="presentation">
          {{ scope.opt.groupLabel }}
        </div>
        <q-item
          v-bind="scope.itemProps"
          class="compact-glass-option"
          :class="{ 'compact-glass-option--selected': scope.selected }"
          :title="scope.opt.disable ? unavailableText : undefined"
          :aria-description="scope.opt.disable ? unavailableText : undefined"
        >
          <q-item-section>
            <span
              ><span v-if="scope.selected" class="compact-glass-check" aria-hidden="true">✓</span
              >{{ scope.opt.label }}</span
            >
          </q-item-section>
        </q-item>
      </div>
    </template>
  </glass-select>
</template>
<script setup>
import GlassSelect from './GlassSelect.vue'
defineProps({
  modelValue: { type: [String, Number, Boolean], default: null },
  options: { type: Array, default: () => [] },
  placeholder: { type: String, default: '' },
  menuWidth: { type: Number, default: 300 },
  unavailableText: { type: String, default: 'Dados indisponíveis nesta consulta.' },
})
defineEmits(['update:modelValue'])
</script>
<style>
.compact-glass-menu.profile-glass-menu {
  padding: 7px 7px 13px;
  max-width: calc(100vw - 24px);
  border-radius: 10px;
  background: rgba(25, 32, 43, 0.94);
  color: #fff;
  color-scheme: dark;
  scrollbar-color: rgba(255, 255, 255, 0.3) transparent;
  scrollbar-width: thin;
}
.compact-glass-menu .q-virtual-scroll__content {
  display: block;
}
.compact-glass-row + .compact-glass-row {
  margin-top: 4px;
}
.compact-glass-group {
  height: 24px;
  display: flex;
  align-items: center;
  padding: 0 2px;
  color: rgba(171, 184, 204, 0.9);
  font-size: 10px;
  font-weight: 600;
}
.compact-glass-option {
  min-height: 28px;
  padding: 0 8px;
  border-radius: 6px;
  font-size: 12px;
  line-height: 16px;
}
.compact-glass-option .q-item__section {
  min-width: 0;
  overflow-wrap: anywhere;
}
.compact-glass-option--selected {
  background: rgba(0, 163, 255, 0.12);
  color: #00a3ff;
  font-weight: 600;
}
.compact-glass-check {
  display: inline-block;
  margin-right: 6px;
}
.compact-glass-option.disabled {
  opacity: 0.6 !important;
}
.compact-glass-option.q-manual-focusable--focused {
  outline: 1px solid #00a3ff;
  outline-offset: -1px;
}
</style>
