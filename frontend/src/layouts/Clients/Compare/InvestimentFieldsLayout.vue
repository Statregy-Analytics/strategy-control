<template>
  <div class="row InvestimentFieldsLayout">
    <div class="col-12 q-px-md text-bold">Investimento</div>
    <div
      class="row justify-center q-gutter-sm q-pa-md text-muted q-mt-xs"
      style="width: 250px; align-items: center"
    >
      <div class="col-12 self-center">
        <p class="text-compara">Classificaçao</p>
      </div>
      <div class="col-12 self-end">
        <p class="text-compara">Saldo disponível</p>
      </div>
      <div class="col-12 self-end">
        <p class="text-compara">Assessor Responsável</p>
      </div>
      <div class="col-12 self-end">
        <p class="text-compara">Data de dividendo</p>
      </div>
      <div class="col-12 self-end">
        <p class="text-compara">Valor do dividendo</p>
      </div>
    </div>
    <div v-for="(item, index) in compare" :key="index" class="row">
      <info-compare-layout
        v-if="item.id != 0"
        class="col-12 q-pa-md"
        v-bind="
          (function () {
            const inv = (item && item.investment) || {}
            // normalize assessor into a displayable string
            let assessorDisplay = '-'
            const a = inv.assessor
            if (a !== undefined && a !== null) {
              if (typeof a === 'string' || typeof a === 'number') {
                assessorDisplay = a
              } else if (typeof a === 'object') {
                // common shapes: { label, value }, { name }, { assessor: { name } }
                if (a.label) assessorDisplay = a.label
                else if (a.name) assessorDisplay = a.name
                else if (a.assessor) {
                  assessorDisplay =
                    typeof a.assessor === 'object' ? a.assessor.name || '-' : a.assessor
                }
              }
            }
            return {
              item_one: inv.classification || '-',
              item_two: inv.saldo || '-',
              item_three: assessorDisplay,
              item_four: inv.data_dividendo || '-',
              item_five: inv.valor_dividendo || '-',
            }
          })()
        "
      />
    </div>
  </div>
</template>
<script setup>
import InfoCompareLayout from './InfoCompareLayout.vue'
import { defineComponent } from 'vue'
import { useClientStore } from 'src/stores/client'
import { storeToRefs } from 'pinia'
const clientStore = useClientStore()
const { compare } = storeToRefs(clientStore)
defineComponent({
  name: 'InvestimentFieldsLayout',
})
</script>
