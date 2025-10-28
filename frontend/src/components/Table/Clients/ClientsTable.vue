<template>
  <div class="q-pa-md ClientsTable">
    <q-table
      flat
      dense
      class="my-sticky-header-column-table"
      hide-pagination
      :pagination="pagination"
      :rows="paginatedRows"
      :columns="props.columns.length == 0 ? columnsClient : props.columns"
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
            <q-btn
              color="primary"
              no-caps
              label="Exportar"
              flat
              size="sm"
              :disable="rowsArray.length === 0"
              @click="exportTable"
            />
            <q-btn
              size="xs"
              padding="xs"
              no-caps
              outline
              label="Comparar Clientes"
              :class="!compareBtn ? 'text-muted' : 'text-primary'"
              :disable="selected.length !== 2"
              @click.prevent.stop="compareSelected"
            />
            <q-btn size="md" padding="xs" outline class="">
              <IconLayoutCards size="18" />
            </q-btn>
            <q-btn size="md" padding="xs" outline class="outline" color="primary">
              <IconList size="18" />
            </q-btn>
          </div>
        </div>
      </template>
      <!-- Coluna de Clientes -->
      <template v-slot:body-cell-cliente="props">
        <q-td :props="props">
          <q-item>
            <q-item-section avatar>
              <avatar-initials
                :src="
                  (props.row.cliente &&
                    (props.row.cliente.avatar || props.row.cliente.avatar_url)) ||
                  props.row.avatar ||
                  props.row.avatar_url
                "
                :name="props.row.cliente && props.row.cliente.name"
                size="32px"
                class="q-mr-sm"
              />
            </q-item-section>
            <q-item-section align="left">
              <q-item-label>
                {{ props.row.cliente && props.row.cliente.name }}
              </q-item-label>
              <q-item-label caption>
                {{ props.row.cliente && props.row.cliente.email }}
              </q-item-label>
            </q-item-section>
          </q-item>
        </q-td>
      </template>

      <!-- contrato -->
      <template v-slot:body-cell-contrato="props">
        <q-td :props="props">
          <p>
            {{ $filtersString.formatPartternCurrency(props.row?.contrato?.total || 0) }} <br />
            <span class="text-muted text-small">{{ props.row?.contrato?.quantity || '-' }}</span>
          </p>
        </q-td>
      </template>
      <template v-slot:body-cell-saldo="props">
        <q-td :props="props">
          <p>{{ $filtersString.formatPartternCurrency(props.row.saldo) }} <br /></p>
        </q-td>
      </template>
      <!-- assessor (resolve id -> name using advisor store when possible) -->
      <template v-slot:body-cell-assessor="props">
        <q-td :props="props">
          <p class="text-right">
            {{ resolveAssessorName(props.row) }}
          </p>
        </q-td>
      </template>

      <!-- dividendo -->
      <template v-slot:body-cell-dividendo="props">
        <q-td :props="props">
          <div class="text-right">
            <div>{{ formatDividendoValue(props.row) }}</div>
            <div class="text-muted text-small">{{ formatDividendoDate(props.row) }}</div>
          </div>
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
            :data-test="'clients-row-actions-btn-' + props.row.id"
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
                  @click.prevent="editAndClose(props.row.id)"
                  :data-test="'clients-row-edit-' + props.row.id"
                >
                  <q-icon
                    :name="$filtersString.resolveUrl('img:icons/edit.svg')"
                    size="0.8rem"
                    class="text-muted"
                  />
                  <span class="q-ml-sm text-muted" style="font-size: small; color: #656565">
                    Editar
                  </span>
                </q-btn>
                <q-btn
                  class="q-mb-xs"
                  no-caps
                  flat
                  style="min-width: 181px; align-items: start"
                  :data-test="'clients-row-delete-' + props.row.id"
                  @click.prevent="confirmRemoveAndClose(props.row.id)"
                >
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
            </q-menu>
          </q-btn>
        </q-td>
      </template>
    </q-table>
    <q-dialog
      v-model="clientDialog"
      position="right"
      full-height
      full-width
      maximized
      persistent
      class="control-width"
      data-test="clients-create-dialog"
    >
      <edit-clients-layout />
    </q-dialog>
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
    </q-dialog>
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
        <q-pagination
          v-model="pagination.page"
          color="primary"
          :max="pagesNumber"
          :max-pages="6"
          size="sm"
          direction-links
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, defineComponent } from 'vue'
import { exportFile, useQuasar } from 'quasar'
import { useLayoutStore } from 'src/stores/layout'
import { storeToRefs } from 'pinia'
import { useClientStore } from 'src/stores/client'
import useCliente from 'src/composables/Fakes/useCliente'
import useAdvisors from 'src/composables/Fakes/useAdvisors'
import filtersString from 'src/boot/filtersString'

import EditClientsLayout from 'src/layouts/Clients/EditClientsLayout.vue'
import CompareLayout from 'src/layouts/Clients/CompareLayout.vue'
import AvatarInitials from 'src/components/Avatar/AvatarInitials.vue'
defineComponent({
  name: 'ClientsTable',
})
const props = defineProps({
  columns: {
    type: Array,
    default: () => [],
  },
  // optional override rows: if provided (non-null), the table will render these rows
  rows: {
    type: Array,
    default: null,
  },
})
const storeLayout = useLayoutStore()
const storeClient = useClientStore()
// const { compare } = storeToRefs(storeClient)
const { clientDialog, dialogCompare } = storeToRefs(storeLayout)
const { rowsClient, columnsClient, getClient, deleteClient } = useCliente()
// prefer external override rows when provided (e.g. empty list when creating new advisor)
const rowsSource = computed(() => {
  return props.rows && Array.isArray(props.rows) ? props.rows : rowsClient
})
// ensure a safe array view for templates and consumers
const rowsArray = computed(() => (Array.isArray(rowsSource.value) ? rowsSource.value : []))

const confirmRemoveRow = (id) => {
  // Use dialog event handlers to ensure deletion happens only after user confirms
  $q.dialog({
    title: 'Confirmar remoção',
    message: 'Tem certeza que deseja remover este cliente? Esta ação não pode ser desfeita.',
    cancel: true,
    persistent: true,
  })
    .onOk(async () => {
      try {
        const res = await deleteClient(id)
        if (res === true || res) {
          $q.notify({ message: 'Cliente removido', color: 'positive' })
        } else {
          $q.notify({ message: 'Não foi possível remover o cliente', color: 'negative' })
        }
      } catch (err) {
        console.error('remove client error', err)
        $q.notify({ message: 'Erro ao remover cliente', color: 'negative' })
      }
    })
    .onCancel(() => {
      // usuário cancelou — nenhuma ação necessária
    })
}

// helper used by template to close menu and trigger edit
const editAndClose = (id) => editClient(id)
const confirmRemoveAndClose = (id) => confirmRemoveRow(id)

// menu uses default q-menu activator behavior
// const classCompare = computed(() => {
//   console.log('classCompare', compare.value.length)
//   return compare.value.length < 3 ? 'control-width' : 'control-width-compare'
// })

const editClient = (id) => {
  // set header for editing mode
  storeLayout.setDialogOpengHeader('Edição de Cliente')
  console.log('editClient', id)
  try {
    const payload = getClient(id)
    // Log the payload received from the adapter before normalization
    console.log('editClient payload before setClientEdit', payload)
    storeLayout.setClientDialog(true)
    storeLayout.setClientEdit(payload)
  } catch (e) {
    console.error('editClient: failed to get client payload', e && e.message)
    storeLayout.setClientDialog(true)
  }
}

const compareSelected = () => {
  if (selected.value.length !== 2) {
    $q.notify({
      message: 'Selecione exatamente dois clientes para comparar.',
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
const compareBtn = computed(() => selected.value.length === 2)
const getSelectedString = () => {
  return selected.value.length === 0
    ? ''
    : `${selected.value.length} record${selected.value.length > 1 ? 's' : ''} selected of ${rowsArray.value.length}`
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
  return rowsArray.value.filter((row) => {
    // ensure row has cliente object before accessing
    if (!row || !row.cliente) return false
    // Filtro de pesquisa geral
    if (
      filter.value &&
      !Object.values(row.cliente || {}).some((val) =>
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
  let formatted = ''
  try {
    formatted = formatFn !== void 0 ? formatFn(val, row) : val
    formatted = formatted === void 0 || formatted === null ? '' : String(formatted)
    formatted = formatted.split('"').join('""')
  } catch {
    formatted = ''
  }
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
  const content = [columnsClient.map((col) => wrapCsvValue(col.label))]
    .concat(
      rowsArray.value.map((row) =>
        columnsClient
          .map((col) => {
            let val =
              typeof col.field === 'function'
                ? col.field(row)
                : row[col.field === void 0 ? col.name : col.field]
            // special handling for exportable values
            if (col.name === 'assessor') {
              val = resolveAssessorName(row)
            } else if (col.name === 'contrato') {
              if (val && typeof val === 'object') val = val.total != null ? val.total : ''
            } else if (col.name === 'dividendo') {
              if (val && typeof val === 'object') val = val.total != null ? val.total : ''
            } else if (val && typeof val === 'object') {
              val = val.name || (val.cliente && val.cliente.name) || ''
            }
            return wrapCsvValue(val, col.format, row)
          })
          .join(','),
      ),
    )
    .join('\r\n')
  const date = new Date()
  const bomContent = '\uFEFF' + content
  const status = exportFile(
    `clients-${date.getDate()}-${date.getMonth()}-${date.getTime()}.csv`,
    bomContent,
    'text/csv;charset=utf-8',
  )

  if (status !== true) {
    $q.notify({
      message: 'Browser denied file download...',
      color: 'negative',
      icon: 'warning',
    })
  }
}

// helpers to display assessor and dividend info
const { rowsAssessores } = useAdvisors()
const resolveAssessorName = (row) => {
  // prefer investment.assessor (may be id or object or name)
  const inv = row && (row.investment || {})
  const aid = inv && inv.assessor
  // numeric id (number or numeric string)
  if (aid !== undefined && aid !== null) {
    if (typeof aid === 'number' || (typeof aid === 'string' && String(aid).match(/^\d+$/))) {
      const id = Number(aid)
      const found = (rowsAssessores || []).find((a) => Number(a.id) === id)
      if (found && found.assessor && found.assessor.name) return found.assessor.name
      if (found && found.name) return found.name
      // if backend resolved to name but stored as id elsewhere, continue to fallbacks
    }
    // object with various shapes: { label, value }, { name }, { assessor: { name } }
    if (typeof aid === 'object') {
      // { label: 'Carlos Costa', value: 180 }
      if (aid.label) return aid.label
      // { name: 'Carlos Costa' }
      if (aid.name) return aid.name
      // { assessor: { name: 'Carlos Costa' } } or { assessor: 'Carlos Costa' }
      if (aid.assessor) {
        if (typeof aid.assessor === 'object') return aid.assessor.name || '-'
        return aid.assessor
      }
      return '-'
    }
    // string name — try to normalize/verify by searching advisors list
    if (typeof aid === 'string' && aid.trim()) {
      // direct string — prefer to show it
      // but try to find canonical casing in rowsAssessores
      const name = aid.trim()
      const foundByName = (rowsAssessores || []).find((a) => {
        const aName = (a && ((a.assessor && a.assessor.name) || a.name)) || ''
        return aName && String(aName).toLowerCase() === String(name).toLowerCase()
      })
      if (foundByName)
        return (foundByName.assessor && foundByName.assessor.name) || foundByName.name
      return name
    }
  }
  // older data may place assessor at top-level
  if (row && row.assessor) return row.assessor
  return '-'
}

const formatDividendoValue = (row) => {
  // prefer investment.valor_dividendo then dividendo.total then others
  const inv = row && (row.investment || {})
  if (inv && inv.valor_dividendo != null)
    return filtersString.formatPartternCurrency(inv.valor_dividendo)
  if (row && row.dividendo && row.dividendo.total != null)
    return filtersString.formatPartternCurrency(row.dividendo.total)
  return '-'
}

const formatDividendoDate = (row) => {
  const inv = row && (row.investment || {})
  if (inv && inv.data_dividendo) return inv.data_dividendo
  if (row && row.dividendo && row.dividendo.data) return row.dividendo.data
  return '-'
}
</script>
<style lang="sass">
.custom-btn-warning
  background-color: #FFD2881c !important
  color: #000 !important
  border: 1px solid #FFD288 !important
.custom-btn-primary
  background-color: #21ba451c !important
  color: #000 !important
  border: 1px solid #F1FDE8 !important
.custom-btn-negative
  background-color: #FF3D001c !important
  color: #000 !important
  border: 1px solid #FF3D00 !important
.custom-btn-muted
  background-color: #bdb4b41c !important
  color: #000 !important
  border: 1px solid #bdb4b4 !important
.q-btn--outline:before
  background-color: transparent !important
  border: 1px solid transparent !important
.my-sticky-header-column-table
  tr th
    position: sticky
    /* higher than z-index for td below */
    z-index: 2
    /* bg color is important; just specify one */
    background: #FAFAFA

  /* this will be the loading indicator */
  thead tr:last-child th
    /* height of all previous header rows */
    top: 48px
    /* highest z-index */
    z-index: 3
    font-weight: 700
    text-align: start
  thead tr:first-child th
    top: 0
    z-index: 1
  tr:first-child th:first-child
    /* highest z-index */
    z-index: 3

  td:first-child
    z-index: 1

  td:first-child, th:first-child
    position: sticky
    left: 0

  /* prevent scrolling behind sticky top row on focus */
  tbody
    /* height of all previous header rows */
    scroll-margin-top: 48px
.q-table--dense .q-table__top
  padding: 6px 0px !important
.q-table--dense .q-table th:first-child, .q-table--dense .q-table td:first-child
  padding: 0px !important
.q-checkbox--dense .q-checkbox__inner
  width: 0.4em
  min-width: 0.1em
  height: 0.4em
</style>
