<template>
  <div class="row LoanFieldsLayout">
    <div class="col-12 q-px-md text-bold">Empréstimo</div>
    <div
      class="row justify-center q-gutter-sm q-pa-md text-muted q-mt-xs"
      style="width: 250px; align-items: center"
    >
      <div class="col-12">
        <p class="text-compara">Situação do Empréstimo</p>
      </div>
      <div class="col-12">
        <p class="text-compara">Valor Emprestado</p>
      </div>
      <div class="col-12">
        <p class="text-compara">Data do Valor Emprestado</p>
      </div>
      <div class="col-12">
        <p class="text-compara">Valor Total Dívida</p>
      </div>
      <div class="col-12">
        <p class="text-compara">Valor Atual da Dívida</p>
      </div>
      <div class="col-12">
        <p class="text-compara">Valor para Antecipação</p>
      </div>
      <div class="col-12">
        <p class="text-compara">Número Parcelas</p>
      </div>
      <div class="col-12">
        <p class="text-compara">Dia de Pagamento da Parcelas</p>
      </div>
    </div>
    <div v-for="(item, index) in compare" :key="index" class="row">
      <info-compare-layout
        v-if="item.id != 0"
        class="col-12 q-pa-md"
        v-bind="
          (function () {
            const wl = (item && item.weLend && item.weLend[0]) || {}
            return {
              item_one: wl.status || '-',
              item_two: wl.valor || '-',
              item_three: wl.data_loan || '-',
              item_four: wl.value_dividendo || '-',
              item_five: wl.value_now_dividendo || '-',
              item_six: wl.value_finish || '-',
              item_seven: wl.value_before || '-',
              item_eight: wl.number_parcelas || '-',
              item_nine: wl.date_payment || '-',
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
  name: 'LoanFieldsLayout',
})
</script>
