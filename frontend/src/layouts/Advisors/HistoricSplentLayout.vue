<template>
  <q-card class="HistoricSplentLayout">
    <title-card title="Histórico de Gastos" :icon-left="true" />
    <q-separator></q-separator>
    <div class="q-mr-lg" v-for="item in advisorEdit.gastos.data" :key="item.date">
      <q-banner inline-actions rounded class="q-ma-md border-pattern">
        <div class="row justify-center items-center q-gutter-sm">
          <div class="col-1">
            <q-btn round :icon="$filtersString.resolveUrl('img:icons/png/receipt-2.png')"></q-btn>
          </div>
          <div class="col">
            <span class="text-muted" style="font-size: 12px">
              <span class="text-dark">Strategy Analytics</span>
              {{ new Date(item.date).toLocaleDateString('pt-BR') }} 10:24
            </span>
            <div class="">
              Inseriu Novo Gastro de R$
              {{
                Number(item.amount).toLocaleString('pt-BR', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })
              }}
            </div>
          </div>
        </div>
      </q-banner>
      <q-banner dense class="q-ma-md bg-grey-3 border-radius-pattern"
        >Valor Somado: R$
        {{
          Number(item.amount).toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })
        }}
      </q-banner>
    </div>
    <q-banner inline-actions rounded class="q-ma-md border-pattern">
      <div class="row justify-center items-center q-gutter-sm">
        <div class="col-1">
          <q-btn round :icon="$filtersString.resolveUrl('img:icons/png/edit.png')"></q-btn>
        </div>
        <div class="col">
          <span class="text-muted" style="font-size: 12px">
            <span class="text-dark">Strategy Analytics</span> 27/02/2025 10:24
          </span>
          <div class="">Editou um Gasto de R$ 2.000,00 para R$ 1.000,00</div>
        </div>
      </div>
    </q-banner>
    <q-banner dense class="q-ma-md bg-grey-3 border-radius-pattern">
      Valor Somado: R$ 1.000.00
    </q-banner>
    <q-banner inline-actions rounded class="q-ma-md border-pattern">
      <div class="row justify-center items-center q-gutter-sm">
        <div class="col-1">
          <q-btn round :icon="$filtersString.resolveUrl('img:icons/png/file-alert.png')"></q-btn>
        </div>
        <div class="col">
          <span class="text-muted" style="font-size: 12px">
            <span class="text-dark">Strategy Analytics</span> 27/02/2025 10:24
          </span>
          <div class="">Remeveu um Gasto</div>
        </div>
      </div>
    </q-banner>
    <q-banner dense class="q-ma-md bg-grey-3 border-radius-pattern">
      Valor Somado: R$ 0,00
    </q-banner>
  </q-card>
</template>
<script setup>
import { defineComponent } from 'vue'
import TitleCard from 'src/components/Card/TitleCard.vue'
import { useAdvisorStore } from 'src/stores/advisor'
import { storeToRefs } from 'pinia'

const advisorStore = useAdvisorStore()
const { advisorEdit } = storeToRefs(advisorStore)

defineComponent({
  name: 'HistoricSplentLayout',
})
</script>
<style scoped lang="sass">
.HistoricSplentLayout
  min-width: 920px
</style>
