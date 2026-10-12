<template>
  <q-banner v-if="error" role="alert">{{ error }}</q-banner>
  <form-section title="Status do contrato">
    <q-select
      v-model="statusId"
      :options="statuses"
      option-label="name"
      option-value="id"
      emit-value
      map-options
      outlined
      dense
      aria-label="Novo status"
    />
    <q-btn
      flat
      dense
      no-caps
      label="Alterar status"
      :disable="!statusId || busy"
      @click="write('post', 'status', { statusId })"
    />
  </form-section>
  <form-section v-if="detail?.registrationStatus !== 'Draft'" title="Participantes">
    <q-list separator
      ><q-item v-for="p in detail?.participants || []" :key="p.clientId"
        ><q-item-section
          >{{ p.displayName }} —
          {{ money(p.allocatedAmount, detail?.currency?.isoCode) }}</q-item-section
        ><q-item-section side
          ><q-btn
            flat
            dense
            icon="link_off"
            aria-label="Desvincular participante"
            :disable="busy"
            @click="confirmRemove(`participants/${p.clientId}`)" /></q-item-section></q-item
    ></q-list>
    <customer-select v-model="participantId" class="q-mt-md" />
    <label-form text-label="Valor alocado" class="q-mt-md"
      ><q-input
        v-model.number="allocation"
        type="number"
        min="0"
        step="0.01"
        outlined
        dense
        aria-label="Valor alocado"
    /></label-form>
    <q-btn
      flat
      dense
      no-caps
      label="Vincular participante"
      :disable="!participantId || busy"
      @click="
        write('post', 'participants', { clientId: participantId, allocatedAmount: allocation })
      "
    />
  </form-section>
  <form-section
    title="Documentos"
    caption="Vincule documentos já enviados pelo cliente e escolha quais ficam visíveis no portal."
  >
    <resource-state :state="documents.state" @retry="loadDocuments">
      <q-list separator
        ><q-item v-for="d in documents.state.data || []" :key="d.documentId"
          ><q-item-section
            >{{ d.fileName
            }}<q-item-label caption>{{
              d.visibleToClient ? 'Liberado ao cliente' : 'Uso interno'
            }}</q-item-label></q-item-section
          ><q-item-section side
            ><div>
              <q-btn
                flat
                dense
                :icon="d.visibleToClient ? 'visibility_off' : 'visibility'"
                :aria-label="d.visibleToClient ? 'Ocultar do cliente' : 'Liberar ao cliente'"
                :disable="busy"
                @click="
                  write(
                    'patch',
                    `documents/${d.documentId}`,
                    { visibleToClient: !d.visibleToClient },
                    loadDocuments,
                  )
                "
              /><q-btn
                flat
                dense
                icon="link_off"
                aria-label="Desvincular documento"
                :disable="busy"
                @click="confirmRemove(`documents/${d.documentId}`, loadDocuments)"
              /></div></q-item-section></q-item
      ></q-list>
      <p v-if="!documents.state.data?.length" class="text-muted">Nenhum documento vinculado.</p>
    </resource-state>
    <label-form text-label="Cliente do documento"
      ><q-select
        v-model="documentClient"
        :options="detail?.participants || []"
        option-value="clientId"
        option-label="displayName"
        emit-value
        map-options
        outlined
        dense
        aria-label="Cliente do documento"
    /></label-form>
    <customer-document-select v-model="documentId" :customer-id="documentClient" class="q-mt-md" />
    <q-checkbox v-model="visibleToClient" label="Liberar ao cliente" />
    <q-btn
      flat
      dense
      no-caps
      label="Vincular documento"
      :disable="!documentId || busy"
      @click="
        write(
          'post',
          'documents',
          { documentId, description: null, visibleToClient },
          loadDocuments,
        )
      "
    />
  </form-section>
  <form-section
    title="Universo de ativos elegíveis"
    caption="Selecione os ativos de bolsa e cripto permitidos para este contrato."
  >
    <finance-table
      ref="assetsTable"
      :path="`admin/contracts/${contractId}/assets`"
      :columns="assetColumns"
      row-key="contractAssetId"
    >
      <template #body-cell-actions="p"
        ><q-td :props="p"
          ><q-btn
            flat
            dense
            icon="link_off"
            aria-label="Remover ativo"
            :disable="busy"
            @click="
              confirmRemove(`assets/${p.row.contractAssetId}`, () => assetsTable.reload())
            " /></q-td
      ></template>
    </finance-table>
    <q-input
      v-model="assetSearch"
      class="q-mt-md"
      outlined
      dense
      debounce="350"
      placeholder="Buscar ativos elegíveis"
      aria-label="Buscar ativos elegíveis"
      @update:model-value="loadAssetOptions"
    />
    <resource-state :state="assetOptions.state" @retry="loadAssetOptions"
      ><q-select
        v-model="assetIds"
        class="q-mt-sm"
        multiple
        use-chips
        :options="assetOptions.state.data || []"
        option-value="id"
        :option-label="(a) => `${a.ticker} · ${a.name}`"
        emit-value
        map-options
        outlined
        dense
        aria-label="Ativos para adicionar"
    /></resource-state>
    <q-btn
      flat
      dense
      no-caps
      label="Adicionar ativos"
      :disable="!assetIds.length || busy"
      @click="
        write('post', 'assets', { presetSetId: null, assetIds, assets: null }, () => {
          assetsTable.reload()
          assetIds = []
        })
      "
    />
    <q-btn flat dense no-caps label="Exportar ativos" :loading="exporting" @click="exportAssets" />
  </form-section>
  <form-section title="Histórico"
    ><finance-table
      ref="history"
      :path="`admin/contracts/${contractId}/history`"
      :columns="historyColumns"
  /></form-section>
</template>
<script setup>
import { ref } from 'vue'
import { useQuasar } from 'quasar'
import FormSection from 'src/components/Entity/FormSection.vue'
import LabelForm from 'src/components/Form/LabelForm.vue'
import ResourceState from './ResourceState.vue'
import FinanceTable from './FinanceTable.vue'
import CustomerDocumentSelect from './CustomerDocumentSelect.vue'
import CustomerSelect from './CustomerSelect.vue'
import { useFinanceResource } from 'src/composables/useFinanceResource'
import {
  financeGet,
  financeWrite,
  financeExport,
  columns,
  money,
  dateLabel,
} from 'src/services/financeService'
const props = defineProps({
  contractId: { type: String, required: true },
  detail: { type: Object, default: null },
  statuses: { type: Array, default: () => [] },
})
const emit = defineEmits(['changed']),
  $q = useQuasar()
const documents = useFinanceResource(),
  assetOptions = useFinanceResource()
const statusId = ref(null),
  participantId = ref(null),
  allocation = ref(null),
  documentClient = ref(null),
  documentId = ref(null),
  visibleToClient = ref(false),
  busy = ref(false),
  error = ref(''),
  assetSearch = ref(''),
  assetIds = ref([]),
  assetsTable = ref(),
  history = ref(),
  exporting = ref(false)
const assetColumns = columns([
  ['ticker', 'Código'],
  ['name', 'Ativo'],
  ['assetType', 'Tipo'],
  ['market', 'Mercado / rede', (r) => r.market?.name || r.network?.name || '—'],
  ['actions', 'Ações'],
])
const historyColumns = columns([
  ['occurredAtUtc', 'Data', (r) => dateLabel(r.occurredAtUtc)],
  ['action', 'Evento'],
  ['actor', 'Responsável', (r) => r.performedBy?.displayName || '—'],
])
const loadDocuments = () =>
  documents.load(
    async () => (await financeGet(`admin/contracts/${props.contractId}/documents`)).data,
  )
const loadAssetOptions = () =>
  assetOptions.load(
    async () =>
      (
        await financeGet('admin/contracts/catalog/assets', {
          search: assetSearch.value || undefined,
          page: 1,
          pageSize: 100,
        })
      ).data,
  )
async function write(method, suffix, payload, reload) {
  busy.value = true
  error.value = ''
  try {
    await financeWrite(method, `admin/contracts/${props.contractId}/${suffix}`, payload)
    if (reload) await reload()
    history.value?.reload()
    if (suffix === 'status' || suffix.startsWith('participants')) emit('changed')
    $q.notify({ type: 'positive', message: 'Alteração salva.' })
  } catch {
    error.value = 'Não foi possível concluir a alteração. Confira os dados e tente novamente.'
  } finally {
    busy.value = false
  }
}
function confirmRemove(suffix, reload) {
  $q.dialog({
    title: 'Remover vínculo',
    message: 'Confirma a remoção deste vínculo do contrato?',
    cancel: true,
  }).onOk(() => write('delete', suffix, undefined, reload))
}
async function exportAssets() {
  exporting.value = true
  try {
    await financeExport(
      `admin/contracts/${props.contractId}/assets/export`,
      { format: 'csv' },
      'ativos-contrato.csv',
    )
  } catch {
    error.value = 'Não foi possível exportar os ativos.'
  } finally {
    exporting.value = false
  }
}
loadDocuments()
loadAssetOptions()
</script>
