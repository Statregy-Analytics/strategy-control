<template>
  <q-page class="ContractsPage">
    <title-page title="Contratos" :breadcrumbs />
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
          <q-tab no-caps name="expansao" label="Expansão de Patrimônio" />
          <q-tab no-caps name="aposentadoria" label="Fundo de Aposentadoria" />
          <q-tab no-caps name="liquidez" label="Fundo de Liquidez Elevada" />
        </q-tabs>

        <q-separator />

        <q-tab-panels v-model="tab" animated>
          <q-tab-panel name="expansao">
            <expansao-contract-layout />
          </q-tab-panel>

          <q-tab-panel name="aposentadoria">
            <expansao-contract-layout />
          </q-tab-panel>

          <q-tab-panel name="liquidez">
            <expansao-contract-layout />
          </q-tab-panel>
        </q-tab-panels>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import TitlePage from 'src/components/TitlePage.vue'
import ExpansaoContractLayout from 'src/layouts/Contracts/ExpansaoContractsLayout.vue'
import { ref } from 'vue'

const tab = ref('expansao')
const breadcrumbs = [
  {
    label: 'Contratos',
  },
  {
    label: 'Contratos',
  },
]
</script>
