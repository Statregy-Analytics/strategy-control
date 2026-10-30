<template>
  <div
    class="profile-document-entry"
    :class="
      variant
        ? `profile-document-entry--${variant}`
        : ['profile-document-entry--personal', { 'profile-document-entry--missing': !documentId }]
    "
    :aria-busy="reviewState.saving"
    :data-document-id="documentId"
  >
    <div class="profile-document" :class="`profile-document--${item.status}`">
      <span
        v-if="variant === 'asset-editor'"
        class="asset-document-status"
        :class="`asset-document-status--${item.status}`"
        ><img v-if="item.status === 'Approved'" src="/icons/asset-editor/check.svg" alt="" /><img
          v-else-if="['Uploaded', 'Pending', 'UnderReview', 'InReview'].includes(item.status)"
          src="/icons/asset-editor/pending-status.svg"
          alt=""
        />{{ assetStatus }}</span
      >
      <span class="profile-document__icon">
        <img v-if="variant === 'asset-editor'" src="/icons/asset-editor/file.svg" alt="" />
        <img
          v-else-if="
            variant === 'asset-expanded' &&
            ['Approved', 'Pending', 'Rejected', 'UnderReview', 'InReview'].includes(item.status)
          "
          :src="`/icons/asset-editor/asset-${item.status === 'Approved' ? 'approved' : item.status === 'Rejected' ? 'rejected' : 'pending'}.svg`"
          alt=""
        />
        <img
          v-else-if="!variant && !documentId"
          src="/icons/client-selection/document-pending.svg"
          alt=""
          width="16"
          height="16"
        />
        <img
          v-else-if="(!variant && documentId) || item.status === 'Approved'"
          src="/icons/client-selection/document-approved.svg"
          alt=""
          width="16"
          height="16"
        />
        <q-icon v-else :name="statusIcon" :color="statusColor" size="16px" />
      </span>
      <div class="profile-document__identity">
        <strong :title="item.documentTypeName || item.documentTypeCode">{{
          item.documentTypeName || item.documentTypeCode || 'Documento'
        }}</strong>
        <small>{{ caption || subtitle }}</small>
      </div>
      <q-btn
        v-if="documentId"
        flat
        :round="!variant"
        no-caps
        dense
        size="sm"
        :aria-label="`Visualizar ${name}`"
        :loading="busy"
        :disable="reviewState.saving"
        @click="view"
        ><img
          :src="variant ? '/icons/asset-editor/view.svg' : '/icons/document-review/view.svg'"
          alt=""
        /><q-tooltip>Visualizar</q-tooltip
        ><span v-if="variant">{{ variant === 'asset-editor' ? 'Ver' : 'Visualizar' }}</span></q-btn
      >
      <q-btn
        v-if="documentAction(item, 'Download')"
        flat
        round
        dense
        size="sm"
        :aria-label="`Baixar ${name}`"
        :loading="downloading"
        :disable="reviewState.saving"
        @click="download"
        ><img src="/icons/document-review/download.svg" alt="" /><q-tooltip
          >Baixar</q-tooltip
        ></q-btn
      >
      <q-btn
        v-if="canUpload"
        class="profile-document-upload"
        flat
        dense
        no-caps
        icon="upload"
        label="Upload"
        size="sm"
        @click="uploadOpen = true"
      />
    </div>

    <q-badge
      v-if="documentId && !variant"
      outline
      :color="statusColor"
      class="profile-document-status"
      >{{
        item.status === 'Approved'
          ? 'Aprovado'
          : item.status === 'Rejected'
            ? 'Rejeitado'
            : 'Pendente'
      }}</q-badge
    >

    <p
      v-if="item.status === 'Rejected' && item.latestReview?.notes"
      class="document-rejection-notes"
    >
      {{ item.latestReview.notes }}
    </p>
    <p v-if="reviewState.error && !rejectOpen" role="alert" class="document-review-error">
      {{ reviewState.error }}
    </p>
    <div v-if="reviewable" class="document-review-actions">
      <q-btn
        outline
        no-caps
        dense
        label="Reprovar"
        class="document-reject-button"
        :disable="busy || reviewState.saving"
        @click="openRejection"
      />
      <q-btn
        outline
        no-caps
        dense
        label="Aprovar"
        class="document-approve-button"
        :disable="busy || reviewState.saving"
        :loading="reviewState.saving && !rejectOpen"
        @click="reviewer.submit('Approved')"
      />
    </div>
    <q-dialog v-model="rejectOpen" :persistent="reviewState.saving">
      <q-card class="document-reject-dialog">
        <h2>Reprovar documento</h2>
        <p>O cliente vê o motivo e a mensagem e pode enviar o documento de novo.</p>
        <p v-if="reviewState.error" role="alert" class="document-review-error">
          {{ reviewState.error }}
        </p>
        <label-form text-label="Motivo"
          ><q-select
            v-model="rejection.reason"
            :options="rejectionReasons"
            outlined
            dense
            aria-label="Motivo"
            :disable="reviewState.saving"
            :error="Boolean(reviewState.reasonError)"
            :error-message="reviewState.reasonError"
            hide-bottom-space
            dropdown-icon="img:/icons/document-review/chevron.svg"
        /></label-form>
        <label-form text-label="Mensagem para o cliente"
          ><q-input
            v-model="rejection.message"
            type="textarea"
            rows="3"
            outlined
            aria-label="Mensagem para o cliente"
            :disable="reviewState.saving"
            placeholder="Ex.: a foto ficou cortada. Envie de novo mostrando o documento inteiro."
        /></label-form>
        <div class="document-review-actions">
          <q-btn
            outline
            dense
            no-caps
            label="Cancelar"
            :disable="reviewState.saving"
            @click="rejectOpen = false"
          /><q-btn
            outline
            dense
            no-caps
            label="Reprovar documento"
            class="document-reject-button"
            :loading="reviewState.saving"
            :disable="reviewState.saving"
            @click="reviewer.submit('Rejected', rejection.reason, rejection.message)"
          />
        </div>
      </q-card>
    </q-dialog>
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
import { computed, ref, reactive, watch, onScopeDispose } from 'vue'
import TitleCard from 'src/components/Card/TitleCard.vue'
import LabelForm from 'src/components/Form/LabelForm.vue'
import useNotification from 'src/composables/global/useNotification'
import {
  getDocumentTemporaryUrl,
  uploadCustomerDocument,
  downloadDocument,
  reviewDocument,
} from 'src/services/documentAdminService'
import {
  documentAction,
  canReviewDocument,
  createDocumentReviewer,
  rejectionReasons,
} from 'src/services/documentReview'
import { getApiErrorMessage } from 'src/services/apiError'
const props = defineProps({
  variant: { type: String, default: '' },
  caption: { type: String, default: '' },
  item: { type: Object, required: true },
  customerId: { type: String, required: true },
})
const emit = defineEmits(['updated'])
const { errorNotify, successNotify } = useNotification()
const busy = ref(false),
  uploadOpen = ref(false),
  file = ref(null)
const downloading = ref(false),
  rejectOpen = ref(false)
const rejection = reactive({ reason: null, message: '' })
const reviewState = reactive({})
let revision = 0
const reviewer = createDocumentReviewer(reviewState, {
  item: () => props.item,
  write: reviewDocument,
  errorMessage: (error) => getApiErrorMessage(error, 'Não foi possível revisar o documento.'),
  updated: (status) => {
    rejectOpen.value = false
    successNotify(status === 'Approved' ? 'Documento aprovado.' : 'Documento reprovado.')
    emit('updated')
  },
})
const assetStatus = computed(
  () =>
    ({
      Approved: 'Validado',
      Uploaded: 'Pendente',
      Pending: 'Pendente',
      Rejected: 'Rejeitado',
      UnderReview: 'Pendente',
      InReview: 'Pendente',
    })[props.item.status] ||
    props.item.status ||
    'Enviado',
)
const pending = computed(() => ['Pending', 'UnderReview', 'InReview'].includes(props.item.status))
const reviewable = computed(() => canReviewDocument(props.item) && !reviewState.completed)
const openRejection = () => {
  Object.assign(rejection, { reason: null, message: '' })
  reviewState.error = ''
  reviewState.reasonError = ''
  rejectOpen.value = true
}
function resetDocumentContext() {
  revision++
  reviewer.reset()
  busy.value = false
  downloading.value = false
  rejectOpen.value = false
  uploadOpen.value = false
  file.value = null
}
watch(
  () => [props.customerId, props.item.documentId || props.item.document?.id, props.item.status],
  resetDocumentContext,
  { flush: 'sync' },
)
onScopeDispose(resetDocumentContext)
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
    Uploaded: 'Enviado',
    Approved: 'Aprovado',
    Rejected: 'Rejeitado',
    UnderReview: 'Em análise',
    InReview: 'Em análise',
    Pending: 'Pendente',
    Missing: 'Aguardando envio',
    Waived: 'Dispensado',
  }
  const date = props.item.submittedAtUtc
  if (!props.variant) {
    if (!documentId.value) return props.item.status === 'Waived' ? 'Dispensado' : 'Aguardando envio'
    return date ? `Enviado em ${new Date(date).toLocaleDateString('pt-BR')}` : 'Enviado'
  }
  return [
    pending.value ? null : labels[props.item.status] || props.item.status,
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
  const operation = revision
  busy.value = true
  try {
    const result = await getDocumentTemporaryUrl(documentId.value)
    if (operation !== revision) return
    const url = result.url || result.temporaryUrl
    if (!url || !/^https?:\/\//i.test(url)) throw new Error('URL indisponível')
    window.open(url, '_blank', 'noopener,noreferrer')
  } catch (error) {
    if (operation !== revision) return
    errorNotify(getApiErrorMessage(error, 'Não foi possível abrir o documento.'))
  } finally {
    if (operation === revision) busy.value = false
  }
}
async function download() {
  if (downloading.value) return
  const operation = revision
  downloading.value = true
  try {
    const response = await downloadDocument(documentId.value)
    if (operation !== revision) return
    const url = URL.createObjectURL(response.data),
      link = document.createElement('a')
    link.href = url
    link.download = props.item.document?.file?.fileName || 'documento'
    link.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  } catch (error) {
    if (operation === revision)
      errorNotify(getApiErrorMessage(error, 'Não foi possível baixar o documento.'))
  } finally {
    if (operation === revision) downloading.value = false
  }
}
async function upload() {
  if (!file.value || busy.value || !canUpload.value) return
  const operation = revision
  busy.value = true
  try {
    const data = new FormData()
    data.append('file', file.value)
    data.append('documentTypeId', props.item.documentTypeId)
    if (props.item.requirementId) data.append('requirementId', props.item.requirementId)
    const countryId = props.item.countryId || props.item.document?.countryId
    if (countryId) data.append('countryId', countryId)
    await uploadCustomerDocument(props.customerId, data)
    if (operation !== revision) return
    successNotify('Documento enviado.')
    uploadOpen.value = false
    file.value = null
    emit('updated')
  } catch (error) {
    if (operation === revision)
      errorNotify(getApiErrorMessage(error, 'Não foi possível enviar o documento.'))
  } finally {
    if (operation === revision) busy.value = false
  }
}
</script>
<style scoped>
.profile-document-entry {
  min-width: 0;
}
.profile-document img {
  width: 16px;
  height: 16px;
  flex: none;
}
.profile-document__pending-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: none;
  width: 32px;
  height: 32px;
  border: 1px solid rgba(254, 230, 133, 0.5);
  border-radius: 4px;
  background: rgba(254, 230, 133, 0.14);
}
.document-awaiting {
  display: inline-block;
  margin-top: 12px;
  padding: 3px 8px;
  color: #fee685;
  border: 1px solid rgba(254, 230, 133, 0.55);
  border-radius: 6px;
  background: rgba(254, 230, 133, 0.14);
  font-size: 12px;
}
.document-review-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  flex-wrap: wrap;
  margin-top: 12px;
}
.document-review-actions .q-btn {
  min-height: 32px;
  padding: 0 16px;
  border-radius: 8px;
  font-size: 12px;
  background: rgba(255, 255, 255, 0.06);
}
.document-review-actions .document-reject-button {
  color: #ff9e9e;
  background: rgba(231, 0, 11, 0.14);
}
.document-reject-button:before {
  border-color: rgba(231, 0, 11, 0.55);
}
.document-approve-button:before {
  border-color: rgba(0, 166, 62, 0.5);
}
.document-review-actions .document-approve-button {
  color: #99f2b2;
  background: rgba(0, 166, 62, 0.14);
}
.document-review-error {
  color: #ff9e9e;
  font-size: 12px;
}
.document-rejection-notes {
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  font-size: 12px;
  color: var(--sa-muted);
}
.document-reject-dialog {
  width: 440px;
  max-width: calc(100vw - 32px);
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  color: var(--sa-text);
  background: var(--sa-bg);
  border: 1px solid var(--sa-border);
  border-radius: 12px;
  box-shadow: 4px 4px 12px rgba(0, 0, 0, 0.13);
}
.document-reject-dialog h2 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  line-height: normal;
}
.document-reject-dialog p {
  margin: 0;
  font-size: 14px;
  line-height: 20px;
  color: var(--sa-muted);
}
.document-reject-dialog :deep(.LabelForm > span) {
  font-size: 12px !important;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  font-weight: 500;
  color: var(--sa-muted);
}
.document-reject-dialog :deep(.q-field__native),
.document-reject-dialog :deep(.q-field__input) {
  color: var(--sa-text);
  font-size: 14px;
}
.document-reject-dialog :deep(.q-field__control) {
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.04);
}
.document-reject-dialog :deep(.q-field__control:before) {
  border-color: rgba(255, 255, 255, 0.2);
}
.document-reject-dialog :deep(.q-select__dropdown-icon) {
  width: 16px;
  height: 16px;
  font-size: 16px;
}
.document-reject-dialog :deep(.q-textarea .q-field__control) {
  min-height: 88px;
  height: 88px;
}
.document-reject-dialog :deep(textarea) {
  min-height: 64px;
  padding-top: 10px;
  resize: none;
}
.document-reject-dialog .document-review-actions {
  margin-top: 0;
}
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
  font-size: 14px;
  font-weight: 500;
  line-height: 20px;
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
.profile-document__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: none;
  width: 36px;
  height: 36px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.08),
    rgba(255, 255, 255, 0.03),
    rgba(255, 255, 255, 0.07)
  );
  backdrop-filter: blur(20px);
}
.asset-document-status {
  position: absolute;
  top: 0;
  right: 0;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 6px;
  padding: 1px 6px;
  font-size: 10px;
  text-transform: uppercase;
}
.asset-document-status--Approved {
  background: #007a5533;
  color: #74ffa0;
  border-color: #74ffa0;
}
.asset-document-status--Uploaded,
.asset-document-status--Pending,
.asset-document-status--UnderReview,
.asset-document-status--InReview {
  color: #fee685;
  border-color: #fee685;
  background: #bb4d0033;
}
.asset-document-status--Rejected {
  color: #ff9d9d;
}
.profile-document-entry--asset-editor .profile-document {
  position: relative;
  min-height: 160px;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  padding: 0;
  background: transparent;
  border: 0;
}
.profile-document-entry--asset-editor .profile-document__icon {
  align-self: flex-start;
}
.profile-document-entry--asset-editor .profile-document__identity {
  margin-bottom: 28px;
}
.profile-document-entry--asset-editor .profile-document > .q-btn {
  margin-top: auto;
  margin-right: 36px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 7px;
}
.profile-document-entry--asset-expanded .profile-document__icon {
  border-radius: 50%;
}
.profile-document-entry--asset-expanded .profile-document {
  min-height: 70px;
  border-radius: 10px;
}
.profile-document-entry--asset-expanded .profile-document > .q-btn {
  border: 1px solid rgba(255, 255, 255, 0.25);
  padding: 4px 8px;
  border-radius: 6px;
}
.profile-document-entry--asset-editor :deep(.q-btn__content),
.profile-document-entry--asset-expanded :deep(.q-btn__content) {
  gap: 6px;
}
.profile-document-entry--personal .profile-document {
  min-height: 61px;
  padding: 10px 12px;
  border: 0.8px solid #ffffff33;
  border-radius: 10px;
  background: linear-gradient(120deg, #ffffff14, #ffffff08, #ffffff12);
  color: #fff;
}
.profile-document-entry--personal .profile-document__icon {
  width: 32px;
  height: 32px;
}
.profile-document-entry--personal strong {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.profile-document-entry--personal small {
  color: #ffffff99;
}
.profile-document-entry--personal .profile-document-upload {
  flex: none;
  width: 90px;
  height: 28px;
  min-height: 28px;
  border-radius: 8px;
  border: 0.5px solid #bedbff38;
  background: #2b7fff0d;
  color: #bedbffd6;
  font-size: 12px;
}
.profile-document-entry--missing .profile-document {
  border: 0.5px solid #bedbff24;
  background: #2b7fff08;
}
.profile-document-entry--personal > .profile-document-status {
  margin-top: 6px;
}
.asset-document-status {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
.asset-document-status img {
  width: 12px;
  height: 12px;
}
</style>
