<template>
  <q-card class="EditClientsLayout">
    <title-card
      :title="titleHeader"
      :advisor="advisorEdit.assessor ? advisorEdit.assessor.name : ''"
    />

    <q-separator></q-separator>

    <q-banner inline-actions rounded class="q-ma-md border-pattern">
      <div class="row">
        <div class="col-1">
          <q-avatar size="32px">
            <q-img
              :src="clientEdit.cliente.avatar"
              :alt="clientEdit.cliente.name"
              :title="clientEdit.cliente.name"
            />
          </q-avatar>
        </div>
        <div class="col-3">
          <span class="text-muted" style="font-size: 12px">ID #{{ clientEdit.id }}</span>
          <div class="">
            {{ clientEdit.cliente.name }}
          </div>
        </div>
        <div class="col">
          <q-btn
            size="sm"
            outline
            no-caps
            class="custom-btn-muted"
            :label="'Classificação: ' + clientEdit.level"
          />
          <q-btn
            flat
            round
            dense
            color="grey-6"
            icon="keyboard_arrow_down"
            @click.prevent="showLevelOptions = !showLevelOptions"
          />
          <q-menu v-model="showLevelOptions" self="top middle" square>
            <q-list style="min-width: 420px; padding-top: 2px">
              <q-item
                dense
                v-for="userClient in clientesSelected"
                :key="userClient"
                clickable
                @click="selectClient(userClient.id)"
                style="border-radius: 6px; margin-inline: 2px"
              >
                <q-item-section avatar>
                  <q-avatar size="32px">
                    <q-img
                      :src="userClient.avatar"
                      :alt="userClient.name"
                      :title="userClient.name"
                    />
                  </q-avatar>
                </q-item-section>
                <q-item-section align="left">
                  {{ userClient.name }}
                </q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </div>
      </div>
      <template v-slot:action>
        <q-btn
          outline
          color="primary"
          label="Comparar"
          no-caps
          size="sm"
          class="outline"
          :icon="$filtersString.resolveUrl('img:icons/replace.svg')"
          @click.prevent="showCompareOptions = !showCompareOptions"
        />

        <q-menu v-model="showCompareOptions" self="top middle" square>
          <q-list style="min-width: 420px; padding-top: 2px">
            <q-item
              dense
              v-for="userClient in clientesSelected"
              :key="userClient"
              clickable
              style="border-radius: 6px; margin-inline: 2px"
              @click="selectCompare(userClient.id)"
            >
              <q-item-section avatar>
                <q-avatar size="32px">
                  <q-img :src="userClient.avatar" :alt="userClient.name" :title="userClient.name" />
                </q-avatar>
              </q-item-section>
              <q-item-section align="left">
                {{ userClient.name }}
              </q-item-section>
            </q-item>
          </q-list>
        </q-menu>
        <q-btn flat size="xs" :icon="$filtersString.resolveUrl('img:icons/edit.svg')" />
        <q-btn flat size="xs" :icon="$filtersString.resolveUrl('img:icons/trash.svg')" />
      </template>
    </q-banner>
    <q-card-section>
      <div class="text-h7 text-bold">Informações e Documentos Pessoais</div>
      <personal-data-layout class="q-my-lg" />
      <div class="text-h7 text-bold">Dados Bancários</div>
      <bank-details-layout class="q-my-lg" />
      <div class="text-h7 text-bold">Documentos Residencias</div>
      <data-residential-layout class="q-my-lg" />
      <upload-residential-layout class="q-my-lg" />
      <div class="text-h7 text-bold q-mt-lg">Documentos Contábeis de Pessoa Física</div>
      <upload-documents-layout class="q-my-lg" />
      <div class="text-h7 text-bold q-mt-lg">Documentos Contábeis de Pessoa Jurídica</div>
      <upload-persona-layout class="q-my-lg" />
      <div class="text-h7 text-bold q-mt-lg">Investimento</div>
      <investment-form-layout class="q-my-lg" />
      <div class="text-h7 text-bold q-mt-lg">Contratos</div>
      <contract-client-table class="q-my-lg" />
      <div class="text-h7 text-bold q-mt-lg">Empréstimo</div>
      <we-lend-form-layout class="q-my-lg" />
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
          data-test="clients-remove-btn"
          @click.prevent="confirmRemove = true"
          :disable="!clientEdit.id"
        />
        <div class="row items-center">
          <q-tooltip v-if="!canSave"
            >Preencha todos os campos obrigatórios corretamente (Nome, CPF, E-mail, Data de
            Nascimento)</q-tooltip
          >
          <q-btn
            :disable="!canSave"
            size="sm"
            unelevated
            color="primary"
            label="Salvar"
            icon="save"
            data-test="clients-save-btn"
            @click.prevent="saveClient"
          />
        </div>
      </div>
    </q-card-actions>
    <!-- confirmation dialog for delete -->
    <q-dialog v-model="confirmRemove" persistent>
      <q-card>
        <q-card-section>
          <div class="text-h6">Confirmar remoção</div>
          <div class="text-subtitle2 q-mt-sm">
            Tem certeza que deseja remover este cliente? Esta ação não pode ser desfeita.
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
import { defineComponent, ref, computed } from 'vue'
import { useQuasar } from 'quasar'
import { useLayoutStore } from 'src/stores/layout'
import { useClientStore } from 'src/stores/client'
import { useAdvisorStore } from 'src/stores/advisor'
import { storeToRefs } from 'pinia'
import TitleCard from 'src/components/Card/TitleCard.vue'
import PersonalDataLayout from 'src/layouts/Clients/PersonalDataLayout.vue'
import BankDetailsLayout from 'src/layouts/Clients/BankDetailsLayout.vue'
import DataResidentialLayout from 'src/layouts/Clients/DataResidentialLayout.vue'
import UploadResidentialLayout from 'src/layouts/Clients/Form/UploadResidentialLayout.vue'
import UploadDocumentsLayout from 'src/layouts/Clients/Form/UploadDocumentsLayout.vue'
import UploadPersonaLayout from 'src/layouts/Clients/Form/UploadPersonaLayout.vue'
import InvestmentFormLayout from 'src/layouts/Clients/Form/InvestmentFormLayout.vue'
import WeLendFormLayout from 'src/layouts/Clients/Form/WeLendFormLayout.vue'
import ContractClientTable from 'src/components/Table/Clients/ContractClientTable.vue'
import useCliente from 'src/composables/Fakes/useCliente'
import useAdvisors from 'src/composables/Fakes/useAdvisors'
import useRules from 'src/composables/global/useRules'
defineComponent({
  name: 'EditClientsLayout',
})

const layoutStore = useLayoutStore()
const clientStore = useClientStore()
const advisorStore = useAdvisorStore()
const { clientEdit } = storeToRefs(layoutStore)
const { advisorEdit } = storeToRefs(advisorStore)
const showLevelOptions = ref(false)
const showCompareOptions = ref(false)
const clienteApi = useCliente()
const { rowsClient, getClientIdName, getClient, createClient, updateClient, deleteClient } =
  clienteApi
const { rowsAssessores } = useAdvisors()
const confirmRemove = ref(false)
const selectClient = (id) => {
  layoutStore.setClientEdit(getClient(id))
  showLevelOptions.value = false
}
const selectCompare = (id) => {
  const selectedClient = getClient(id)
  const currentClient = clientEdit.value
  clientStore.setCompare([currentClient, selectedClient])
  layoutStore.setDialogCompare(true)
  showCompareOptions.value = false
}
const clientesSelected = computed(() => {
  return getClientIdName()
})

const titleHeader = computed(() => {
  try {
    const payload = clientEdit.value || {}
    // if clientEdit has a truthy numeric id -> editing, otherwise inclusion
    if (payload && payload.id) return 'Edição de Cliente'
  } catch {
    /* ignore */
  }
  return 'Inclusão de Cliente'
})

// validation helpers for enabling/disabling save button
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
  const payload = clientEdit.value || {}
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

// Save / Delete actions
const $q = useQuasar()

const saveClient = async () => {
  const payload = clientEdit.value || {}
  // basic client-side validation to avoid sending invalid payloads to the backend
  const cliente = payload.cliente || {}
  // simple email validation
  const isValidEmail = (e) => typeof e === 'string' && /^\S+@\S+\.\S+$/.test(e)
  if (!cliente.name || String(cliente.name).trim() === '') {
    $q.notify({ message: 'O campo Nome é obrigatório.', color: 'negative' })
    return
  }
  // validação: nome completo (nome e sobrenome)
  if (!isFieldValid(nameRule, cliente.name)) {
    $q.notify({ message: 'Informe nome completo (nome e sobrenome).', color: 'negative' })
    return
  }
  if (!cliente.email || !isValidEmail(cliente.email)) {
    $q.notify({ message: 'Informe um e-mail válido.', color: 'negative' })
    return
  }
  // frontend uniqueness checks to avoid duplicate name/email
  try {
    const nameNormalized = String(cliente.name || '')
      .trim()
      .toLowerCase()
    const emailNormalized = String(cliente.email || '')
      .trim()
      .toLowerCase()
    const dupByName = (rowsClient || []).find(
      (r) =>
        r &&
        r.cliente &&
        String(r.cliente.name || '')
          .trim()
          .toLowerCase() === nameNormalized &&
        r.id !== payload.id,
    )
    if (dupByName) {
      $q.notify({ message: 'Já existe um cliente com este nome.', color: 'negative' })
      return
    }
    const dupByEmail = (rowsClient || []).find(
      (r) =>
        r &&
        r.cliente &&
        String(r.cliente.email || '')
          .trim()
          .toLowerCase() === emailNormalized &&
        r.id !== payload.id,
    )
    if (dupByEmail) {
      $q.notify({ message: 'Já existe um cliente com este e-mail.', color: 'negative' })
      return
    }
  } catch (e) {
    // não bloquear salvamento caso a verificação de duplicidade falhe por algum motivo
    console.debug('dup check failed', e && e.message)
  }
  try {
    // prepare payload copy to avoid mutating reactive clientEdit directly
    const toSend = JSON.parse(JSON.stringify(payload))
    // normalize assessor into { label, value } when possible
    try {
      const inv = toSend.investment || {}
      const a = inv.assessor
      if (a !== undefined && a !== null) {
        // object with value
        if (typeof a === 'object' && a.value !== undefined) {
          inv.assessor = { label: String(a.label || ''), value: String(a.value) }
        } else if (typeof a === 'number' || (typeof a === 'string' && String(a).match(/^\d+$/))) {
          const id = String(a)
          const found = (rowsAssessores || []).find((r) => String(r.id) === id)
          if (found)
            inv.assessor = {
              label: (found.assessor && found.assessor.name) || found.name || id,
              value: id,
            }
          else inv.assessor = String(a)
        } else if (typeof a === 'string') {
          const name = a.trim()
          const foundByName = (rowsAssessores || []).find((r) => {
            const n = (r.assessor && r.assessor.name) || r.name || ''
            return n && n.toLowerCase() === name.toLowerCase()
          })
          if (foundByName)
            inv.assessor = {
              label: (foundByName.assessor && foundByName.assessor.name) || foundByName.name,
              value: String(foundByName.id),
            }
          else inv.assessor = name
        }
      }
    } catch (e) {
      console.debug('assessor normalization failed', e && e.message)
    }

    console.log('saveClient payload', JSON.stringify(toSend))
    if (payload.id) {
      const res = await updateClient(payload.id, toSend)
      console.log('updateClient result', res)
      $q.notify({ message: 'Cliente atualizado com sucesso', color: 'positive' })
    } else {
      const created = await createClient(toSend)
      console.log('createClient result', created)
      $q.notify({ message: 'Cliente criado com sucesso', color: 'positive' })
    }
    layoutStore.setClientDialog(false)
  } catch (err) {
    console.error('saveClient error', err)
    $q.notify({
      message: err && err.message ? err.message : 'Erro ao salvar cliente',
      color: 'negative',
    })
  }
}

const removeClient = async () => {
  const payload = clientEdit.value || {}
  if (!payload.id) return
  try {
    await deleteClient(payload.id)
    $q.notify({ message: 'Cliente removido', color: 'positive' })
    layoutStore.setClientDialog(false)
  } catch (err) {
    console.error('removeClient error', err)
    $q.notify({ message: 'Erro ao remover cliente', color: 'negative' })
  }
}

const onConfirmRemove = async () => {
  confirmRemove.value = false
  await removeClient()
}
</script>
