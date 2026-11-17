<template>
  <q-dialog :model-value="true" @update:model-value="!$event && $emit('close')">
    <q-card class="credit-detail">
      <header class="credit-detail__header">
        <button class="credit-detail__close" aria-label="Fechar" @click="$emit('close')">
          <img src="/icons/credit/icon.svg" alt="" />
        </button>
        <resource-state :state="detail" @retry="$emit('retry-detail')">
          <div class="credit-detail__title">
            <h2>{{ record?.publicCode || 'Detalhes da Operação' }}</h2>
            <span class="credit-detail__badge">{{ workspaceStatus(record?.status) || '—' }}</span
            ><span class="credit-detail__badge">{{ workspaceStatus(record?.kind) || '—' }}</span>
          </div>
          <dl class="credit-detail__summary">
            <div v-for="item in summary" :key="item.label">
              <dt>{{ item.label }}:</dt>
              <dd>{{ item.value }}</dd>
            </div>
          </dl>
        </resource-state>
        <ol class="credit-detail__stages" aria-label="Etapas da operação">
          <li v-for="(stage, index) in stages" :key="stage">
            <credit-stage-badge :label="stage" :current="stage === record?.stage" />
            ><img v-if="index < stages.length - 1" src="/icons/credit/chevron-right.svg" alt="" />
          </li>
        </ol>
        <div class="credit-detail__actions">
          <button v-for="action in actions" :key="action.label" disabled>
            <img :src="'/icons/credit/' + action.icon + '.svg'" alt="" />{{ action.label }}
          </button>
        </div>
      </header>
      <form-section class="credit-detail__section" title="Informações da Operação">
        <resource-state :state="detail" @retry="$emit('retry-detail')">
          <h3>Informações Preenchidas</h3>
          <dl class="credit-detail__information">
            <div>
              <dt>Renda mensal</dt>
              <dd>Indisponível</dd>
            </div>
            <div>
              <dt>Prazo desejado</dt>
              <dd>
                {{ record?.termMonths == null ? 'Não informado' : record.termMonths + ' meses' }}
              </dd>
            </div>
            <div>
              <dt>Finalidade</dt>
              <dd>{{ record?.purpose || 'Não informado' }}</dd>
            </div>
          </dl>
          <h3 class="credit-detail__missing">Informações Faltantes</h3>
          <p>Requisitos da etapa indisponíveis nesta consulta.</p>
        </resource-state>
      </form-section>
      <form-section class="credit-detail__section" title="Documentos da Etapa">
        <resource-state :state="documents" @retry="$emit('retry-documents')">
          <h3>Documentos Enviados</h3>
          <p v-if="!documents.data?.length">Nenhum documento enviado.</p>
          <div
            v-for="doc in documents.data || []"
            :key="doc.documentId"
            class="credit-detail__document"
          >
            <img src="/icons/credit/file-check.svg" alt="" />
            <div>
              <strong>{{ doc.documentTypeName || doc.fileName || 'Documento' }}</strong
              ><small>Enviado em {{ dateLabel(doc.uploadedAtUtc) }}</small>
            </div>
            <button disabled aria-label="Visualizar documento">
              <img src="/icons/credit/eye.svg" alt="" /></button
            ><button disabled aria-label="Baixar documento">
              <img src="/icons/credit/download.svg" alt="" />
            </button>
          </div>
          <h3 class="credit-detail__missing">Documentos Faltantes</h3>
          <p>Requisitos documentais da etapa indisponíveis.</p>
          <details class="credit-detail__future">
            <summary>
              <img src="/icons/credit/chevron-down.svg" alt="" />Documentos Futuros Previstos
            </summary>
            <p>Consulta indisponível.</p>
          </details>
        </resource-state>
      </form-section>
      <form-section
        class="credit-detail__section"
        title="Pré-propostas por Parceiro"
        caption="Estimativas baseadas nas regras cadastradas de cada parceiro"
        ><p>Consulta indisponível.</p></form-section
      >
      <form-section class="credit-detail__section" title="Propostas Finais por Parceiro"
        ><p>Consulta indisponível.</p></form-section
      >
      <form-section
        class="credit-detail__section"
        title="Comparativo de Propostas"
        caption="Compare as propostas liberadas e escolha a melhor para o cliente"
      >
        <q-table
          dark
          flat
          dense
          :rows="[]"
          :columns="proposalColumns"
          hide-pagination
          no-data-label="Consulta de propostas indisponível."
        />
      </form-section>
      <form-section class="credit-detail__section" title="Histórico da Operação">
        <resource-state :state="history" @retry="$emit('retry-history')">
          <p v-if="!history.data?.length">Nenhuma alteração registrada.</p>
          <ol v-else class="credit-detail__timeline">
            <li v-for="(event, index) in history.data" :key="event.id || index">
              <div>
                <strong>{{ auditAction(event.action).label }}</strong
                ><time>{{ auditDate(event.occurredAtUtc) }}</time>
              </div>
              <p v-if="event.fromStatus || event.toStatus">
                {{ workspaceStatus(event.fromStatus) || '—' }} →
                {{ workspaceStatus(event.toStatus) || '—' }}
              </p>
              <p v-if="event.reason">{{ event.reason }}</p>
              <p v-if="event.changedFields?.length">
                {{ event.changedFields.map(auditField).join(', ') }}
              </p>
              <small>Por: {{ event.performedBy?.displayName || 'Não informado' }}</small>
            </li>
          </ol>
        </resource-state>
      </form-section>
    </q-card>
  </q-dialog>
</template>
<script setup>
import { computed } from 'vue'
import CreditStageBadge from './CreditStageBadge.vue'
import { creditStages as stages } from 'src/services/creditDirectoryModel'
import { auditAction, auditDate, auditField } from 'src/services/auditModel'
import FormSection from 'src/components/Entity/FormSection.vue'
import ResourceState from 'src/components/Finance/ResourceState.vue'
import { columns, dateLabel, money } from 'src/services/financeService'
import { workspaceStatus } from 'src/services/adminWorkspaceModel'
const props = defineProps({
  detail: { type: Object, required: true },
  documents: { type: Object, required: true },
  history: { type: Object, required: true },
})
defineEmits(['close', 'retry-detail', 'retry-documents', 'retry-history'])
const record = computed(() => props.detail.data)
const summary = computed(() => [
  { label: 'Cliente', value: record.value?.client?.name || 'Não informado' },
  {
    label: 'Valor solicitado',
    value: money(record.value?.principalAmount, record.value?.currencyIsoCode),
  },
  { label: 'Garantia', value: record.value?.collateral || 'Não informado' },
  { label: 'Responsável', value: 'Indisponível' },
  { label: 'Origem', value: 'Indisponível' },
  { label: 'Parceiros', value: 'Indisponível' },
  { label: 'Criado em', value: dateLabel(record.value?.createdAtUtc) },
  { label: 'Atualizado', value: dateLabel(record.value?.updatedAtUtc) },
])
const actions = [
  { label: 'Editar Operação', icon: 'pen' },
  { label: 'Solicitar Documento', icon: 'upload' },
  { label: 'Inserir Proposta Final', icon: 'plus' },
  { label: 'Alterar Status', icon: 'settings' },
]
const proposalColumns = columns(
  [
    'Parceiro',
    'Valor Aprovado',
    'Valor Líquido',
    'Parcela',
    'Prazo',
    'Taxa a.m.',
    'CET a.m.',
    'Validade',
    'Status',
  ].map((x) => [x, x]),
)
</script>
<style scoped>
.credit-detail {
  width: 894px;
  max-width: calc(100vw - 32px) !important;
  max-height: calc(100dvh - 48px);
  padding: 24px;
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 10px;
  background:
    linear-gradient(125deg, rgba(78, 23, 35, 0.2), rgba(16, 81, 126, 0.2)), rgba(26, 30, 45, 0.94);
  backdrop-filter: blur(20px);
  box-shadow: 4px 4px 6px rgba(0, 0, 0, 0.13);
  overflow: auto;
}
.credit-detail__header {
  position: relative;
  padding: 0 0 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}
.credit-detail__title {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-right: 40px;
  flex-wrap: wrap;
}
.credit-detail h2 {
  font-size: 20px;
  line-height: 28px;
  font-weight: 700;
  margin: 0;
}
.credit-detail__badge {
  font-size: 12px;
  line-height: 16px;
  padding: 3px 10px;
  border: 0.5px solid white;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.2);
}
.credit-detail__close {
  position: absolute;
  right: 0;
  top: 0;
  width: 32px;
  height: 32px;
  display: grid;
  place-items: center;
  border: 1px solid rgba(255, 255, 255, 0.26);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
  cursor: pointer;
}
.credit-detail__summary {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px 16px;
  margin: 12px 0;
}
.credit-detail__summary div {
  display: flex;
  gap: 4px;
  min-width: 0;
  flex-wrap: wrap;
  font-size: 12px;
  line-height: 18px;
}
.credit-detail dt {
  color: rgba(255, 255, 255, 0.72);
}
.credit-detail dd {
  margin: 0;
  overflow-wrap: anywhere;
}
.credit-detail__stages {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  list-style: none;
  padding: 0;
  margin: 16px 0;
}
.credit-detail__stages li {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.72);
}
.credit-detail__stages > li > span:not(.credit-stage) {
  padding: 6px 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 100px;
  background: rgba(255, 255, 255, 0.05);
}
.credit-detail__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.credit-detail__actions button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 5px 10px;
  border: 1px solid rgba(255, 255, 255, 0.26);
  border-radius: 8px;
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.05));
  color: white;
  font: inherit;
  font-size: 14px;
  opacity: 0.5;
}
.credit-detail__section {
  padding: 24px;
  margin-top: 24px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(20px);
}
.credit-detail__section :deep(.form-section__title) {
  font-size: 14px;
  line-height: 20px;
  letter-spacing: 0.7px;
  text-transform: uppercase;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.6);
}
.credit-detail h3 {
  font-size: 12px;
  line-height: 16px;
  text-transform: uppercase;
  font-weight: 400;
  margin: 16px 0 8px;
}
.credit-detail p {
  font-size: 13px;
  line-height: 20px;
  color: rgba(255, 255, 255, 0.72);
  margin: 8px 0;
  overflow-wrap: anywhere;
}
.credit-detail__information {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  font-size: 14px;
  line-height: 20px;
  margin: 0;
}
.credit-detail__information dt {
  font-size: 12px;
}
.credit-detail__missing {
  color: #ffd98a;
}
.credit-detail__document {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  margin: 8px 0;
  background: rgba(255, 255, 255, 0.05);
  font-size: 14px;
}
.credit-detail__document div {
  flex: 1;
  min-width: 0;
  overflow-wrap: anywhere;
}
.credit-detail small {
  display: block;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.72);
}
.credit-detail__document button {
  background: transparent;
  border: 0;
  padding: 4px;
  opacity: 0.5;
  display: grid;
  place-items: center;
}
.credit-detail__future {
  margin-top: 20px;
  font-size: 12px;
}
.credit-detail__future summary {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  text-transform: uppercase;
  list-style: none;
}
.credit-detail__future[open] summary img {
  transform: rotate(180deg);
}
.credit-detail__timeline {
  list-style: none;
  margin: 0;
  padding: 0 0 0 16px;
}
.credit-detail__timeline li {
  position: relative;
  padding: 0 0 24px 16px;
  border-left: 1px solid rgba(255, 255, 255, 0.2);
}
.credit-detail__timeline li:last-child {
  border-left-color: transparent;
  padding-bottom: 0;
}
.credit-detail__timeline li:before {
  content: '';
  position: absolute;
  left: -4px;
  top: 4px;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.72);
}
.credit-detail__timeline li > div {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  font-size: 14px;
}
.credit-detail__timeline time {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.72);
}
.credit-detail__section :deep(.q-table__container) {
  background: transparent;
  max-width: 100%;
  overflow: auto;
}
@media (max-width: 600px) {
  .credit-detail {
    padding: 16px;
  }
  .credit-detail__summary,
  .credit-detail__information {
    grid-template-columns: 1fr;
  }
  .credit-detail__section {
    padding: 16px;
  }
  .credit-detail__timeline li > div {
    flex-direction: column;
    gap: 4px;
  }
}
</style>
