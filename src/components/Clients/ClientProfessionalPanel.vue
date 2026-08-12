<template>
  <div>
    <div class="text-subtitle1 text-weight-bold">Perfil profissional</div>
    <div class="text-caption text-grey-7">Ocupação, empregador e período de vigência do vínculo.</div>

    <div v-if="loading" class="row justify-center q-pa-xl">
      <q-spinner color="primary" size="32px" />
    </div>
    <q-banner v-else-if="loadError" class="bg-red-1 text-negative q-mt-md">
      {{ loadError }}
      <template #action><q-btn flat color="negative" label="Tentar novamente" @click="load" /></template>
    </q-banner>
    <q-form v-else ref="formRef" class="q-mt-md" @submit.prevent="save">
      <div class="row q-col-gutter-sm items-end">
        <label-form class-name="col-12 col-md-4" text-label="Ocupação"><q-input
          v-model.trim="form.occupation"
          outlined
          dense
          placeholder="value"
          hide-bottom-space
          :rules="[(value) => !!value || 'Informe a ocupação']"
        /></label-form>
        <label-form class-name="col-12 col-md-4" text-label="Empregador"><q-input
          v-model.trim="form.employerName"
          outlined
          dense
          clearable
          placeholder="value"
        /></label-form>
        <label-form class-name="col-12 col-md-4" text-label="Válido desde"><q-input
          v-model="form.validFrom"
          type="date"
          outlined
          dense
          hide-bottom-space
          :rules="[(value) => !!value || 'Informe a data inicial']"
        /></label-form>
        <label-form class-name="col-12 col-md-4" text-label="Válido até"><q-input
          v-model="form.validTo"
          type="date"
          outlined
          dense
          clearable
          :disable="form.isCurrent"
          hide-bottom-space
          :rules="[validEndDate]"
        /></label-form>
        <q-checkbox
          v-model="form.isCurrent"
          label="Vínculo atual"
          class="col-auto q-mb-sm"
          dense
          size="sm"
          @update:model-value="onCurrentChange"
        />
      </div>
      <div class="row justify-end q-mt-sm">
        <q-btn type="submit" flat dense size="sm" color="primary" icon="save" label="Salvar perfil" no-caps :loading="saving" />
      </div>
    </q-form>

    <div v-if="!embedded" class="q-mt-xl">
      <div class="text-subtitle1 text-weight-bold">Resumo do perfil</div>
      <div class="text-caption text-grey-7">Visão combinada retornada para o cliente.</div>
      <div v-if="loading" class="row justify-center q-pa-lg"><q-spinner color="primary" /></div>
      <q-banner v-else-if="combinedError" class="bg-orange-1 text-warning q-mt-md">
        {{ combinedError }}
        <template #action><q-btn flat color="warning" label="Tentar novamente" @click="load" /></template>
      </q-banner>
      <q-list v-else separator class="q-mt-md">
        <q-item>
          <q-item-section><q-item-label caption>Ocupação</q-item-label><q-item-label>{{ combinedOccupation }}</q-item-label></q-item-section>
        </q-item>
        <q-item>
          <q-item-section><q-item-label caption>Empregador</q-item-label><q-item-label>{{ combinedEmployer }}</q-item-label></q-item-section>
        </q-item>
        <q-item>
          <q-item-section><q-item-label caption>Situação</q-item-label><q-item-label>{{ combinedCurrent }}</q-item-label></q-item-section>
        </q-item>
      </q-list>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import {
  getCustomerProfessionalFinancialSecurity,
  getCustomerProfessionalProfile,
  updateCustomerProfessionalProfile,
} from 'src/services/customerService'
import { getApiErrorMessage } from 'src/services/apiError'
import useNotification from 'src/composables/global/useNotification'
import LabelForm from 'src/components/Form/LabelForm.vue'

const props = defineProps({
  customerId: { type: String, required: true },
  embedded: { type: Boolean, default: false },
})
const emit = defineEmits(['updated'])
const { successNotify, errorNotify } = useNotification()
const formRef = ref(null)
const loading = ref(true)
const saving = ref(false)
const loadError = ref('')
const combinedError = ref('')
const combined = ref(null)
const form = reactive({ occupation: '', employerName: null, validFrom: '', validTo: null, isCurrent: true })

const combinedProfile = computed(() => combined.value?.professionalProfile ?? combined.value?.professional ?? combined.value ?? {})
const combinedOccupation = computed(() => combinedProfile.value?.occupation || form.occupation || 'Não informado')
const combinedEmployer = computed(() => combinedProfile.value?.employerName || form.employerName || 'Não informado')
const combinedCurrent = computed(() => {
  const current = combinedProfile.value?.isCurrent ?? form.isCurrent
  return current === true ? 'Vínculo atual' : current === false ? 'Vínculo encerrado' : 'Não informado'
})

const fillForm = (profile = {}) => Object.assign(form, {
  occupation: profile.occupation ?? '',
  employerName: profile.employerName ?? null,
  validFrom: profile.validFrom?.slice(0, 10) ?? '',
  validTo: profile.validTo?.slice(0, 10) ?? null,
  isCurrent: profile.isCurrent ?? !profile.validTo,
})
const validEndDate = (value) => form.isCurrent || !value || !form.validFrom || value >= form.validFrom || 'A data final deve ser posterior à data inicial'
const onCurrentChange = (isCurrent) => { if (isCurrent) form.validTo = null }

const load = async () => {
  loading.value = true
  loadError.value = ''
  combinedError.value = ''
  const [profileResult, combinedResult] = await Promise.allSettled([
    getCustomerProfessionalProfile(props.customerId),
    getCustomerProfessionalFinancialSecurity(props.customerId),
  ])
  if (profileResult.status === 'fulfilled') fillForm(profileResult.value || {})
  else if (profileResult.reason?.response?.status === 404) fillForm()
  else loadError.value = getApiErrorMessage(profileResult.reason, 'Não foi possível carregar o perfil profissional.')
  if (combinedResult.status === 'fulfilled') combined.value = combinedResult.value
  else {
    combined.value = null
    combinedError.value = getApiErrorMessage(combinedResult.reason, 'O resumo combinado está temporariamente indisponível.')
  }
  loading.value = false
}

const save = async () => {
  if (!await formRef.value.validate()) return
  try {
    saving.value = true
    await updateCustomerProfessionalProfile(props.customerId, {
      occupation: form.occupation,
      employerName: form.employerName || null,
      validFrom: form.validFrom,
      validTo: form.isCurrent ? null : form.validTo || null,
      isCurrent: form.isCurrent,
    })
    successNotify('Perfil profissional atualizado.')
    await load()
    emit('updated')
  } catch (error) {
    errorNotify(getApiErrorMessage(error, 'Não foi possível salvar o perfil profissional.'))
  } finally {
    saving.value = false
  }
}

onMounted(load)
</script>
