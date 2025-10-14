<template>
  <div class="LogicContractsLayout row items-start q-gutter-sm">
    <contract-details-card class="col-12" :item="linkItems">
      <transition name="fade" mode="out-in">
        <logic-parameters-filter v-if="paramentroLogic" />
      </transition>
    </contract-details-card>

    <div class="col-2 q-my-md" v-for="(item, index) in details" :key="index">
      <contract-values-card
        :title="item.title"
        :value="item.value"
        :icon-value="item.iconValue"
        :badge-text="item.badgeText"
        :badge-color="item.badgeColor"
        :bgColor="item.bgColor"
      />
    </div>
    <div class="col-12 q-pr-sm">
      <projection-control-table class="q-mt-md">
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
          style="height: 35px; border-radius: 6px"
          class="q-mb-sm"
        />
      </projection-control-table>
    </div>
    <logic-contract-table class="col-12" v-if="!projection" />
    <projection-contract-table v-else class="col-12" />
  </div>
</template>

<script setup>
import { defineComponent, ref } from 'vue'
import { useLayoutStore } from 'src/stores/layout'
import { storeToRefs } from 'pinia'
import LogicContractTable from 'src/components/Table/Contract/LogiccContractTable.vue'
import ContractDetailsCard from 'src/components/Card/ContractDetailsCard.vue'
import ContractValuesCard from 'src/components/Card/ContractValuesCard.vue'
import LogicParametersFilter from 'src/components/Form/LogicParametersFilter.vue'
import ProjectionContractTable from 'src/components/Table/Contract/ProjectionContractTable.vue'
import ProjectionControlTable from 'src/components/Table/Contract/ProjectionControlTable.vue'
defineComponent({
  name: 'LogicContractsLayout',
})
const storeLayout = useLayoutStore()
const { paramentroLogic, projection } = storeToRefs(storeLayout)
const viewHistory = ref(false)
const details = [
  {
    title: 'Valorização do ativo em 7 dias',
    iconValue: 'arrow_downward',
    iconColor: 'red',
    value: '3%',
    badgeText: '+2% vs. período anterior',
    badgeColor: 'negative',
    bgColor: 'primary',
  },
  {
    title: 'Valorização do ativo em 30 dias',
    iconValue: 'arrow_upward',
    iconColor: 'red',
    value: '3%',
    badgeText: '+2% período anterior',
    badgeColor: 'positive',
    bgColor: 'primary',
  },
  {
    title: 'Valorização do ativo em 30 dias',
    iconValue: 'arrow_upward',
    iconColor: 'green',
    value: '3%',
    badgeText: '+2% período anterior',
    badgeColor: 'positive',
    bgColor: 'primary',
  },
  {
    title: 'Intervalo de Oscilação',
    value: '30 min',
    bgColor: 'primary',
  },
]
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
const optionView = [
  { label: 'Todo o período', value: 'all' },
  { label: '30 dias', value: '30d' },
  { label: '90 dias', value: '90d' },
  { label: '1 ano', value: '1y' },
]
</script>
<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.9s ease-in;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
