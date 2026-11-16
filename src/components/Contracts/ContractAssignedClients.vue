<template>
  <div class="assigned-clients">
    <div v-for="(row, index) in allocations" :key="row.clientId" class="assigned-clients__card">
      <div class="assigned-clients__heading">
        <span class="assigned-clients__avatar"
          ><img src="/icons/contracts/distribution/user.svg" alt=""
        /></span>
        <div>
          <strong>{{ row.displayName || 'Cliente' }}</strong
          ><small>{{ documentLabel(row) }}</small>
          <span class="assigned-clients__badge">Atribuído</span>
        </div>
      </div>
      <dl>
        <div>
          <dt>Valor</dt>
          <dd>{{ money(row.allocatedAmount, currency) }}</dd>
        </div>
        <div>
          <dt>Participação</dt>
          <dd>{{ state.percentages[index].replace('.', ',') }}%</dd>
        </div>
      </dl>
    </div>
    <div v-if="allocations.length" class="assigned-clients__total">
      <span>Total distribuído</span
      ><strong
        >{{ money(centsDecimal(state.total), currency) }} ·
        {{ state.totalPercentage.replace('.', ',') }}%</strong
      >
    </div>
    <p v-if="allocations.length">
      Para incluir outro cliente, use Adicionar Cliente: a distribuição reabre com os valores já
      atribuídos e o cliente novo em branco; a soma tem de fechar com o Capital Inicial Contratual.
    </p>
    <div v-else class="contract-empty">
      <img src="/icons/contracts/users-empty.svg" alt="" />
      <p>Nenhum cliente vinculado. Adicione pelo menos um.</p>
    </div>
    <div class="assigned-clients__action">
      <q-btn outline no-caps class="full-width" @click="$emit('add')"
        ><img src="/icons/contracts/distribution/plus.svg" alt="" />Adicionar Cliente</q-btn
      >
    </div>
  </div>
</template>
<script setup>
import { computed, watch, onScopeDispose } from 'vue'
import { distributionState, centsDecimal } from 'src/services/contractDistribution'
import { distributionCustomers } from 'src/services/contractDistributionCustomers'
import { useFinanceResource } from 'src/composables/useFinanceResource'
import { money } from 'src/services/financeService'
const props = defineProps({
  allocations: { type: Array, required: true },
  capital: { type: [String, Number], default: null },
  currency: { type: String, default: 'BRL' },
  lookup: { type: Function, default: distributionCustomers },
})
defineEmits(['add'])
const state = computed(() => distributionState(props.allocations, props.capital))
const metadata = useFinanceResource()
let active = true
onScopeDispose(() => {
  active = false
  metadata.reset()
})
watch(
  () => props.allocations.map((row) => row.clientId).join(','),
  () => {
    metadata.load(async () =>
      props.allocations.length ? (await props.lookup({}, () => active)).customers || [] : [],
    )
  },
  { immediate: true },
)
function documentLabel(row) {
  const customer = metadata.state.data?.find((item) => item.customerId === row.clientId)
  return (
    customer?.maskedDocument ||
    row.maskedDocument ||
    (metadata.state.loading
      ? 'Carregando documento...'
      : metadata.state.error
        ? 'Documento indisponível'
        : 'Documento não informado')
  )
}
</script>
<style scoped>
.assigned-clients {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.assigned-clients__card {
  padding: 12px;
  border: 1px solid #ffffff33;
  border-radius: 10px;
  background: #ffffff0f;
  color: #fff;
}
.assigned-clients__heading {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  min-width: 0;
}
.assigned-clients__heading > div {
  display: flex;
  flex-direction: column;
  min-width: 0;
  flex: 1;
  overflow-wrap: anywhere;
}
.assigned-clients__heading strong {
  font-size: 14px;
  font-weight: 600;
  line-height: 20px;
}
.assigned-clients__heading small {
  font-size: 10px;
  color: #ffffffb8;
}
.assigned-clients__avatar {
  display: grid;
  place-items: center;
  flex: none;
  width: 32px;
  height: 32px;
  border: 1px solid #fff;
  border-radius: 50%;
}
.assigned-clients__avatar img {
  width: 14px;
  height: 14px;
}
.assigned-clients__badge {
  align-self: flex-start;
  margin-top: 4px;
  padding: 3px 8px;
  border: 1px solid #2b7fff;
  border-radius: 8px;
  background: #ffffff1a;
  color: #bedbff;
  font-size: 10px;
}
.assigned-clients dl {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin: 10px 0 0;
  padding-top: 10px;
  border-top: 1px solid #ffffff1f;
}
.assigned-clients dt {
  font-size: 12px;
  color: #ffffffb8;
}
.assigned-clients dd {
  font-size: 14px;
  font-weight: 700;
  margin: 4px 0 0;
  overflow-wrap: anywhere;
  font-variant-numeric: tabular-nums;
}
.assigned-clients__total {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 4px 4px 0;
  font-size: 12px;
}
.assigned-clients__total strong {
  text-align: right;
  overflow-wrap: anywhere;
}
.assigned-clients p {
  font-size: 12px;
  line-height: 18px;
  color: #ffffffb8;
  margin: 0;
}
.assigned-clients__action {
  margin-top: 8px;
  padding-top: 16px;
  border-top: 1px solid #ffffff1f;
}
.assigned-clients :deep(.q-btn) {
  background: linear-gradient(182deg, #0000001f, #00000005);
  min-height: 36px;
  border-radius: 8px;
}
.assigned-clients :deep(.q-btn:before) {
  border: 1px dashed #ffffff1f;
}
.assigned-clients :deep(.q-btn img) {
  width: 16px;
  height: 16px;
  margin-right: 8px;
}
</style>
