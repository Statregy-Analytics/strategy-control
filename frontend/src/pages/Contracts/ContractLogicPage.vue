<template>
  <div class="ContractLogicPage">
    <title-page title="Lógica de Contratos" :breadcrumbs />
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
            <logics-contracts-layout />
          </q-tab-panel>

          <q-tab-panel name="aposentadoria">
            <logics-contracts-layout />
          </q-tab-panel>

          <q-tab-panel name="liquidez">
            <logics-contracts-layout />
          </q-tab-panel>
        </q-tab-panels>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref } from 'vue'
import TitlePage from 'src/components/TitlePage.vue'
import LogicsContractsLayout from 'src/layouts/Contracts/LogicsContractsLayout.vue'
const tab = ref('expansao')
const breadcrumbs = [
  {
    label: 'Contratos',
  },
  {
    label: 'Lógica de Contratos',
  },
]
</script>
<style lang="sass">
.border-selected
  border: 1px solid blue !important
</style>
