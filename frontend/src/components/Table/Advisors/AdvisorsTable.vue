<template>
  <div class="q-pa-md AdvisorsTable">
    <q-table
      flat
      dense
      class="my-sticky-header-column-table"
      hide-pagination
      :pagination="pagination"
      :rows="paginatedRows"
      :columns="columnsAssessores"
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
              :disable="filteredRows.length === 0"
              @click="exportTable"
            />
            <q-btn size="md" padding="xs" outline class="">
              <IconLayoutCards size="18" />
            </q-btn>
            <q-btn size="md" padding="xs" outline color="primary" class="outline border-radius-4">
              <IconList size="18" />
            </q-btn>
          </div>
        </div>
      </template>
      <!-- Coluna de Assessores -->
      <template v-slot:body-cell-assessor="props">
        <q-td :props="props">
          <q-item>
            <q-item-section avatar>
              <avatar-initials
                :src="(props.row.assessor && props.row.assessor.avatar) || props.row.avatar || ''"
                :name="(props.row.assessor && props.row.assessor.name) || props.row.name || ''"
                size="32px"
                rounded
                class="q-mr-sm"
              />
            </q-item-section>
            <q-item-section align="left">
              <q-item-label>
                {{ (props.row.assessor && props.row.assessor.name) || props.row.name || '' }}
              </q-item-label>
              <q-item-label caption>
                {{ (props.row.assessor && props.row.assessor.email) || props.row.email || '' }}
              </q-item-label>
            </q-item-section>
          </q-item>
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
                  @click.prevent="editAndClose(props.row.id)"
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
      v-model="advisorsDialog"
      position="right"
      full-height
      full-width
      persistent
      maximized
      class="control-width"
    >
      <edit-advisor-layout />
    </q-dialog>
    <q-dialog
      v-model="splentHistoricDialog"
      position="right"
      full-height
      full-width
      persistent
      maximized
      class="control-width"
    >
      <historic-splent-layout />
    </q-dialog>
    <q-dialog
      v-model="commissionDialog"
      position="right"
      full-height
      full-width
      persistent
      maximized
      class="control-width-compare"
    >
      <add-commission-form-layout />
    </q-dialog>
    <div class="row justify-between items-center q-mt-md">
      <div class="row items-center">
        <span class="q-mr-sm">Itens por pág.:</span>
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
          Mostrando {{ firstItemIndex }} a {{ lastItemIndex }} de Total de
          {{ filteredRows.length }} itens
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
import { useAdvisorStore } from 'src/stores/advisor'
import { storeToRefs } from 'pinia'
import EditAdvisorLayout from 'src/layouts/Advisors/EditAdvisorLayout.vue'
import useAdvisors from 'src/composables/Fakes/useAdvisors'
import AvatarInitials from 'src/components/Avatar/AvatarInitials.vue'
import HistoricSplentLayout from 'src/layouts/Advisors/HistoricSplentLayout.vue'
import AddCommissionFormLayout from 'src/layouts/Advisors/Form/AddCommissionFormLayout.vue'
defineComponent({
  name: 'AdvisorsTable',
})
const storeLayout = useLayoutStore()
const storeAdvisor = useAdvisorStore()
const { columnsAssessores, rowsAssessores, getAdvisor, removeAdvisor } = useAdvisors()
// const { compare } = storeToRefs(storeClient)
const { advisorsDialog, splentHistoricDialog, commissionDialog } = storeToRefs(storeLayout)
// const classCompare = computed(() => {
//   console.log('classCompare', compare.value.length)
//   return compare.value.length < 3 ? 'control-width' : 'control-width-compare'
// })

const editAdvisor = (id) => {
  console.log('editAdvisor', id)
  storeLayout.setDialogOpengHeader('Assessores')
  storeLayout.seAdvisorsDialog(true)
  storeAdvisor.setAdvisorEdit(getAdvisor(id))

  // advisorsDialog.value = true
}

const selected = ref([])

const getSelectedString = () => {
  return selected.value.length === 0
    ? ''
    : `${selected.value.length} record${selected.value.length > 1 ? 's' : ''} selected of ${rowsAssessores.length}`
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
  return rowsAssessores.filter((row) => {
    // Filtro de pesquisa geral: pesquisar por nome do assessor
    if (filter.value) {
      const name = String(row.assessor && row.assessor.name ? row.assessor.name : '').toLowerCase()
      if (!name.includes(filter.value.toLowerCase())) return false
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
  const content = [columnsAssessores.map((col) => wrapCsvValue(col.label))]
    .concat(
      filteredRows.value.map((row) =>
        columnsAssessores
          .map((col) => {
            let val =
              typeof col.field === 'function'
                ? col.field(row)
                : row[col.field === void 0 ? col.name : col.field]
            if (val && typeof val === 'object') {
              val = val.name || (val.assessor && val.assessor.name) || ''
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
    `advisors-${date.getDate()}-${date.getMonth()}-${date.getTime()}.csv`,
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

const idToRemove = ref(null)

const confirmRemoveAdvisor = async () => {
  const id = idToRemove.value
  if (!id) return
  try {
    await Promise.resolve(removeAdvisor(id))
    $q.notify({ message: 'Assessor removido com sucesso.', color: 'positive' })
  } catch (e) {
    console.error('removeAdvisor failed', e)
    $q.notify({ message: 'Erro ao remover assessor', color: 'negative' })
  } finally {
    idToRemove.value = null
  }
}

const onRemoveAdvisor = async (id) => {
  // store id and open a dialog like clients flow
  idToRemove.value = id
  // open dialog; only proceed on OK
  $q.dialog({
    title: 'Confirmar remoção',
    message: 'Tem certeza que deseja remover este assessor? Essa ação não pode ser desfeita.',
    cancel: true,
    persistent: true,
  })
    .onOk(async () => {
      await confirmRemoveAdvisor()
    })
    .onCancel(() => {
      idToRemove.value = null
    })
}

// helpers used by template to close menu and trigger actions
const editAndClose = (id) => editAdvisor(id)
const confirmRemoveAndClose = (id) => onRemoveAdvisor(id)

// action menu control
// q-menu uses default activator behavior
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
