<template>
  <div>
    <div class="text-subtitle1 text-weight-bold">Perfil financeiro</div>
    <div class="text-caption text-grey-7">Renda, patrimônio declarado e histórico de vigência.</div>
    <div v-if="loading" class="row justify-center q-pa-xl"><q-spinner color="primary" size="32px" /></div>
    <q-banner v-else-if="loadError" class="bg-red-1 text-negative q-mt-md">{{ loadError }}
      <template #action><q-btn flat color="negative" label="Tentar novamente" @click="load" /></template>
    </q-banner>
    <q-form v-else ref="formRef" class="q-mt-md" @submit.prevent="save">
      <div class="row q-col-gutter-sm">
        <label-form class-name="col-12 col-md-4" text-label="Renda mensal individual"><q-input v-model="form.individualMonthlyIncome" type="number" min="0" step="0.01" outlined dense placeholder="0,00" /></label-form>
        <label-form class-name="col-12 col-md-4" text-label="Renda mensal familiar"><q-input v-model="form.householdMonthlyIncome" type="number" min="0" step="0.01" outlined dense placeholder="0,00" /></label-form>
        <label-form class-name="col-12 col-md-4" text-label="Patrimônio declarado"><q-input v-model="form.declaredNetWorth" type="number" min="0" step="0.01" outlined dense placeholder="0,00" /></label-form>
        <label-form class-name="col-12 col-md-4" text-label="Moeda"><q-input v-model.trim="form.currencyCode" maxlength="3" outlined dense placeholder="BRL" :rules="[(value) => !!value || 'Informe a moeda']" /></label-form>
        <label-form class-name="col-12 col-md-4" text-label="Válido desde"><q-input v-model="form.effectiveFrom" type="date" outlined dense :rules="[(value) => !!value || 'Informe a data inicial']" /></label-form>
        <label-form class-name="col-12 col-md-4" text-label="Válido até"><q-input v-model="form.effectiveTo" type="date" outlined dense clearable /></label-form>
      </div>
      <div class="row justify-end q-mt-sm"><q-btn type="submit" flat dense size="sm" color="primary" icon="add" label="Criar nova versão" no-caps :loading="saving" /></div>
    </q-form>

    <div class="text-subtitle2 text-weight-bold q-mt-lg q-mb-sm">Histórico financeiro</div>
    <q-table flat dense hide-pagination row-key="id" :rows="history" :columns="columns">
      <template #body-cell-income="props"><q-td :props="props">{{ money(props.row.individualMonthlyIncome, props.row.currencyCode) }}</q-td></template>
      <template #body-cell-netWorth="props"><q-td :props="props">{{ money(props.row.declaredNetWorth, props.row.currencyCode) }}</q-td></template>
      <template #body-cell-period="props"><q-td :props="props">{{ date(props.row.effectiveFrom) }} — {{ date(props.row.effectiveTo) }}</q-td></template>
    </q-table>

    <div class="text-subtitle1 text-weight-bold q-mt-xl">Segurança da conta</div>
    <div class="text-caption text-grey-7">Informações somente para consulta; nenhum segredo é exibido.</div>
    <div class="row q-col-gutter-sm q-mt-sm">
      <div v-for="item in securityItems" :key="item.label" class="col-12 col-md-4">
        <div class="text-caption text-grey-7">{{ item.label }}</div><div>{{ item.value }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import LabelForm from 'src/components/Form/LabelForm.vue'
import { createCustomerFinancialProfile, getCustomerAccountSecurity, getCustomerCurrentFinancialProfile, getCustomerProfessionalFinancialSecurity, listCustomerFinancialProfiles } from 'src/services/customerService'
import { getApiErrorMessage } from 'src/services/apiError'
import useNotification from 'src/composables/global/useNotification'

const props = defineProps({ customerId: { type: String, required: true } })
const emit = defineEmits(['updated'])
const { successNotify, errorNotify } = useNotification()
const formRef = ref(null), loading = ref(true), saving = ref(false), loadError = ref('')
const history = ref([]), security = ref({})
const form = reactive({ individualMonthlyIncome: null, householdMonthlyIncome: null, declaredNetWorth: null, currencyCode: 'BRL', effectiveFrom: new Date().toISOString().slice(0, 10), effectiveTo: null })
const columns = [
  { name: 'income', label: 'Renda individual', field: 'individualMonthlyIncome', align: 'left' },
  { name: 'netWorth', label: 'Patrimônio', field: 'declaredNetWorth', align: 'left' },
  { name: 'period', label: 'Vigência', field: 'effectiveFrom', align: 'left' },
]
const yesNo = (value) => value === true ? 'Sim' : value === false ? 'Não' : 'Não informado'
const securityItems = computed(() => [
  { label: 'E-mail confirmado', value: yesNo(security.value?.emailConfirmed) },
  { label: 'Telefone confirmado', value: yesNo(security.value?.phoneConfirmed) },
  { label: 'Autenticação em duas etapas', value: yesNo(security.value?.twoFactorEnabled) },
])
const fill = (profile = {}) => Object.assign(form, {
  individualMonthlyIncome: profile.individualMonthlyIncome ?? null, householdMonthlyIncome: profile.householdMonthlyIncome ?? null,
  declaredNetWorth: profile.declaredNetWorth ?? null, currencyCode: profile.currencyCode ?? 'BRL',
  effectiveFrom: profile.effectiveFrom?.slice(0, 10) ?? new Date().toISOString().slice(0, 10), effectiveTo: profile.effectiveTo?.slice(0, 10) ?? null,
})
const load = async () => {
  loading.value = true; loadError.value = ''
  const [combinedResult, currentResult, historyResult, securityResult] = await Promise.allSettled([
    getCustomerProfessionalFinancialSecurity(props.customerId), getCustomerCurrentFinancialProfile(props.customerId), listCustomerFinancialProfiles(props.customerId, { page: 1, pageSize: 20 }), getCustomerAccountSecurity(props.customerId),
  ])
  if (currentResult.status === 'fulfilled') fill(currentResult.value || {})
  else if (combinedResult.status === 'fulfilled') fill(combinedResult.value?.financialProfile || combinedResult.value?.financial || {})
  else if (currentResult.reason?.response?.status !== 404) loadError.value = getApiErrorMessage(currentResult.reason, 'Não foi possível carregar o perfil financeiro.')
  if (historyResult.status === 'fulfilled') history.value = historyResult.value?.data ?? []
  if (securityResult.status === 'fulfilled') security.value = securityResult.value || {}
  loading.value = false
}
const save = async () => {
  if (!await formRef.value.validate()) return
  try {
    saving.value = true
    await createCustomerFinancialProfile(props.customerId, { ...form, individualMonthlyIncome: form.individualMonthlyIncome || null, householdMonthlyIncome: form.householdMonthlyIncome || null, declaredNetWorth: form.declaredNetWorth || null, effectiveTo: form.effectiveTo || null, currencyCode: form.currencyCode.toUpperCase() })
    successNotify('Nova versão financeira criada.'); await load(); emit('updated')
  } catch (error) { errorNotify(getApiErrorMessage(error, 'Não foi possível criar a versão financeira.')) }
  finally { saving.value = false }
}
const money = (value, currency = 'BRL') => value == null ? 'Não informado' : new Intl.NumberFormat('pt-BR', { style: 'currency', currency }).format(Number(value))
const date = (value) => value ? new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' }).format(new Date(value)) : 'Atual'
onMounted(load)
</script>
