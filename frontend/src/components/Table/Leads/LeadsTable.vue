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
              label="Comparar Leads"
              :class="!compareBtn ? 'text-muted' : 'text-primary'"
              :disable="selected.length < 2 || selected.length > 5"
              @click.prevent.stop="compareSelected"
            >
              <q-tooltip v-if="selected.length < 2 || selected.length > 5">
                Selecione entre 2 e 5 leads para comparar
              </q-tooltip>
            </q-btn>
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
              <avatar-initials
                :src="props.row.cliente.avatar"
                :name="props.row.cliente.name"
                size="32px"
                class="q-mr-sm"
              />
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

      <!-- Coluna de CPF formatado -->
      <template v-slot:body-cell-cpf="props">
        <q-td :props="props">
          <div>{{ $filtersString.formatCpf(props.row.cliente?.cpf || props.row.cpf) }}</div>
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
                    class="text-primary"
                  />
                  <span class="q-ml-sm text-muted" style="font-size: small; color: #656565"
                    >Editar</span
                  >
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
          Mostrando {{ firstItemIndex }} a {{ lastItemIndex }} de {{ rowsNumber }} registros
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
// import useCliente from 'src/composables/Fakes/useCliente'
import { useLeadStore } from 'src/stores/lead'
import useLeads from 'src/composables/Fakes/useLeads'
import useLeadsApi from 'src/composables/Api/useLeadsApi'
import EditLeadLayout from 'src/layouts/Leads/EditLeadLayout.vue'
import CompareLayout from 'src/layouts/Leads/CompareLayout.vue'
import AvatarInitials from 'src/components/Avatar/AvatarInitials.vue'
defineComponent({
  name: 'LeadsTable',
})

const storeLayout = useLayoutStore()
const storeLead = useLeadStore()
// const { compare } = storeToRefs(storeClient)
const { leadDialog, dialogCompare } = storeToRefs(storeLayout)
const { rowLeads: fakeRowLeads, columnLeads } = useLeads()
const { rows: apiRows, fetchLeads } = useLeadsApi()
// const classCompare = computed(() => {
//   console.log('classCompare', compare.value.length)
//   return compare.value.length < 3 ? 'control-width' : 'control-width-compare'
// })

const editLead = async (id) => {
  storeLayout.setDialogOpengHeader('Lead')
  console.log('editLead', id)

  // set a safe default so forms don't crash while we fetch
  const safeDefault = {
    id: id,
    cliente: { avatar: '', name: '', email: '', rg: '', cpf: '', cnh: '', phone: '', birth: '' },
    residential: {},
    bank: {},
    bankRegister: [],
    cpf: '',
    phone: '',
    profission: '',
    situacao_rf: '',
    estagio_lead: '',
    address: [],
    partner: [],
    related_person: [],
    emprestimo: '',
    dividendo: { total: 0, data: '' },
    contrato: { total: 0, quantity: '' },
    saldo: 0,
    _raw: {},
  }
  storeLead.setLeadEdit(safeDefault)
  storeLayout.setLeadDialog(true)

  const apiBase =
    (import.meta && import.meta.env && import.meta.env.VITE_API_BASE_URL) ||
    (import.meta && import.meta.env && import.meta.env.DEV ? '' : 'http://localhost:3333')

  try {
    const res = await fetch(`${apiBase}/api/leads/${id}`)
    if (!res.ok) {
      $q.notify({ message: 'Lead não encontrado no backend', color: 'negative' })
      storeLead.setLeadEdit(safeDefault)
      return
    }
    const item = await res.json()
    const lead = item.lead || item
    const leadObj = {
      id: item.id || lead.id,
      cliente: {
        avatar: lead.avatar || lead.cliente?.avatar || '',
        name: lead.name || lead.cliente?.name || '',
        email: lead.email || lead.cliente?.email || '',
        rg: lead.rg || lead.cliente?.rg || '',
        cpf: lead.cpf || lead.cliente?.cpf || '',
        cnh: lead.cnh || lead.cliente?.cnh || '',
        phone: lead.phone || lead.cliente?.phone || '',
        birth:
          lead.birth && String(lead.birth).length >= 10
            ? new Date(lead.birth).toISOString().slice(0, 10)
            : lead.cliente?.birth || lead.data_nascimento || '',
      },
      cpf: lead.cpf || '',
      phone: lead.phone || '',
      profission: lead.profission || lead.profissao || '',
      situacao_rf: lead.situacao_rf || '',
      estagio_lead: lead.estagio_lead || '',
      address: lead.address || [],
      partner: lead.partner || [],
      related_person: lead.related_person || [],
      bankRegister: lead.bankRegister || [],
      bank: lead.bank || {},
      residential: lead.residential || {},
      emprestimo: lead.emprestimo || '',
      dividendo: lead.dividendo || { total: 0, data: '' },
      contrato: lead.contrato || { total: 0, quantity: '' },
      saldo: lead.saldo || 0,
      _raw: lead,
    }
    storeLead.setLeadEdit(leadObj)
  } catch (err) {
    console.error('Failed to load lead', err)
    $q.notify({ message: 'Erro ao carregar lead', color: 'negative' })
    storeLead.setLeadEdit(safeDefault)
  }

  // storeLayout.setClientDialog(true)
  // storeLayout.setClientEdit(getClientLead(id))
}

// Refresh list when other components notify updates
if (typeof window !== 'undefined') {
  window.addEventListener('leads:updated', () => {
    try {
      fetchLeads({ q: filter.value })
    } catch (err) {
      console.debug('fetchLeads on leads:updated failed', err)
    }
  })
}

const rowsSource = computed(() => {
  return apiRows.value && apiRows.value.length ? normalizedApiRows.value : fakeRowLeads
})
const rowsArray = computed(() => (Array.isArray(rowsSource.value) ? rowsSource.value : []))

const compareSelected = () => {
  const count = selected.value.length
  if (count < 2 || count > 5) {
    $q.notify({
      message: 'Selecione entre 2 e 5 leads para comparar.',
      color: 'negative',
      icon: 'warning',
    })
    return
  }
  storeLayout.setDialogOpengHeader('Comparar Leads')
  storeLayout.setDialogCompare(true)
  storeLead.setCompareSelect(selected.value)
}
const confirmRemoveRow = (id) => {
  $q.dialog({
    title: 'Confirmar remoção',
    message: 'Tem certeza que deseja remover este lead? Esta ação não pode ser desfeita.',
    cancel: true,
    persistent: true,
  })
    .onOk(async () => {
      try {
        const apiBase =
          (import.meta && import.meta.env && import.meta.env.VITE_API_BASE_URL) ||
          (import.meta && import.meta.env && import.meta.env.DEV ? '' : 'http://localhost:3333')
        const res = await fetch(`${apiBase}/api/leads/${id}`, { method: 'DELETE' })
        if (res.ok) {
          $q.notify({ message: 'Lead removido', color: 'positive' })
          window.dispatchEvent(new Event('leads:updated'))
        } else {
          $q.notify({ message: 'Não foi possível remover o lead', color: 'negative' })
        }
      } catch (err) {
        console.error('remove lead error', err)
        $q.notify({ message: 'Erro ao remover lead', color: 'negative' })
      }
    })
    .onCancel(() => {
      // usuario cancelou
    })
}

const confirmRemoveAndClose = (id) => confirmRemoveRow(id)
const selected = ref([])
const compareBtn = computed(() => {
  return selected.value.length > 1
})
const getSelectedString = () => {
  const totalRows = rowsArray.value.length
  return selected.value.length === 0
    ? ''
    : `${selected.value.length} record${selected.value.length > 1 ? 's' : ''} selected of ${totalRows}`
}

const pagination = ref({
  page: 1,
  rowsPerPage: 5,
  rowsNumber: 0,
})
const updatePagination = (val) => {
  pagination.value = val
  // fetch fresh data but do not rely on server-side pagination
  fetchLeads({ q: filter.value })
}
const filter = ref('')
// Normalize API rows (shape: { id, lead: { name, email, avatar, phone, ... } })
const normalizedApiRows = computed(() => {
  if (!apiRows.value || !apiRows.value.length) return []
  return apiRows.value.map((r) => {
    const lead = r.lead || r
    return {
      id: r.id || lead.id,
      cliente: {
        avatar: lead.avatar || lead.cliente?.avatar || '',
        name: lead.name || lead.cliente?.name || '',
        email: lead.email || lead.cliente?.email || '',
        // Normalize birth to YYYY-MM-DD if present in backend (may come as ISO or other)
        birth:
          lead.birth && String(lead.birth).length >= 10
            ? new Date(lead.birth).toISOString().slice(0, 10)
            : lead.cliente?.birth || lead.data_nascimento || '',
      },
      cpf: lead.cpf || lead.nif || lead.cliente?.cpf || '',
      phone: lead.phone || lead.telefone || lead.cliente?.phone || '',
      profission: lead.profission || lead.profission || lead.profissao || lead.profession || '',
      situacao_rf: lead.situacao_rf || lead.situacao || '',
      estagio_lead: lead.estagio_lead || lead.stage || '',
      address: lead.address || lead.endereco || lead.cliente?.address || [],
      partner: lead.partner || lead.socios || [],
      related_person: lead.related_person || lead.relatedPeople || [],
      bankRegister: lead.bankRegister || lead.bank_register || [],
      bank: lead.bank || {},
      residential: lead.residential || {},
      emprestimo: lead.emprestimo || '',
      dividendo: lead.dividendo || { total: 0, data: '' },
      contrato: lead.contrato || { total: 0, quantity: '' },
      saldo: lead.saldo || 0,
      // Keep original lead payload for advanced uses
      _raw: lead,
    }
  })
})
// Filtra as linhas com base nos filtros aplicados
const filteredRows = computed(() => {
  // When api has data use it, otherwise fallback to fake rows
  const source = apiRows.value && apiRows.value.length ? normalizedApiRows.value : fakeRowLeads
  return source.filter((row) => {
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
const rowsNumber = computed(() => {
  // filteredRows already uses apiRows when present, so return its length
  return filteredRows.value.length
})

// Retorna apenas as linhas da página atual (sempre client-side pagination)
const paginatedRows = computed(() => {
  const start = (pagination.value.page - 1) * pagination.value.rowsPerPage
  const end = start + pagination.value.rowsPerPage
  return filteredRows.value.slice(start, end)
})
// Calcula o número total de páginas (client-side)
const pagesNumber = computed(() => Math.ceil(rowsNumber.value / pagination.value.rowsPerPage))

// Índices dos itens exibidos
const firstItemIndex = computed(
  () => (pagination.value.page - 1) * pagination.value.rowsPerPage + 1,
)

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
// Fetch initial data from API (no server-side pagination)
fetchLeads({})

// Note: q-table emits update:pagination and we call fetchLeads in updatePagination
const $q = useQuasar()
const exportTable = () => {
  // naive encoding to csv format
  const sourceRows = apiRows.value && apiRows.value.length ? normalizedApiRows.value : fakeRowLeads
  const content = [columnLeads.map((col) => wrapCsvValue(col.label))]
    .concat(
      sourceRows.map((row) =>
        columnLeads
          .map((col) => {
            let val =
              typeof col.field === 'function'
                ? col.field(row)
                : row[col.field === void 0 ? col.name : col.field]
            // if value is an object (e.g., cliente), prefer its name property
            if (val && typeof val === 'object') {
              val = val.name || (val.cliente && val.cliente.name) || ''
            }
            return wrapCsvValue(val, col.format, row)
          })
          .join(','),
      ),
    )
    .join('\r\n')
  const date = new Date()
  // prepend UTF-8 BOM so Excel correctly recognizes accented characters
  const bomContent = '\uFEFF' + content
  const status = exportFile(
    `leads-${date.getDate()}-${date.getMonth()}-${date.getTime()}.csv`,
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
</script>
