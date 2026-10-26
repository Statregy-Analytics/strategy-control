<template>
  <div class="selection-footer">
    <span>Página {{ modelValue }} de {{ Math.max(1, max) }}</span>
    <div class="selection-footer__buttons">
      <q-btn
        outline
        dense
        no-caps
        class="selection-footer__direction"
        label="Anterior"
        :disable="modelValue <= 1"
        @click="emit('update:modelValue', modelValue - 1)"
      /><q-pagination
        :model-value="modelValue"
        :max="Math.max(1, max)"
        :max-pages="6"
        size="sm"
        outline
        active-color="primary"
        @update:model-value="emit('update:modelValue', $event)"
      /><q-btn
        outline
        dense
        no-caps
        class="selection-footer__direction"
        label="Próximo"
        :disable="modelValue >= max"
        @click="emit('update:modelValue', modelValue + 1)"
      />
    </div>
  </div>
</template>
<script setup>
defineProps({ modelValue: { type: Number, required: true }, max: { type: Number, required: true } })
const emit = defineEmits(['update:modelValue'])
</script>
<style scoped>
.selection-footer {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
  margin-top: 24px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
}
.selection-footer__buttons {
  display: flex;
  align-items: center;
  gap: 8px;
}
.selection-footer__buttons :deep(.q-btn) {
  border-radius: 8px;
  min-height: 32px;
  height: 32px;
  min-width: 32px;
  font-size: 14px;
  background: rgba(255, 255, 255, 0.06);
}
.selection-footer__buttons :deep(.q-btn:before) {
  border-color: rgba(255, 255, 255, 0.2);
}
.selection-footer__buttons :deep(.q-pagination .q-btn) {
  color: #fff !important;
  width: 32px;
  padding: 0;
  margin: 0;
}
.selection-footer__buttons :deep(.q-pagination__content) {
  gap: 8px;
}
.selection-footer__direction {
  width: 80px;
  padding: 0;
}
.selection-footer__buttons :deep(.q-pagination .q-btn.bg-primary) {
  color: #fff !important;
  background: rgba(255, 255, 255, 0.16) !important;
}
.selection-footer__buttons :deep(.q-pagination .q-btn.bg-primary:before) {
  border: 1px solid rgba(255, 255, 255, 0.45);
}
</style>
