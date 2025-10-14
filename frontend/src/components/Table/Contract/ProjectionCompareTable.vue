<template>
  <div class="ProjectionCompareTable">
    <q-table
      :grid="$q.screen.xs"
      flat
      dense
      bordered
      :rows="rowProjectionNow"
      :columns="columnsProjectionNow"
      row-key="label"
      hide-header
      hide-pagination
      :pagination="pagination"
      class="LogicContractTable"
    >
      <template v-slot:body-cell-label="props">
        <q-td :props="props">
          <!-- <q-badge color="grey" text-color="white">{{ props.row.label }}</q-badge> -->
          {{ props.row.label }}
        </q-td>
      </template>
    </q-table>
    <div class="col-10 q-my-md">
      <b>Projeção</b>
      <span class="q-ml-md bg-positive-light q-pa-xs tag-positive-light"> Projeção </span>
    </div>
    <q-table
      :grid="$q.screen.xs"
      flat
      dense
      bordered
      :rows="rowCompare"
      :columns="columnsCompare"
      row-key="label"
      hide-header
      hide-pagination
      :pagination="pagination"
      class="LogicContractTable"
    >
      <template v-slot:body-cell-label="props">
        <q-td :props="props">
          <!-- <q-badge color="grey" text-color="white">{{ props.row.label }}</q-badge> -->
          {{ props.row.label }}
        </q-td>
      </template>
    </q-table>
  </div>
</template>
<script setup>
import { ref } from 'vue'
import useProjectionNow from 'src/composables/Fakes/useProjectionNow'
import useCompare from 'src/composables/Fakes/useCompare'
const { columnsProjectionNow, rowProjectionNow } = useProjectionNow()
const { columnsCompare, rowCompare } = useCompare()
// import { useLayoutStore } from 'src/stores/layout'
// import { storeToRefs } from 'pinia'
// const storeLayout = useLayoutStore()
// const { projectionStatus } = storeToRefs(storeLayout)
const pagination = ref({
  page: 1,
  rowsPerPage: 5,
  rowsNumber: 0,
})
</script>
