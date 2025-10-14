<template>
  <div class="ProjectionContractTable">
    <q-table
      :grid="$q.screen.xs"
      flat
      dense
      bordered
      :rows="nowProjectionRow"
      :columns="columnsProjection"
      row-key="label"
      hide-header
      hide-pagination
      :pagination="pagination"
      class="LogicContractTable"
      v-if="projectionStatus == 1"
    >
      <template v-slot:body-cell-label="props">
        <q-td :props="props">
          <!-- <q-badge color="grey" text-color="white">{{ props.row.label }}</q-badge> -->
          {{ props.row.label }}
        </q-td>
      </template>
    </q-table>
    <projection-compare-table v-else />
  </div>
</template>
<script setup>
import { ref } from 'vue'
import { useLayoutStore } from 'src/stores/layout'
import { storeToRefs } from 'pinia'
import ProjectionCompareTable from './ProjectionCompareTable.vue'
import useProjection from 'src/composables/Fakes/useProjection'
const { columnsProjection, nowProjectionRow } = useProjection()
const storeLayout = useLayoutStore()
const { projectionStatus } = storeToRefs(storeLayout)
const pagination = ref({
  page: 1,
  rowsPerPage: 5,
  rowsNumber: 0,
})
</script>
