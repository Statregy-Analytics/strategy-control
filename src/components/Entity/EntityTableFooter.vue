<template>
  <div class="row justify-between items-center q-mt-md">
    <div class="row items-center">
      <span class="q-mr-sm">Itens por página:</span>
      <q-select dense outlined :model-value="pageSize" :options="pageSizeOptions" dropdown-icon="keyboard_arrow_down" @update:model-value="emit('page-size', $event)" />
      <span class="q-ml-md text-caption text-grey-8">Mostrando {{ firstItem }} a {{ lastItem }} de {{ totalItems }} registros</span>
    </div>
    <q-pagination v-if="totalPages > 1" :model-value="page" color="primary" :max="totalPages" :max-pages="6" size="sm" direction-links @update:model-value="emit('page', $event)" />
  </div>
</template>
<script setup>
defineProps({
  page: { type: Number, required: true }, pageSize: { type: Number, required: true },
  totalItems: { type: Number, required: true }, totalPages: { type: Number, required: true },
  firstItem: { type: Number, required: true }, lastItem: { type: Number, required: true },
  pageSizeOptions: { type: Array, default: () => [5, 10, 15, 20] },
})
const emit = defineEmits(['page', 'page-size'])
</script>
