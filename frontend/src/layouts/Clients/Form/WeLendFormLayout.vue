<template>
  <div class="WeLendFormLayout">
    <div class="row justify-around q-gutter-sm">
      <label-form className="col" textLabel="Status">
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
          v-model="clientEdit.newWeLend.value_antecipacao"
          dense
          placeholder=""
          class="q-my-sm"
          type="number"
          inputmode="numeric"
        ></q-input>
      </label-form>
    </div>
    <div class="row justify-around q-gutter-sm">
      <label-form className="col" textLabel="Parcelas para quitação">
        <q-input
          outlined
          v-model="clientEdit.newWeLend.parcelas_quitacao"
          dense
          placeholder=""
          class="q-my-sm"
          type="number"
          inputmode="numeric"
          :min="0"
          :rules="parcelasRules"
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
import { defineComponent, watch } from 'vue'
import { useLayoutStore } from 'src/stores/layout'
import { storeToRefs } from 'pinia'
const layoutStore = useLayoutStore()
const { clientEdit } = storeToRefs(layoutStore)

// ensure newWeLend structure exists
if (clientEdit && clientEdit.value) {
  try {
    if (!clientEdit.value.newWeLend) clientEdit.value.newWeLend = {}
  } catch {
    /* ignore */
  }
}

// auto-copy guard: remember last value we auto-copied so we don't overwrite user edits
let lastAutoCopiedAntecipacao = undefined

// watch value_before and copy to value_antecipacao only when the target is empty or
// when it equals the previous auto-copied value (so user edits are preserved)
watch(
  () =>
    (clientEdit.value && clientEdit.value.newWeLend && clientEdit.value.newWeLend.value_before) ||
    '',
  (newVal) => {
    try {
      if (!clientEdit.value) return
      if (!clientEdit.value.newWeLend) clientEdit.value.newWeLend = {}
      const nw = clientEdit.value.newWeLend
      const desired = newVal === null || newVal === undefined ? '' : String(newVal)
      const current = nw.value_antecipacao || ''
      if (!desired) return
      if (!current || current === lastAutoCopiedAntecipacao) {
        nw.value_antecipacao = desired
        lastAutoCopiedAntecipacao = desired
      }
    } catch {
      /* ignore */
    }
  },
  { immediate: true },
)

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
// validation rules
const parcelasRules = [
  (val) => val === '' || val === null || Number(val) >= 0 || 'Valor não pode ser negativo',
]
defineComponent({
  name: 'WeLendFormLayout',
})
</script>
