<template>
  <section class="portfolio-contracts" aria-label="Contratos atrelados à carteira">
    <header>
      <h3>
        <img src="/icons/client-profile/portfolio-contract-heading.svg" alt="" />Contratos atrelados
        à carteira
      </h3>
      <q-badge v-if="!listing.state.loading && !listing.state.error" outline
        >{{ matching.length }} {{ matching.length === 1 ? 'contrato' : 'contratos' }}</q-badge
      >
    </header>
    <resource-state :state="listing.state" @retry="load">
      <div class="portfolio-contracts__body">
        <p v-if="!matching.length" class="text-muted">Nenhum contrato vinculado nesta moeda.</p>
        <article v-for="row in matching" :key="row.id" class="portfolio-contract">
          <resource-state :state="details[row.id]?.state || emptyState" @retry="loadDetail(row.id)">
            <template v-if="contract(row.id)">
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
import { computed, reactive, watch } from 'vue'
import ProfileFields from 'src/components/Entity/ProfileFields.vue'
import ResourceState from 'src/components/Finance/ResourceState.vue'
import { useFinanceResource } from 'src/composables/useFinanceResource'
import { financeGet, money, dateLabel } from 'src/services/financeService'
import { projectClientContract } from 'src/services/clientProfileProjection'
const props = defineProps({
  customerId: { type: String, required: true },
  currencyId: { type: String, required: true },
  currencyCode: { type: String, required: true },
})
const listing = useFinanceResource(),
  details = reactive({})
const emptyState = { data: null, loading: true, error: '' }
const matching = computed(() =>
  (listing.state.data || []).filter((row) => row.currencyCode === props.currencyCode),
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
  const resource = (details[id] ||= useFinanceResource())
  await resource.load(async () => {
    const result = (await financeGet(`admin/contracts/${id}`)).data
    if (!result?.participants?.some((item) => item.clientId === customerId))
      throw new Error('Participação indisponível')
    return result
  })
}
async function load() {
  const customerId = props.customerId
  const currencyCode = props.currencyCode
  for (const id of Object.keys(details)) {
    details[id].reset()
    delete details[id]
  }
  const result = await listing.load(async () => {
    const rows = []
    let page = 1,
      totalPages = 1
    do {
      const result = await financeGet('admin/contracts', {
        clientId: customerId,
        page,
        pageSize: 100,
      })
      rows.push(...(result.data || []))
      totalPages = Number(result.pagination?.totalPages || 1)
      page += 1
    } while (page <= totalPages)
    return rows.filter((row) => row.clients?.some((client) => client.clientId === customerId))
  })
  if (!result || props.customerId !== customerId || props.currencyCode !== currencyCode) return
  await Promise.allSettled(
    result
      .filter((row) => row.currencyCode === currencyCode)
      .map((row) => loadDetail(row.id, customerId)),
  )
}
watch(() => [props.customerId, props.currencyId], load, { immediate: true })
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
