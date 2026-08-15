<template>
  <q-card class="ClientComparisonPanel">
    <title-card title="Comparar clientes" @on-close="emit('close')" />
    <q-separator />
    <q-card-section>
      <div class="text-caption text-grey-7 q-mb-md">
        Comparação dos dados disponíveis na listagem administrativa.
      </div>
      <q-table flat dense hide-pagination row-key="field" :rows="comparisonRows" :columns="columns" />
    </q-card-section>
  </q-card>
</template>

<script setup>
import { computed } from 'vue'
import TitleCard from 'src/components/Card/TitleCard.vue'

const props = defineProps({ customers: { type: Array, required: true } })
const emit = defineEmits(['close'])
const statusLabel = (value) => ({ Prospect: 'Prospect', Active: 'Ativo', Suspended: 'Suspenso', Archived: 'Arquivado' })[value] || value || 'Não informado'
const kindLabel = (value) => ({ Person: 'Pessoa física', Organization: 'Pessoa jurídica' })[value] || value || 'Não informado'
const formatDate = (value) => value ? new Intl.DateTimeFormat('pt-BR').format(new Date(value)) : 'Não informado'
const columns = computed(() => [
  { name: 'label', label: 'Dado', field: 'label', align: 'left' },
  ...props.customers.map((customer, index) => ({
    name: `customer-${index}`,
    label: customer.primaryName || customer.displayName || `Cliente ${index + 1}`,
    field: `customer-${index}`,
    align: 'left',
  })),
])
const comparisonRows = computed(() => [
  { field: 'contact', label: 'Contato principal', ...values((customer) => customer.primaryContact || 'Não informado') },
  { field: 'kind', label: 'Tipo', ...values((customer) => kindLabel(customer.kind)) },
  { field: 'status', label: 'Status', ...values((customer) => statusLabel(customer.status)) },
  { field: 'updated', label: 'Atualizado em', ...values((customer) => formatDate(customer.updatedAtUtc || customer.createdAtUtc)) },
])
function values(formatter) {
  return Object.fromEntries(props.customers.map((customer, index) => [`customer-${index}`, formatter(customer)]))
}
</script>
