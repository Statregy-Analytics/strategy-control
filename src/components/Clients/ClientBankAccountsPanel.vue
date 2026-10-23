<template>
  <div>
    <div class="text-subtitle1 text-weight-bold">Contas bancárias</div>
    <div class="text-caption text-grey-7">
      Dados de leitura são sempre apresentados de forma mascarada.
    </div>

    <div v-if="loading" class="row justify-center q-pa-xl">
      <q-spinner color="primary" size="32px" />
    </div>
    <q-banner v-else-if="loadError" class="bg-red-1 text-negative q-mt-md">
      {{ loadError }}
      <template #action
        ><q-btn flat color="negative" label="Tentar novamente" @click="load"
      /></template>
    </q-banner>
    <template v-else>
      <q-table
        flat
        dense
        hide-pagination
        row-key="id"
        :grid="embedded && $q.screen.lt.sm"
        :class="['bank-accounts-table', { 'bank-accounts-table--profile': embedded }]"
        :rows="accounts"
        :columns="columns"
      >
        <template #no-data
          ><div class="full-width text-center text-grey-7 q-pa-lg">
            Nenhuma conta bancária cadastrada.
          </div></template
        >
        <template #body-cell-bank="props"
          ><q-td :props="props"
            ><div class="bank-identity">
              <span v-if="embedded" class="bank-initials" aria-hidden="true">{{
                bankInitials(props.row.bankId)
              }}</span
              ><span class="bank-name" :title="bankName(props.row.bankId)">{{
                bankName(props.row.bankId)
              }}</span>
            </div></q-td
          ></template
        >
        <template #body-cell-account="props"
          ><q-td :props="props">{{
            embedded
              ? [props.row.branch, masked(props.row.accountNumberMasked)]
                  .filter(Boolean)
                  .join(' / ')
              : masked(props.row.accountNumberMasked)
          }}</q-td></template
        >
        <template #body-cell-holder="props"
          ><q-td :props="props">{{ masked(props.row.holderDocumentMasked) }}</q-td></template
        >
        <template #body-cell-pix="props"
          ><q-td :props="props" class="bank-pix">{{
            masked(props.row.pixKeyMasked)
          }}</q-td></template
        >
        <template #body-cell-primary="props">
          <q-td :props="props" class="text-center">
            <q-icon
              v-if="props.row.isPrimary"
              name="img:/icons/client-profile/bank-primary.svg"
              size="16px"
              aria-label="Conta principal"
              ><q-tooltip>Conta principal</q-tooltip></q-icon
            >
            <q-btn
              v-else-if="accounts.length > 1"
              flat
              round
              dense
              size="sm"
              icon="radio_button_unchecked"
              aria-label="Definir como principal"
              :disable="saving || actionSaving"
              @click="runAction('primary', props.row)"
              ><q-tooltip>Definir como principal</q-tooltip></q-btn
            >
          </q-td>
        </template>
        <template #body-cell-actions="props">
          <q-td :props="props">
            <div class="bank-row-actions">
              <q-btn
                flat
                round
                dense
                size="sm"
                aria-label="Editar conta"
                :disable="saving || actionSaving"
                @click="runAction('edit', props.row)"
                ><q-icon name="img:/icons/client-profile/bank-edit.svg" size="16px" /><q-tooltip
                  >Editar conta</q-tooltip
                ></q-btn
              >
              <q-btn
                flat
                round
                dense
                size="sm"
                aria-label="Arquivar conta"
                :disable="saving || actionSaving"
                @click="runAction('archive', props.row)"
                ><q-icon name="img:/icons/client-profile/bank-archive.svg" size="16px" /><q-tooltip
                  >Arquivar conta</q-tooltip
                ></q-btn
              >
            </div>
          </q-td>
        </template>
        <template #item="p"
          ><div class="bank-mobile-account q-pa-sm col-12">
            <dl>
              <div v-for="column in columns.filter((c) => c.name !== 'actions')" :key="column.name">
                <dt>{{ column.label }}</dt>
                <dd>
                  <q-icon
                    v-if="column.name === 'primary' && p.row.isPrimary"
                    name="img:/icons/client-profile/bank-primary.svg"
                    size="16px"
                    aria-label="Conta principal"
                  /><template v-else>{{ mobileValue(p.row, column) }}</template>
                </dd>
              </div>
            </dl>
            <div class="bank-row-actions">
              <q-btn
                v-if="!p.row.isPrimary && accounts.length > 1"
                flat
                dense
                no-caps
                size="sm"
                label="Definir como principal"
                :disable="saving || actionSaving"
                @click="runAction('primary', p.row)"
              /><q-btn
                flat
                round
                dense
                icon="img:/icons/client-profile/bank-edit.svg"
                aria-label="Editar conta"
                :disable="saving || actionSaving"
                @click="runAction('edit', p.row)"
              /><q-btn
                flat
                round
                dense
                icon="img:/icons/client-profile/bank-archive.svg"
                aria-label="Arquivar conta"
                :disable="saving || actionSaving"
                @click="runAction('archive', p.row)"
              />
            </div></div
        ></template>
      </q-table>

      <component
        :is="embedded ? QDialog : QExpansionItem"
        v-model="formOpen"
        dense
        dense-toggle
        :icon="editingId ? 'edit' : 'add'"
        :label="editingId ? 'Editar conta' : 'Adicionar conta'"
        header-class="text-primary q-mt-md"
      >
        <q-card :class="embedded ? 'bank-profile-dialog' : 'bank-inline-form'" flat>
          <title-card
            v-if="embedded"
            :title="editingId ? 'Editar conta' : 'Adicionar conta'"
            :disable-close="saving"
            @on-close="closeForm"
          />
          <q-card-section>
            <q-form ref="formRef" class="q-pt-sm" @submit.prevent="save">
              <div class="row q-col-gutter-sm bank-profile-fields">
                <label-form class-name="col-12 col-md-4 bank-field" text-label="Banco">
                  <q-select
                    ref="bankSelectRef"
                    v-model="form.bankId"
                    class="bank-select"
                    :options="filteredBankOptions"
                    :option-label="bankOptionLabel"
                    emit-value
                    map-options
                    use-input
                    fill-input
                    hide-selected
                    outlined
                    dense
                    options-dense
                    input-debounce="150"
                    aria-label="Pesquisar banco"
                    hide-bottom-space
                    :rules="[required]"
                    @filter="filterBanks"
                    @update:model-value="onBankSelected"
                  >
                    <template #no-option
                      ><q-item
                        ><q-item-section class="text-grey-7">{{
                          bankSearch
                            ? 'Nenhum banco encontrado.'
                            : 'Digite o código ou nome do banco.'
                        }}</q-item-section></q-item
                      ></template
                    >
                  </q-select>
                </label-form>
                <label-form class-name="col-12 col-md-4" text-label="Tipo de conta">
                  <q-select
                    v-model="form.accountType"
                    :options="accountTypeOptions"
                    emit-value
                    map-options
                    outlined
                    dense
                    hide-bottom-space
                    :rules="[required]"
                  />
                </label-form>
                <label-form v-if="embedded" class-name="col-12" text-label="Ag/conta"
                  ><q-input
                    v-model="bankAccountText"
                    outlined
                    dense
                    placeholder="0000 / 00000-0"
                    aria-label="Agência e conta"
                    :readonly="Boolean(editingId)"
                    :rules="[
                      () =>
                        Boolean(form.branch && form.accountNumber) ||
                        'Informe agência / conta-dígito',
                    ]"
                /></label-form>
                <label-form v-if="!embedded" class-name="col-12 col-md-4" text-label="Agência">
                  <q-input
                    v-model.trim="form.branch"
                    outlined
                    dense
                    maxlength="20"
                    hide-bottom-space
                    :rules="[required]"
                  />
                </label-form>
                <label-form v-if="!embedded" class-name="col-8 col-md-3" text-label="Conta">
                  <q-input
                    :model-value="editingId ? editingMasks.accountNumber : form.accountNumber"
                    outlined
                    dense
                    maxlength="30"
                    :readonly="Boolean(editingId)"
                    hide-bottom-space
                    :rules="[required]"
                    @update:model-value="form.accountNumber = $event"
                  />
                </label-form>
                <label-form v-if="!embedded" class-name="col-4 col-md-1" text-label="Dígito"
                  ><q-input v-model.trim="form.accountDigit" outlined dense maxlength="4"
                /></label-form>

                <label-form class-name="col-12 col-md-4" text-label="Titularidade">
                  <q-select
                    v-model="form.holderType"
                    :options="holderTypeOptions"
                    emit-value
                    map-options
                    outlined
                    dense
                    hide-bottom-space
                    :rules="[required]"
                  />
                </label-form>
                <label-form
                  v-if="!embedded"
                  class-name="col-12 col-md-4"
                  text-label="Nome do titular"
                  ><q-input v-model.trim="form.holderName" outlined dense
                /></label-form>
                <label-form class-name="col-12 col-md-4" text-label="Documento do titular"
                  ><q-input
                    :model-value="editingId ? editingMasks.holderDocument : form.holderDocument"
                    outlined
                    dense
                    :readonly="Boolean(editingId)"
                    @update:model-value="form.holderDocument = $event"
                /></label-form>
                <label-form
                  v-if="!embedded"
                  class-name="col-12 col-md-4"
                  text-label="Tipo de chave Pix"
                  ><q-select
                    v-model="form.pixKeyType"
                    :options="pixKeyTypeOptions"
                    emit-value
                    map-options
                    clearable
                    outlined
                    dense
                    options-dense
                    aria-label="Tipo de chave Pix"
                /></label-form>
                <label-form v-if="!embedded" class-name="col-12 col-md-4" text-label="Chave Pix"
                  ><q-input
                    :model-value="editingId ? editingMasks.pixKey : form.pixKey"
                    outlined
                    dense
                    :readonly="Boolean(editingId)"
                    @update:model-value="form.pixKey = $event"
                /></label-form>
                <label-form v-if="!embedded" class-name="col-12 col-md-4" text-label="Status"
                  ><q-select
                    v-model="form.status"
                    :options="statusOptions"
                    emit-value
                    map-options
                    outlined
                    dense
                /></label-form>
                <div class="col-12 col-md-4 row items-center">
                  <q-toggle
                    v-if="embedded"
                    v-model="form.isPrimary"
                    label="Definir como conta principal"
                  /><q-checkbox v-else v-model="form.isPrimary" label="Definir como principal" />
                </div>
              </div>
              <div class="row justify-end q-gutter-sm q-mt-sm">
                <q-btn flat dense size="sm" label="Cancelar" no-caps @click="closeForm" />
                <q-btn
                  type="submit"
                  flat
                  dense
                  size="sm"
                  color="primary"
                  icon="save"
                  :label="editingId ? 'Salvar alterações' : embedded ? 'Salvar conta' : 'Adicionar'"
                  no-caps
                  :loading="saving"
                />
              </div>
            </q-form>
          </q-card-section>
        </q-card>
      </component>
    </template>
    <q-dialog v-model="archiveDialog" persistent>
      <q-card style="width: min(440px, calc(100vw - 32px))"
        ><q-card-section
          ><div class="text-h6">Arquivar conta</div>
          <div class="q-mt-sm">
            Esta ação encerra o uso da conta selecionada. Deseja continuar?
          </div></q-card-section
        ><q-card-actions align="right"
          ><q-btn
            flat
            label="Cancelar"
            no-caps
            :disable="actionSaving"
            @click="archiveDialog = false" /><q-btn
            flat
            color="negative"
            label="Arquivar"
            no-caps
            :loading="actionSaving"
            @click="confirmArchive" /></q-card-actions
      ></q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { computed, nextTick, reactive, ref, watch, onScopeDispose } from 'vue'
import { createRequestContext } from 'src/services/requestContext'
import { QDialog, QExpansionItem } from 'quasar'
import TitleCard from 'src/components/Card/TitleCard.vue'
import LabelForm from 'src/components/Form/LabelForm.vue'
import {
  archiveCustomerBankAccount,
  createCustomerBankAccount,
  getCustomerBankAccount,
  listBanks,
  listCustomerBankAccounts,
  setPrimaryCustomerBankAccount,
  updateCustomerBankAccount,
} from 'src/services/customerService'
import { readBankCatalog } from 'src/services/bankCatalog'
import { getApiErrorMessage } from 'src/services/apiError'
import useNotification from 'src/composables/global/useNotification'

const props = defineProps({ customerId: { type: String, required: true }, embedded: Boolean })
const emit = defineEmits(['updated'])
const { successNotify, errorNotify } = useNotification()
const formRef = ref(null),
  bankSelectRef = ref(null),
  loading = ref(true),
  saving = ref(false),
  actionSaving = ref(false),
  loadError = ref(''),
  formOpen = ref(false),
  editingId = ref(null),
  archiveDialog = ref(false),
  archiveTarget = ref(null)
const accounts = ref([]),
  bankOptions = ref([]),
  filteredBankOptions = ref([])
const editingMasks = reactive({ accountNumber: '', holderDocument: '', pixKey: '' })
const accountTypeOptions = [
  { label: 'Conta corrente', value: 'Checking' },
  { label: 'Conta poupança', value: 'Savings' },
  { label: 'Conta de pagamento', value: 'Payment' },
]
const holderTypeOptions = [
  { label: 'Pessoa física', value: 'Individual' },
  { label: 'Pessoa jurídica', value: 'Organization' },
]
const pixKeyTypeOptions = [
  { label: 'CPF/CNPJ', value: 'Document' },
  { label: 'E-mail', value: 'Email' },
  { label: 'Telefone', value: 'Phone' },
  { label: 'Aleatória', value: 'Random' },
]
const statusOptions = [
  { label: 'Ativa', value: 'Active' },
  { label: 'Inativa', value: 'Inactive' },
]
const emptyForm = () => ({
  bankId: null,
  branch: '',
  accountNumber: '',
  accountDigit: null,
  accountType: '',
  holderType: '',
  holderName: null,
  holderDocument: null,
  pixKey: null,
  pixKeyType: null,
  isPrimary: false,
  status: 'Active',
})
const form = reactive(emptyForm())
const bankAccountInput = ref('')
const bankAccountText = computed({
  get: () =>
    editingId.value ? `${form.branch} / ${editingMasks.accountNumber}` : bankAccountInput.value,
  set: (value) => {
    if (editingId.value) return
    bankAccountInput.value = value
    const parts = value.split('/')
    form.branch = parts[0]?.trim() || ''
    const account = (parts.slice(1).join('/') || '').trim().split('-')
    form.accountNumber = account[0] || ''
    form.accountDigit = account[1] || null
  },
})
const columns = computed(() => [
  { name: 'bank', label: 'Banco', field: 'bankId', align: 'left' },
  {
    name: 'account',
    label: props.embedded ? 'Agência / conta' : 'Conta',
    field: 'accountNumberMasked',
    align: 'left',
  },
  ...(props.embedded
    ? [
        {
          name: 'type',
          label: 'Tipo',
          field: (r) =>
            accountTypeOptions.find((o) => o.value === r.accountType)?.label || 'Não informado',
          align: 'left',
        },
      ]
    : []),
  ...(!props.embedded
    ? [{ name: 'holder', label: 'Documento', field: 'holderDocumentMasked', align: 'left' }]
    : []),
  { name: 'pix', label: 'Chave Pix', field: 'pixKeyMasked', align: 'left' },
  { name: 'primary', label: 'Principal', field: 'isPrimary', align: 'center' },
  { name: 'actions', label: '', field: 'id', align: 'right' },
])
const required = (value) => !!value || 'Campo obrigatório'
const masked = (value) => value || 'Não informado'
const bankName = (id) =>
  bankOptions.value.find((bank) => bank.value === id)?.label || 'Banco não identificado'
const bankInitials = (id) => {
  const words = bankName(id)
    .replace(/^\d+\s*[—-]\s*/, '')
    .split(/\s+/)
    .filter(
      (word) =>
        word &&
        !['banco', 'de', 'do', 'da', 'dos', 'das', 's.a.', 's.a'].includes(word.toLowerCase()),
    )
  return (
    words.length === 1
      ? words[0].slice(0, 2)
      : words
          .slice(0, 2)
          .map((word) => word[0])
          .join('')
  ).toUpperCase()
}
const normalizeSearch = (value) =>
  String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('pt-BR')
const onBankSelected = async () => {
  filteredBankOptions.value = []
  await nextTick()
  bankSelectRef.value?.hidePopup()
}
const bankSearch = ref('')
const bankOptionLabel = (option) => (typeof option === 'object' ? option.label : bankName(option))
const filterBanks = (value, update) => {
  bankSearch.value = String(value || '').trim()
  update(() => {
    const search = normalizeSearch(value).trim()
    filteredBankOptions.value = search
      ? bankOptions.value.filter((bank) => normalizeSearch(bank.label).includes(search))
      : []
  })
}
const context = createRequestContext(() => props.customerId)
const formContext = createRequestContext(() => props.customerId)
let loadRevision = 0
const load = async () => {
  const version = ++loadRevision,
    ownerActive = context.capture(),
    customerId = props.customerId
  const active = () => ownerActive() && version === loadRevision
  loading.value = true
  loadError.value = ''
  const [banksResult, accountsResult] = await Promise.allSettled([
    readBankCatalog((params) => {
      if (!active()) throw Error('Consulta encerrada.')
      return listBanks({ ...params, isActive: true })
    }),
    listCustomerBankAccounts(customerId, { page: 1, pageSize: 100 }),
  ])
  if (!active()) return
  if (banksResult.status === 'fulfilled') {
    bankOptions.value = banksResult.value.map((bank) => ({
      label: bank.code ? `${bank.code} — ${bank.name}` : bank.name,
      value: bank.id,
    }))
    filteredBankOptions.value = []
  } else {
    bankOptions.value = []
    filteredBankOptions.value = []
    loadError.value = getApiErrorMessage(
      banksResult.reason,
      'Não foi possível carregar o catálogo de bancos.',
    )
  }
  if (accountsResult.status === 'fulfilled') accounts.value = accountsResult.value?.data ?? []
  else
    loadError.value = getApiErrorMessage(
      accountsResult.reason,
      'Não foi possível carregar as contas bancárias.',
    )
  loading.value = false
}
const closeForm = () => {
  formContext.invalidate()
  saving.value = false
  bankAccountInput.value = ''
  Object.assign(form, emptyForm())
  Object.assign(editingMasks, { accountNumber: '', holderDocument: '', pixKey: '' })
  editingId.value = null
  formRef.value?.resetValidation()
  formOpen.value = false
}
const startEdit = async (account) => {
  formContext.invalidate()
  const active = formContext.capture(),
    customerId = props.customerId
  try {
    saving.value = true
    const detail = await getCustomerBankAccount(customerId, account.id)
    if (!active()) return
    editingId.value = account.id
    Object.assign(form, {
      bankId: detail.bankId,
      branch: detail.branch,
      accountNumber: detail.accountNumber,
      accountDigit: detail.accountDigit,
      accountType: detail.accountType,
      holderType: detail.holderType,
      holderName: detail.holderName,
      holderDocument: detail.holderDocument,
      pixKey: detail.pixKey,
      pixKeyType: detail.pixKeyType,
      isPrimary: detail.isPrimary,
      status: detail.status,
    })
    Object.assign(editingMasks, {
      accountNumber: detail.accountNumberMasked || 'Mascarado',
      holderDocument: detail.holderDocumentMasked || 'Não informado',
      pixKey: detail.pixKeyMasked || 'Não informado',
    })
    formOpen.value = true
  } catch (error) {
    if (active()) errorNotify(getApiErrorMessage(error, 'Não foi possível abrir a conta bancária.'))
  } finally {
    if (active()) saving.value = false
  }
}
const save = async () => {
  if (saving.value || actionSaving.value) return
  const active = formContext.capture(),
    ownerActive = context.capture(),
    customerId = props.customerId,
    accountId = editingId.value
  saving.value = true
  try {
    if (!(await formRef.value.validate()) || !active()) return
    const payload = {
      ...form,
      accountDigit: form.accountDigit || null,
      holderName: form.holderName || null,
      holderDocument: form.holderDocument || null,
      pixKey: form.pixKey || null,
      pixKeyType: form.pixKeyType || null,
    }
    if (accountId) await updateCustomerBankAccount(customerId, accountId, payload)
    else await createCustomerBankAccount(customerId, payload)
    if (!active()) return
    successNotify(accountId ? 'Conta bancária atualizada.' : 'Conta bancária adicionada.')
    closeForm()
    await load()
    if (ownerActive()) emit('updated')
  } catch (error) {
    if (active())
      errorNotify(getApiErrorMessage(error, 'Não foi possível adicionar a conta bancária.'))
  } finally {
    if (active()) saving.value = false
  }
}
const runAction = async (action, account) => {
  if (saving.value || actionSaving.value) return
  const active = context.capture(),
    customerId = props.customerId
  try {
    if (action === 'edit') {
      await startEdit(account)
      return
    }
    if (action === 'archive') {
      archiveTarget.value = account
      archiveDialog.value = true
      return
    }
    actionSaving.value = true
    if (action === 'primary') await setPrimaryCustomerBankAccount(customerId, account.id)
    if (!active()) return
    successNotify('Conta bancária atualizada.')
    await load()
    if (active()) emit('updated')
  } catch (error) {
    if (active())
      errorNotify(getApiErrorMessage(error, 'Não foi possível atualizar a conta bancária.'))
  } finally {
    if (active()) actionSaving.value = false
  }
}
const confirmArchive = async () => {
  if (saving.value || actionSaving.value || !archiveTarget.value) return
  const active = context.capture(),
    customerId = props.customerId,
    accountId = archiveTarget.value.id
  try {
    actionSaving.value = true
    await archiveCustomerBankAccount(customerId, accountId)
    if (!active()) return
    archiveDialog.value = false
    archiveTarget.value = null
    successNotify('Conta bancária arquivada.')
    await load()
    if (active()) emit('updated')
  } catch (error) {
    if (active())
      errorNotify(getApiErrorMessage(error, 'Não foi possível arquivar a conta bancária.'))
  } finally {
    if (active()) actionSaving.value = false
  }
}

const mobileValue = (row, column) => {
  if (column.name === 'bank') return bankName(row.bankId)
  if (column.name === 'primary') return row.isPrimary ? 'Sim' : 'Não'
  if (column.name === 'account')
    return [row.branch, masked(row.accountNumberMasked)].filter(Boolean).join(' / ')
  return typeof column.field === 'function' ? column.field(row) : masked(row[column.field])
}
defineExpose({
  addAccount: () => {
    if (saving.value || actionSaving.value) return
    closeForm()
    formOpen.value = true
  },
})
function resetContext() {
  context.invalidate()
  loadRevision++
  closeForm()
  accounts.value = []
  bankOptions.value = []
  filteredBankOptions.value = []
  archiveDialog.value = false
  archiveTarget.value = null
  saving.value = false
  actionSaving.value = false
  loadError.value = ''
}
watch(
  () => props.customerId,
  () => {
    resetContext()
    load()
  },
  { flush: 'sync' },
)
onScopeDispose(() => {
  resetContext()
  context.dispose()
  formContext.dispose()
})
load()
</script>

<style scoped>
.bank-accounts-table {
  min-width: 0;
  max-width: 100%;
}
.bank-accounts-table :deep(table) {
  table-layout: fixed;
  width: 100%;
}
.bank-accounts-table :deep(th),
.bank-accounts-table :deep(td) {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.bank-accounts-table :deep(th:nth-child(2)) {
  width: 10%;
}
.bank-accounts-table :deep(th:nth-child(3)),
.bank-accounts-table :deep(th:nth-child(4)) {
  width: 16%;
}
.bank-accounts-table :deep(th:nth-child(5)) {
  width: 12%;
}
.bank-accounts-table :deep(th:last-child) {
  width: 76px;
}
.bank-accounts-table :deep(td:nth-child(5)),
.bank-accounts-table :deep(td:last-child) {
  padding-left: 4px;
  padding-right: 4px;
}
.bank-row-actions {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 4px;
}
.bank-name {
  display: block;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.bank-field {
  min-width: 0;
}
.bank-select {
  min-width: 0;
  width: 100%;
}
.bank-select :deep(.q-field__native > span) {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.bank-accounts-table--profile :deep(th) {
  width: auto !important;
  font-size: 11px;
  padding: 8px;
}
.bank-accounts-table--profile :deep(td) {
  padding: 8px;
  font-size: 12px;
}
.bank-accounts-table--profile :deep(th:first-child) {
  width: 20% !important;
}
.bank-accounts-table--profile :deep(th:last-child) {
  width: 76px !important;
}
.bank-accounts-table--profile :deep(th:nth-last-child(2)) {
  width: 72px !important;
}
.bank-profile-dialog .bank-profile-fields > * {
  width: 100%;
}
.bank-profile-dialog {
  background: linear-gradient(145deg, #101423, #072539) !important;
  width: min(720px, calc(100vw - 32px));
  color: var(--sa-text);
  background: var(--sa-surface);
  border: 1px solid var(--sa-border);
  border-radius: 12px;
}
.bank-inline-form {
  background: transparent;
}
.bank-profile-dialog :deep(.q-field__native),
.bank-profile-dialog :deep(.q-field__input),
.bank-profile-dialog :deep(.q-field__marginal) {
  color: #fff;
}
.bank-profile-dialog :deep(.q-field--outlined .q-field__control::before) {
  border-color: rgba(255, 255, 255, 0.28);
}
.bank-mobile-account {
  border: 1px solid var(--sa-border);
  border-radius: 8px;
}
.bank-mobile-account dl {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin: 0;
}
.bank-mobile-account dt {
  font-size: 10px;
  color: var(--sa-muted);
}
.bank-mobile-account dd {
  margin: 4px 0 0;
  font-size: 12px;
  overflow-wrap: anywhere;
}
.bank-mobile-account dl > div:first-child {
  grid-column: 1 / -1;
}
.bank-identity {
  display: flex;
  align-items: center;
  min-width: 0;
  gap: 8px;
}
.bank-initials {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: none;
  width: 24px;
  height: 24px;
  font-size: 9px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.06);
}
.bank-accounts-table :deep(td.bank-pix) {
  white-space: normal;
  overflow: visible;
  text-overflow: clip;
  overflow-wrap: anywhere;
}
</style>
