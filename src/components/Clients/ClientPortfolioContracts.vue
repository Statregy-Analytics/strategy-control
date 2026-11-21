<template>
  <section
    class="portfolio-contracts"
    :class="{ 'portfolio-contracts--compact': compact }"
    aria-label="Contratos Atrelados à Carteira"
  >
    <header>
      <h3>
        <img v-if="!compact" src="/icons/client-profile/portfolio-contract-heading.svg" alt="" />{{
          compact ? 'Contratos Vinculados' : 'Contratos atrelados à carteira'
        }}
      </h3>
      <q-badge v-if="!compact && !listing.state.loading && !listing.state.error" outline
        >{{ matching.length }} {{ matching.length === 1 ? 'contrato' : 'contratos' }}</q-badge
      >
    </header>
    <resource-state :state="listing.state" @retry="load">
      <div class="portfolio-contracts__body">
        <p v-if="!matching.length" class="text-muted">
          {{
            allCurrencies ? 'Nenhum contrato vinculado.' : 'Nenhum contrato vinculado nesta moeda.'
          }}
        </p>
        <article v-for="row in matching" :key="row.id" class="portfolio-contract">
          <resource-state :state="details[row.id]?.state || emptyState" @retry="loadDetail(row.id)">
            <template v-if="contract(row.id)">
              <template v-if="compact">
                <div class="compact-contract-heading">
                  <span class="compact-contract-icon"
                    ><img src="/icons/wallet-cards/contract-box.svg" alt=""
                  /></span>
                  <div>
                    <h4>{{ row.name }}</h4>
                    <small>{{ row.publicCode }}</small>
                  </div>
                  <span class="compact-contract-currency">{{
                    contract(row.id).currencyCode || '—'
                  }}</span
                  ><span
                    class="compact-contract-status"
                    :class="{
                      'compact-contract-status--active': contract(row.id).statusCode === 'ACTIVE',
                    }"
                    >{{ contract(row.id).status }}</span
                  >
                </div>
                <div class="compact-contract-values">
                  <div>
                    <span>Valor entrada</span
                    ><strong>{{
                      money(contract(row.id).initialValue, contract(row.id).currencyCode)
                    }}</strong>
                  </div>
                  <div>
                    <span>Saldo atual</span
                    ><strong>{{
                      money(contract(row.id).currentValue, contract(row.id).currencyCode)
                    }}</strong>
                  </div>
                </div>
                <p class="compact-contract-engine">
                  <img src="/icons/wallet-cards/engine.svg" alt="" />{{
                    contract(row.id).engineName || '—'
                  }}
                </p>
                <div class="compact-contract-meta">
                  <span
                    >Participação:
                    {{
                      contract(row.id).percentage == null
                        ? '—'
                        : Number(contract(row.id).percentage).toLocaleString('pt-BR') + '%'
                    }}</span
                  ><span>Desde {{ date(contract(row.id).linkedAtUtc) }}</span>
                </div>
                <q-btn
                  outline
                  dense
                  no-caps
                  class="full-width compact-contract-open"
                  :to="{ name: 'contracts', query: { contractId: row.id } }"
                  ><img src="/icons/wallet-cards/contract-open.svg" alt="" />Abrir Contrato</q-btn
                >
              </template>
              <template v-else>
                <div class="portfolio-contract__identity">
                  <div class="portfolio-contract__icon">
                    <img src="/icons/client-profile/portfolio-contract.svg" alt="" />
                  </div>
                  <div>
                    <h4>{{ row.name }}</h4>
                    <div class="portfolio-contract__meta">
                      <span>{{ row.publicCode }}</span
                      ><q-badge
                        outline
                        :color="contract(row.id).statusCode === 'ACTIVE' ? 'positive' : 'grey-5'"
                        >{{ contract(row.id).status }}</q-badge
                      >
                    </div>
                    <p class="portfolio-contract__dates">
                      <img src="/icons/client-profile/portfolio-calendar.svg" alt="" />Vigência:
                      {{ date(contract(row.id).startDate) }} a {{ date(contract(row.id).endDate) }}
                    </p>
                  </div>
                </div>
                <div class="portfolio-contract__values">
                  <profile-fields :columns="5" :fields="fields(contract(row.id))" />
                </div>
                <q-btn
                  class="full-width q-mt-sm"
                  outline
                  dense
                  no-caps
                  size="sm"
                  :to="{ name: 'contracts', query: { contractId: row.id } }"
                  ><img src="/icons/client-profile/portfolio-eye.svg" alt="" class="q-mr-xs" />Ver
                  contrato</q-btn
                >
              </template>
            </template>
            <p v-else-if="details[row.id]?.state.data" class="text-muted">
              Participação do cliente indisponível.
            </p>
          </resource-state>
        </article>
      </div>
    </resource-state>
  </section>
</template>
<script setup>
import { computed, reactive, watch, onScopeDispose } from 'vue'
import { createRequestContext, readCurrentPages } from 'src/services/requestContext'
import ProfileFields from 'src/components/Entity/ProfileFields.vue'
import ResourceState from 'src/components/Finance/ResourceState.vue'
import { useFinanceResource } from 'src/composables/useFinanceResource'
import { financeGet, money, dateLabel } from 'src/services/financeService'
import { projectClientContract } from 'src/services/clientProfileProjection'
const props = defineProps({
  customerId: { type: String, required: true },
  currencyId: { type: String, default: null },
  currencyCode: { type: String, default: null },
  read: { type: Function, default: financeGet },
  compact: Boolean,
  allCurrencies: Boolean,
})
const context = createRequestContext(
  () => `${props.customerId}:${props.currencyId}:${props.currencyCode}:${props.allCurrencies}`,
)
const listing = useFinanceResource(),
  details = reactive({})
const emptyState = { data: null, loading: true, error: '' }
const matching = computed(() =>
  (listing.state.data || []).filter(
    (row) => props.allCurrencies || row.currencyCode === props.currencyCode,
  ),
)
const contract = (id) => projectClientContract(details[id]?.state.data || {}, props.customerId)
const date = dateLabel
const fields = (value) => [
  { label: 'Valor inicial', value: money(value.initialValue, value.currencyCode) },
  { label: 'Valor base', value: money(value.baseValue, value.currencyCode) },
  { label: 'Valor atual', value: money(value.currentValue, value.currencyCode) },
  { label: 'Valor bloqueado', value: money(value.blockedValue, value.currencyCode) },
  {
    label: 'Participação',
    value:
      value.percentage == null
        ? 'Indisponível'
        : `${new Intl.NumberFormat('pt-BR').format(value.percentage)}%`,
  },
]
async function loadDetail(id, customerId = props.customerId) {
  const active = context.capture()
  if (!active()) return
  const resource = (details[id] ||= useFinanceResource())
  await resource.load(async () => {
    const result = (await props.read(`admin/contracts/${id}`)).data
    if (!active()) return null
    if (!result?.participants?.some((item) => item.clientId === customerId))
      throw new Error('Participação indisponível')
    return result
  })
}
async function load() {
  context.invalidate()
  const active = context.capture()
  const customerId = props.customerId
  const currencyCode = props.currencyCode
  for (const id of Object.keys(details)) {
    details[id].reset()
    delete details[id]
  }
  const result = await listing.load(async () => {
    if (!props.customerId) throw Error('Cliente indisponível.')
    if (!props.allCurrencies && (!props.currencyCode || !props.currencyId))
      throw Error('Moeda indisponível.')
    const rows = await readCurrentPages(
      (page) =>
        props.read('admin/contracts', {
          clientId: customerId,
          page,
          pageSize: 100,
        }),
      active,
    )
    if (!rows) return null
    return rows.filter(
      (row) =>
        row.registrationStatus !== 'Draft' &&
        row.clients?.some((client) => client.clientId === customerId),
    )
  })
  if (
    !active() ||
    !result ||
    props.customerId !== customerId ||
    props.currencyCode !== currencyCode
  )
    return
  const rows = result.filter((row) => props.allCurrencies || row.currencyCode === currencyCode)
  let next = 0
  await Promise.allSettled(
    Array.from({ length: Math.min(4, rows.length) }, async () => {
      while (active() && next < rows.length) await loadDetail(rows[next++].id, customerId)
    }),
  )
}
watch(() => [props.customerId, props.currencyId, props.currencyCode, props.allCurrencies], load, {
  immediate: true,
  flush: 'sync',
})
onScopeDispose(() => {
  context.dispose()
  listing.reset()
  Object.values(details).forEach((item) => item.reset())
})
</script>
<style scoped>
.portfolio-contracts {
  margin: 24px 0;
  border: 1px solid var(--sa-border);
  border-radius: 10px;
  background: var(--sa-surface-soft);
}
.portfolio-contracts > header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--sa-border);
}
h3 {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  font-size: 12px;
  line-height: 18px;
  font-weight: 600;
  text-transform: uppercase;
  color: var(--sa-muted);
}
.portfolio-contracts__body {
  display: grid;
  gap: 12px;
  padding: 16px;
}
.portfolio-contract {
  min-width: 0;
  padding: 16px;
  border: 1px solid var(--sa-border);
  border-radius: 10px;
  background: var(--sa-surface-soft);
}
.portfolio-contract__identity {
  display: flex;
  align-items: center;
  gap: 12px;
}
.portfolio-contract__identity > div:last-child {
  min-width: 0;
}
.portfolio-contract__icon {
  display: flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: 1px solid var(--sa-border);
  border-radius: 9px;
}
h4 {
  margin: 0 0 6px;
  font-size: 14px;
  line-height: 22px;
  font-weight: 700;
  overflow-wrap: anywhere;
}
.portfolio-contract__meta,
.portfolio-contract__dates {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  color: var(--sa-muted);
  font-size: 10px;
}
.portfolio-contract__dates {
  margin: 8px 0 0;
}
.portfolio-contract__values {
  margin-top: 12px;
  padding: 12px;
  border: 1px solid var(--sa-border);
  border-radius: 10px;
  background: var(--sa-surface-soft);
}
.portfolio-contract__values :deep(dt) {
  font-size: 10px;
  letter-spacing: 0;
}
.portfolio-contract__values :deep(dd) {
  font-size: 12px;
}
</style>

<style scoped>
.portfolio-contracts--compact {
  margin: 0;
  border: 0;
  background: transparent;
}
.portfolio-contracts--compact > header {
  padding: 0;
  margin-bottom: 16px;
  border: 0;
}
.portfolio-contracts--compact h3 {
  color: white;
  text-transform: none;
  font-size: 14px;
  line-height: 20px;
  font-weight: 500;
}
.portfolio-contracts--compact .portfolio-contracts__body {
  padding: 0;
  gap: 16px;
}
.portfolio-contracts--compact .portfolio-contract {
  padding: 12px;
  border: 1px solid #ffffff33;
  border-radius: 12px;
  background: #ffffff0d;
}
.compact-contract-heading {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}
.compact-contract-icon {
  display: grid;
  place-items: center;
  flex: none;
  width: 32px;
  height: 32px;
  border: 1px solid #ffffff33;
  border-radius: 8px;
  background: linear-gradient(90deg, #ffffff14, #ffffff08, #ffffff12);
}
.compact-contract-heading > div {
  flex: 1;
  min-width: 0;
}
.portfolio-contracts--compact h4 {
  font:
    500 14px/20px Inter,
    sans-serif;
  margin: 0;
  color: white;
}
.compact-contract-heading small {
  font: 400 10px/16px monospace;
  color: #ffffff99;
}
.compact-contract-currency {
  padding: 2px 8px;
  border: 1px solid #ffffff80;
  border-radius: 6px;
  font:
    400 12px/16px Inter,
    sans-serif;
  color: white;
}
.compact-contract-status {
  padding: 2px 8px;
  border: 1px solid #ffffff80;
  border-radius: 6px;
  font:
    400 10px/16px Inter,
    sans-serif;
  text-transform: uppercase;
}
.compact-contract-status--active {
  color: #7bf1a8;
  border-color: #00c950;
  background: #00c9501a;
}
.compact-contract-values {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-top: 8px;
  font:
    400 12px/16px Inter,
    sans-serif;
  color: #ffffffb8;
}
.compact-contract-values strong {
  display: block;
  color: white;
  font-weight: 600;
  font-size: 14px;
  line-height: 20px;
  overflow-wrap: anywhere;
}
.compact-contract-engine {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #ffffff99;
  margin: 8px 0;
}
.compact-contract-meta {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  font-size: 12px;
  line-height: 16px;
  color: #ffffff99;
  margin: 8px 0;
  flex-wrap: wrap;
}
.compact-contract-open {
  font-size: 12px;
  line-height: 16px;
  min-height: 28px;
  border-radius: 8px;
  background: #ffffff0d;
  color: #ffffffb8;
}
.compact-contract-open :deep(.q-btn__content) {
  gap: 8px;
}
@media (max-width: 600px) {
  .compact-contract-heading {
    flex-wrap: wrap;
  }
  .compact-contract-values {
    gap: 8px;
  }
}
</style>
