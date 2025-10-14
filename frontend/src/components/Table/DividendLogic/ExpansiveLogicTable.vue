<template>
  <q-table
    :grid="$q.screen.xs"
    flat
    bordered
    :rows="rowLogic"
    :columns="columnsLogic"
    row-key="label"
    hide-header
    hide-pagination
    :pagination="pagination"
    class="expansive-logic"
  >
    <template v-slot:body="props">
      <q-tr :props="props">
        <q-td :props="props" key="label">
          {{ props.row.label }}
        </q-td>
        <q-td v-for="i in 11" :key="`value${i === 1 ? '' : i - 1}`" :props="props">
          <q-chip
            v-if="props.row[`value${i === 1 ? '' : i - 1}`] === '300,00_'"
            size="sm"
            square
            padding="lg"
            no-caps
            style="border: 1px solid #bdb4b4"
            label="#A231 Nome do C..."
          />
          <span v-else>{{ props.row[`value${i === 1 ? '' : i - 1}`] }}</span>
        </q-td>
      </q-tr>
    </template>
  </q-table>
</template>
<script setup>
import { defineComponent, ref } from 'vue'
import useLogic from 'src/composables/Fakes/useLogic'

const { columnsLogic, rowLogic } = useLogic()

defineComponent({
  name: 'ExpansiveLogic',
})
const pagination = ref({
  page: 1,
  rowsPerPage: 5,
  rowsNumber: 0,
})
</script>
<style lang="sass"></style>
