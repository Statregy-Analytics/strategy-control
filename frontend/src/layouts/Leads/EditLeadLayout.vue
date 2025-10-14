<template>
  <q-card class="EditLeadLayout">
    <title-card :title="dialogOpengHeader" @on-close="onClose"></title-card>
    <q-separator />
    <q-banner
      v-if="leadEdit && leadEdit.id && leadEdit.cliente"
      inline-actions
      rounded
      class="q-ma-md border-pattern"
    >
      <div class="row">
        <div class="col-1">
          <q-avatar size="32px">
            <q-img
              :src="leadEdit.cliente?.avatar"
              :alt="leadEdit.cliente?.name"
              :title="leadEdit.cliente?.name"
            />
          </q-avatar>
        </div>
        <div class="col-3">
          <span class="text-muted" style="font-size: 12px">ID #{{ leadEdit.id }}</span>
          <div class="">
            {{ leadEdit.cliente?.name }}
          </div>
        </div>
        <div class="col-1">
          <q-btn
            size="xs"
            outline
            padding="xs"
            no-caps
            class="custom-btn-muted"
            :label="leadEdit.estagio_lead"
          />
        </div>
        <div class="col">
          <q-btn flat round dense color="grey-6" icon="keyboard_arrow_down">
            <q-menu v-model="optionsMenu" self="top middle" square>
              <q-list style="min-width: 320px; padding-top: 2px">
                <q-item
                  dense
                  v-for="lead in leadSelected"
                  :key="lead"
                  clickable
                  @click="setLead(lead.value)"
                  style="border-radius: 6px; margin-inline: 2px"
                >
                  <q-item-section avatar>
                    <q-avatar size="32px">
                      <q-img :src="lead.avatar" :alt="lead.name" :title="lead.name" />
                    </q-avatar>
                  </q-item-section>
                  <q-item-section align="left">
                    {{ lead.label }}
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
      </template>
    </q-banner>
    <q-banner v-else inline-actions rounded class="q-ma-md border-pattern">
      <div>Carregando lead...</div>
    </q-banner>
    <q-card-section>
      <documents-leads-form ref="documentsForm" />
      <banks-leads-layout />
      <residencial-leads-layout />
      <upload-residencial-leads-layout />
      <documents-p-f-leads-layout />
      <documents-persona-leads-form />
      <address-leads-table />
      <partner-leads-table />
      <related-leads-table />
    </q-card-section>
    <q-card-actions vertical>
      <div class="row justify-end q-pa-md">
        <q-btn
          size="sm"
          unelevated
          color="negative"
          class="q-mr-sm"
          label="Remover"
          icon="delete"
          @click.prevent="confirmRemove = true"
          :disable="!leadEdit.id"
        />
        <div class="row items-center">
          <q-tooltip v-if="!canSave"
            >Preencha nome, e-mail, CPF e data de nascimento corretamente</q-tooltip
          >
          <q-btn
            :disable="!canSave"
            size="sm"
            unelevated
            color="primary"
            label="Salvar"
            icon="save"
            @click.prevent="saveLead"
          />
        </div>
      </div>
    </q-card-actions>

    <q-dialog v-model="confirmRemove" persistent>
      <q-card>
        <q-card-section>
          <div class="text-h6">Confirmar remoção</div>
          <div class="text-subtitle2 q-mt-sm">
            Tem certeza que deseja remover este lead? Esta ação não pode ser desfeita.
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="primary" @click="confirmRemove = false" />
          <q-btn flat label="Remover" color="negative" @click="onConfirmRemove" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-card>
</template>
<script setup>
import { defineComponent, computed, ref } from 'vue'
import { useQuasar } from 'quasar'
import useRules from 'src/composables/global/useRules'
import { useLayoutStore } from 'src/stores/layout'
import { useLeadStore } from 'src/stores/lead'
import { storeToRefs } from 'pinia'
import useLeads from 'src/composables/Fakes/useLeads'
import TitleCard from 'src/components/Card/TitleCard.vue'
import DocumentsLeadsForm from './form/DocumentsLeadsForm.vue'
import BanksLeadsLayout from './form/BanksLeadsLayout.vue'
import ResidencialLeadsLayout from './form/ResidencialLeadsLayout.vue'
import UploadResidencialLeadsLayout from './form/UploadResidencialLeadsLayout.vue'
import DocumentsPFLeadsLayout from './form/DocumentsPFLeadsLayout.vue'
import DocumentsPersonaLeadsForm from './form/DocumentsPersonaLeadsForm.vue'
import AddressLeadsTable from 'src/components/Table/Leads/AddressLeadsTable.vue'
import PartnerLeadsTable from 'src/components/Table/Leads/PartnerLeadsTable.vue'
import RelatedLeadsTable from 'src/components/Table/Leads/RelatedLeadsTable.vue'

const optionsMenu = ref(false)
const documentsForm = ref(null)

const layoutStore = useLayoutStore()
const leadStore = useLeadStore()
const { leadEdit } = storeToRefs(leadStore)
const { dialogOpengHeader } = storeToRefs(layoutStore)
const { getLeadOptions, getClientLead } = useLeads()

const setLead = (id) => {
  console.log('setLead', id)
  leadStore.setLeadEdit(getClientLead(id))
  optionsMenu.value = false
}

const onClose = () => {
  console.log('onClose')
  // restore the full safe default shape so child components (tables/layouts)
  // that expect arrays/objects don't receive undefined
  const safeDefault = {
    id: null,
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
  leadStore.setLeadEdit(safeDefault)
}
defineComponent({
  name: 'EditLeadLayout',
})
const leadSelected = computed(() => {
  return getLeadOptions()
})

// Save / Remove actions for leads with validations
const $q = useQuasar()
const confirmRemove = ref(false)

// Rules from clients editor
const { nameRule, emailRule, cpfRule } = useRules()

const isFieldValid = (rules, value) => {
  if (!rules || !Array.isArray(rules)) return true
  for (const r of rules) {
    try {
      const res = r(value)
      if (res !== true) return false
    } catch {
      return false
    }
  }
  return true
}

const canSave = computed(() => {
  const payload = leadEdit.value || {}
  const cliente = payload.cliente || {}
  const name = cliente.name
  const email = cliente.email
  const cpf = cliente.cpf
  const birth = cliente.birth
  if (!name || !email || !cpf || !birth) return false
  if (!isFieldValid(nameRule, name)) return false
  if (!isFieldValid(emailRule, email)) return false
  if (!isFieldValid(cpfRule, cpf)) return false
  return true
})

const saveLead = async () => {
  // mark all fields as touched so child components reveal errors when user tries to save
  try {
    if (documentsForm.value && documentsForm.value.markAllTouched)
      documentsForm.value.markAllTouched()
  } catch (err) {
    console.debug('markAllTouched failed', err)
  }

  const payload = leadEdit.value || {}
  const cliente = payload.cliente || {}
  // basic client-side validation
  if (!cliente.name || String(cliente.name).trim() === '') {
    $q.notify({ message: 'O campo Nome é obrigatório.', color: 'negative' })
    return
  }
  if (!isFieldValid(nameRule, cliente.name)) {
    $q.notify({ message: 'Informe nome completo (nome e sobrenome).', color: 'negative' })
    return
  }
  const isValidEmail = (e) => typeof e === 'string' && /^\S+@\S+\.\S+$/.test(e)
  if (!cliente.email || !isValidEmail(cliente.email)) {
    $q.notify({ message: 'Informe um e-mail válido.', color: 'negative' })
    return
  }
  if (!cliente.cpf || !isFieldValid(cpfRule, cliente.cpf)) {
    $q.notify({ message: 'Informe um CPF válido.', color: 'negative' })
    return
  }
  if (!cliente.birth) {
    $q.notify({ message: 'Informe a data de nascimento.', color: 'negative' })
    return
  }

  // normalize payload: backend expects { lead: { name, email, ... } } or top-level with name
  const leadBody = payload.lead
    ? payload.lead
    : {
        ...(payload.cliente || {}),
        cpf: payload.cpf || (payload.cliente && payload.cliente.cpf) || undefined,
        cnh: payload.cnh || (payload.cliente && payload.cliente.cnh) || undefined,
        phone: payload.phone || (payload.cliente && payload.cliente.phone) || undefined,
        profission: payload.profission || payload.profissao || undefined,
        situacao_rf: payload.situacao_rf || undefined,
        estagio_lead: payload.estagio_lead || undefined,
        address: payload.address || undefined,
        partner: payload.partner || undefined,
        related_person: payload.related_person || undefined,
        bankRegister: payload.bankRegister || undefined,
        emprestimo: payload.emprestimo || undefined,
        dividendo: payload.dividendo || undefined,
        contrato: payload.contrato || undefined,
        saldo: payload.saldo || undefined,
        avatar: (payload.cliente && payload.cliente.avatar) || payload.avatar || undefined,
      }
  const toSend = payload.lead
    ? JSON.parse(JSON.stringify(payload))
    : { lead: JSON.parse(JSON.stringify(leadBody)) }
  try {
    if (payload.id) {
      const res = await fetch(
        `${(import.meta.env && import.meta.env.VITE_API_BASE_URL) || 'http://localhost:3333'}/api/leads/${payload.id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(toSend),
        },
      )
      if (!res.ok) throw new Error('Erro ao atualizar lead')
      $q.notify({ message: 'Lead atualizado com sucesso', color: 'positive' })
      // notify other components to refresh lists
      try {
        window.dispatchEvent(new Event('leads:updated'))
      } catch (err) {
        console.debug('leads:updated dispatch error', err)
      }
    } else {
      const res = await fetch(
        `${(import.meta.env && import.meta.env.VITE_API_BASE_URL) || 'http://localhost:3333'}/api/leads`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(toSend),
        },
      )
      if (!res.ok) throw new Error('Erro ao criar lead')
      $q.notify({ message: 'Lead criado com sucesso', color: 'positive' })
      try {
        window.dispatchEvent(new Event('leads:updated'))
      } catch (err) {
        console.debug('leads:updated dispatch error', err)
      }
    }
    layoutStore.setLeadDialog(false)
  } catch (err) {
    console.error('saveLead error', err)
    $q.notify({
      message: err && err.message ? err.message : 'Erro ao salvar lead',
      color: 'negative',
    })
  }
}

const removeLead = async () => {
  const payload = leadEdit.value || {}
  if (!payload.id) return
  try {
    const res = await fetch(
      `${(import.meta.env && import.meta.env.VITE_API_BASE_URL) || 'http://localhost:3333'}/api/leads/${payload.id}`,
      {
        method: 'DELETE',
      },
    )
    if (!res.ok) throw new Error('Erro ao remover lead')
    $q.notify({ message: 'Lead removido', color: 'positive' })
    try {
      window.dispatchEvent(new Event('leads:updated'))
    } catch (err) {
      console.debug('leads:updated dispatch error', err)
    }
    layoutStore.setLeadDialog(false)
  } catch (err) {
    console.error('removeLead error', err)
    $q.notify({ message: 'Erro ao remover lead', color: 'negative' })
  }
}

const onConfirmRemove = async () => {
  confirmRemove.value = false
  await removeLead()
}
</script>
