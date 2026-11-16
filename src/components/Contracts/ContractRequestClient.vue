<template>
  <div class="request-client">
    <div class="request-client__identity">
      <img src="/icons/contracts/flows/2366-281-imgUser.svg" alt="" />
      <div>
        <strong>{{ context.client.displayName }}</strong
        ><small>{{ masked(context.client.maskedDocument) }}</small
        ><span>Solicitação {{ context.code }}</span>
      </div>
    </div>
    <dl>
      <div>
        <dt>Aporte</dt>
        <dd>A configurar</dd>
      </div>
      <div>
        <dt>Participação</dt>
        <dd>—</dd>
      </div>
    </dl>
    <p>Pedido do cliente: {{ amount }} ({{ requestModalityName(context.answers?.modality) }}).</p>
    <q-btn
      outline
      no-caps
      class="full-width"
      :disable="!currencySelected"
      @click="$emit('configure')"
      ><img src="/icons/contracts/flows/2366-281-imgIconeCarteira.svg" alt="" />Configurar
      vínculo</q-btn
    >
    <p v-if="showFooter">
      Capital consolidado <strong>{{ money(capital, currency) }} · —</strong>
    </p>
    <p>
      O cliente da solicitação já entra na lista. Configure o aporte dele (moedas da Carteira
      Strategy ou da Carteira de Depósito) em Configurar vínculo e, se houver, adicione os outros
      clientes.
    </p>
    <q-btn
      v-if="showFooter"
      outline
      no-caps
      class="full-width"
      :disable="!currencySelected"
      @click="$emit('add')"
      ><img src="/icons/contracts/flows/2366-281-imgPlus.svg" alt="" />Adicionar Cliente</q-btn
    >
  </div>
</template>
<script setup>
import { computed } from 'vue'
import { money } from 'src/services/financeService'
import { requestModalityName } from 'src/services/contractRequests'
import { customerMaskedDocument as masked } from 'src/services/customerPresentation'
const props = defineProps({
  context: { type: Object, required: true },
  currencySelected: Boolean,
  showFooter: { type: Boolean, default: true },
  capital: { type: [String, Number], default: 0 },
  currency: { type: String, default: 'BRL' },
})
defineEmits(['configure', 'add'])
const amount = computed(() => {
  const a = props.context.answers || {}
  return a.modality === 'Recurring'
    ? money(a.monthlyAmount, a.currencyCode) + '/mês'
    : money(a.initialAmount, a.currencyCode) +
        (a.modality === 'Hybrid'
          ? ' no início e ' + money(a.monthlyAmount, a.currencyCode) + ' por mês'
          : '')
})
</script>
<style scoped>
.request-client {
  padding: 0 24px 24px;
  font-size: 12px;
  color: #ffffffb8;
}
.request-client__identity {
  display: flex;
  gap: 10px;
  border: 1px solid #ffffff33;
  border-radius: 10px;
  padding: 12px;
}
.request-client__identity > div {
  min-width: 0;
}
.request-client strong {
  color: #fff;
  font-size: 13px;
}
.request-client small {
  display: block;
  font-size: 10px;
}
.request-client span {
  display: inline-block;
  border: 1px solid #2b7fff;
  border-radius: 6px;
  background: #ffffff1a;
  padding: 2px 8px;
  font-size: 10px;
  color: #bedbff;
  margin-top: 4px;
}
.request-client dl {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
.request-client dd {
  margin: 4px 0;
  color: #fff;
}
.request-client p {
  line-height: 18px;
  margin: 12px 0;
}
.request-client .q-btn {
  color: #fff;
  font-size: 12px;
}
.request-client .q-btn img {
  margin-right: 8px;
}
</style>
