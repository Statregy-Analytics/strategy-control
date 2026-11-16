<template>
  <div class="assigned-clients" :class="{ 'assigned-clients--wallet': walletMode }">
    <div v-for="(row, index) in allocations" :key="row.clientId" class="assigned-clients__card">
      <div class="assigned-clients__heading">
        <span class="assigned-clients__avatar"
          ><img
            :src="
              walletMode
                ? '/icons/contracts/wallet-capital/2325-797-imgUser.svg'
                : '/icons/contracts/distribution/user.svg'
            "
            alt=""
        /></span>
        <div>
          <strong>{{ row.displayName || 'Cliente' }}</strong
          ><small>{{ documentLabel(row) }}</small>
          <span
            v-if="requestContext?.client.customerId === row.clientId"
            class="assigned-clients__badge"
            >Solicitação {{ requestContext.code }}</span
          >
          <template v-if="walletMode"
            ><span v-for="tag in walletTags(row)" :key="tag" class="assigned-clients__badge">{{
              tag
            }}</span></template
          >
          <span v-else class="assigned-clients__badge">Atribuído</span>
        </div>
        <q-btn
          v-if="walletMode"
          flat
          round
          dense
          icon="close"
          class="assigned-clients__remove"
          :aria-label="`Remover cliente ${row.displayName}`"
          @click="$emit('remove', row.clientId)"
        />
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
      <p v-if="walletMode" class="assigned-clients__origin">
        Origem:
        {{
          row.walletSources?.length
            ? row.walletSources.map(walletOriginLabel).join(' + ')
            : 'Origens do aporte indisponíveis nesta consulta.'
        }}
      </p>
    </div>
    <div v-if="allocations.length" class="assigned-clients__total">
      <span>{{ walletMode ? 'Capital consolidado' : 'Total distribuído' }}</span
      ><strong
        >{{ money(centsDecimal(state.total), currency) }} ·
        {{ state.totalPercentage.replace('.', ',') }}%</strong
      >
    </div>
    <p v-if="walletMode && allocations.length">
      Os valores saem da carteira escolhida em cada linha do vínculo (saldo parado da Carteira
      Strategy ou saldo da Carteira de Depósito) quando o contrato é criado. A participação de cada
      um é o aporte dele ÷ a soma dos aportes, e muda enquanto clientes são adicionados.
    </p>
    <p v-else-if="allocations.length">
      Para incluir outro cliente, use Adicionar Cliente: a distribuição reabre com os valores já
      atribuídos e o cliente novo em branco; a soma tem de fechar com o Capital Inicial Contratual.
    </p>
    <div v-else class="contract-empty">
      <img
        :src="
          walletMode
            ? '/icons/contracts/wallet-capital/1484-71887-imgUsers1.svg'
            : '/icons/contracts/users-empty.svg'
        "
        alt=""
      />
      <p>
        {{
          walletMode
            ? 'Nenhum cliente vinculado. Escolha antes a moeda firmada e adicione pelo menos um.'
            : 'Nenhum cliente vinculado. Adicione pelo menos um.'
        }}
      </p>
    </div>
    <div class="assigned-clients__action">
      <q-btn outline no-caps class="full-width" :disable="!allowAdd" @click="$emit('add')"
        ><img
          :src="
            walletMode
              ? '/icons/contracts/wallet-capital/2325-797-imgPlus.svg'
              : '/icons/contracts/distribution/plus.svg'
          "
          alt=""
        />Adicionar Cliente</q-btn
      >
    </div>
  </div>
</template>
<script setup>
import { computed, watch, onScopeDispose } from 'vue'
import { distributionState, centsDecimal } from 'src/services/contractDistribution'
import { distributionCustomers } from 'src/services/contractDistributionCustomers'
import { useFinanceResource } from 'src/composables/useFinanceResource'
import { walletCapitalTypes, walletOriginLabel } from 'src/services/contractWalletCapital'
import { money } from 'src/services/financeService'
const props = defineProps({
  requestContext: { type: Object, default: null },
  walletMode: Boolean,
  allowAdd: { type: Boolean, default: true },
  allocations: { type: Array, required: true },
  capital: { type: [String, Number], default: null },
  currency: { type: String, default: 'BRL' },
  lookup: { type: Function, default: distributionCustomers },
})
defineEmits(['add', 'remove'])
const walletTags = (row) =>
  walletCapitalTypes
    .map((type) => {
      const codes = [
        ...new Set(
          (row.walletSources || [])
            .filter((line) => line.type === type.key)
            .map((line) => line.currencyIsoCode),
        ),
      ]
      return codes.length ? `${type.label} · ${codes.join(', ')}` : null
    })
    .filter(Boolean)
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
.assigned-clients--wallet .contract-empty {
  min-height: 160px;
  padding: 24px 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  text-align: center;
  border: 1px dashed #ffffff1f;
  border-radius: 10px;
}
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
.assigned-clients :deep(.assigned-clients__remove) {
  min-height: 20px;
  height: 20px;
  width: 20px;
  padding: 0;
  color: #ffffffb8;
  background: transparent;
}
.assigned-clients__origin {
  padding-top: 10px;
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
