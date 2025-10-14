<template>
  <div class="dividendLogicPage">
    <title-page title="Lógica de Dividendo" :breadcrumbs />
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
          <q-tab no-caps name="expansao" label="[Nome do Contrato] (DRP)" />
          <q-tab no-caps name="aposentadoria" label="[Nome do Contrato] (CPA)" />
          <q-tab no-caps name="liquidez" label="[Nome do Contrato] (CPA)" />
        </q-tabs>

        <q-separator />

        <q-tab-panels v-model="tab" animated>
          <q-tab-panel name="expansao">
            <expansao-logic-layout />
          </q-tab-panel>

          <q-tab-panel name="aposentadoria">
            <cpa-logic-layout />
          </q-tab-panel>

          <q-tab-panel name="liquidez">
            <p>estou no terceiro</p>
          </q-tab-panel>
        </q-tab-panels>
      </div>
    </div>
  </div>
</template>
<script setup>
import TitlePage from 'src/components/TitlePage.vue'
import ExpansaoLogicLayout from 'src/layouts/DividendLogic/ExpansaoLogicLayout.vue'
import CpaLogicLayout from 'src/layouts/DividendLogic/CpaLogicLayout.vue'
import { ref } from 'vue'

const tab = ref('expansao')
const breadcrumbs = [
  {
    label: 'Contratos',
  },
  {
    label: 'Logica de Dividendos',
  },
]
</script>
