<template>
  <q-page class="banks-page">
    <title-page :breadcrumbs="breadcrumbs">
      <div class="row items-center justify-between">
        <div class="text-h6">Catálogo de bancos</div>
        <q-btn color="primary" icon="add" label="Cadastrar banco" dense no-caps class="q-mr-sm" style="border-radius: 8px" @click="openCreate" />
      </div>
    </title-page>

    <div class="q-pa-md">
      <q-banner v-if="loadError || countryError" rounded class="bg-red-1 text-negative q-mb-md">
        {{ loadError || countryError }}
        <template #action><q-btn flat color="negative" label="Tentar novamente" @click="load" /></template>
      </q-banner>
      <q-table dark flat dense hide-pagination row-key="id" :rows-per-page-options="[0]" :pagination="{ rowsPerPage: 0 }" class="my-sticky-header-column-table" :rows="displayedBanks" :columns="columns" :loading="loading">
        <template #top>
          <div class="row col-12 items-center justify-between q-col-gutter-md">
            <div class="col-12 col-sm-5 col-md-4"><q-input dark v-model="search" dense outlined clearable debounce="300" placeholder="Pesquisar por código ou nome"><template #prepend><q-icon name="search" size="1.2rem" /></template></q-input></div>
            <q-toggle dark v-model="onlyActive" label="Somente ativos" color="primary" />
          </div>
        </template>
        <template #body-cell-name="props"><q-td :props="props"><q-item dense class="q-pa-none"><q-item-section avatar><q-avatar size="32px" color="blue-grey-1" text-color="blue-grey-7" icon="account_balance" /></q-item-section><q-item-section><q-item-label>{{ props.row.name }}</q-item-label><q-item-label caption>{{ props.row.code || 'Sem código' }}</q-item-label></q-item-section></q-item></q-td></template>
        <template #body-cell-isActive="props"><q-td :props="props"><q-badge :color="props.value ? 'positive' : 'grey'">{{ props.value ? 'Ativo' : 'Inativo' }}</q-badge></q-td></template>
        <template #no-data><div v-if="!loading && !loadError" class="full-width row flex-center q-pa-xl text-grey-7"><q-icon name="account_balance" size="28px" class="q-mr-sm" />Nenhum banco encontrado.</div></template>
      </q-table>
      <entity-table-footer v-if="!loading && !loadError" :page="pagination.page" :page-size="pagination.pageSize" :total-items="totalItems" :total-pages="totalPages" :first-item="firstItem" :last-item="lastItem" @page="changePage" @page-size="changePageSize" />
    </div>

    <q-dialog v-model="createDialog" position="right" full-height>
      <q-card class="bank-dialog column no-wrap">
        <q-card-section class="row items-center justify-between"><div class="text-h6">Cadastrar banco</div><q-btn flat round dense icon="close" aria-label="Fechar" :disable="saving" @click="createDialog = false" /></q-card-section>
        <q-separator />
        <q-card-section class="scroll col">
          <form-section title="Identificação" caption="Informe os dados do banco conforme o catálogo oficial.">
            <q-form ref="form" @submit.prevent="save">
              <div class="row q-col-gutter-md">
                <label-form class-name="col-12 col-sm-4" text-label="Código"><q-input v-model.trim="draft.code" dense outlined maxlength="20" :rules="requiredRules" /></label-form>
                <label-form class-name="col-12 col-sm-8" text-label="Nome"><q-input v-model.trim="draft.name" dense outlined :rules="requiredRules" /></label-form>
                <label-form class-name="col-12" text-label="País"><q-select v-model="draft.countryId" dense outlined emit-value map-options :options="countryOptions" :rules="countryRules" :error="Boolean(countryError)" :error-message="countryError" :loading="countriesLoading" :disable="countriesLoading || Boolean(countryError)" aria-label="País" /></label-form>
                <div class="col-12"><q-toggle v-model="draft.isActive" label="Banco ativo" color="primary" /></div>
              </div>
              <div class="row justify-end q-gutter-sm q-mt-lg"><q-btn flat label="Cancelar" no-caps :disable="saving" @click="createDialog = false" /><q-btn type="submit" flat color="primary" icon="save" label="Salvar banco" no-caps :loading="saving" :disable="countriesLoading || Boolean(countryError) || !countryOptions.length" /></div>
            </q-form>
          </form-section>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { computed, onMounted, onScopeDispose, reactive, ref, watch } from 'vue'
import TitlePage from 'src/components/TitlePage.vue'
import LabelForm from 'src/components/Form/LabelForm.vue'
import FormSection from 'src/components/Entity/FormSection.vue'
import EntityTableFooter from 'src/components/Entity/EntityTableFooter.vue'
import { createBank, listBanks, listCountries } from 'src/services/customerService'
import { bankCountryName, bankCountryOptions, readCountryCatalog } from 'src/services/countryCatalog'
import { readBankCatalog } from 'src/services/bankCatalog'
import { getApiErrorMessage } from 'src/services/apiError'
import useNotification from 'src/composables/global/useNotification'

const { successNotify, errorNotify } = useNotification()
const banks = ref([]), loading = ref(false), loadError = ref(''), search = ref(''), onlyActive = ref(false), createDialog = ref(false), saving = ref(false), form = ref(null)
const countries = ref([]), countriesLoading = ref(false), countryError = ref('')
let banksRevision = 0, countryRevision = 0
onScopeDispose(() => { banksRevision++; countryRevision++ })
const pagination = reactive({ page: 1, pageSize: 10 })
const draft = reactive({ code: '', name: '', countryId: null, isActive: true })
const breadcrumbs = [{ label: 'Gestão de Dados' }, { label: 'Bancos' }]
const formatDate = (value) => { const date = value ? new Date(value) : null; return date && !Number.isNaN(date.getTime()) && date.getUTCFullYear() >= 2000 ? new Intl.DateTimeFormat('pt-BR').format(date) : '—' }
const columns = [{ name: 'name', label: 'Banco', field: 'name', align: 'left' }, { name: 'countryId', label: 'País', field: (bank) => countriesLoading.value ? 'Carregando…' : bankCountryName(bank, countries.value), align: 'left' }, { name: 'isActive', label: 'Status', field: 'isActive', align: 'left' }, { name: 'createdAtUtc', label: 'Cadastrado em', field: 'createdAtUtc', align: 'left', format: formatDate }]
const requiredRules = [(value) => Boolean(String(value || '').trim()) || 'Campo obrigatório']
const countryOptions = computed(() => bankCountryOptions(countries.value))
const countryRules = [(value) => countryOptions.value.some((country) => country.value === value) || 'Selecione um país.']
const normalizeSearch = (value) => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR')
const filteredBanks = computed(() => {
  const term = normalizeSearch(search.value).trim()
  return term ? banks.value.filter((bank) => normalizeSearch(`${bank.code || ''} ${bank.name || ''}`).includes(term)) : banks.value
})
const totalItems = computed(() => filteredBanks.value.length)
const totalPages = computed(() => Math.max(1, Math.ceil(totalItems.value / pagination.pageSize)))
const displayedBanks = computed(() => filteredBanks.value.slice((pagination.page - 1) * pagination.pageSize, pagination.page * pagination.pageSize))
const firstItem = computed(() => totalItems.value ? (pagination.page - 1) * pagination.pageSize + 1 : 0)
const lastItem = computed(() => Math.min(pagination.page * pagination.pageSize, totalItems.value))
const loadCountries = async () => {
  if (countriesLoading.value) return
  const operation = ++countryRevision
  countriesLoading.value = true
  countryError.value = ''
  try {
    const result = await readCountryCatalog(listCountries)
    if (operation === countryRevision) countries.value = result
  } catch (error) {
    if (operation === countryRevision) {
      countries.value = []
      countryError.value = getApiErrorMessage(error, 'Não foi possível carregar os países.')
    }
  } finally { if (operation === countryRevision) countriesLoading.value = false }
}
const load = async () => {
  const operation = ++banksRevision
  const isActive = onlyActive.value || undefined
  if (!countries.value.length || countryError.value) loadCountries()
  loading.value = true; loadError.value = ''; banks.value = []
  try {
    const result = await readBankCatalog((params) => listBanks({ ...params, isActive }), () => { if (operation !== banksRevision) throw Error('Consulta encerrada.') })
    if (operation !== banksRevision) return
    banks.value = result
  }
  catch (error) { if (operation === banksRevision) loadError.value = getApiErrorMessage(error, 'Não foi possível carregar o catálogo de bancos.') }
  finally { if (operation === banksRevision) loading.value = false }
}
const openCreate = () => { Object.assign(draft, { code: '', name: '', countryId: countryOptions.value[0]?.value ?? null, isActive: true }); createDialog.value = true }
const save = async () => { if (saving.value || countriesLoading.value || countryError.value || !await form.value.validate()) return; saving.value = true; try { await createBank({ ...draft, code: draft.code || null }); successNotify('Banco cadastrado.'); createDialog.value = false; pagination.page = 1; await load() } catch (error) { errorNotify(error?.response?.status === 409 ? 'Já existe um banco com esse código.' : getApiErrorMessage(error, 'Não foi possível cadastrar o banco.')) } finally { saving.value = false } }
const changePage = (page) => { pagination.page = page }
const changePageSize = (pageSize) => { pagination.page = 1; pagination.pageSize = pageSize }
watch(search, () => { pagination.page = 1 })
watch(onlyActive, () => { pagination.page = 1; load() })
onMounted(load)
</script>

<style scoped>
.bank-dialog { width: min(620px, 100vw); }
</style>
