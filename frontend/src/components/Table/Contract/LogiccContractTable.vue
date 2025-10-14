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
    class="LogicContractTable"
  >
    <template v-slot:body-cell-label="props">
      <q-td :props="props">
        <!-- <q-badge color="grey" text-color="white">{{ props.row.label }}</q-badge> -->
        {{ props.row.label }}
      </q-td>
    </template>
  </q-table>
</template>
<script setup>
import { defineComponent, ref } from 'vue'
defineComponent({
  name: 'LogicContractTable',
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
    classes: () => 'border-right-3',
  },
  value0,
  ...values,
]
const retornClass = (value) => {
  const test = [value]
  const encontrado = test.some((objeto) => objeto.label === 'Valorização do dia [abs (%)]')
  const logicaContrato = test.some(
    (objeto) =>
      objeto.label === 'Oscilação Máx. Positiva [abs (%)]' ||
      objeto.label === 'Lógica de Dividendo Atrelada',
  )
  const positivo = test.some((objeto) => objeto.label === 'Rendimento Lóg. Contrato [R$ (%)]')
  if (encontrado) {
    return 'text-negative'
  }
  if (logicaContrato) {
    return 'text-positive'
  }
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
    label: 'Preço do papel [R$]',
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
    label: 'Valorização do dia [abs (%)]',
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
    label: 'Preço de abertura [R$]',
    value: '300,0040',
    value1: '300,0040',
    value2: '300,0040',
    value3: '300,0040',
    value4: '300,0040',
    value5: '300,0040',
    value6: '300,0040',
    value7: '300,0040',
    value8: '300,0040',
    value9: '300,0040',
    value10: '300,0040',
    value11: '300,0040',
    value12: '300,0040',
    value13: '300,0040',
    value14: '300,0040',
    value15: '300,0040',
    value16: '300,0040',
    value17: '300,0040',
    value18: '300,0040',
    value19: '300,0040',
    value20: '300,0040',
    value21: '300,0040',
    value22: '300,0040',
    value23: '300,0040',
    value24: '300,0040',
    value25: '300,0040',
    value26: '300,0040',
    value27: '300,0040',
    value28: '300,0040',
    value29: '300,0040',
    value30: '300,0040',
    value31: '300,0040',
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
    label: 'Oscilação Máx. Negativa [abs (%)]',
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
    label: 'Oscilação Máx. Positiva [abs (%)]',
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
    label: 'Média de Oscilação [R$]',
    value: '300,0040',
    value1: '300,0040',
    value2: '300,0040',
    value3: '300,0040',
    value4: '300,0040',
    value5: '300,0040',
    value6: '300,0040',
    value7: '300,0040',
    value8: '300,0040',
    value9: '300,0040',
    value10: '300,0040',
    value11: '300,0040',
    value12: '300,0040',
    value13: '300,0040',
    value14: '300,0040',
    value15: '300,0040',
    value16: '300,0040',
    value17: '300,0040',
    value18: '300,0040',
    value19: '300,0040',
    value20: '300,0040',
    value21: '300,0040',
    value22: '300,0040',
    value23: '300,0040',
    value24: '300,0040',
    value25: '300,0040',
    value26: '300,0040',
    value27: '300,0040',
    value28: '300,0040',
    value29: '300,0040',
    value30: '300,0040',
    value31: '300,0040',
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
.q-btn-special
  flex-direction: column
  align-items: stretch
  position: relative
  outline: 0
  border: 0
  vertical-align: middle
  font-size: 10px !important
  text-decoration: none
  color: inherit
  background: transparent
  font-weight: 500 !important
  text-align: center !important
  width: auto
  height: auto
  cursor: default
  padding: 4px 16px
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
.LogicContractTable
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
    border-right: 3px solid #ececec
  th:first-child,
  td:first-child
    position: sticky
    left: 0
    z-index: 1
.my-special
  margin-right: 10rem !important
</style>
