<template>
  <div class="AvailableForMovementLayout row items-start q-gutter-sm">
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
    <movement-historic class="col-12" />
  </div>
</template>
<script setup>
import BalanceInfoCard from 'src/components/Card/BalanceInfoCard.vue'
import MovementHistoric from 'src/components/Table/Wallet/MovementHistoric.vue'
import { defineComponent, ref, onMounted } from 'vue'
defineComponent({
  name: 'AvailableForMovementLayout',
})

onMounted(() => {
  console.debug('[DEBUG] AvailableForMovementLayout mounted')
})
const infoCard = ref([
  {
    title: 'Diponível para Movimentar',
    value: 'R$ 210.000,00',
    moreInfo: 'Mais informações',
    bgColor: '',
  },
  {
    title: 'Valor Total em Progresso ',
    subTitle: '(Saldo -> Contrato)',
    value: 'R$ 100.000,00',
    moreInfo: 'Mais informações',
    bgColor: 'bg-yellow-2',
  },
  {
    title: 'Valor em Progresso ',
    subTitle: '(Contrato -> Saldo)',
    value: 'R$ 100.000,00',
    moreInfo: 'Mais informações',
    bgColor: 'bg-yellow-2',
  },
  {
    title: 'Valor em Progresso ',
    subTitle: '(depósito)',
    value: 'R$ 50.000,00',
    moreInfo: 'Mais informações',
    bgColor: 'bg-yellow-2',
  },
  {
    title: 'Valor em Progresso ',
    subTitle: '(saque)',
    value: 'R$ 50.000,00',
    moreInfo: 'Mais informações',
    bgColor: 'bg-yellow-2',
  },
])
</script>
