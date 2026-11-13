<template>
  <q-dialog :model-value="true" @update:model-value="!$event && $emit('close')">
    <q-card class="participant-detail">
      <header>
        <h2>
          <img src="/icons/contracts/ct10-user.svg" alt="" />Detalhes do Cliente —
          {{ participant.displayName }}
        </h2>
        <q-btn flat round dense icon="close" aria-label="Fechar detalhes" @click="$emit('close')" />
      </header>
      <main>
        <resource-state :state="identity.state" @retry="loadIdentity"
          ><dl class="participant-detail__identity">
            <div>
              <dt>Nome / Razão Social</dt>
              <dd>
                <strong>{{ participant.displayName }}</strong>
              </dd>
            </div>
            <div>
              <dt>Data de Entrada</dt>
              <dd>{{ dateLabel(participant.linkedAtUtc) }}</dd>
            </div>
            <div>
              <dt>Documento</dt>
              <dd>{{ document }}</dd>
            </div>
            <div>
              <dt>Índice do Motor na Entrada</dt>
              <dd>Indisponível</dd>
            </div>
            <div>
              <dt>E-mail</dt>
              <dd>{{ email }}</dd>
            </div>
            <div>
              <dt>Status do Vínculo</dt>
              <dd>Indisponível</dd>
            </div>
          </dl></resource-state
        >
        <section class="participant-detail__summary">
          <h3>Resumo de Participação</h3>
          <dl>
            <div>
              <dt>Participação Inicial</dt>
              <dd>Indisponível</dd>
            </div>
            <div>
              <dt>Participação Atual</dt>
              <dd>{{ percentage(participant.allocationPercentage) }}</dd>
            </div>
            <div>
              <dt>Posição Atual</dt>
              <dd>Indisponível</dd>
            </div>
            <div>
              <dt>Total Depositado</dt>
              <dd class="participant-detail__deposit">
                {{ money(participant.contributedAmount, currency) }}
              </dd>
            </div>
            <div>
              <dt>Total Retirado</dt>
              <dd>Indisponível</dd>
            </div>
          </dl>
        </section>
        <section>
          <h3>
            <img src="/icons/contracts/ct10-arrow-up-right.svg" alt="" />Histórico de
            Depósitos/Aportes
          </h3>
          <q-table
            flat
            dark
            dense
            hide-pagination
            :rows="[]"
            :columns="depositColumns"
            :pagination="{ rowsPerPage: 0 }"
            no-data-label="Consulta indisponível."
          />
        </section>
        <section>
          <h3><img src="/icons/contracts/ct10-coins.svg" alt="" />Distribuições Recebidas</h3>
          <div class="participant-detail__destination">
            <span>Destino dos dividendos deste cliente</span
            ><q-btn-toggle
              :model-value="null"
              disable
              no-caps
              :options="[
                { label: 'Carteira Strategy', value: 'Strategy' },
                { label: 'Carteira de Depósito', value: 'Deposit' },
              ]"
            />
          </div>
          <q-table
            flat
            dark
            dense
            hide-pagination
            :rows="[]"
            :columns="distributionColumns"
            :pagination="{ rowsPerPage: 0 }"
            no-data-label="Consulta indisponível."
          />
        </section>
        <section>
          <h3>
            <img src="/icons/contracts/ct10-history.svg" alt="" />Histórico de Alterações do Vínculo
          </h3>
          <q-table
            flat
            dark
            dense
            hide-pagination
            :rows="[]"
            :columns="historyColumns"
            :pagination="{ rowsPerPage: 0 }"
            no-data-label="Consulta indisponível."
          />
        </section>
      </main>
      <footer><q-btn outline no-caps label="Fechar" @click="$emit('close')" /></footer>
    </q-card>
  </q-dialog>
</template>
<script setup>
import { computed, watch, onScopeDispose } from 'vue'
import ResourceState from 'src/components/Finance/ResourceState.vue'
import { useFinanceResource } from 'src/composables/useFinanceResource'
import { getCustomerIdentificationContact } from 'src/services/customerService'
import { columns, dateLabel, money } from 'src/services/financeService'
const props = defineProps({
  participant: { type: Object, required: true },
  currency: { type: String, required: true },
})
defineEmits(['close'])
const identity = useFinanceResource()
const document = computed(() => {
  const docs = identity.state.data?.personalDocuments || []
  const doc = docs.find((d) => ['CPF', 'NIF', 'CNPJ'].includes(d.documentCode)) || docs[0]
  return doc?.valueMasked || 'Não informado'
})
const email = computed(() => {
  const contacts = (identity.state.data?.contacts || []).filter(
    (c) => c.kind === 'Email' && c.status === 'Active',
  )
  const contact = contacts.find((c) => c.isPrimary) || contacts[0]
  if (!contact?.value) return 'Não informado'
  if (contact.valueMasked) return contact.valueMasked
  const [local, domain] = contact.value.split('@')
  return domain ? local.slice(0, 2) + '•••@' + domain : '••••'
})
const loadIdentity = () =>
  identity.load(() => getCustomerIdentificationContact(props.participant.clientId))
watch(
  () => props.participant.clientId,
  () => {
    identity.reset()
    loadIdentity()
  },
  { immediate: true },
)
onScopeDispose(() => identity.reset())
const percentage = (value) =>
  value == null
    ? 'Indisponível'
    : new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 }).format(value) + '%'
const depositColumns = columns([
  ['date', 'Data'],
  ['type', 'Tipo'],
  ['amount', 'Valor'],
  ['origin', 'Origem (Moeda e Cotação)'],
])
const distributionColumns = columns([
  ['date', 'Data'],
  ['type', 'Tipo'],
  ['amount', 'Valor'],
])
const historyColumns = columns([
  ['date', 'Data/Hora'],
  ['action', 'Ação'],
  ['actor', 'Usuário'],
  ['details', 'Detalhes'],
])
</script>
<style scoped>
.participant-detail {
  width: 880px;
  max-width: calc(100vw - 32px);
  color: var(--sa-text, #fff);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(32px);
  box-shadow: 4px 4px 12px rgba(0, 0, 0, 0.13);
}
.participant-detail header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
  gap: 16px;
}
.participant-detail h2,
.participant-detail h3 {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  line-height: 22px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  margin: 0;
}
.participant-detail h2 {
  overflow-wrap: anywhere;
  min-width: 0;
}
.participant-detail main {
  padding: 24px;
}
.participant-detail dl {
  margin: 0;
}
.participant-detail__identity {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}
.participant-detail dt {
  font-size: 11px;
  text-transform: uppercase;
  line-height: 18px;
}
.participant-detail dd {
  margin: 6px 0 0;
  overflow-wrap: anywhere;
}
.participant-detail section {
  margin-top: 24px;
}
.participant-detail__summary {
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.03);
}
.participant-detail__summary dl {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 12px;
  margin-top: 16px;
}
.participant-detail__summary dd {
  font-size: 16px;
  font-weight: 700;
  margin-top: 16px;
}
.participant-detail__deposit {
  color: #4dd495;
}
.participant-detail :deep(.q-table__container) {
  margin-top: 16px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 12px;
  background: transparent;
}
.participant-detail :deep(th) {
  font-size: 11px;
  text-transform: uppercase;
}
.participant-detail__destination {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 20px;
  font-size: 13px;
}
.participant-detail__destination :deep(.q-btn-toggle) {
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.04);
  box-shadow: none;
}
.participant-detail footer {
  display: flex;
  justify-content: flex-end;
  padding: 16px 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(0, 0, 0, 0.08);
}
@media (max-width: 650px) {
  .participant-detail main {
    padding: 16px;
  }
  .participant-detail__summary dl {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .participant-detail__identity {
    grid-template-columns: 1fr;
  }
}
</style>
