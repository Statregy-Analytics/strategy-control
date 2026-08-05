<template>
  <div>
    <div class="text-subtitle1 text-weight-bold">Contas bancárias</div>
    <div class="text-caption text-grey-7">Dados de leitura são sempre apresentados de forma mascarada.</div>

    <div v-if="loading" class="row justify-center q-pa-xl"><q-spinner color="primary" size="32px" /></div>
    <q-banner v-else-if="loadError" class="bg-red-1 text-negative q-mt-md">
      {{ loadError }}
      <template #action><q-btn flat color="negative" label="Tentar novamente" @click="load" /></template>
    </q-banner>
    <template v-else>
      <q-table flat dense hide-pagination row-key="id" class="q-mt-md" :rows="accounts" :columns="columns">
        <template #no-data><div class="full-width text-center text-grey-7 q-pa-lg">Nenhuma conta bancária cadastrada.</div></template>
        <template #body-cell-bank="props"><q-td :props="props">{{ bankName(props.row.bankId) }}</q-td></template>
        <template #body-cell-account="props"><q-td :props="props">{{ masked(props.row.accountNumberMasked) }}</q-td></template>
        <template #body-cell-holder="props"><q-td :props="props">{{ masked(props.row.holderDocumentMasked) }}</q-td></template>
        <template #body-cell-pix="props"><q-td :props="props">{{ masked(props.row.pixKeyMasked) }}</q-td></template>
        <template #body-cell-primary="props"><q-td :props="props"><q-badge v-if="props.row.isPrimary" outline color="primary" label="Principal" /></q-td></template>
        <template #body-cell-actions="props">
          <q-td :props="props"><row-actions :actions="actionsFor(props.row)" @select="runAction($event, props.row)" /></q-td>
        </template>
      </q-table>

      <q-expansion-item v-model="formOpen" dense dense-toggle icon="add" label="Adicionar conta" header-class="text-primary q-mt-md">
        <q-form ref="formRef" class="q-pt-sm" @submit.prevent="save">
          <div class="row q-col-gutter-sm">
            <label-form class-name="col-12 col-md-4" text-label="Banco">
              <q-select v-model="form.bankId" :options="bankOptions" emit-value map-options outlined dense options-dense :rules="[required]" />
            </label-form>
            <label-form class-name="col-12 col-md-4" text-label="Agência">
              <q-input v-model.trim="form.branch" outlined dense maxlength="20" :rules="[required]" />
            </label-form>
            <label-form class-name="col-8 col-md-3" text-label="Conta">
              <q-input v-model.trim="form.accountNumber" outlined dense maxlength="30" :rules="[required]" />
            </label-form>
            <label-form class-name="col-4 col-md-1" text-label="Dígito"><q-input v-model.trim="form.accountDigit" outlined dense maxlength="4" /></label-form>
            <label-form class-name="col-12 col-md-4" text-label="Tipo de conta">
              <q-input v-model.trim="form.accountType" outlined dense placeholder="Ex.: Corrente" :rules="[required]" />
            </label-form>
            <label-form class-name="col-12 col-md-4" text-label="Tipo de titular">
              <q-input v-model.trim="form.holderType" outlined dense placeholder="Ex.: Pessoa física" :rules="[required]" />
            </label-form>
            <label-form class-name="col-12 col-md-4" text-label="Nome do titular"><q-input v-model.trim="form.holderName" outlined dense /></label-form>
            <label-form class-name="col-12 col-md-4" text-label="Documento do titular"><q-input v-model.trim="form.holderDocument" outlined dense /></label-form>
            <label-form class-name="col-12 col-md-4" text-label="Tipo de chave Pix"><q-input v-model.trim="form.pixKeyType" outlined dense /></label-form>
            <label-form class-name="col-12 col-md-4" text-label="Chave Pix"><q-input v-model.trim="form.pixKey" outlined dense /></label-form>
            <label-form class-name="col-12 col-md-4" text-label="Status"><q-input v-model.trim="form.status" outlined dense /></label-form>
            <div class="col-12 col-md-4 row items-center"><q-checkbox v-model="form.isPrimary" label="Definir como principal" /></div>
          </div>
          <div class="row justify-end q-gutter-sm q-mt-sm">
            <q-btn flat dense size="sm" label="Cancelar" no-caps @click="closeForm" />
            <q-btn type="submit" flat dense size="sm" color="primary" icon="save" label="Adicionar" no-caps :loading="saving" />
          </div>
        </q-form>
      </q-expansion-item>
    </template>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import LabelForm from 'src/components/Form/LabelForm.vue'
import RowActions from 'src/components/Entity/RowActions.vue'
import { archiveCustomerBankAccount, changeCustomerBankAccountStatus, createCustomerBankAccount, listBanks, listCustomerBankAccounts, setPrimaryCustomerBankAccount } from 'src/services/customerService'
import { getApiErrorMessage } from 'src/services/apiError'
import useNotification from 'src/composables/global/useNotification'

const props = defineProps({ customerId: { type: String, required: true } })
const emit = defineEmits(['updated'])
const { successNotify, errorNotify } = useNotification()
const formRef = ref(null), loading = ref(true), saving = ref(false), loadError = ref(''), formOpen = ref(false)
const accounts = ref([]), bankOptions = ref([])
const emptyForm = () => ({ bankId: null, branch: '', accountNumber: '', accountDigit: null, accountType: '', holderType: '', holderName: null, holderDocument: null, pixKey: null, pixKeyType: null, isPrimary: false, status: 'Active' })
const form = reactive(emptyForm())
const columns = [
  { name: 'bank', label: 'Banco', field: 'bankId', align: 'left' },
  { name: 'account', label: 'Conta', field: 'accountNumberMasked', align: 'left' },
  { name: 'holder', label: 'Documento', field: 'holderDocumentMasked', align: 'left' },
  { name: 'pix', label: 'Chave Pix', field: 'pixKeyMasked', align: 'left' },
  { name: 'primary', label: '', field: 'isPrimary', align: 'left' },
  { name: 'actions', label: '', field: 'id', align: 'right' },
]
const required = (value) => !!value || 'Campo obrigatório'
const masked = (value) => value || 'Não informado'
const bankName = (id) => bankOptions.value.find((bank) => bank.value === id)?.label || 'Banco não identificado'
const actionsFor = (account) => [
  ...(!account.isPrimary ? [{ name: 'primary', label: 'Definir como principal', icon: 'star_outline', color: 'primary' }] : []),
  { name: 'status', label: account.status === 'Active' ? 'Desativar conta' : 'Ativar conta', icon: 'toggle_on' },
  { name: 'archive', label: 'Arquivar conta', icon: 'archive', color: 'negative' },
]
const load = async () => {
  loading.value = true; loadError.value = ''
  const [banksResult, accountsResult] = await Promise.allSettled([
    listBanks({ page: 1, pageSize: 200, isActive: true }), listCustomerBankAccounts(props.customerId, { page: 1, pageSize: 100 }),
  ])
  if (banksResult.status === 'fulfilled') bankOptions.value = (banksResult.value?.data ?? []).map((bank) => ({ label: bank.code ? `${bank.code} — ${bank.name}` : bank.name, value: bank.id }))
  if (accountsResult.status === 'fulfilled') accounts.value = accountsResult.value?.data ?? []
  else loadError.value = getApiErrorMessage(accountsResult.reason, 'Não foi possível carregar as contas bancárias.')
  loading.value = false
}
const closeForm = () => { Object.assign(form, emptyForm()); formRef.value?.resetValidation(); formOpen.value = false }
const save = async () => {
  if (!await formRef.value.validate()) return
  try {
    saving.value = true
    await createCustomerBankAccount(props.customerId, { ...form, accountDigit: form.accountDigit || null, holderName: form.holderName || null, holderDocument: form.holderDocument || null, pixKey: form.pixKey || null, pixKeyType: form.pixKeyType || null })
    successNotify('Conta bancária adicionada.'); closeForm(); await load(); emit('updated')
  } catch (error) { errorNotify(getApiErrorMessage(error, 'Não foi possível adicionar a conta bancária.')) }
  finally { saving.value = false }
}
const runAction = async (action, account) => {
  try {
    if (action === 'primary') await setPrimaryCustomerBankAccount(props.customerId, account.id)
    if (action === 'status') await changeCustomerBankAccountStatus(props.customerId, account.id, account.status === 'Active' ? 'Inactive' : 'Active')
    if (action === 'archive') await archiveCustomerBankAccount(props.customerId, account.id)
    successNotify('Conta bancária atualizada.'); await load(); emit('updated')
  } catch (error) { errorNotify(getApiErrorMessage(error, 'Não foi possível atualizar a conta bancária.')) }
}

load()
</script>
