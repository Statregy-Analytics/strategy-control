<template>
  <div class="entity-table-footer row justify-between items-center q-mt-md">
    <div class="row items-center">
      <span class="q-mr-sm">Itens por página:</span>
      <q-select :dark="dark" options-dense aria-label="Itens por página" dense outlined :model-value="pageSize" :options="pageSizeOptions" dropdown-icon="keyboard_arrow_down" @update:model-value="emit('page-size', $event)" />
      <span class="q-ml-md text-caption">Mostrando {{ firstItem }} a {{ lastItem }} de {{ totalItems }} registros</span>
    </div>
    <q-pagination v-if="totalPages > 1" :model-value="page" color="primary" :max="totalPages" :max-pages="6" size="sm" direction-links @update:model-value="emit('page', $event)" />
  </div>
</template>
<script setup>
defineProps({
  dark: { type: Boolean, default: null },
  page: { type: Number, required: true }, pageSize: { type: Number, required: true },
  totalItems: { type: Number, required: true }, totalPages: { type: Number, required: true },
  firstItem: { type: Number, required: true }, lastItem: { type: Number, required: true },
  pageSizeOptions: { type: Array, default: () => [5, 10, 15, 20] },
})
const emit = defineEmits(['page', 'page-size'])
</script>
<style scoped>
.entity-table-footer { color: rgba(255,255,255,.6); font-size: 12px; }
.entity-table-footer :deep(.q-field__control) { min-height: 32px; }
</style>
