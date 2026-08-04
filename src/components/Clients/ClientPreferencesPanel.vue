<template>
  <div class="row q-col-gutter-md">
    <div class="col-12 col-md-4">
      <q-card flat bordered>
        <q-card-section><div class="text-subtitle1 text-weight-bold">Status do cliente</div>
          <div class="text-caption text-grey-7">Controla o estado operacional do cadastro.</div></q-card-section>
        <q-separator />
        <q-card-section>
          <q-select v-model="selectedStatus" :options="statusOptions" emit-value map-options outlined label="Status" />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn color="primary" label="Alterar status" no-caps :loading="savingStatus" :disable="selectedStatus === currentStatus" @click="saveStatus" />
        </q-card-actions>
      </q-card>
    </div>

    <div class="col-12 col-md-8">
      <q-card flat bordered>
        <q-card-section><div class="text-subtitle1 text-weight-bold">Preferências</div>
          <div class="text-caption text-grey-7">Moeda, idioma, fuso horário e tema definidos pelo catálogo da API.</div></q-card-section>
        <q-separator />
        <q-card-section v-if="loading" class="row justify-center q-pa-xl"><q-spinner color="primary" size="36px" /></q-card-section>
        <q-banner v-else-if="loadError" class="bg-red-1 text-negative">{{ loadError }}
          <template #action><q-btn flat color="negative" label="Tentar novamente" @click="load" /></template>
        </q-banner>
        <q-card-section v-else class="row q-col-gutter-md">
          <q-select v-model="form.primaryCurrencyCode" :options="currencyOptions" emit-value map-options outlined label="Moeda principal" class="col-12 col-sm-6" />
          <q-select v-model="form.secondaryCurrencyCode" :options="currencyOptions" emit-value map-options clearable outlined label="Moeda secundária" class="col-12 col-sm-6" />
          <q-select v-model="form.languageCode" :options="languageOptions" emit-value map-options outlined label="Idioma" class="col-12 col-sm-6" />
          <q-select v-model="form.timeZoneId" :options="timeZoneOptions" emit-value map-options outlined label="Fuso horário" class="col-12 col-sm-6" />
          <q-select v-model="form.theme" :options="themeOptions" emit-value map-options outlined label="Tema" class="col-12 col-sm-6" />
        </q-card-section>
        <q-card-actions v-if="!loading && !loadError" align="right">
          <q-btn color="primary" label="Salvar preferências" no-caps :loading="savingPreferences" @click="savePreferences" />
        </q-card-actions>
      </q-card>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { changeCustomerStatus, getCustomerPreferences, getCustomerStatus, getPreferenceCatalog, updateCustomerPreferences } from 'src/services/customerService'
import { getApiErrorMessage } from 'src/services/apiError'
import useNotification from 'src/composables/global/useNotification'

const props = defineProps({ customerId: { type: String, required: true } })
const emit = defineEmits(['updated'])
const { successNotify, errorNotify } = useNotification()
const loading = ref(true), loadError = ref(''), savingStatus = ref(false), savingPreferences = ref(false)
const currentStatus = ref(''), selectedStatus = ref(''), catalog = ref({})
const form = reactive({ primaryCurrencyCode: null, secondaryCurrencyCode: null, languageCode: '', timeZoneId: '', theme: '' })
const statusOptions = [
  { label: 'Prospect', value: 'Prospect' }, { label: 'Ativo', value: 'Active' },
  { label: 'Suspenso', value: 'Suspended' }, { label: 'Arquivado', value: 'Archived' },
]
const toOptions = (items = [], valueKeys = ['code', 'id', 'value'], labelKeys = ['displayName', 'name', 'label']) =>
  items.map((item) => typeof item === 'string' ? { label: item, value: item } : {
    value: valueKeys.map((key) => item?.[key]).find(Boolean),
    label: labelKeys.map((key) => item?.[key]).find(Boolean) || valueKeys.map((key) => item?.[key]).find(Boolean),
  }).filter((item) => item.value)
const currencyOptions = computed(() => toOptions(catalog.value.currencies))
const languageOptions = computed(() => toOptions(catalog.value.languages, ['code', 'languageCode', 'value']))
const timeZoneOptions = computed(() => toOptions(catalog.value.timeZones || catalog.value.timezones, ['id', 'timeZoneId', 'value']))
const themeOptions = computed(() => toOptions(catalog.value.themes, ['value', 'code', 'id']))
const load = async () => {
  loading.value = true; loadError.value = ''
  try {
    const [status, preferences, options] = await Promise.all([getCustomerStatus(props.customerId), getCustomerPreferences(props.customerId), getPreferenceCatalog()])
    currentStatus.value = status?.status ?? status
    selectedStatus.value = currentStatus.value
    Object.assign(form, {
      primaryCurrencyCode: preferences?.primaryCurrencyCode ?? null,
      secondaryCurrencyCode: preferences?.secondaryCurrencyCode ?? null,
      languageCode: preferences?.languageCode ?? '',
      timeZoneId: preferences?.timeZoneId ?? '',
      theme: preferences?.theme ?? '',
    })
    catalog.value = options || {}
  } catch (error) { loadError.value = getApiErrorMessage(error, 'Não foi possível carregar status e preferências.') }
  finally { loading.value = false }
}
const saveStatus = async () => {
  try { savingStatus.value = true; await changeCustomerStatus(props.customerId, selectedStatus.value); currentStatus.value = selectedStatus.value; successNotify('Status atualizado.'); emit('updated') }
  catch (error) { errorNotify(getApiErrorMessage(error, 'Não foi possível alterar o status.')) }
  finally { savingStatus.value = false }
}
const savePreferences = async () => {
  try { savingPreferences.value = true; await updateCustomerPreferences(props.customerId, { ...form }); successNotify('Preferências atualizadas.'); emit('updated') }
  catch (error) { errorNotify(getApiErrorMessage(error, 'Não foi possível salvar as preferências.')) }
  finally { savingPreferences.value = false }
}
onMounted(load)
</script>
