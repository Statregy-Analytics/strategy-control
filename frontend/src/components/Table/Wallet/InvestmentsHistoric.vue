<template>
  <div class="">
    <q-table
      flat
      dense
      class="my-sticky-header-column-table"
      title="Histórico de Transações"
      :rows="paginatedRows"
      :columns="columnsMovement"
      row-key="id"
      :selected-rows-label="getSelectedString"
      selection="multiple"
      v-model:selected="selected"
      hide-pagination
      :pagination="pagination"
      @update:pagination="updatePagination"
      :loading="loading"
    >
      <!-- Filtros avançados -->
      <template v-slot:top>
        <div class="col-12 row q-mb-md">
          <div class="col-12 row q-col-gutter-sm">
            <div class="col-xs-12 col-sm-4 col-md-2">
              <div class="input-personal" @click="openDatePicker">
                <span
                  class="text-input text-muted"
                  :style="!dateRange.solicitado.to ? 'font-size:1.2em' : 'font-size:0.6em'"
                >
                  Data de solicitação
                </span>

                <q-btn flat v-if="!dateRange.solicitado.to">
                  <IconCalendarEventFilled size="16" />
                  <q-popup-proxy
                    cover
                    transition-show="scale"
                    transition-hide="scale"
                    ref="pickerSolitado"
                  >
                    <q-date v-model="dateRange.solicitado" range mask="DD/MM/YYYY">
                      <div class="row items-center justify-end q-gutter-sm">
                        <q-btn label="Cancel" color="primary" flat v-close-popup />
                        <q-btn label="OK" color="primary" flat v-close-popup />
                      </div>
                    </q-date>
                  </q-popup-proxy>
                </q-btn>
                <q-badge
                  v-else
                  class="custom-btn-info"
                  style="font-size: 12px !important; border: 1px solid var(--Info-200, #b9e1ff)"
                >
                  {{ dateRange.solicitado.from }} - {{ dateRange.solicitado.to }}
                  <IconX size="14" class="q-ml-xs cursor-pointer" @click.prevent="emptyDateRange" />
                </q-badge>
              </div>
            </div>

            <!-- Filtro por data limite -->
            <div class="col-xs-12 col-sm-4 col-md-2">
              <div class="input-personal" @click.prevent="openDatePickerLimite">
                <span
                  class="text-input text-muted"
                  :style="!dateRange.limitado.to ? 'font-size:1.2em' : 'font-size:0.6em'"
                >
                  Data Limite
                </span>

                <q-btn flat v-if="!dateRange.limitado.to">
                  <IconCalendarEventFilled size="16" />
                  <q-popup-proxy
                    cover
                    transition-show="scale"
                    transition-hide="scale"
                    ref="pickerLimite"
                  >
                    <q-date v-model="dateRange.limitado" range mask="DD/MM/YYYY">
                      <div class="row items-center justify-end q-gutter-sm">
                        <q-btn label="Cancel" color="primary" flat v-close-popup />
                        <q-btn label="OK" color="primary" flat v-close-popup />
                      </div>
                    </q-date>
                  </q-popup-proxy>
                </q-btn>
                <q-badge
                  v-else
                  class="custom-btn-info"
                  style="font-size: 12px !important; border: 1px solid var(--Info-200, #b9e1ff)"
                >
                  {{ dateRange.limitado.from }} - {{ dateRange.limitado.to }}
                  <IconX size="14" class="q-ml-xs cursor-pointer" @click.prevent="emptyDateRange" />
                </q-badge>
              </div>
            </div>

            <!-- Filtro por tipo -->
            <div class="col-xs-12 col-sm-4 col-md-2">
              <q-select
                v-model="filters.tipo"
                :options="tiposOptions"
                outlined
                dense
                input-style="max-height: 50px !important;"
                use-chips
                dropdown-icon="keyboard_arrow_down"
                v-bind:hide-dropdown-icon="filters.tipo != null"
              >
                <template v-slot:selected>
                  <span class="text-muted" style="font-size: 14px">Tipo de movimentação </span>
                  <q-badge
                    v-if="filters.tipo"
                    class="custom-btn-info"
                    style="font-size: 12px !important; border: 1px solid var(--Info-200, #b9e1ff)"
                  >
                    {{ filters.tipo }}
                    <IconX
                      size="14"
                      class="q-ml-xs cursor-pointer"
                      @click.prevent="filters.tipo = null"
                    />
                  </q-badge>
                </template>
              </q-select>
              <!-- label="Tipo de Movimentação" -->
            </div>
            <!-- Filtro por Nome -->
            <div class="col-xs-12 col-sm-4 col-md-3">
              <q-select
                v-model="filters.clienteName"
                :options="optionsClienteName"
                outlined
                dense
                input-style="max-height: 50px !important;"
                use-chips
                dropdown-icon="keyboard_arrow_down"
                aria-placeholder="Selecione teste"
                :display-value="`Company: ${filters.clienteName ? filters.clienteName.label : '*none*'}`"
                v-bind:hide-dropdown-icon="filters.clienteName != null"
              >
                <template v-slot:selected>
                  <span class="text-muted">Cliente </span>
                  <q-badge
                    v-if="filters.clienteName"
                    class="custom-btn-info"
                    style="font-size: 12px !important; border: 1px solid var(--Info-200, #b9e1ff)"
                  >
                    {{ filters.clienteName.label }}
                    <span v-if="dateRange.limitado.from && dateRange.limitado.to">
                      - {{ dateRange.limitado.from }} - {{ dateRange.limitado.to }}</span
                    >
                    <IconX
                      size="14"
                      class="q-ml-xs cursor-pointer"
                      @click.prevent="filters.clienteName = null"
                    />
                  </q-badge>
                </template>
              </q-select>
              <!-- :label="filters.clienteName ? '' : 'Pesquisar por cliente'" -->
            </div>

            <!-- Filtro por status -->
            <div class="col-xs-12 col-sm-4 col-md-2">
              <q-select
                v-model="filters.status"
                :options="statusOptions"
                outlined
                dense
                use-chips
                dropdown-icon="keyboard_arrow_down"
                v-bind:hide-dropdown-icon="filters.status != null"
              >
                <template v-slot:selected>
                  <span class="text-muted" style="font-size: 14px">Status </span>
                  <q-badge
                    v-if="filters.status"
                    class="custom-btn-info"
                    style="font-size: 12px !important; border: 1px solid var(--Info-200, #b9e1ff)"
                  >
                    {{ filters.status }}
                    <IconX
                      size="14"
                      class="q-ml-xs cursor-pointer"
                      @click.prevent="filters.status = null"
                    />
                  </q-badge>
                </template>
              </q-select>
            </div>
            <div class="col self-end items-end" style="text-align-last: end">
              <span class="text-muted cursor-pointer" @click="clearFilters"> Limpar Filtros</span>
            </div>
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
          <!-- <q-btn
            size="xs"
            outline
            padding="xs"
            class="custom-btn-muted"
            :label="props.row.cliente.name"
            no-caps
          /> -->
        </q-td>
      </template>
      <!-- Coluna de status personalizada -->
      <template v-slot:body-cell-status="props">
        <q-td :props="props">
          <q-btn
            size="xs"
            outline
            padding="xs"
            :color="getStatusColor(props.row.status)"
            :class="getClasseStatus(props.row.status)"
            :label="props.row.status"
            no-caps
          />
        </q-td>
      </template>
      <!-- Coluna de Tipo -->
      <template v-slot:body-cell-tipo="props">
        <q-td :props="props">
          <q-btn
            size="xs"
            outline
            padding="xs"
            class="custom-btn-muted"
            :label="props.row.tipo"
            no-caps
          />
        </q-td>
      </template>
      <!-- Coluna de documentos personalizada -->
      <template v-slot:body-cell-documentos="props">
        <q-td :props="props">
          <q-btn
            v-if="props.row.documentos !== 'Sem anexo'"
            size="xs"
            outline
            padding="xs"
            no-caps
            class="custom-btn-muted"
            :label="props.row.documentos"
            @click="downloadDocument(props.row.documentos)"
          />
          <span v-else class="text-muted" style="font-size: 10px">{{ props.row.documentos }}</span>
        </q-td>
      </template>
    </q-table>

    <div class="row justify-between items-center q-mt-md">
      <div class="row items-center">
        <span class="q-mr-sm">Itens por página:</span>
        <q-select
          dense
          outlined
          v-model="pagination.rowsPerPage"
          :options="[5, 10, 15, 20]"
          style="min-width: 80px"
          @update:model-value="updateRowsPerPage"
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

<script>
import { ref, computed, defineComponent } from 'vue'
import useVariablesGlobal from 'src/composables/Fakes/useVariablesGlobal'
import useMovement from 'src/composables/Fakes/useMovement'

export default defineComponent({
  name: 'TransactionHistoric',
  setup() {
    const { tiposOptions, statusOptions } = useVariablesGlobal()
    const { rowsMovement, columnsMovement } = useMovement()
    const selected = ref([])
    const filter = ref('')
    const loading = ref(false)
    const filterExpanded = ref(true)
    const pagination = ref({
      page: 1,
      rowsPerPage: 5,
      rowsNumber: 0,
    })

    // Modelos para filtros
    const filters = ref({
      tipo: null,
      status: null,
      clienteName: null,
    })
    const optionsClienteName = rowsMovement.map((row) => ({
      label: row.cliente.name,
      value: row.cliente.name,
    }))

    const dateRange = ref({
      solicitado: { from: '', to: '' },
      limitado: { from: '', to: '' },
    })
    const emptyDateRange = () => {
      pickerSolitado.value = null
      dateRange.value.solicitado = { from: '', to: '' }
      dateRange.value.limitado = { from: '', to: '' }
      dateRangeInput.value.solicitado = ''
      dateRangeInput.value.limitado = ''
    }
    // Funç

    // Função para converter data string para objeto Date
    const parseDate = (dateStr) => {
      if (!dateStr) return null
      // Se for um range (ex: "10/05/2025  a 15/05/2025 ")
      if (dateStr.includes(' a ')) {
        dateStr = dateStr.split(' a ')[0] // Pega a primeira data
      }
      const [datePart] = dateStr.split(' - ') // Remove hora se existir
      const [day, month, year] = datePart.split('/')
      return new Date(`${year}-${month}-${day}`)
    }

    // Filtra as linhas com base nos filtros aplicados
    const filteredRows = computed(() => {
      return rowsMovement.filter((row) => {
        // Filtro de pesquisa geral
        if (
          filter.value &&
          !Object.values(row).some((val) =>
            String(val).toLowerCase().includes(filter.value.toLowerCase()),
          )
        ) {
          return false
        }

        // Filtro por data de solicitação
        if (dateRange.value.solicitado.from && dateRange.value.solicitado.to) {
          const rowDate = parseDate(row.solicitado_em)
          const fromDate = parseDate(dateRange.value.solicitado.from)
          const toDate = parseDate(dateRange.value.solicitado.to)

          if (!rowDate || rowDate < fromDate || rowDate > toDate) {
            return false
          }
        }

        // Filtro por data limite
        if (dateRange.value.limitado.from && dateRange.value.limitado.to) {
          const rowDate = parseDate(row.limitado_ate)
          const fromDate = parseDate(dateRange.value.limitado.from)
          const toDate = parseDate(dateRange.value.limitado.to)

          if (!rowDate || rowDate < fromDate || rowDate > toDate) {
            return false
          }
        }

        // Filtro por tipo
        if (filters.value.tipo && !row.tipo.includes(filters.value.tipo)) {
          return false
        }

        // Filtro por status
        if (filters.value.status && !row.status.includes(filters.value.status)) {
          return false
        }

        // Filtro por nome do cliente
        if (filters.value.clienteName) {
          const clienteName = filters.value.clienteName.value.toLowerCase()
          console.log(`Filtrando por cliente: ${clienteName}`)
          if (!row.cliente.name.toLowerCase().includes(clienteName)) {
            return false
          }
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

    // Função para limpar todos os filtros
    const clearFilters = () => {
      filter.value = ''
      filters.value = {
        tipo: null,
        status: null,
        clienteName: null,
      }
      dateRange.value = {
        solicitado: { from: '', to: '' },
        limitado: { from: '', to: '' },
      }
      dateRangeInput.value = {
        solicitado: '',
        limitado: '',
      }
      pagination.value.page = 1
    }
    const clearSolicitado = () => {
      dateRange.value.solicitado = { from: '', to: '' }
      dateRangeInput.value.solicitado = ''
    }
    const clearLimitado = () => {
      dateRange.value.limitado = { from: '', to: '' }
      dateRangeInput.value.limitado = ''
    }
    // Função para determinar a cor do status
    const getStatusColor = (status) => {
      if (status.includes('Concluído')) return 'positive'
      if (status.includes('Atrasado')) return 'negative'
      if (status.includes('Pendente')) return 'warning'
      return 'grey'
    }

    const getClasseStatus = (status) => {
      if (status.includes('Concluído')) return 'custom-btn-primary'
      if (status.includes('Atrasado')) return 'custom-btn-negative'
      if (status.includes('Pendente')) return 'custom-btn-warning'
      return ''
    }

    // Função simulada para download de documento
    const downloadDocument = (filename) => {
      console.log(`Downloading ${filename}`)
      // Aqui você implementaria a lógica real de download
    }
    const updatePagination = (val) => {
      pagination.value = val
    }
    const updateRowsPerPage = (val) => {
      pagination.value.rowsPerPage = val
      pagination.value.page = 1
    }
    const dateRangeInput = ref({
      solicitado: '',
      limitado: '',
    })
    // Método para atualizar o texto do input
    const updateDateInput = (field) => {
      if (dateRange.value[field].from && dateRange.value[field].to) {
        dateRangeInput.value[field] =
          `${dateRange.value[field].from} a ${dateRange.value[field].to}`
      } else {
        dateRangeInput.value[field] = ''
      }
    }
    const pickerSolitado = ref(null)
    const pickerLimite = ref(null)
    const openDatePicker = () => {
      pickerSolitado.value.show()
    }
    return {
      openDatePickerLimite: () => {
        pickerLimite.value.show()
      },
      pickerSolitado,
      openDatePicker,
      pickerLimite,
      selected,
      columnsMovement,
      rowsMovement,
      filteredRows,
      paginatedRows,
      pagination,
      pagesNumber,
      filter,
      filters,
      dateRange,
      tiposOptions,
      statusOptions,
      filterExpanded,
      loading,
      firstItemIndex,
      lastItemIndex,
      getStatusColor,
      downloadDocument,
      clearFilters,
      updatePagination,
      updateRowsPerPage,
      updateDateInput,
      dateRangeInput,
      clearSolicitado,
      clearLimitado,
      getClasseStatus,
      optionsClienteName,
      emptyDateRange,
      getSelectedString() {
        return selected.value.length === 0
          ? ''
          : `${selected.value.length} registro${selected.value.length > 1 ? 's' : ''} selecionado${selected.value.length > 1 ? 's' : ''} de ${rowsNumber.value}`
      },
    }
  },
})
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
