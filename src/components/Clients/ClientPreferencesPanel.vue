<template>
  <div :class="[hideStatus ? '' : 'row q-col-gutter-md', { 'profile-preferences': profileLayout }]">
    <div v-if="!hideStatus" class="col-12 col-md-4">
      <q-card flat :bordered="!embedded">
        <q-card-section
          ><div class="text-subtitle1 text-weight-bold">Status do cliente</div>
          <div class="text-caption text-grey-7">
            Controla o estado operacional do cadastro.
          </div></q-card-section
        >
        <q-separator />
        <q-card-section>
          <q-select
            v-model="selectedStatus"
            :options="statusOptions"
            emit-value
            map-options
            outlined
            label="Status"
          />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn
            color="primary"
            label="Alterar status"
            no-caps
            :loading="savingStatus"
            :disable="selectedStatus === currentStatus"
            @click="saveStatus"
          />
        </q-card-actions>
      </q-card>
    </div>

    <div :class="hideStatus ? 'col-12' : 'col-12 col-md-8'">
      <q-card flat :bordered="!embedded">
        <q-card-section v-if="!profileLayout"
          ><div class="text-subtitle1 text-weight-bold">Preferências</div>
          <div class="text-caption text-grey-7">
            Moeda, idioma, fuso horário e tema definidos pelo catálogo da API.
          </div></q-card-section
        >
        <q-separator v-if="!embedded" />
        <q-card-section v-if="loading" class="row justify-center q-pa-xl"
          ><q-spinner color="primary" size="36px"
        /></q-card-section>
        <q-banner v-else-if="loadError" class="bg-red-1 text-negative"
          >{{ loadError }}
          <template #action
            ><q-btn flat color="negative" label="Tentar novamente" @click="load"
          /></template>
        </q-banner>
        <q-card-section v-else class="preference-fields row q-col-gutter-sm q-px-none q-py-sm">
          <label-form :class-name="preferenceColumn" text-label="Moeda primária"
            ><q-select
              :model-value="values.primaryCurrencyCode"
              @update:model-value="setField('primaryCurrencyCode', $event)"
              :readonly="controlled && !editing"
              :disable="busy"
              :error="Boolean(fieldErrors?.primaryCurrencyCode)"
              :error-message="fieldErrors?.primaryCurrencyCode"
              :class="{
                'preference-field--changed':
                  controlled && editing && changed('primaryCurrencyCode'),
              }"
              :options="currencyOptions"
              emit-value
              map-options
              outlined
              dense
              aria-label="Moeda principal"
          /></label-form>
          <label-form :class-name="preferenceColumn" text-label="Moeda secundária"
            ><q-select
              :model-value="values.secondaryCurrencyCode"
              @update:model-value="setField('secondaryCurrencyCode', $event)"
              :readonly="controlled && !editing"
              :disable="busy"
              :error="Boolean(fieldErrors?.secondaryCurrencyCode)"
              :error-message="fieldErrors?.secondaryCurrencyCode"
              :class="{
                'preference-field--changed':
                  controlled && editing && changed('secondaryCurrencyCode'),
              }"
              :options="currencyOptions"
              emit-value
              map-options
              clearable
              outlined
              dense
              aria-label="Moeda secundária"
          /></label-form>
          <label-form :class-name="preferenceColumn" text-label="Idioma do sistema"
            ><q-select
              :model-value="values.languageCode"
              @update:model-value="setField('languageCode', $event)"
              :readonly="controlled && !editing"
              :disable="busy"
              :error="Boolean(fieldErrors?.languageCode)"
              :error-message="fieldErrors?.languageCode"
              :class="{
                'preference-field--changed': controlled && editing && changed('languageCode'),
              }"
              :options="languageOptions"
              emit-value
              map-options
              outlined
              dense
              aria-label="Idioma"
          /></label-form>
          <label-form :class-name="preferenceColumn" text-label="Fuso horário"
            ><q-select
              :model-value="values.timeZoneId"
              @update:model-value="setField('timeZoneId', $event)"
              :readonly="controlled && !editing"
              :disable="busy"
              :error="Boolean(fieldErrors?.timeZoneId)"
              :error-message="fieldErrors?.timeZoneId"
              :class="{
                'preference-field--changed': controlled && editing && changed('timeZoneId'),
              }"
              :options="timeZoneOptions"
              emit-value
              map-options
              outlined
              dense
              aria-label="Fuso horário"
          /></label-form>
          <label-form v-if="profileLayout" class-name="col-12 q-mt-md" text-label="Tema do sistema">
            <div class="preference-themes">
              <q-btn
                v-for="theme in themeOptions"
                :key="theme.value"
                :label="theme.label"
                :icon="themeIcon(theme)"
                :aria-pressed="values.theme === theme.value"
                :class="{ 'preference-theme--selected': values.theme === theme.value }"
                outline
                no-caps
                :disable="busy || (controlled && !editing)"
                @click="setField('theme', theme.value)"
              />
            </div>
          </label-form>
          <label-form v-else class-name="col-12 col-md-4" text-label="Tema"
            ><q-select
              v-model="form.theme"
              :options="themeOptions"
              emit-value
              map-options
              outlined
              dense
          /></label-form>
        </q-card-section>
        <q-card-actions
          v-if="!controlled && !loading && !loadError"
          align="right"
          class="q-pa-none"
        >
          <q-btn
            flat
            dense
            size="sm"
            color="primary"
            icon="save"
            label="Salvar preferências"
            no-caps
            :loading="savingPreferences"
            @click="savePreferences"
          />
        </q-card-actions>
      </q-card>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onScopeDispose, reactive, ref } from 'vue'
import {
  changeCustomerStatus,
  getCustomerPreferences,
  getCustomerStatus,
  getPreferenceCatalog,
  updateCustomerPreferences,
} from 'src/services/customerService'
import { getApiErrorMessage } from 'src/services/apiError'
import useNotification from 'src/composables/global/useNotification'
import LabelForm from 'src/components/Form/LabelForm.vue'

const props = defineProps({
  customerId: { type: String, required: true },
  embedded: { type: Boolean, default: false },
  hideStatus: { type: Boolean, default: false },
  profileLayout: { type: Boolean, default: false },
  controlled: Boolean,
  editing: Boolean,
  externalValue: Object,
  original: Object,
  busy: Boolean,
  fieldErrors: Object,
})
const emit = defineEmits(['updated', 'ready', 'update:externalValue'])
const { successNotify, errorNotify } = useNotification()
const loading = ref(true),
  loadError = ref(''),
  savingStatus = ref(false),
  savingPreferences = ref(false)
const currentStatus = ref(''),
  selectedStatus = ref(''),
  catalog = ref({})
const form = reactive({
  primaryCurrencyCode: null,
  secondaryCurrencyCode: null,
  languageCode: '',
  timeZoneId: '',
  theme: '',
})
const values = computed(() =>
  props.controlled && props.editing && props.externalValue ? props.externalValue : form,
)
const setField = (key, value) => {
  if (props.controlled) {
    if (props.editing && !props.busy)
      emit('update:externalValue', { ...values.value, [key]: value })
  } else form[key] = value
}
const changed = (key) => values.value[key] !== props.original?.[key]
const preferenceColumn = computed(() =>
  props.profileLayout ? 'col-12 col-sm-6 col-lg-3' : 'col-12 col-md-4',
)
const statusOptions = [
  { label: 'Prospect', value: 'Prospect' },
  { label: 'Ativo', value: 'Active' },
  { label: 'Suspenso', value: 'Suspended' },
  { label: 'Arquivado', value: 'Archived' },
]
const toOptions = (
  items = [],
  valueKeys = ['code', 'id', 'value'],
  labelKeys = ['displayName', 'name', 'label'],
) =>
  items
    .map((item) =>
      typeof item === 'string'
        ? { label: item, value: item }
        : {
            value: valueKeys.map((key) => item?.[key]).find(Boolean),
            label:
              labelKeys.map((key) => item?.[key]).find(Boolean) ||
              valueKeys.map((key) => item?.[key]).find(Boolean),
          },
    )
    .filter((item) => item.value)
const currencyOptions = computed(() => toOptions(catalog.value.currencies))
const languageOptions = computed(() =>
  toOptions(catalog.value.languages, ['code', 'languageCode', 'value']),
)
const timeZoneOptions = computed(() =>
  toOptions(catalog.value.timeZones || catalog.value.timezones, ['id', 'timeZoneId', 'value']),
)
const themeOptions = computed(() => toOptions(catalog.value.themes, ['value', 'code', 'id']))
const themeIcon = (theme) => {
  const key = String(theme.value).toLowerCase() + String(theme.label).toLowerCase()
  const name = /light|claro/.test(key) ? 'light' : /dark|escuro/.test(key) ? 'dark' : 'auto'
  return 'img:/icons/client-profile/theme-' + name + '.svg'
}
let loadRevision = 0
onScopeDispose(() => loadRevision++)
const load = async () => {
  const revision = ++loadRevision
  loading.value = true
  emit('ready', false)
  loadError.value = ''
  try {
    const [status, preferences, options] = await Promise.all([
      props.hideStatus ? Promise.resolve(null) : getCustomerStatus(props.customerId),
      getCustomerPreferences(props.customerId),
      getPreferenceCatalog(),
    ])
    if (revision !== loadRevision) return
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
    emit('ready', true)
  } catch (error) {
    if (revision !== loadRevision) return
    loadError.value = getApiErrorMessage(error, 'Não foi possível carregar status e preferências.')
  } finally {
    if (revision === loadRevision) loading.value = false
  }
}
const saveStatus = async () => {
  try {
    savingStatus.value = true
    await changeCustomerStatus(props.customerId, selectedStatus.value)
    currentStatus.value = selectedStatus.value
    successNotify('Status atualizado.')
    emit('updated')
  } catch (error) {
    errorNotify(getApiErrorMessage(error, 'Não foi possível alterar o status.'))
  } finally {
    savingStatus.value = false
  }
}
const savePreferences = async () => {
  try {
    savingPreferences.value = true
    await updateCustomerPreferences(props.customerId, { ...form })
    successNotify('Preferências atualizadas.')
    emit('updated')
  } catch (error) {
    errorNotify(getApiErrorMessage(error, 'Não foi possível salvar as preferências.'))
  } finally {
    savingPreferences.value = false
  }
}
defineExpose({ reload: load })
onMounted(load)
</script>
<style scoped>
.preference-field--changed :deep(.q-field__control) {
  background: rgba(190, 219, 255, 0.08);
}
.preference-field--changed :deep(.q-field__control:before) {
  border-color: rgba(190, 219, 255, 0.5);
}
.preference-fields :deep(.LabelForm) {
  min-width: 0;
  grid-template-columns: minmax(0, 1fr);
}
.preference-fields :deep(.q-field) {
  min-width: 0;
  width: 100%;
  max-width: 100%;
}
.preference-fields :deep(.q-field__control-container),
.preference-fields :deep(.q-field__native) {
  min-width: 0;
}
.preference-fields :deep(.q-field__native) {
  flex-wrap: nowrap;
}
.preference-fields :deep(.q-field__native > span) {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.profile-preferences :deep(.q-card) {
  background: transparent;
  color: inherit;
}
.profile-preferences :deep(.LabelForm > span) {
  color: rgba(255, 255, 255, 0.68);
  font-size: 12px !important;
  text-transform: uppercase;
  letter-spacing: 0.6px;
}
.preference-themes :deep(.q-icon) {
  width: 16px;
  height: 16px;
  font-size: 16px;
}
.preference-themes {
  display: flex;
  gap: 12px;
}
.preference-themes .q-btn {
  flex: 1;
  min-height: 36px;
  color: rgba(255, 255, 255, 0.7);
  background: var(--sa-surface-soft);
}
.preference-themes .preference-theme--selected {
  color: #fff;
  background: rgba(255, 255, 255, 0.14);
}
@media (max-width: 600px) {
  .preference-themes :deep(.q-icon) {
    width: 16px;
    height: 16px;
    font-size: 16px;
  }
  .preference-themes {
    flex-direction: column;
    gap: 8px;
  }
}
</style>
