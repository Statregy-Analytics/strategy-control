<template>
  <q-dialog :model-value="true" @update:model-value="$emit('close')"
    ><q-card class="contract-flow contract-requests"
      ><header>
        <h2>Solicitações de Contrato</h2>
        <q-btn flat round dense aria-label="Fechar" @click="$emit('close')"
          ><img :src="icon('Icon')" alt=""
        /></q-btn>
      </header>
      <div class="contract-flow__body">
        <div class="contract-flow__box contract-requests__info">
          <information-icon />
          <p>
            Pedidos feitos pelos clientes no "Quero Conhecer" da Área do Cliente. A solicitação não
            mexe em saldo: o assessor entra em contato, combina a moeda firmada, as moedas e as
            carteiras e cria o contrato ou inclui o cliente num contrato aberto; o aporte só sai das
            carteiras do cliente nessa hora.
          </p>
        </div>
        <div class="contract-requests__filters" role="tablist" aria-label="Status da solicitação">
          <button
            v-for="item in requestStatuses"
            :key="item.value"
            role="tab"
            :aria-selected="status === item.value"
            @click="status = item.value"
          >
            {{ item.label }} <strong>{{ counts[item.value] ?? '—' }}</strong>
          </button>
        </div>
        <resource-state :state="resource.state" @retry="load"
          ><table>
            <thead>
              <tr>
                <th>Enviada em</th>
                <th>Cliente</th>
                <th>Objetivo e prazo</th>
                <th>Valor</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in rows" :key="row.id">
                <td>{{ when(row.submittedAtUtc) }}</td>
                <td>
                  <strong>{{ row.client?.displayName || 'Indisponível' }}</strong
                  ><small>{{ row.code }}</small>
                </td>
                <td>
                  {{ row.answers?.objective || 'Indisponível'
                  }}<small>{{ row.answers?.period || 'Indisponível' }}</small>
                </td>
                <td>
                  <strong>{{ requestAmountLabel(row, money) }}</strong
                  ><small>{{ requestModalityLabel(row, money) }}</small>
                </td>
                <td>
                  <span class="contract-flow__badge" :class="row.status">{{
                    requestStatusLabel(row.status)
                  }}</span
                  ><small v-if="row.status === 'Fulfilled'">{{
                    row.contract?.name || 'Contrato indisponível'
                  }}</small
                  ><small v-if="row.status === 'Canceled'">{{
                    row.cancellationReason || 'Motivo indisponível'
                  }}</small>
                </td>
                <td>
                  <button class="contract-requests__open" @click="$emit('open', row.id)">
                    Abrir
                  </button>
                </td>
              </tr>
              <tr v-if="!rows.length">
                <td colspan="6" class="contract-requests__empty">
                  <strong>{{ empty.title }}</strong>
                  <p>{{ empty.description }}</p>
                </td>
              </tr>
            </tbody>
          </table></resource-state
        >
      </div>
      <footer>
        <q-pagination
          v-if="resource.state.data?.totalPages > 1"
          v-model="page"
          :max="resource.state.data.totalPages"
          aria-label="Página das solicitações"
        /><q-btn outline no-caps label="Fechar" @click="$emit('close')" /></footer></q-card
  ></q-dialog>
</template>
<script setup>
import InformationIcon from 'src/components/Entity/InformationIcon.vue'
import { ref, computed, watch, onScopeDispose } from 'vue'
import ResourceState from 'src/components/Finance/ResourceState.vue'
import { useFinanceResource } from 'src/composables/useFinanceResource'
import { money } from 'src/services/financeService'
import {
  listContractRequests,
  requestStatuses,
  requestStatusLabel,
  requestAmountLabel,
  requestModalityLabel,
} from 'src/services/contractRequests'
const props = defineProps({ read: { type: Function, default: listContractRequests } })
const emit = defineEmits(['close', 'open', 'count'])
const resource = useFinanceResource(),
  status = ref('All'),
  page = ref(1)
let active = true
const rows = computed(() =>
  (resource.state.data?.items || []).filter(
    (row) => status.value === 'All' || row.status === status.value,
  ),
)
const counts = computed(() => resource.state.data?.counts || {})
const empty = computed(
  () =>
    ({
      All: {
        title: 'Nenhuma solicitação de contrato ainda',
        description:
          'Os pedidos que os clientes enviam pelo "Quero Conhecer" da Área do Cliente aparecem aqui.',
      },
      New: {
        title: 'Nenhuma solicitação nova',
        description:
          'Os pedidos que os clientes enviam pelo "Quero Conhecer" da Área do Cliente aparecem aqui.',
      },
      InContact: {
        title: 'Nenhuma solicitação em contato',
        description:
          'As solicitações em que o assessor já entrou em contato com o cliente aparecem aqui.',
      },
      Fulfilled: {
        title: 'Nenhuma solicitação atendida',
        description:
          'As solicitações que viraram contrato ou entraram num contrato aberto aparecem aqui.',
      },
      Canceled: {
        title: 'Nenhuma solicitação cancelada',
        description: 'As solicitações canceladas, com o motivo, aparecem aqui.',
      },
    })[status.value],
)
const when = (value) =>
  value
    ? new Date(value).toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Indisponível'
const icon = (name) => '/icons/contracts/flows/2360-281-img' + name + '.svg'
async function load() {
  await resource.load(async () => {
    const result = await props.read({
      page: page.value,
      pageSize: 20,
      ...(status.value === 'All' ? {} : { status: status.value }),
    })
    if (!Array.isArray(result?.items)) throw Error('Solicitações indisponíveis.')
    return result
  })
  if (active && !resource.state.error) emit('count', counts.value.New ?? null)
}
onScopeDispose(() => {
  active = false
  resource.reset()
})
watch(status, () => {
  if (page.value !== 1) page.value = 1
  else load()
})
watch(page, load)
load()
</script>
<style src="./contractFlow.scss" lang="scss"></style>
<style scoped>
.contract-requests {
  width: 840px;
  max-width: calc(100vw - 32px);
}
.contract-requests__info {
  display: flex;
  gap: 12px;
  align-items: center;
}
.contract-requests__info img {
  flex-shrink: 0;
}
.contract-requests__filters {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.contract-requests__filters button {
  border: 1px solid #ffffff33;
  border-radius: 20px;
  padding: 6px 12px;
  background: transparent;
  color: #ffffffb8;
  font-size: 12px;
}
.contract-requests__filters button[aria-selected='true'] {
  border-color: #ffffff;
  background: #ffffff1a;
  color: #fff;
}
.contract-requests__filters strong {
  margin-left: 4px;
}
.contract-requests th:nth-child(1) {
  width: 14%;
}
.contract-requests th:nth-child(2) {
  width: 23%;
}
.contract-requests th:nth-child(3) {
  width: 22%;
}
.contract-requests th:nth-child(4) {
  width: 21%;
}
.contract-requests th:nth-child(5) {
  width: 14%;
}
.contract-requests th:last-child {
  width: 6%;
}
.contract-requests td {
  padding: 12px 8px;
  vertical-align: top;
}
.contract-requests__open {
  border: 0;
  background: transparent;
  color: #ffffff;
  padding: 0;
  font-size: 12px;
  cursor: pointer;
}
.contract-requests tr:hover {
  background: #ffffff0a;
}
.contract-requests__empty {
  text-align: center;
  padding: 40px 16px !important;
}
.contract-requests__empty strong {
  font-size: 16px;
}
.contract-requests__empty p {
  margin: 8px 0 0;
  color: #ffffff99;
}
@media (max-width: 600px) {
  .contract-requests table {
    min-width: 700px;
  }
  .contract-requests .contract-flow__body > div:last-child {
    overflow-x: auto;
  }
}
</style>
