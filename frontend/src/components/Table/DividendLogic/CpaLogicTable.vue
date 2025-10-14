<template>
  <q-table
    :grid="$q.screen.xs"
    flat
    bordered
    :rows="rowCpa"
    :columns="columnsCpa"
    row-key="label"
    hide-header
    hide-pagination
    :pagination="pagination"
    class="cpa-logic-table"
  >
    <template v-slot:body="props">
      <q-tr :props="props">
        <q-td :props="props" key="label">
          {{ props.row.label }}
        </q-td>
        <q-td v-for="i in 11" :key="`value${i === 1 ? '' : i - 1}`" :props="props">
          <q-chip
            v-if="arrayChip.includes(props.row[`value${i === 1 ? '' : i - 1}`])"
            size="sm"
            square
            padding="lg"
            no-caps
            style="border: 1px solid #bdb4b4"
            :class="{
              'custom-btn-primary': props.row[`value${i === 1 ? '' : i - 1}`] === 'Pagamento feito',
              'custom-btn-warning': props.row[`value${i === 1 ? '' : i - 1}`] === 'Perto de Vencer',
            }"
            :label="props.row[`value${i === 1 ? '' : i - 1}`]"
          />
          <span v-else>{{ props.row[`value${i === 1 ? '' : i - 1}`] }}</span>
        </q-td>
      </q-tr>
    </template>
  </q-table>
</template>
<script setup>
import { defineComponent, ref } from 'vue'
import useCpa from 'src/composables/Fakes/useCpa'

const { columnsCpa, rowCpa } = useCpa()
const arrayChip = [
  'Pendente',
  'Pagamento feito',
  'Perto de Vencer',
  '#A231 Nome do..',
  'x9s0a1ka-boleto',
  '12jasn--t213_comp',
]
defineComponent({
  name: 'CpaLogicTable',
})
const pagination = ref({
  page: 1,
  rowsPerPage: 5,
  rowsNumber: 0,
})
</script>
<style lang="sass">
.ExpansiveLogic
  tr:first-child
    background-color: #f5f5f5
    color: #000
</style>
