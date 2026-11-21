<template>
  <aside class="request-origin">
    <div class="request-origin__top">
      <information-icon />
      <div>
        <strong>Contrato a partir da solicitação {{ context.code }}</strong
        ><small
          >{{ context.client.displayName }} · enviada em {{ when(context.submittedAtUtc) }}</small
        >
      </div>
      <button @click="$emit('open', context.id)">Ver solicitação</button>
    </div>
    <div class="request-origin__answers">
      <div v-for="answer in answers" :key="answer.label">
        <small>{{ answer.label }}</small
        ><strong>{{ answer.value || 'Indisponível' }}</strong>
      </div>
    </div>
    <p>
      Use como referência em Vigência e Prazos e no Universo de Ativos do Contrato. O cliente já
      está em Clientes Vinculados; ao criar o contrato, a solicitação passa a Atendida.
    </p>
  </aside>
</template>
<script setup>
import InformationIcon from 'src/components/Entity/InformationIcon.vue'
import { computed } from 'vue'
import { money } from 'src/services/financeService'
import { requestApplicationLabel } from 'src/services/contractRequests'
const props = defineProps({ context: { type: Object, required: true } })
defineEmits(['open'])
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
const answers = computed(() => {
  const a = props.context.answers || {}
  return [
    { label: 'Objetivo de investimento', value: a.objective },
    { label: 'Período', value: a.period },
    {
      label: 'Modalidade e valor',
      value: requestApplicationLabel(props.context, money),
    },
    { label: 'Tipos de ativos', value: a.assetTypes?.join(', ') },
    { label: 'Regiões', value: a.regions?.join(', ') },
  ]
})
</script>
<style scoped>
.request-origin {
  border: 1px solid #ffffff;
  border-radius: 12px;
  background: #ffffff1a;
  padding: 16px 20px;
  color: #fff;
  margin: 24px 48px;
}
.request-origin__top {
  display: flex;
  gap: 10px;
  align-items: center;
}
.request-origin__top > div {
  flex: 1;
}
.request-origin strong {
  font-size: 13px;
  line-height: 18px;
}
.request-origin small {
  display: block;
  font-size: 12px;
  color: #ffffffb8;
  line-height: 18px;
}
.request-origin button {
  border: 0;
  background: none;
  color: #ffffff;
  font-size: 12px;
  cursor: pointer;
}
.request-origin__answers {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px 16px;
  margin: 12px 0;
}
.request-origin p {
  margin: 0;
  font-size: 12px;
  color: #ffffffb8;
}
@media (max-width: 600px) {
  .request-origin {
    margin: 16px;
  }
  .request-origin__answers {
    grid-template-columns: 1fr;
  }
  .request-origin__top {
    flex-wrap: wrap;
  }
}
</style>
