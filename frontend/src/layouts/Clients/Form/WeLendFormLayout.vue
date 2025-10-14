<template>
  <div class="WeLendFormLayout">
    <div class="row justify-around q-gutter-sm">
      <label-form className="col" textLabel="Classificação">
        <q-select
          outlined
          dense
          :options="optionsStatus"
          v-model="clientEdit.newWeLend.status"
          class="q-my-sm"
        ></q-select>
      </label-form>
      <label-form className="col" textLabel="Saldo disponível">
        <q-input
          outlined
          v-model="clientEdit.newWeLend.value"
          dense
          placeholder=""
          class="q-my-sm"
        ></q-input>
      </label-form>
      <label-form className="col" textLabel="Saldo disponível">
        <q-input
          outlined
          v-model="clientEdit.investment.data_value_welend"
          dense
          class="q-my-sm"
          bg-color="white"
          navigation-min-year-month="1990/07"
          type="date"
        />
      </label-form>
    </div>
    <div class="row justify-around q-gutter-sm">
      <label-form className="col" textLabel="Valor Total Dívida (R$)">
        <q-select
          outlined
          dense
          :options="optionsDivida"
          v-model="clientEdit.newWeLend.value_dividendo"
          class="q-my-sm"
        ></q-select>
      </label-form>
      <label-form className="col" textLabel="Valor Atual da Dívida (R$)">
        <q-input
          outlined
          v-model="clientEdit.newWeLend.value_before"
          dense
          placeholder=""
          class="q-my-sm"
        ></q-input>
      </label-form>
    </div>
    <div class="row justify-around q-gutter-sm">
      <label-form className="col" textLabel="Valor Total para Quitação (R$)">
        <q-select
          outlined
          dense
          :options="optionsQuitacao"
          v-model="clientEdit.newWeLend.value_finish"
          class="q-my-sm"
        ></q-select>
      </label-form>
      <label-form className="col" textLabel="Valor para Antecipação (R$)">
        <q-input
          outlined
          v-model="clientEdit.newWeLend.value_before"
          dense
          placeholder=""
          class="q-my-sm"
        ></q-input>
      </label-form>
    </div>
    <div class="row justify-around q-gutter-sm">
      <label-form className="col" textLabel="Valor para Antecipação (R$)">
        <q-input
          outlined
          v-model="clientEdit.newWeLend.value_before"
          dense
          placeholder=""
          class="q-my-sm"
        ></q-input>
      </label-form>
      <label-form className="col" textLabel="Dia de Pagamento (R$)">
        <q-select
          outlined
          dense
          :options="optionsPayment"
          v-model="clientEdit.newWeLend.date_payment"
          class="q-my-sm"
        ></q-select>
      </label-form>
    </div>
  </div>
</template>
<script setup>
import LabelForm from 'src/components/Form/LabelForm.vue'
import { defineComponent } from 'vue'
import { useLayoutStore } from 'src/stores/layout'
import { storeToRefs } from 'pinia'
const layoutStore = useLayoutStore()
const { clientEdit } = storeToRefs(layoutStore)

const optionsStatus = [
  { label: 'Ativo', value: 'Ativo' },
  { label: 'Pago', value: 'Pago' },
  { label: 'Inativo', value: 'Inativo' },
]
const optionsDivida = [
  { label: '200.000,00', value: 'acoes' },
  { label: '200.000,00', value: 'renda_fixa' },
  { label: '200.000,00', value: 'fundos_imobiliarios' },
  { label: '200.000,00', value: 'criptomoedas' },
]
const optionsQuitacao = [
  { label: '200.000,00', value: 1 },
  { label: '200.000,00', value: 2 },
  { label: '200.000,00', value: 3 },
  { label: '200.000,00', value: 4 },
]
const optionsPayment = [
  { label: '1', value: 1 },
  { label: '10', value: 2 },
  { label: '15', value: 3 },
  { label: '20', value: 4 },
]
defineComponent({
  name: 'WeLendFormLayout',
})
</script>
