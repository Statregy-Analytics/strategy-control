<template>
  <q-table
    :grid="$q.screen.xs"
    flat
    dense
    bordered
    :rows="rows"
    :columns="columns"
    row-key="label"
    hide-header
    hide-pagination
    :pagination="pagination"
    @update:pagination="updatePagination"
    class="ExpansaoContractTable"
  >
    <template v-slot:body="props">
      <q-tr :props="props">
        <q-td :props="props" key="label">
          {{ props.row.label }}
        </q-td>
        <q-td v-for="i in 32" :key="`value${i === 1 ? '' : i - 1}`" :props="props">
          <q-chip
            v-if="props.row[`value${i === 1 ? '' : i - 1}`] === 'Lógica Contrato ABC'"
            size="sm"
            square
            padding="lg"
            no-caps
            style="border: 1px solid #bdb4b4"
            :label="props.row[`value${i === 1 ? '' : i - 1}`]"
          />
          <q-chip
            color="transparent"
            v-else-if="props.row[`value${i === 1 ? '' : i - 1}`] === 'Real (BRL)'"
          >
            <q-avatar rounded>
              <img src="icons/brazil_icon.png" />
            </q-avatar>
            {{ props.row[`value${i === 1 ? '' : i - 1}`] }}
          </q-chip>
          <q-chip
            color="transparent"
            v-else-if="props.row[`value${i === 1 ? '' : i - 1}`] === 'Dólar (USD)'"
          >
            <q-avatar rounded>
              <img :src="i % 2 !== 0 ? 'icons/usa_icon.png' : 'icons/bitcon_icon.png'" />
            </q-avatar>
            {{ props.row[`value${i === 1 ? '' : i - 1}`] }}
          </q-chip>
          <span v-else>
            {{ props.row[`value${i === 1 ? '' : i - 1}`] }}
          </span>
        </q-td>
      </q-tr>
    </template>
  </q-table>
</template>
<script setup>
import { defineComponent, ref } from 'vue'
defineComponent({
  name: 'ExpansaoContractTable',
})

const values = Array.from({ length: 31 }, (_, i) => {
  return {
    name: `value${i + 1}`,
    label: `Value${i + 1}`,
    field: `value${i + 1}`,
    align: 'right',
    classes: (val) => `${retornClass(val)}`,
  }
})
const value0 = {
  name: 'value',
  label: 'Value',
  field: 'value',
  align: 'right',
  classes: (val) => `${retornClass(val)}`,
}
// const columnsFirst = {
//   name: 'label',
//   label: 'Label',
//   field: 'label',
//   align: 'left',
//   classes: retornClass(val),
// }
const columns = [
  {
    name: 'label',
    label: 'Label',
    field: 'label',
    align: 'left',
  },
  value0,
  ...values,
]
const retornClass = (value) => {
  const test = [value]
  const encontrado = test.some((objeto) => objeto.label === 'Variação desde a criação [R$ (%)]')
  // const logicaContrato = test.some(
  //   (objeto) =>
  //     objeto.label === 'Lógica de Contrato Atrelada' ||
  //     objeto.label === 'Lógica de Dividendo Atrelada',
  // )
  const positivo = test.some((objeto) => objeto.label === 'Rendimento Lóg. Contrato [R$ (%)]')
  if (encontrado) {
    return 'text-negative'
  }
  // if (logicaContrato) {
  //   return 'q-btn-special q-btn-item non-selectable no-outline q-btn--outline q-btn--rectangle q-btn--actionable q-focusable q-hoverable q-btn--no-uppercase custom-btn-muted'
  // }
  if (positivo) {
    return 'text-positive'
  }
  return 'my-special-class'
}
const rows = [
  {
    label: 'Informações',
    value: '01/03/25',
    value1: '02/03/25',
    value2: '03/03/25',
    value3: '04/03/25',
    value4: '05/03/25',
    value5: '06/03/25',
    value6: '07/03/25',
    value7: '08/03/25',
    value8: '09/03/25',
    value9: '10/03/25',
    value10: '11/03/25',
    value11: '12/03/25',
    value12: '13/03/25',
    value13: '14/03/25',
    value14: '15/03/25',
    value15: '16/03/25',
    value16: '17/03/25',
    value17: '18/03/25',
    value18: '19/03/25',
    value19: '20/03/25',
    value20: '21/03/25',
    value22: '22/03/25',
    value23: '23/03/25',
    value24: '24/03/25',
    value25: '25/03/25',
    value26: '26/03/25',
    value27: '27/03/25',
    value28: '28/03/25',
    value29: '29/03/25',
    value30: '30/03/25',
    value31: '31/03/25',
  },
  {
    label: 'Valor Base de Contrato [R$]',
    value: '300,00',
    value1: '300,00',
    value2: '300,00',
    value3: '300,00',
    value4: '300,00',
    value5: '300,00',
    value6: '300,00',
    value7: '300,00',
    value8: '300,00',
    value9: '300,00',
    value10: '300,00',
    value11: '300,00',
    value12: '300,00',
    value13: '300,00',
    value14: '300,00',
    value15: '300,00',
    value16: '300,00',
    value17: '300,00',
    value18: '300,00',
    value19: '300,00',
    value20: '300,00',
    value21: '300,00',
    value22: '300,00',
    value23: '300,00',
    value24: '300,00',
    value25: '300,00',
    value26: '300,00',
    value27: '300,00',
    value28: '300,00',
    value29: '300,00',
    value30: '300,00',
    value31: '300,00',
  },
  {
    label: 'Valor Atual do Contrato [R$]',
    value: '300,00',
    value1: '300,00',
    value2: '300,00',
    value3: '300,00',
    value4: '300,00',
    value5: '300,00',
    value6: '300,00',
    value7: '300,00',
    value8: '300,00',
    value9: '300,00',
    value10: '300,00',
    value11: '300,00',
    value12: '300,00',
    value13: '300,00',
    value14: '300,00',
    value15: '300,00',
    value16: '300,00',
    value17: '300,00',
    value18: '300,00',
    value19: '300,00',
    value20: '300,00',
    value21: '300,00',
    value22: '300,00',
    value23: '300,00',
    value24: '300,00',
    value25: '300,00',
    value26: '300,00',
    value27: '300,00',
    value28: '300,00',
    value29: '300,00',
    value30: '300,00',
    value31: '300,00',
  },
  {
    label: 'Variação desde a criação [R$ (%)]',
    value: '52.000,00 (+52%)',
    'variation-since-creation': '52.000,00 (+52%)',
    value1: '52.000,00 (+52%)',
    value2: '52.000,00 (+52%)',
    value3: '52.000,00 (+52%)',
    value4: '52.000,00 (+52%)',
    value5: '52.000,00 (+52%)',
    value6: '52.000,00 (+52%)',
    value7: '52.000,00 (+52%)',
    value8: '52.000,00 (+52%)',
    value9: '52.000,00 (+52%)',
    value10: '52.000,00 (+52%)',
    value11: '52.000,00 (+52%)',
    value12: '52.000,00 (+52%)',
    value13: '52.000,00 (+52%)',
    value14: '52.000,00 (+52%)',
    value15: '52.000,00 (+52%)',
    value16: '52.000,00 (+52%)',
    value17: '52.000,00 (+52%)',
    value18: '52.000,00 (+52%)',
    value19: '52.000,00 (+52%)',
    value20: '52.000,00 (+52%)',
    value21: '52.000,00 (+52%)',
    value22: '52.000,00 (+52%)',
    value23: '52.000,00 (+52%)',
    value24: '52.000,00 (+52%)',
    value25: '52.000,00 (+52%)',
    value26: '52.000,00 (+52%)',
    value27: '52.000,00 (+52%)',
    value28: '52.000,00 (+52%)',
    value29: '52.000,00 (+52%)',
    value30: '52.000,00 (+52%)',
    value31: '52.000,00 (+52%)',
  },
  {
    label: 'Variação do dia [R$ (%)]',
    value: '1.000 (-0.66%)',
    'daily-variation': '1.000 (-0.66%)',
    value1: '300,00',
    value2: '300,00',
    value3: '300,00',
    value4: '300,00',
    value5: '300,00',
    value6: '300,00',
    value7: '300,00',
    value8: '300,00',
    value9: '300,00',
    value10: '300,00',
    value11: '300,00',
    value12: '300,00',
    value13: '300,00',
    value14: '300,00',
    value15: '300,00',
    value16: '300,00',
    value17: '300,00',
    value18: '300,00',
    value19: '300,00',
    value20: '300,00',
    value21: '300,00',
    value22: '300,00',
    value23: '300,00',
    value24: '300,00',
    value25: '300,00',
    value26: '300,00',
    value27: '300,00',
    value28: '300,00',
    value29: '300,00',
    value30: '300,00',
    value31: '300,00',
  },
  {
    label: 'Preço de abertura [R$]',
    value: '300,00',
    value1: '300,00',
    value2: '300,00',
    value3: '300,00',
    value4: '300,00',
    value5: '300,00',
    value6: '300,00',
    value7: '300,00',
    value8: '300,00',
    value9: '300,00',
    value10: '300,00',
    value11: '300,00',
    value12: '300,00',
    value13: '300,00',
    value14: '300,00',
    value15: '300,00',
    value16: '300,00',
    value17: '300,00',
    value18: '300,00',
    value19: '300,00',
    value20: '300,00',
    value21: '300,00',
    value22: '300,00',
    value23: '300,00',
    value24: '300,00',
    value25: '300,00',
    value26: '300,00',
    value27: '300,00',
    value28: '300,00',
    value29: '300,00',
    value30: '300,00',
    value31: '300,00',
  },
  {
    label: 'Preço de fechamento [R$]',
    value: '300,00',
    value1: '300,00',
    value2: '300,00',
    value3: '300,00',
    value4: '300,00',
    value5: '300,00',
    value6: '300,00',
    value7: '300,00',
    value8: '300,00',
    value9: '300,00',
    value10: '300,00',
    value11: '300,00',
    value12: '300,00',
    value13: '300,00',
    value14: '300,00',
    value15: '300,00',
    value16: '300,00',
    value17: '300,00',
    value18: '300,00',
    value19: '300,00',
    value20: '300,00',
    value21: '300,00',
    value22: '300,00',
    value23: '300,00',
    value24: '300,00',
    value25: '300,00',
    value26: '300,00',
    value27: '300,00',
    value28: '300,00',
    value29: '300,00',
    value30: '300,00',
    value31: '300,00',
  },
  {
    label: 'Rendimento Lóg. Contrato [R$ (%)]',
    value: '1.000 (+0.66%)',
    'log-yield': '1.000 (+0.66%)',
    value1: '1.000 (+0.66%)',
    value2: '1.000 (+0.66%)',
    value3: '1.000 (+0.66%)',
    value4: '1.000 (+0.66%)',
    value5: '1.000 (+0.66%)',
    value6: '1.000 (+0.66%)',
    value7: '1.000 (+0.66%)',
    value8: '1.000 (+0.66%)',
    value9: '1.000 (+0.66%)',
    value10: '1.000 (+0.66%)',
    value11: '1.000 (+0.66%)',
    value12: '1.000 (+0.66%)',
    value13: '1.000 (+0.66%)',
    value14: '1.000 (+0.66%)',
    value15: '1.000 (+0.66%)',
    value16: '1.000 (+0.66%)',
    value17: '1.000 (+0.66%)',
    value18: '1.000 (+0.66%)',
    value19: '1.000 (+0.66%)',
    value20: '1.000 (+0.66%)',
    value21: '1.000 (+0.66%)',
    value22: '1.000 (+0.66%)',
    value23: '1.000 (+0.66%)',
    value24: '1.000 (+0.66%)',
    value25: '1.000 (+0.66%)',
    value26: '1.000 (+0.66%)',
    value27: '1.000 (+0.66%)',
    value28: '1.000 (+0.66%)',
    value29: '1.000 (+0.66%)',
    value30: '1.000 (+0.66%)',
    value31: '1.000 (+0.66%)',
  },
  {
    label: 'Rendimento Distrib. Lucro [R$ (%)]',
    value: '0,00 (-0%)',
    value1: '0,00 (-0%)',
    value2: '0,00 (-0%)',
    value3: '0,00 (-0%)',
    value4: '0,00 (-0%)',
    value5: '0,00 (-0%)',
    value6: '0,00 (-0%)',
    value7: '0,00 (-0%)',
    value8: '0,00 (-0%)',
    value9: '0,00 (-0%)',
    value10: '0,00 (-0%)',
    value11: '0,00 (-0%)',
    value12: '0,00 (-0%)',
    value13: '0,00 (-0%)',
    value14: '0,00 (-0%)',
    value15: '0,00 (-0%)',
    value16: '0,00 (-0%)',
    value17: '0,00 (-0%)',
    value18: '0,00 (-0%)',
    value19: '0,00 (-0%)',
    value20: '0,00 (-0%)',
    value21: '0,00 (-0%)',
    value22: '0,00 (-0%)',
    value23: '0,00 (-0%)',
    value24: '0,00 (-0%)',
    value25: '0,00 (-0%)',
    value26: '0,00 (-0%)',
    value27: '0,00 (-0%)',
    value28: '0,00 (-0%)',
    value29: '0,00 (-0%)',
    value30: '0,00 (-0%)',
    value31: '0,00 (-0%)',
  },
  {
    label: 'Lógica de Contrato Atrelada',
    'contract-logic': 'Lógica Contrato ABC',
    value: 'Lógica Contrato ABC',
    value1: 'Lógica Contrato ABC',
    value2: 'Lógica Contrato ABC',
    value3: 'Lógica Contrato ABC',
    value4: 'Lógica Contrato ABC',
    value5: 'Lógica Contrato ABC',
    value6: 'Lógica Contrato ABC',
    value7: 'Lógica Contrato ABC',
    value8: 'Lógica Contrato ABC',
    value9: 'Lógica Contrato ABC',
    value10: 'Lógica Contrato ABC',
    value11: 'Lógica Contrato ABC',
    value12: 'Lógica Contrato ABC',
    value13: 'Lógica Contrato ABC',
    value14: 'Lógica Contrato ABC',
    value15: 'Lógica Contrato ABC',
    value16: 'Lógica Contrato ABC',
    value17: 'Lógica Contrato ABC',
    value18: 'Lógica Contrato ABC',
    value19: 'Lógica Contrato ABC',
    value20: 'Lógica Contrato ABC',
    value21: 'Lógica Contrato ABC',
    value22: 'Lógica Contrato ABC',
    value23: 'Lógica Contrato ABC',
    value24: 'Lógica Contrato ABC',
    value25: 'Lógica Contrato ABC',
    value26: 'Lógica Contrato ABC',
    value27: 'Lógica Contrato ABC',
    value28: 'Lógica Contrato ABC',
    value29: 'Lógica Contrato ABC',
    value30: 'Lógica Contrato ABC',
    value31: 'Lógica Contrato ABC',
  },
  {
    label: 'Lógica de Dividendo Atrelada',
    'dividend-logic': 'Lógica Contrato ABC',
    value: 'Lógica Contrato ABC',
    value1: 'Lógica Contrato ABC',
    value2: 'Lógica Contrato ABC',
    value3: 'Lógica Contrato ABC',
    value4: 'Lógica Contrato ABC',
    value5: 'Lógica Contrato ABC',
    value6: 'Lógica Contrato ABC',
    value7: 'Lógica Contrato ABC',
    value8: 'Lógica Contrato ABC',
    value9: 'Lógica Contrato ABC',
    value10: 'Lógica Contrato ABC',
    value11: 'Lógica Contrato ABC',
    value12: 'Lógica Contrato ABC',
    value13: 'Lógica Contrato ABC',
    value14: 'Lógica Contrato ABC',
    value15: 'Lógica Contrato ABC',
    value16: 'Lógica Contrato ABC',
    value17: 'Lógica Contrato ABC',
    value18: 'Lógica Contrato ABC',
    value19: 'Lógica Contrato ABC',
    value20: 'Lógica Contrato ABC',
    value21: 'Lógica Contrato ABC',
    value22: 'Lógica Contrato ABC',
    value23: 'Lógica Contrato ABC',
    value24: 'Lógica Contrato ABC',
    value25: 'Lógica Contrato ABC',
    value26: 'Lógica Contrato ABC',
    value27: 'Lógica Contrato ABC',
    value28: 'Lógica Contrato ABC',
    value29: 'Lógica Contrato ABC',
    value30: 'Lógica Contrato ABC',
    value31: 'Lógica Contrato ABC',
  },
  {
    label: 'Moeda Lastreada ao Contrato',
    value: 'Real (BRL)',
    'backed-currency': 'Real (BRL)',
    value1: 'Real (BRL)',
    value2: 'Real (BRL)',
    value3: 'Real (BRL)',
    value4: 'Real (BRL)',
    value5: 'Real (BRL)',
    value6: 'Real (BRL)',
    value7: 'Real (BRL)',
    value8: 'Real (BRL)',
    value9: 'Real (BRL)',
    value10: 'Real (BRL)',
    value11: 'Real (BRL)',
    value12: 'Real (BRL)',
    value13: 'Real (BRL)',
    value14: 'Real (BRL)',
    value15: 'Real (BRL)',
    value16: 'Real (BRL)',
    value17: 'Real (BRL)',
    value18: 'Real (BRL)',
    value19: 'Real (BRL)',
    value20: 'Real (BRL)',
    value21: 'Real (BRL)',
    value22: 'Real (BRL)',
    value23: 'Real (BRL)',
    value24: 'Real (BRL)',
    value25: 'Real (BRL)',
    value26: 'Real (BRL)',
    value27: 'Real (BRL)',
    value28: 'Real (BRL)',
    value29: 'Real (BRL)',
    value30: 'Real (BRL)',
    value31: 'Real (BRL)',
  },
  {
    label: 'Moeda Secundária de Visualiz.',
    value: 'Dólar (USD)',
    'secondary-currency': 'Dólar (USD)',
    value1: 'Dólar (USD)',
    value2: 'Dólar (USD)',
    value3: 'Dólar (USD)',
    value4: 'Dólar (USD)',
    value5: 'Dólar (USD)',
    value6: 'Dólar (USD)',
    value7: 'Dólar (USD)',
    value8: 'Dólar (USD)',
    value9: 'Dólar (USD)',
    value10: 'Dólar (USD)',
    value11: 'Dólar (USD)',
    value12: 'Dólar (USD)',
    value13: 'Dólar (USD)',
    value14: 'Dólar (USD)',
    value15: 'Dólar (USD)',
    value16: 'Dólar (USD)',
    value17: 'Dólar (USD)',
    value18: 'Dólar (USD)',
    value19: 'Dólar (USD)',
    value20: 'Dólar (USD)',
    value21: 'Dólar (USD)',
    value22: 'Dólar (USD)',
    value23: 'Dólar (USD)',
    value24: 'Dólar (USD)',
    value25: 'Dólar (USD)',
    value26: 'Dólar (USD)',
    value27: 'Dólar (USD)',
    value28: 'Dólar (USD)',
    value29: 'Dólar (USD)',
    value30: 'Dólar (USD)',
    value31: 'Dólar (USD)',
  },
]
const pagination = ref({
  page: 1,
  rowsPerPage: 5,
  rowsNumber: 0,
})
const updatePagination = (val) => {
  pagination.value = val
}
</script>
<style lang="sass">

.custom-btn-muted
  background-color: #bdb4b41c !important
  color: #000 !important
  border: 1px solid #bdb4b4 !important
.q-btn-special
  vertical-align: middle
  font-size: 9px !important
  font-weight: 500 !important
  text-align: center !important
  cursor: default
.q-badge-special
  background-color: #f5f5f5 !important
  color: #000 !important
  padding: 2px 6px !important
  border-radius: 4px !important
  font-size: 12px !important
  line-height: 1 !important
  min-height: 12px !important
  font-weight: normal !important
  vertical-align: baseline !important
.ExpansaoContractTable
  tr:first-child
    background-color: #f5f5f5
    color: #000
  tr:first-child td:first-child
    /* bg color is important for th; just specify one */
    background-color: #f5f5f5
    border-right: 1px solid #ececec
  .my-special td:first-child
    background-color: red
    border-right: 1px solid #ececec
  td:first-child
    background-color: #fff
    border-right: 0px solid #ececec

  th:first-child,
  td:first-child
    position: sticky
    left: 0
    z-index: 1
.my-special
  margin-right: 10rem !important
</style>
