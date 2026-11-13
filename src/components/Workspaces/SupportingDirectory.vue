<template>
  <section>
    <q-banner v-if="!available" class="workspace-error" role="status"
      >Consulta indisponível.</q-banner
    ><template v-if="kind === 'authors'"
      ><div class="workspace-cards">
        <article v-for="row in rows" :key="row.id" class="workspace-record">
          <div class="workspace-record-head">
            <q-avatar size="48px">{{ row.name?.slice(0, 1) || '—' }}</q-avatar>
            <div>
              <h2>{{ row.name }}</h2>
              <p>{{ row.role || '—' }}</p>
              <small>{{ row.attribution || '—' }}</small>
            </div>
            <row-actions
              dark
              :actions="[{ name: 'edit', label: 'Editar', icon: 'edit' }]"
              @select="$emit('edit', row)"
            />
          </div>
          <dl>
            <div>
              <dt>Publicações</dt>
              <dd>{{ row.publicationsCount ?? 'Indisponível' }}</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>{{ row.status || '—' }}</dd>
            </div>
          </dl>
          <q-expansion-item v-for="field in authorFields" :key="field.key" :label="field.label"
            ><p class="workspace-preview">
              {{ row[field.key] || 'Não informado' }}
            </p></q-expansion-item
          >
        </article>
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
      <q-table
        dark
        flat
        dense
        :rows="rows"
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
    ><q-dialog :model-value="Boolean(selected)" @update:model-value="!$event && (selected = null)"
      ><q-card class="workspace-modal workspace-modal--wide"
        ><div class="workspace-modal-heading">
          <h2>Detalhes do Parceiro</h2>
          <q-btn
            flat
            dense
            icon="close"
            aria-label="Fechar detalhes do parceiro"
            @click="selected = null"
          />
        </div>
        <p>Visualize e gerencie informações completas do parceiro</p>
        <h3>{{ selected?.name }}</h3>
        <p>{{ selected?.type }}</p>
        <q-btn-toggle
          v-model="partnerTab"
          no-caps
          :options="partnerTabs.map((label) => ({ label, value: label }))" /><template
          v-if="partnerTab === 'Dados Gerais'"
          ><dl class="partner-details">
            <template v-for="field in partnerFields" :key="field.key"
              ><dt>{{ field.label }}</dt>
              <dd>{{ selected?.[field.key] ?? 'Indisponível' }}</dd></template
            >
          </dl></template
        ><q-list v-else-if="partnerTab === 'Serviços'"
          ><q-item v-for="product in selected?.products || []" :key="product"
            ><q-item-section>{{ product }}</q-item-section></q-item
          ></q-list
        >
        <p v-else>Consulta indisponível.</p>
        <div class="workspace-actions">
          <q-btn outline no-caps label="Fechar" @click="selected = null" /><q-btn
            outline
            no-caps
            label="Editar Parceiro"
            @click="editSelected"
          /></div></q-card
    ></q-dialog>
  </section>
</template>
<script setup>
import { ref } from 'vue'
import RowActions from 'src/components/Entity/RowActions.vue'
import { columns, dateLabel } from 'src/services/financeService'
defineProps({
  kind: { type: String, required: true },
  rows: { type: Array, default: () => [] },
  available: Boolean,
})
const emit = defineEmits(['edit'])
function editSelected() {
  const row = selected.value
  selected.value = null
  emit('edit', row)
}
const selected = ref(null),
  partnerTab = ref('Dados Gerais')
const authorFields = [
  { key: 'economicView', label: 'Visão econômica' },
  { key: 'politicalView', label: 'Visão política' },
  { key: 'philosophy', label: 'Filosofia de vida' },
]
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
const partnerTabs = [
  'Dados Gerais',
  'Serviços',
  'Regras',
  'Comissão',
  'Documentos',
  'Procedimentos',
  'Materiais',
  'Histórico',
]
const partnerFields = [
  { key: 'type', label: 'Tipo de Parceiro' },
  { key: 'publicCode', label: 'ID do Parceiro' },
  { key: 'status', label: 'Status' },
  { key: 'updatedAtUtc', label: 'Última Atualização' },
  { key: 'email', label: 'Contato' },
  { key: 'phone', label: 'Telefone' },
]
</script>
<style scoped>
.partner-details {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin: 24px 0;
}
.partner-details dd {
  margin: 0;
}
.workspace-modal :deep(.q-btn-toggle) {
  flex-wrap: wrap;
}
.workspace-record-head > div {
  min-width: 0;
  flex: 1;
}
.workspace-record-head .q-avatar {
  flex: none;
}
</style>
