<template>
  <q-page class="TransctionPage">
    <title-page title="Transação" subtitle="Transações" />
    <div class="q-pt-md q-pl-md row">
      <div class="col-12">
        <q-tabs
          v-model="tab"
          dense
          class="text-grey col-12"
          active-color="primary"
          indicator-color="primary"
          inline-label
          align="left"
        >
          <q-tab
            v-for="(item, index) in tabList"
            :key="index"
            no-caps
            :name="item.name"
            :disable="item.disable"
          >
            <component :is="item.icon" class="tabler-icon-s14 q-mr-sm" />
            <span>{{ item.label }}</span>
          </q-tab>
        </q-tabs>

        <q-separator />

        <q-tab-panels v-model="tab" animated>
          <q-tab-panel v-for="(item, index) in tabList" :key="index" :name="item.qTabelPanel">
            <component :is="componentsMaps[item.componentPanel]" />
          </q-tab-panel>
        </q-tab-panels>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import TitlePage from 'src/components/TitlePage.vue'
import WalletLayout from 'src/layouts/Transaction/WalletLayout.vue'
import AvailableForMovementLayout from 'src/layouts/Transaction/AvailableForMovementLayout.vue'
import ContratctsInvesmentsLayout from 'src/layouts/Transaction/ContractsInvesmentsLayout.vue'
import { ref } from 'vue'

const tab = ref('carteiras')
const componentsMaps = {
  WalletLayout,
  AvailableForMovementLayout,
  ContratctsInvesmentsLayout,
}

const tabList = [
  {
    name: 'carteiras',
    label: 'Todas as Carteiras',
    icon: 'IconLayoutGrid',
    qTabelPanel: 'carteiras',
    componentPanel: 'WalletLayout',
  },
  {
    name: 'disponivel',
    label: 'Disponível para Movimentar',
    icon: 'IconWallet',
    qTabelPanel: 'disponivel',
    componentPanel: 'AvailableForMovementLayout',
  },
  {
    name: 'contratos',
    label: 'Contratos/Investimentos',
    icon: 'IconFileDollar',
    qTabelPanel: 'contratos',
    componentPanel: 'ContratctsInvesmentsLayout',
  },
  {
    name: 'strategy',
    label: 'Strategy Banking(em breve)',
    icon: 'IconBuildingBank',
    disable: true,
  },
]
</script>
<style scoped></style>
