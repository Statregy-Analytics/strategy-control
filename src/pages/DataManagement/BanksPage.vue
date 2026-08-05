<template>
  <q-page class="banks-page">
    <title-page :breadcrumbs="breadcrumbs">
      <div class="row items-center justify-between">
        <div class="text-h6">Catálogo de bancos</div>
        <q-btn color="primary" icon="add" label="Cadastrar banco" dense no-caps class="q-mr-sm" style="border-radius: 8px" @click="openCreate" />
      </div>
    </title-page>

    <div class="q-pa-md">
      <q-banner v-if="loadError" rounded class="bg-red-1 text-negative q-mb-md">
        {{ loadError }}
        <template #action><q-btn flat color="negative" label="Tentar novamente" @click="load" /></template>
      </q-banner>
      <q-table flat dense hide-pagination row-key="id" class="my-sticky-header-column-table" :rows="displayedBanks" :columns="columns" :loading="loading">
        <template #top>
          <div class="row col-12 items-center justify-between q-col-gutter-md">
            <div class="col-12 col-sm-5 col-md-4"><q-input v-model="search" dense outlined clearable debounce="300" placeholder="Pesquisar por código ou nome"><template #prepend><q-icon name="search" size="1.2rem" /></template></q-input></div>
            <q-toggle v-model="onlyActive" label="Somente ativos" color="primary" />
          </div>
        </template>
        <template #body-cell-name="props"><q-td :props="props"><q-item dense class="q-pa-none"><q-item-section avatar><q-avatar size="32px" color="blue-grey-1" text-color="blue-grey-7" icon="account_balance" /></q-item-section><q-item-section><q-item-label>{{ props.row.name }}</q-item-label><q-item-label caption>{{ props.row.code || 'Sem código' }}</q-item-label></q-item-section></q-item></q-td></template>
        <template #body-cell-isActive="props"><q-td :props="props"><q-badge :color="props.value ? 'positive' : 'grey'">{{ props.value ? 'Ativo' : 'Inativo' }}</q-badge></q-td></template>
        <template #no-data><div class="full-width row flex-center q-pa-xl text-grey-7"><q-icon name="account_balance" size="28px" class="q-mr-sm" />Nenhum banco encontrado.</div></template>
      </q-table>
      <entity-table-footer :page="pagination.page" :page-size="pagination.pageSize" :total-items="pagination.totalItems" :total-pages="pagination.totalPages" :first-item="firstItem" :last-item="lastItem" @page="changePage" @page-size="changePageSize" />
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
                <label-form class-name="col-12" text-label="País (ID)"><q-select v-if="countryOptions.length" v-model="draft.countryId" dense outlined emit-value map-options :options="countryOptions" :rules="uuidRules" /><q-input v-else v-model.trim="draft.countryId" dense outlined placeholder="UUID do país" :rules="uuidRules" /></label-form>
                <div class="col-12"><q-toggle v-model="draft.isActive" label="Banco ativo" color="primary" /></div>
              </div>
              <div class="row justify-end q-gutter-sm q-mt-lg"><q-btn flat label="Cancelar" no-caps :disable="saving" @click="createDialog = false" /><q-btn type="submit" flat color="primary" icon="save" label="Salvar banco" no-caps :loading="saving" /></div>
            </q-form>
          </form-section>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import TitlePage from 'src/components/TitlePage.vue'
import LabelForm from 'src/components/Form/LabelForm.vue'
import FormSection from 'src/components/Entity/FormSection.vue'
import EntityTableFooter from 'src/components/Entity/EntityTableFooter.vue'
import { createBank, listBanks } from 'src/services/customerService'
import { getApiErrorMessage } from 'src/services/apiError'
import useNotification from 'src/composables/global/useNotification'

const { successNotify, errorNotify } = useNotification()
const banks = ref([]), loading = ref(false), loadError = ref(''), search = ref(''), onlyActive = ref(false), createDialog = ref(false), saving = ref(false), form = ref(null)
const pagination = reactive({ page: 1, pageSize: 10, totalItems: 0, totalPages: 1 })
const draft = reactive({ code: '', name: '', countryId: null, isActive: true })
const breadcrumbs = [{ label: 'Gestão de Dados' }, { label: 'Bancos' }]
const formatDate = (value) => { const date = value ? new Date(value) : null; return date && !Number.isNaN(date.getTime()) && date.getUTCFullYear() >= 2000 ? new Intl.DateTimeFormat('pt-BR').format(date) : '—' }
const columns = [{ name: 'name', label: 'Banco', field: 'name', align: 'left' }, { name: 'countryId', label: 'País', field: 'countryId', align: 'left' }, { name: 'isActive', label: 'Status', field: 'isActive', align: 'left' }, { name: 'createdAtUtc', label: 'Cadastrado em', field: 'createdAtUtc', align: 'left', format: formatDate }]
const requiredRules = [(value) => Boolean(String(value || '').trim()) || 'Campo obrigatório']
const uuidRules = [...requiredRules, (value) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value || '') || 'Informe um UUID válido']
const countryOptions = computed(() => [...new Set(banks.value.map((bank) => bank.countryId).filter(Boolean))].map((id) => ({ label: id, value: id })))
const displayedBanks = computed(() => { const term = search.value.trim().toLowerCase(); return term ? banks.value.filter((bank) => `${bank.code || ''} ${bank.name || ''}`.toLowerCase().includes(term)) : banks.value })
const firstItem = computed(() => pagination.totalItems ? (pagination.page - 1) * pagination.pageSize + 1 : 0)
const lastItem = computed(() => Math.min(pagination.page * pagination.pageSize, pagination.totalItems))
const load = async () => {
  loading.value = true; loadError.value = ''
  try { const response = await listBanks({ page: pagination.page, pageSize: pagination.pageSize, isActive: onlyActive.value || undefined }); const items = response?.data ?? response?.items ?? []; banks.value = items; const meta = response?.pagination ?? response?.meta ?? {}; pagination.totalItems = meta.totalItems ?? response?.totalItems ?? items.length; pagination.totalPages = meta.totalPages ?? response?.totalPages ?? Math.max(1, Math.ceil(pagination.totalItems / pagination.pageSize)) }
  catch (error) { loadError.value = getApiErrorMessage(error, 'Não foi possível carregar o catálogo de bancos.') }
  finally { loading.value = false }
}
const openCreate = () => { Object.assign(draft, { code: '', name: '', countryId: countryOptions.value[0]?.value ?? null, isActive: true }); createDialog.value = true }
const save = async () => { saving.value = true; try { const created = await createBank({ ...draft, code: draft.code || null }); successNotify('Banco cadastrado.'); createDialog.value = false; pagination.page = 1; await load(); if (created?.id && !banks.value.some((bank) => bank.id === created.id)) banks.value = [created, ...banks.value] } catch (error) { errorNotify(error?.response?.status === 409 ? 'Já existe um banco com esse código.' : getApiErrorMessage(error, 'Não foi possível cadastrar o banco.')) } finally { saving.value = false } }
const changePage = (page) => { pagination.page = page; load() }
const changePageSize = (pageSize) => { pagination.page = 1; pagination.pageSize = pageSize; load() }
watch(onlyActive, () => { pagination.page = 1; load() })
onMounted(load)
</script>

<style scoped>
.bank-dialog { width: min(620px, 100vw); }
</style>
