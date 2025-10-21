<template>
  <div class="ContractsInvesmentsLayout row items-start q-gutter-sm">
    <div class="col" v-for="(item, index) in infoCard" :key="index">
      <balance-info-card
        :title="item.title"
        :sub-title="item.subTitle"
        :value="item.value"
        :more-info="item.moreInfo"
        :bgColor="item.bgColor"
        class=""
      />
    </div>
    <investments-historic class="col-12" />
  </div>
</template>
<script setup>
import BalanceInfoCard from 'src/components/Card/BalanceInfoCard.vue'
import InvestmentsHistoric from 'src/components/Table/Wallet/InvestmentsHistoric.vue'
import { defineComponent, ref, onMounted } from 'vue'

defineComponent({
  name: 'WalletLayout',
})

onMounted(() => {
  console.debug('[DEBUG] ContractsInvesmentsLayout mounted')
})
const infoCard = ref([
  {
    title: 'Valor Total em Contratos/Investimentos',
    value: 'R$ 100.000,00',
    moreInfo: 'Mais informações',
    bgColor: '',
  },
  {
    title: 'Valor Para movimentar para Saldo Disponível',
    value: 'R$ 100.000,00',
    moreInfo: 'Mais informações',
    bgColor: '',
  },
  {
    title: 'Valor em Progresso ',
    subTitle: '(Saldo -> Contrato)',
    value: 'R$ 50.000,00',
    moreInfo: 'Mais informações',
    bgColor: 'bg-yellow-2',
  },
  {
    title: 'Valor em Progresso ',
    subTitle: '(Contrato -> Saldo)',
    value: 'R$ 50.000,00',
    moreInfo: 'Mais informações',
    bgColor: 'bg-yellow-2',
  },
])
</script>
