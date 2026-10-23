<template>
  <div v-if="variant === 'customer-selection'" class="selection-footer">
    <span>Página {{ page }} de {{ Math.max(1, totalPages) }}</span>
    <div class="selection-footer__buttons">
      <q-btn
        outline
        dense
        no-caps
        icon="chevron_left"
        label="Anterior"
        :disable="page <= 1"
        @click="emit('page', page - 1)"
      /><q-pagination
        :model-value="page"
        :max="Math.max(1, totalPages)"
        :max-pages="6"
        size="sm"
        outline
        active-color="primary"
        @update:model-value="emit('page', $event)"
      /><q-btn
        outline
        dense
        no-caps
        icon-right="chevron_right"
        label="Próximo"
        :disable="page >= totalPages"
        @click="emit('page', page + 1)"
      />
    </div>
  </div>
  <div v-else class="entity-table-footer row justify-between items-center q-mt-md">
    <div class="row items-center">
      <span class="q-mr-sm">Itens por página:</span>
      <q-select
        :dark="dark"
        options-dense
        aria-label="Itens por página"
        dense
        outlined
        :model-value="pageSize"
        :options="pageSizeOptions"
        dropdown-icon="keyboard_arrow_down"
        @update:model-value="emit('page-size', $event)"
      />
      <span class="q-ml-md text-caption"
        >Mostrando {{ firstItem }} a {{ lastItem }} de {{ totalItems }} registros</span
      >
    </div>
    <q-pagination
      v-if="totalPages > 1"
      :model-value="page"
      color="primary"
      :max="totalPages"
      :max-pages="6"
      size="sm"
      direction-links
      @update:model-value="emit('page', $event)"
    />
  </div>
</template>
<script setup>
defineProps({
  variant: { type: String, default: 'default' },
  dark: { type: Boolean, default: null },
  page: { type: Number, required: true },
  pageSize: { type: Number, required: true },
  totalItems: { type: Number, required: true },
  totalPages: { type: Number, required: true },
  firstItem: { type: Number, required: true },
  lastItem: { type: Number, required: true },
  pageSizeOptions: { type: Array, default: () => [5, 10, 15, 20] },
})
const emit = defineEmits(['page', 'page-size'])
</script>
<style scoped>
.entity-table-footer {
  color: rgba(255, 255, 255, 0.6);
  font-size: 12px;
}
.entity-table-footer :deep(.q-field__control) {
  min-height: 32px;
}
.selection-footer {
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
  border-radius: 6px;
  min-height: 32px;
  font-size: 12px;
  background: rgba(255, 255, 255, 0.06);
}
.selection-footer__buttons :deep(.q-btn:before) {
  border-color: rgba(255, 255, 255, 0.2);
}
</style>
