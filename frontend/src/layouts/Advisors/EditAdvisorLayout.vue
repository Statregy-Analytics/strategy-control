<template>
  <q-card class="EditAdvisorLayout">
    <title-card :title="dialogOpengHeader" @on-close="onClose"></title-card>
    <q-separator />
    <q-banner inline-actions rounded class="q-ma-md border-pattern">
      <div class="row">
        <div class="col-1">
          <avatar-initials
            :src="advisorEdit.assessor.avatar || ''"
            :name="advisorEdit.assessor.name"
            size="32px"
            rounded
          />
        </div>
        <div class="col-6">
          <span class="text-muted" style="font-size: 12px">ID #{{ advisorEdit.id }}</span>
          <div class="">
            <div class="row items-center q-gutter-sm">
              <div class="col">
                <q-input
                  dense
                  outlined
                  v-model="advisorEdit.assessor.name"
                  placeholder="Nome do Assessor"
                  :rules="nameRule"
                  lazy-rules
                />
              </div>
              <div class="col">
                <q-input
                  dense
                  outlined
                  v-model="advisorEdit.assessor.email"
                  placeholder="Email do Assessor"
                  :rules="emailRule"
                  lazy-rules
                />
              </div>
            </div>
          </div>
        </div>
        <div class="col">
          <q-btn flat round dense color="grey-6" icon="keyboard_arrow_down">
            <q-menu v-model="showOptions" self="top middle" square>
              <q-list style="min-width: 320px; padding-top: 2px">
                <q-item
                  dense
                  v-for="advisor in advisorsSelected"
                  :key="advisor"
                  clickable
                  @click="setAdvisor(advisor.id)"
                  style="border-radius: 6px; margin-inline: 2px"
                >
                  <q-item-section avatar>
                    <avatar-initials
                      :src="advisor.avatar || ''"
                      :name="advisor.name"
                      size="32px"
                      rounded
                    />
                  </q-item-section>
                  <q-item-section align="left">
                    {{ advisor.name }}
                  </q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
        </div>
      </div>
      <template v-slot:action>
        <q-btn flat size="xs" :icon="$filtersString.resolveUrl('img:icons/edit.svg')" />
        <q-btn flat size="xs" :icon="$filtersString.resolveUrl('img:icons/trash.svg')" />
        <q-btn
          :disable="!advisorNameValid || !advisorEmailValid"
          color="primary"
          dense
          label="Salvar"
          @click.prevent="onSave"
        />
      </template>
    </q-banner>

    <q-card-section>
      <splent-form-layout />

      <commission-form-layout />
      <div class="text-h7 text-bold q-mt-xl q-mb-md">Clientes</div>
      <customers-form-layout />
    </q-card-section>
  </q-card>
</template>
<script setup>
import { defineComponent, ref, computed } from 'vue'
import { useLayoutStore } from 'src/stores/layout'
import { useAdvisorStore } from 'src/stores/advisor'
import { storeToRefs } from 'pinia'
import TitleCard from 'src/components/Card/TitleCard.vue'
import { useQuasar } from 'quasar'
import useAdvisors from 'src/composables/Fakes/useAdvisors'
import useRules from 'src/composables/global/useRules'
import SplentFormLayout from './Form/SplentFormLayout.vue'
import CommissionFormLayout from './Form/CommissionFormLayout.vue'
import CustomersFormLayout from './Form/CustomersFormLayout.vue'
import AvatarInitials from 'src/components/Avatar/AvatarInitials.vue'

const layoutStore = useLayoutStore()
const advisorStore = useAdvisorStore()
const { advisorEdit } = storeToRefs(advisorStore)
const { dialogOpengHeader } = storeToRefs(layoutStore)
const { getAdvisorsIdNameEmail, getAdvisor, addAdvisor } = useAdvisors()
const showOptions = ref(false)
const $q = useQuasar()
const onClose = () => {
  console.log('onClose')
  advisorStore.setAdvisorEdit({})
}
defineComponent({
  name: 'EditAdvisorLayout',
})

const setAdvisor = (advisorId) => {
  advisorStore.setAdvisorEdit(getAdvisor(advisorId))
  showOptions.value = false
}

const advisorsSelected = computed(() => {
  return getAdvisorsIdNameEmail()
})

// validation rules (shared)
const { nameRule, emailRule } = useRules()

const onSave = async () => {
  try {
    // basic frontend validation
    const name = (advisorEdit.value.assessor && advisorEdit.value.assessor.name) || ''
    const email = (advisorEdit.value.assessor && advisorEdit.value.assessor.email) || ''
    const nameOk = String(name).trim().split(/\s+/).filter(Boolean).length >= 2
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email))
    if (!nameOk) {
      $q.notify({
        message: 'Informe nome completo do assessor (nome e sobrenome).',
        color: 'negative',
      })
      return
    }
    if (!emailOk) {
      $q.notify({ message: 'Email inválido.', color: 'negative' })
      return
    }
    // advisorEdit is a reactive ref; extract plain object
    const payload = JSON.parse(JSON.stringify(advisorEdit.value || {}))
    // map payload for API: top-level name/email expected by sqlite adapter
    const apiPayload = Object.assign({}, payload, {
      name: payload.assessor && payload.assessor.name ? payload.assessor.name : undefined,
      email: payload.assessor && payload.assessor.email ? payload.assessor.email : undefined,
    })
    // addAdvisor may be synchronous (fake) or async (API). Normalize with Promise.resolve
    const newAdvisor = await Promise.resolve(addAdvisor(apiPayload))
    advisorStore.setAdvisorEdit(newAdvisor)
    // show success notification
    $q.notify({ message: 'Assessor criado/atualizado com sucesso.', color: 'positive' })
    layoutStore.seAdvisorsDialog(false)
  } catch (e) {
    console.error('Failed to save advisor', e)
  }
}

// expose validation state for template (disable save button)
const advisorNameValid = computed(() => {
  const n = (advisorEdit.value.assessor && advisorEdit.value.assessor.name) || ''
  return String(n).trim().split(/\s+/).filter(Boolean).length >= 2
})
const advisorEmailValid = computed(() => {
  const e = (advisorEdit.value.assessor && advisorEdit.value.assessor.email) || ''
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(e))
})
</script>
