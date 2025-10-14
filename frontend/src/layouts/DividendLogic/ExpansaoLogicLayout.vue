<template>
  <div class="dividendLogicPage row items-start q-gutter-sm text-end justify-end">
    <contract-details-card class="col-12" :item="linkItems">
      <transition name="fade" mode="out-in">
        <logic-dividend-filter v-if="paramentroLogic" />
      </transition>
    </contract-details-card>
    <div class="q-pa-sm text-info text-weight-bold" style="text-align: end">
      <span
        class="text-info text-weight-bold text-end cursor-pointer"
        style="text-align: end"
        v-if="!viewHistory"
        @click.prevent="viewHistory = true"
      >
        ver historico
      </span>
      <q-select
        v-else
        v-model="periodo"
        :options="optionView"
        outlined
        dense
        style="height: 30px; border-radius: 6px; min-width: 200px"
        class="q-mb-sm"
      />
    </div>
    <div class="col-12">
      <expansive-logic />
    </div>
  </div>
</template>

<script setup>
import { defineComponent, ref } from 'vue'
import { useLayoutStore } from 'src/stores/layout'
import { storeToRefs } from 'pinia'
import ContractDetailsCard from 'src/components/Card/ContractDetailsCard.vue'
import ExpansiveLogic from 'src/components/Table/DividendLogic/ExpansiveLogicTable.vue'
import LogicDividendFilter from 'src/components/Form/LogicDividendFilter.vue'
defineComponent({
  name: 'ExpansaoLogicLayout',
})
const storeLayout = useLayoutStore()
const { paramentroLogic } = storeToRefs(storeLayout)
const linkItems = [
  {
    title: 'Detalhes do Contrato',
    icon: 'IconFileText',
    linkTo: '/contracts',
    linkText: 'Ver Contrato',
  },
  {
    title: 'Parâmentros de Lógica',
    icon: 'IconAdjustments',
    linkTo: '',
    linkText: 'Ver parâmetros',
  },
  {
    title: 'Projeção',
    icon: 'IconTimeline',
    selectd: true,
    linkTo: '',
    linkText: 'Ver parâmetros',
  },
]
const periodo = ref('Todo o período')
const viewHistory = ref(false)
const optionView = [
  { label: 'Todo o período', value: 'all' },
  { label: '30 dias', value: '30d' },
  { label: '90 dias', value: '90d' },
  { label: '1 ano', value: '1y' },
]
</script>
