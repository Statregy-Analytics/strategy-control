<template>
  <div class="profile-document" :class="`profile-document--${item.status}`">
    <q-icon :name="statusIcon" :color="statusColor" size="22px" />
    <div class="profile-document__identity">
      <strong>{{ item.documentTypeName || item.documentTypeCode || 'Documento' }}</strong>
      <small>{{ subtitle }}</small>
    </div>
    <q-btn
      v-if="documentId"
      flat
      round
      dense
      icon="visibility"
      size="sm"
      :aria-label="`Visualizar ${name}`"
      :loading="busy"
      @click="view"
      ><q-tooltip>Visualizar</q-tooltip></q-btn
    >
    <q-btn
      v-else-if="canUpload"
      flat
      dense
      no-caps
      icon="upload"
      label="Upload"
      size="sm"
      @click="uploadOpen = true"
    />
    <q-dialog v-model="uploadOpen" :persistent="busy">
      <q-card class="profile-document-dialog">
        <title-card
          :title="`Enviar ${name}`"
          :disable-close="busy"
          @on-close="uploadOpen = false"
        />
        <q-card-section>
          <q-form @submit.prevent="upload">
            <label-form text-label="Arquivo"
              ><q-file
                v-model="file"
                outlined
                dense
                accept=".pdf,.jpg,.jpeg,.png"
                :max-file-size="26214400"
                :rules="fileRules"
                @rejected="rejectFile"
            /></label-form>
            <div class="row justify-end q-mt-md">
              <q-btn flat no-caps label="Enviar" color="primary" type="submit" :loading="busy" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>
<script setup>
import { computed, ref } from 'vue'
import TitleCard from 'src/components/Card/TitleCard.vue'
import LabelForm from 'src/components/Form/LabelForm.vue'
import useNotification from 'src/composables/global/useNotification'
import { getDocumentTemporaryUrl, uploadCustomerDocument } from 'src/services/documentAdminService'
import { getApiErrorMessage } from 'src/services/apiError'
const props = defineProps({
  item: { type: Object, required: true },
  customerId: { type: String, required: true },
})
const emit = defineEmits(['updated'])
const { errorNotify, successNotify } = useNotification()
const busy = ref(false),
  uploadOpen = ref(false),
  file = ref(null)
const name = computed(() => props.item.documentTypeName || 'documento')
const documentId = computed(() => props.item.documentId || props.item.document?.id)
const canUpload = computed(() =>
  props.item.allowedActions?.some((action) => action.toLowerCase() === 'upload'),
)
const statusIcon = computed(
  () =>
    ({ Approved: 'check_circle_outline', Rejected: 'highlight_off' })[props.item.status] ||
    'description',
)
const statusColor = computed(
  () => ({ Approved: 'positive', Rejected: 'negative' })[props.item.status] || 'warning',
)
const subtitle = computed(() => {
  const labels = {
    Approved: 'Aprovado',
    Rejected: 'Rejeitado',
    UnderReview: 'Em análise',
    InReview: 'Em análise',
    Pending: 'Pendente',
    Missing: 'Aguardando envio',
    Waived: 'Dispensado',
  }
  const date = props.item.submittedAtUtc
  return [
    labels[props.item.status] || props.item.status,
    date ? `Enviado em ${new Date(date).toLocaleDateString('pt-BR')}` : null,
  ]
    .filter(Boolean)
    .join(' · ')
})
const fileRules = [
  (v) => !!v || 'Selecione um arquivo',
  (v) =>
    !v || ['application/pdf', 'image/jpeg', 'image/png'].includes(v.type) || 'Use PDF, JPEG ou PNG',
]
const rejectFile = () => errorNotify('Use PDF, JPEG ou PNG com até 25 MB.')
async function view() {
  busy.value = true
  try {
    const result = await getDocumentTemporaryUrl(documentId.value)
    const url = result.url || result.temporaryUrl
    if (!url || !/^https?:\/\//i.test(url)) throw new Error('URL indisponível')
    window.open(url, '_blank', 'noopener,noreferrer')
  } catch (error) {
    errorNotify(getApiErrorMessage(error, 'Não foi possível abrir o documento.'))
  } finally {
    busy.value = false
  }
}
async function upload() {
  if (!file.value || busy.value) return
  busy.value = true
  try {
    const data = new FormData()
    data.append('file', file.value)
    data.append('documentTypeId', props.item.documentTypeId)
    if (props.item.requirementId) data.append('requirementId', props.item.requirementId)
    await uploadCustomerDocument(props.customerId, data)
    successNotify('Documento enviado.')
    uploadOpen.value = false
    file.value = null
    emit('updated')
  } catch (error) {
    errorNotify(getApiErrorMessage(error, 'Não foi possível enviar o documento.'))
  } finally {
    busy.value = false
  }
}
</script>
<style scoped>
.profile-document {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  margin-top: 8px;
  border: 1px solid var(--sa-border);
  border-radius: 8px;
  background: var(--sa-surface-soft);
}
.profile-document__identity {
  flex: 1;
  min-width: 0;
}
strong,
small {
  display: block;
  overflow-wrap: anywhere;
}
strong {
  font-size: 12px;
  font-weight: 500;
}
small {
  margin-top: 4px;
  font-size: 10px;
  color: var(--sa-muted);
}
.profile-document--Approved {
  border-color: rgba(74, 222, 128, 0.3);
}
.profile-document--Rejected {
  border-color: rgba(255, 158, 167, 0.4);
}
.profile-document-dialog {
  width: min(500px, calc(100vw - 32px));
  color: var(--sa-text);
  background: var(--sa-surface);
  border: 1px solid var(--sa-border);
  border-radius: 12px;
}
.profile-document-dialog :deep(.q-field__native),
.profile-document-dialog :deep(.q-field__input),
.profile-document-dialog :deep(.q-field__marginal) {
  color: #fff;
}
.profile-document-dialog :deep(.q-field--outlined .q-field__control::before) {
  border-color: rgba(255, 255, 255, 0.28);
}
</style>
