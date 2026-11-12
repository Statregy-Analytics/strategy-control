<template>
  <div v-if="variant === 'audit'" class="audit-footer">
    <span
      >Exibindo {{ totalItems ? lastItem - firstItem + 1 : 0 }} de {{ totalItems }} registros</span
    >
    <div class="audit-footer__buttons">
      <q-btn
        outline
        dense
        no-caps
        label="Anterior"
        :disable="loading || page <= 1"
        @click="emit('page', page - 1)"
      /><span>Página {{ page }} de {{ Math.max(1, totalPages) }}</span
      ><q-btn
        outline
        dense
        no-caps
        label="Próximo"
        :disable="loading || page >= totalPages"
        @click="emit('page', page + 1)"
      />
    </div>
  </div>
  <entity-pagination
    v-else-if="variant === 'customer-selection'"
    :model-value="page"
    :max="totalPages"
    @update:model-value="emit('page', $event)"
  />
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
    <entity-pagination
      :model-value="page"
      :max="totalPages"
      @update:model-value="emit('page', $event)"
    />
  </div>
</template>
<script setup>
import EntityPagination from './EntityPagination.vue'
defineProps({
  variant: { type: String, default: 'default' },
  loading: Boolean,
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
.audit-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  color: rgba(255, 255, 255, 0.72);
  font-size: 14px;
  padding-top: 16px;
}
.audit-footer__buttons {
  display: flex;
  align-items: center;
  gap: 8px;
}
.audit-footer__buttons .q-btn {
  background: rgba(255, 255, 255, 0.06);
  border-radius: 8px;
  height: 32px;
  min-height: 32px;
  padding: 0 12px;
}
.audit-footer__buttons .q-btn:before {
  border-color: rgba(255, 255, 255, 0.2);
}
.entity-table-footer {
  color: rgba(255, 255, 255, 0.6);
  font-size: 12px;
}
.entity-table-footer :deep(.q-field__control) {
  min-height: 32px;
}
</style>
