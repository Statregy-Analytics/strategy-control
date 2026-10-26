<template>
  <div class="q-pa-md LeadsTable">
    <q-table
      flat
      dense
      class="my-sticky-header-column-table"
      hide-pagination
      :pagination="pagination"
      :rows="paginatedRows"
      :columns="columnLeads"
      row-key="id"
      @update:pagination="updatePagination"
      :selected-rows-label="getSelectedString"
      selection="multiple"
      v-model:selected="selected"
    >
      <!-- Filtros -->
      <template v-slot:top>
        <div class="row col-12 justify-between">
          <div class="col-3 text-start">
            <q-input
              dense
              outlined
              debounce="300"
              v-model="filter"
              placeholder="Pesquisar por palavra-chave"
              clearable
              prepend-inner-icon="search"
            >
              <template v-slot:prepend>
                <q-icon name="search" size="1.2rem" />
              </template>
            </q-input>
          </div>
          <div class="col self-end items-end" style="text-align-last: end">
            <q-btn color="primary" no-caps label="Exportar" flat size="sm" @click="exportTable" />
            <q-btn
              size="xs"
              padding="xs"
              no-caps
              outline
              label="Comparar Clientes"
              :class="!compareBtn ? 'text-muted' : 'text-primary'"
              @click.prevent.stop="compareSelected"
            />
            <q-btn
              size="md"
              padding="xs"
              :icon="$filtersString.resolveUrl('img:icons/layout-cards.svg')"
              outline
              color="primary"
              class="border-radius-4"
            />
            <q-btn
              size="md"
              padding="xs"
              :icon="$filtersString.resolveUrl('img:icons/list.svg')"
              outline
              class="outline"
              color="primary"
            />
          </div>
        </div>
      </template>
      <!-- Coluna de Clientes -->
      <template v-slot:body-cell-cliente="props">
        <q-td :props="props">
          <q-item>
            <q-item-section avatar>
              <q-avatar size="32px" class="q-mr-sm">
                <q-img
                  :src="props.row.cliente.avatar"
                  :alt="props.row.cliente.name"
                  :title="props.row.cliente.name"
                />
              </q-avatar>
            </q-item-section>
            <q-item-section align="left">
              <q-item-label>
                {{ props.row.cliente.name }}
              </q-item-label>
              <q-item-label caption>
                {{ props.row.cliente.email }}
              </q-item-label>
            </q-item-section>
          </q-item>
        </q-td>
      </template>

      <!-- Coluna de emprestimo -->
      <template v-slot:body-cell-emprestimo="props">
        <q-td :props="props">
          <q-btn
            size="xs"
            outline
            padding="xs"
            no-caps
            class="custom-btn-muted"
            :label="props.row.emprestimo"
          />
        </q-td>
      </template>
      <!-- dividendo -->
      <template v-slot:body-cell-dividendo="props">
        <q-td :props="props">
          <p>
            {{ $filtersString.formatPartternCurrency(props.row.dividendo.total) }} <br />
            <span class="text-muted text-small">Data: {{ props.row.dividendo.data }}</span>
          </p>
        </q-td>
      </template>
      <!-- contrato -->
      <template v-slot:body-cell-contrato="props">
        <q-td :props="props">
          <p>
            {{ $filtersString.formatPartternCurrency(props.row.contrato.total) }} <br />
            <span class="text-muted text-small">{{ props.row.contrato.quantity }}</span>
          </p>
        </q-td>
      </template>
      <template v-slot:body-cell-saldo="props">
        <q-td :props="props">
          <p>{{ $filtersString.formatPartternCurrency(props.row.saldo) }} <br /></p>
        </q-td>
      </template>
      <!-- actions -->
      <template v-slot:body-cell-actions="props">
        <q-td :props="props">
          <q-btn
            size="xs"
            padding="xs"
            no-caps
            flat
            :icon="$filtersString.resolveUrl('img:icons/dots-vertical.svg')"
          >
            <q-menu transition-show="flip-right" transition-hide="flip-left">
              <div
                class=""
                style="
                  min-width: 181px;
                  border-radius: 12px;
                  gap: 4px;
                  display: flex;
                  flex-direction: column;
                  justify-content: start;
                "
              >
                <q-btn
                  class="q-mb-xs"
                  no-caps
                  flat
                  style="min-width: 181px; align-items: start"
                  @click.prevent="editLead(props.row.id)"
                >
                  <q-icon
                    :name="$filtersString.resolveUrl('img:icons/edit.svg')"
                    size="0.8rem"
                    class="text-muted"
                  />
                  <span class="q-ml-sm text-muted" style="font-size: small; color: #656565">
                    Editar
                  </span>
                  <!-- <q-tooltip anchor="top middle" self="bottom middle" transition-show="scale">
                  </q-tooltip> -->
                </q-btn>
                <q-btn class="q-mb-xs" no-caps flat style="min-width: 181px; align-items: start">
                  <q-icon
                    :name="$filtersString.resolveUrl('img:icons/trash.svg')"
                    size="0.8rem"
                    class="text-red"
                    color="red"
                  />
                  <span class="q-ml-sm text-muted" style="font-size: small; color: #656565">
                    Remover
                  </span>
                </q-btn>
              </div>
              <!-- <q-list style="min-width: 100px; border-radius: 12px"> </q-list> -->
            </q-menu>
          </q-btn>
        </q-td>
      </template>
    </q-table>
    <q-dialog
      v-model="leadDialog"
      position="right"
      full-height
      full-width
      maximized
      class="control-width"
    >
      <edit-lead-layout />
    </q-dialog>
    <!--
    <q-dialog
      v-model="dialogCompare"
      position="right"
      full-height
      full-width
      maximized
      persistent
      class="control-width-compare"
    >
      <compare-layout />
    </q-dialog> -->
    <!-- <div class="q-mt-md">Selected: {{ JSON.stringify(selected) }}</div> -->
    <div class="row justify-between items-center q-mt-md">
      <div class="row items-center">
        <span class="q-mr-sm">Itens por página:</span>
        <q-select
          dense
          outlined
          v-model="pagination.rowsPerPage"
          :options="[5, 10, 15, 20]"
          @update:model-value="updateRowsPerPage"
          :popup-content-style="{ fontSize: '10px' }"
          dropdown-icon="keyboard_arrow_down"
        />
        <span class="q-ml-md text-caption text-grey-8">
          Mostrando {{ firstItemIndex }} a {{ lastItemIndex }} de
          {{ filteredRows.length }} registros
        </span>
      </div>
      <div class="row justify-center q-mt-md">
        <entity-pagination v-model="pagination.page" :max="pagesNumber" />
      </div>
    </div>
  </div>
</template>

<script setup>
import EntityPagination from 'src/components/Entity/EntityPagination.vue'
import { ref, computed, defineComponent } from 'vue'
import { exportFile, useQuasar } from 'quasar'
import { useLayoutStore } from 'src/stores/layout'
import { storeToRefs } from 'pinia'
import { useClientStore } from 'src/stores/client'
// import useCliente from 'src/composables/Fakes/useCliente'
import { useLeadStore } from 'src/stores/lead'
import useLeads from 'src/composables/Fakes/useLeads'
import EditLeadLayout from 'src/layouts/Leads/EditLeadLayout.vue'
defineComponent({
  name: 'LeadsTable',
})

const storeLayout = useLayoutStore()
const storeClient = useClientStore()
const storeLead = useLeadStore()
// const { compare } = storeToRefs(storeClient)
const { leadDialog } = storeToRefs(storeLayout)
const { rowLeads, columnLeads, getClientLead } = useLeads()
// const classCompare = computed(() => {
//   console.log('classCompare', compare.value.length)
//   return compare.value.length < 3 ? 'control-width' : 'control-width-compare'
// })

const editLead = (id) => {
  storeLayout.setDialogOpengHeader('Lead')
  console.log('editLead', id)
  storeLayout.setLeadDialog(true)
  storeLead.setLeadEdit(getClientLead(id))

  // storeLayout.setClientDialog(true)
  // storeLayout.setClientEdit(getClientLead(id))
}

const compareSelected = () => {
  if (selected.value.length < 2) {
    $q.notify({
      message: 'Selecione pelo menos dois clientes para comparar.',
      color: 'negative',
      icon: 'warning',
    })
    return
  }
  storeLayout.setDialogOpengHeader('Comparar Clientes')
  storeLayout.setDialogCompare(true)
  storeClient.setCompareSelect(selected.value)
}
const selected = ref([])
const compareBtn = computed(() => {
  return selected.value.length > 1
})
const getSelectedString = () => {
  return selected.value.length === 0
    ? ''
    : `${selected.value.length} record${selected.value.length > 1 ? 's' : ''} selected of ${rowLeads.length}`
}

const pagination = ref({
  page: 1,
  rowsPerPage: 5,
  rowsNumber: 0,
})
const updatePagination = (val) => {
  pagination.value = val
}
const filter = ref('')
// Filtra as linhas com base nos filtros aplicados
const filteredRows = computed(() => {
  return rowLeads.filter((row) => {
    // Filtro de pesquisa geral
    if (
      filter.value &&
      !Object.values(row.cliente).some((val) =>
        String(val).toLowerCase().includes(filter.value.toLowerCase()),
      )
    ) {
      return false
    }
    return true
  })
})
// Calcula o número total de linhas para paginação
const rowsNumber = computed(() => filteredRows.value.length)

// Retorna apenas as linhas da página atual
const paginatedRows = computed(() => {
  const start = (pagination.value.page - 1) * pagination.value.rowsPerPage
  const end = start + pagination.value.rowsPerPage
  return filteredRows.value.slice(start, end)
})
// Calcula o número total de páginas
const pagesNumber = computed(() => {
  return Math.ceil(rowsNumber.value / pagination.value.rowsPerPage)
})

// Índices dos itens exibidos
const firstItemIndex = computed(() => {
  return (pagination.value.page - 1) * pagination.value.rowsPerPage + 1
})

const lastItemIndex = computed(() => {
  const end = pagination.value.page * pagination.value.rowsPerPage
  return end > rowsNumber.value ? rowsNumber.value : end
})

function wrapCsvValue(val, formatFn, row) {
  console.log('wrapCsvValue', val, formatFn, row)
  let formatted = formatFn !== void 0 ? formatFn(val, row) : val

  formatted = formatted === void 0 || formatted === null ? '' : String(formatted)

  formatted = formatted.split('"').join('""')
  /**
   * Excel accepts \n and \r in strings, but some other CSV parsers do not
   * Uncomment the next two lines to escape new lines
   */
  // .split('\n').join('\\n')
  // .split('\r').join('\\r')

  return `"${formatted}"`
}
const updateRowsPerPage = (val) => {
  pagination.value.rowsPerPage = val
  pagination.value.page = 1
}
const $q = useQuasar()
const exportTable = () => {
  // naive encoding to csv format
  const content = [columnLeads.map((col) => wrapCsvValue(col.label))]
    .concat(
      rowLeads.map((row) =>
        columnLeads
          .map((col) =>
            wrapCsvValue(
              typeof col.field === 'function'
                ? col.field(row)
                : row[col.field === void 0 ? col.name : col.field],
              col.format,
              row,
            ),
          )
          .join(','),
      ),
    )
    .join('\r\n')
  const date = new Date()
  const status = exportFile(
    `clientes-${date.getDate()}-${date.getMonth()}-${date.getTime()}.csv`,
    content,
    'text/csv',
  )

  if (status !== true) {
    $q.notify({
      message: 'Browser denied file download...',
      color: 'negative',
      icon: 'warning',
    })
  }
}
</script>
