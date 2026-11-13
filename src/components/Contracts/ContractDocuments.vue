<template>
  <section class="contract-documents">
    <div class="document-toolbar">
      <q-btn outline no-caps label="Adicionar Documento" @click="$emit('add')"
        ><img src="/icons/contracts/ct20-plus.svg" alt=""
      /></q-btn>
    </div>
    <resource-state :state="state" @retry="$emit('retry')"
      ><q-table
        dark
        dense
        flat
        :rows="items"
        :columns="documentColumns"
        row-key="documentId"
        hide-pagination
        :pagination="{ rowsPerPage: 0 }"
        no-data-label="Nenhum documento vinculado."
      >
        <template #body-cell-fileName="s"
          ><q-td :props="s"
            ><img src="/icons/contracts/ct20-file-text.svg" alt="" />{{ s.row.fileName }}</q-td
          ></template
        >
        <template #body-cell-type="s"
          ><q-td :props="s"
            ><q-badge outline>{{
              s.row.documentTypeName || s.row.documentTypeCode || '—'
            }}</q-badge></q-td
          ></template
        >
        <template #body-cell-format="s"
          ><q-td :props="s"
            ><q-badge outline>{{ documentFormat(s.row) }}</q-badge></q-td
          ></template
        >
        <template #body-cell-actions="s"
          ><q-td :props="s"
            ><div class="document-actions">
              <q-btn
                flat
                dense
                :loading="opening === s.row.documentId"
                :disable="Boolean(opening)"
                aria-label="Visualizar documento"
                @click="$emit('open', s.row)"
                ><img src="/icons/contracts/ct20-eye.svg" alt="" /></q-btn
              ><q-btn
                flat
                dense
                :loading="downloading === s.row.documentId"
                :disable="Boolean(downloading)"
                aria-label="Baixar documento"
                @click="$emit('download', s.row)"
                ><img src="/icons/contracts/ct20-download.svg" alt="" /></q-btn
              ><q-btn
                flat
                dense
                :disable="busy"
                aria-label="Desvincular documento"
                @click="$emit('remove', s.row)"
                ><img src="/icons/contracts/ct20-trash2.svg" alt=""
              /></q-btn></div></q-td
        ></template>
        <template #bottom
          ><small
            >{{ items.length }} {{ items.length === 1 ? 'documento' : 'documentos' }}</small
          ></template
        >
      </q-table></resource-state
    >
  </section>
</template>
<script setup>
import { computed } from 'vue'
import ResourceState from 'src/components/Finance/ResourceState.vue'
import { columns, dateLabel } from 'src/services/financeService'
const props = defineProps({
  state: { type: Object, required: true },
  busy: Boolean,
  opening: { type: String, default: null },
  downloading: { type: String, default: null },
})
defineEmits(['retry', 'add', 'open', 'remove', 'download'])
const items = computed(() => props.state.data || [])
const documentColumns = columns([
  ['fileName', 'Nome do Arquivo'],
  ['type', 'Tipo'],
  ['uploadedAtUtc', 'Data de Envio', (r) => dateLabel(r.uploadedAtUtc || r.linkedAtUtc)],
  ['format', 'Formato'],
  ['actions', 'Ações'],
])
const documentFormat = (row) =>
  ({ 'application/pdf': 'PDF', 'image/png': 'PNG', 'image/jpeg': 'JPG' })[row.contentType] ||
  row.fileName?.split('.').at(-1)?.toUpperCase() ||
  '—'
</script>
<style scoped>
.contract-documents {
  color: var(--sa-text, #fff);
}
.document-toolbar {
  margin-bottom: 16px;
}
.document-toolbar img {
  margin-right: 6px;
}
.document-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
}
.contract-documents :deep(.q-table__container) {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 10px;
}
.contract-documents :deep(th) {
  font-size: 10px;
  text-transform: uppercase;
}
.contract-documents :deep(td) {
  font-size: 12px;
}
.contract-documents :deep(td img) {
  vertical-align: middle;
  margin-right: 6px;
}
.contract-documents :deep(td:first-child) {
  white-space: normal;
  overflow-wrap: anywhere;
}
.contract-documents :deep(.q-btn) {
  font-size: 12px;
  text-transform: none;
}
</style>
