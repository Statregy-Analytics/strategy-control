<template>
  <section>
    <q-banner v-if="!available" class="workspace-error" role="status"
      >Consulta indisponível.</q-banner
    ><template v-if="kind === 'authors'"
      ><div v-if="available && rows.length" class="author-grid">
        <author-card
          v-for="row in rows"
          :key="row.id"
          :author="row"
          @edit="$emit('edit', $event)"
        />
      </div>
      <p v-if="available && !rows.length" class="workspace-empty">
        Nenhum redator encontrado.
      </p></template
    ><template v-else
      ><div class="workspace-metrics">
        <div v-for="label in partnerMetrics" :key="label" class="workspace-metric">
          <small>{{ label }}</small
          ><strong>Indisponível</strong>
        </div>
      </div>
      <div class="workspace-toolbar">
        <q-input
          v-model="search"
          outlined
          dense
          dark
          clearable
          placeholder="Buscar parceiro, produto ou regra..."
          aria-label="Buscar parceiro, produto ou regra..."
          ><template #prepend
            ><img src="/icons/workspace-review/partner-search.svg" alt="" /></template></q-input
        ><q-btn
          class="partner-create"
          outline
          no-caps
          label="Criar Parceiro"
          @click="$emit('create')"
          ><img src="/icons/workspace-review/partner-plus.svg" alt=""
        /></q-btn>
      </div>
      <q-table
        dark
        flat
        dense
        :rows="filteredPartners"
        :columns="partnerColumns"
        row-key="id"
        hide-pagination
        :pagination="{ rowsPerPage: 0 }"
        :no-data-label="available ? 'Nenhum parceiro encontrado.' : 'Consulta indisponível.'"
        ><template #body-cell-name="p"
          ><q-td :props="p"
            ><q-btn flat no-caps :label="p.row.name" @click="selected = p.row" /></q-td></template
        ><template #body-cell-actions="p"
          ><q-td :props="p"
            ><row-actions
              dark
              :actions="[
                { name: 'open', label: 'Abrir', icon: 'visibility' },
                { name: 'edit', label: 'Editar', icon: 'edit' },
              ]"
              @select="
                $event === 'open' ? (selected = p.row) : $emit('edit', p.row)
              " /></q-td></template></q-table></template
    ><partner-details :partner="selected" @close="selected = null" @edit="editSelected" />
  </section>
</template>
<script setup>
import { computed, ref } from 'vue'
import { foldSearch } from 'src/services/adminWorkspaceModel'
import RowActions from 'src/components/Entity/RowActions.vue'
import PartnerDetails from './PartnerDetails.vue'
import AuthorCard from './AuthorCard.vue'
import { columns, dateLabel } from 'src/services/financeService'
const props = defineProps({
  kind: { type: String, required: true },
  rows: { type: Array, default: () => [] },
  available: Boolean,
})
const emit = defineEmits(['edit', 'create'])
const search = ref('')
const filteredPartners = computed(() =>
  props.rows.filter(
    (row) =>
      !search.value ||
      [row.name, row.type, ...(row.products || [])].some((v) =>
        foldSearch(v).includes(foldSearch(search.value)),
      ),
  ),
)
function editSelected() {
  const row = selected.value
  selected.value = null
  emit('edit', row)
}
const selected = ref(null)
const partnerMetrics = [
  'Parceiros Ativos',
  'Produtos Cadastrados',
  'Tabelas Vigentes',
  'Tabelas Vencendo',
  'Maior Comissão',
  'Melhor Conversão',
]
const partnerColumns = columns([
  ['name', 'Parceiro'],
  ['type', 'Tipo'],
  ['products', 'Serviços', (r) => (r.products || []).join(', ') || '—'],
  [
    'commission',
    'Comissão Vigente',
    (r) => (r.commission == null ? 'Indisponível' : r.commission + '%'),
  ],
  ['status', 'Status'],
  ['updatedAtUtc', 'Última Atualização', (r) => dateLabel(r.updatedAtUtc)],
  ['actions', ''],
])
</script>
<style scoped>
.author-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 24px;
}
@media (max-width: 1400px) {
  .author-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (max-width: 900px) {
  .author-grid {
    grid-template-columns: 1fr;
  }
}
</style>

<style scoped>
.workspace-toolbar {
  justify-content: space-between;
}
.workspace-toolbar .q-input {
  flex: 1;
  max-width: 520px;
  min-width: 0;
}
.partner-create :deep(.q-btn__content) {
  flex-direction: row-reverse;
  gap: 8px;
}
</style>
