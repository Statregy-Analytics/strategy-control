<template>
  <q-card dark class="column no-wrap intake-editor">
    <title-card :title="submission ? 'Detalhe da submissão' : 'Novo formulário'" :disable-close="busy" @on-close="emit('close')" />
    <q-separator />
    <div ref="editorBody" class="col scroll">
      <entity-header v-if="submission" :id="submission.id" :name="submission.title || 'Formulário'" short-id>
        <template #status><q-badge class="q-ml-md">{{ statusLabels[submission.status] || submission.status }}</q-badge></template>
      </entity-header>
      <q-card-section class="intake-editor__content">
        <q-banner v-if="loadError" class="bg-red-1 text-negative" role="alert">{{ loadError }}<template #action><q-btn flat label="Tentar novamente" @click="load" /></template></q-banner>
        <q-linear-progress v-if="loading" indeterminate aria-label="Carregando submissão" />
        <template v-if="!loading && !loadError">
          <form-section title="Identificação" caption="Selecione o formulário publicado e o cliente responsável pela declaração.">
            <div class="row q-col-gutter-md">
              <label-form v-if="!submission" class-name="col-12 col-md-6" text-label="Formulário">
                <q-select dark options-dense hide-bottom-space v-model="selectedCode" outlined dense :options="catalog.map(item => ({ label: item.name, value: item.code }))" emit-value map-options :disable="busy || jobs.length > 0" aria-label="Formulário" @update:model-value="selectForm" />
              </label-form>
              <label-form v-if="!submission" class-name="col-12 col-md-6" text-label="Cliente">
                <q-select dark options-dense hide-bottom-space v-model="customer" outlined dense use-input input-debounce="300" :options="customers" :loading="customersLoading" :disable="busy || jobs.length > 0" aria-label="Cliente" @filter="findCustomers">
                  <template #no-option><q-item><q-item-section>{{ customerError || 'Nenhum cliente encontrado. Pesquise pelo nome.' }}</q-item-section></q-item></template>
                </q-select>
              </label-form>
              <label-form class-name="col-12" text-label="Título da submissão" data-intake-field="title">
                <q-input dark hide-bottom-space v-model="title" outlined dense :disable="!editable || busy" maxlength="200" aria-label="Título da submissão" :error="!!errors.title" :error-message="errors.title" />
              </label-form>
            </div>
          </form-section>
          <q-linear-progress v-if="formLoading" indeterminate aria-label="Carregando formulário" />
          <q-banner v-if="formError" class="bg-red-1 text-negative q-my-md" role="alert">{{ formError }}<template #action><q-btn flat label="Tentar novamente" @click="submission ? resolvePinnedForm() : selectForm(selectedCode)" /></template></q-banner>
          <template v-if="form && !formLoading">
            <div class="text-caption text-muted q-mb-lg">{{ form.name }} · versão {{ form.versionNumber }}<span v-if="form.metadata?.description"> — {{ form.metadata.description }}</span></div>
            <q-banner v-if="!editable && ['Draft', 'NeedsCorrection'].includes(submission?.status || 'Draft')" dark class="q-my-md">
              A versão publicada não permite edição com o seu perfil. Os dados permanecem disponíveis para consulta.
            </q-banner>
            <q-banner v-if="errors._form" class="bg-red-1 text-negative q-my-md" role="alert">{{ errors._form }}</q-banner>
            <dynamic-intake-form v-model="data" :form="form" :errors="errors" :disabled="!editable || busy || unsupported">
              <template #attachment="{ field }">
                <intake-attachment :field="field" :requirement="form.metadata?.requiredAttachments?.find(item => item.key === field.key)" :customer-id="customerId" :types="documentTypes" :jobs="jobs.filter(job => job.fieldKey === field.key)" :busy="busy" :disabled="!editable || unsupported" @add="addJob" @remove="removeJob" />
                <div v-if="errors[`attachments.${field.key}`]" class="text-negative text-caption" role="alert">{{ errors[`attachments.${field.key}`] }}</div>
              </template>
            </dynamic-intake-form>
            <q-banner v-if="typeError" class="bg-red-1 text-negative q-my-sm">{{ typeError }}<template #action><q-btn flat label="Recarregar tipos documentais" @click="loadTypes" /></template></q-banner>
          </template>
          <div v-else-if="!selectedCode && !submission && !formLoading" class="text-muted q-py-lg">Escolha um formulário para começar. Apenas versões publicadas aparecem no catálogo.</div>

          <form-section v-if="submission" title="Anexos vinculados">
            <q-list dark v-if="submission.attachments?.length" separator>
              <q-item v-for="attachment in submission.attachments" :key="attachment.id">
                <q-item-section avatar><q-icon name="description" /></q-item-section>
                <q-item-section><q-item-label class="intake-wrap">{{ attachment.fileName }}</q-item-label><q-item-label caption>{{ attachment.customerUploadedDocumentId ? 'Documento vinculado' : 'Anexo sem vínculo documental' }}</q-item-label></q-item-section>
                <q-item-section v-if="attachment.customerUploadedDocumentId" side><q-btn flat round dense icon="download" aria-label="Baixar documento" :disable="busy" @click="download(attachment)" /></q-item-section>
              </q-item>
            </q-list>
            <div v-else class="text-muted">Nenhum anexo vinculado.</div>
          </form-section>

          <q-banner v-if="actionError" class="bg-red-1 text-negative q-my-md" role="alert">{{ actionError }}</q-banner>
          <q-banner v-if="validationMessage" ref="validationSummary" class="bg-red-1 text-negative q-my-md" role="alert" tabindex="-1">{{ validationMessage }}</q-banner>
          <div v-if="message" role="status" class="q-my-md">{{ message }}</div>
          <q-btn v-if="submission && jobs.some(job => !job.linked)" flat dense no-caps icon="upload" label="Retomar envio de anexos" :loading="busy" @click="retryAttachments" />
          <div v-if="form && !formLoading" class="row justify-end q-gutter-sm q-my-md">
            <q-btn v-if="editable && (!submission || submission.status === 'Draft')" flat dense no-caps icon="save" label="Salvar rascunho e anexos" color="primary" :loading="busy" :disable="unsupported" @click="save(false)" />
            <q-btn v-if="canSubmit" flat dense no-caps icon="send" :label="submission?.status === 'NeedsCorrection' ? 'Reenviar para análise' : 'Enviar para análise'" color="primary" :loading="busy" :disable="unsupported" @click="save(true)" />
          </div>
          <div v-if="form && !canSubmit && editable" class="text-caption text-muted q-mb-lg">Seu perfil pode salvar este rascunho. O envio deve ser realizado por um perfil autorizado no formulário.</div>

          <form-section v-if="canReview" title="Revisão" caption="Confira os dados e documentos antes de concluir a análise.">
            <label-form text-label="Observações da análise"><q-input dark hide-bottom-space v-model="notes" type="textarea" outlined dense :disable="busy" maxlength="2000" aria-label="Observações da análise" /></label-form>
            <div class="row justify-end q-gutter-sm q-mt-md">
              <q-btn flat dense no-caps label="Solicitar correção" icon="edit_note" :disable="busy || !notes.trim()" @click="review('correction-request')" />
              <q-btn flat dense no-caps label="Rejeitar" color="negative" icon="close" :disable="busy || !notes.trim()" @click="review('reject')" />
              <q-btn flat dense no-caps label="Aprovar" color="primary" icon="check" :loading="busy" @click="review('approve')" />
            </div>
            <div class="text-caption text-muted q-mt-sm">Rejeição e solicitação de correção exigem observações. Uma rejeição encerra a submissão.</div>
          </form-section>
          <form-section v-if="submission" title="Histórico">
            <q-linear-progress v-if="historyLoading" indeterminate aria-label="Carregando histórico" />
            <q-banner v-if="historyError" class="bg-red-1 text-negative">{{ historyError }}<template #action><q-btn flat label="Tentar novamente" @click="loadHistory" /></template></q-banner>
            <q-list dark v-else-if="history.length" separator>
              <q-item v-for="event in history" :key="event.id"><q-item-section><q-item-label>{{ eventLabels[event.eventType] || 'Atualização da submissão' }}</q-item-label><q-item-label caption>{{ formatDate(event.occurredAtUtc) }} · {{ statusLabels[event.toStatus] || 'Registrado' }}</q-item-label><q-item-label v-if="event.notes" class="intake-wrap">{{ event.notes }}</q-item-label></q-item-section></q-item>
            </q-list>
            <div v-else-if="!historyLoading && !historyError" class="text-muted">Nenhum evento registrado.</div>
          </form-section>
        </template>
      </q-card-section>
    </div>
  </q-card>
</template>

<script setup>
import { computed, nextTick, onMounted, ref, watch, onBeforeUnmount } from 'vue'
import { useQuasar } from 'quasar'
import TitleCard from 'src/components/Card/TitleCard.vue'
import EntityHeader from 'src/components/Entity/EntityHeader.vue'
import FormSection from 'src/components/Entity/FormSection.vue'
import LabelForm from 'src/components/Form/LabelForm.vue'
import DynamicIntakeForm from './DynamicIntakeForm.vue'
import IntakeAttachment from './IntakeAttachment.vue'
import { allowedAction, cleanFormData, collection, components, createFormValidator, formFields, statusLabels } from './formModel'
import { createIntakeWriter, getActiveIntakeForm, getIntakeDefinition, getIntakeHistory, getIntakeSubmission, intakeError, intakePath } from 'src/services/dataIntakeService'
import { lookupCustomers } from 'src/services/customerService'
import { listDocumentTypes, downloadDocument } from 'src/services/documentAdminService'

const props = defineProps({ submissionId: { type: String, default: '' }, catalog: { type: Array, default: () => [] }, user: { type: Object, required: true } })
const emit = defineEmits(['close', 'updated', 'busy'])
const $q = useQuasar()
const submission = ref(null), form = ref(null), data = ref({}), title = ref(''), selectedCode = ref(''), customer = ref(null)
const loading = ref(false), formLoading = ref(false), busy = ref(false), loadError = ref(''), formError = ref(''), actionError = ref(''), message = ref(''), errors = ref({})
const customers = ref([]), customersLoading = ref(false), customerError = ref(''), documentTypes = ref([]), typeError = ref(''), jobs = ref([])
const history = ref([]), historyLoading = ref(false), historyError = ref(''), notes = ref('')
const editorBody = ref(null), validationSummary = ref(null), validationMessage = ref('')
const versionConflict = ref(false)
const write = createIntakeWriter()
let validator, selectionRevision = 0, lookupRevision = 0, disposed = false
const customerId = computed(() => submission.value?.customerId || customer.value?.value || '')
const unsupported = computed(() => !form.value || Object.values(formFields(form.value)).some((field) => !components.includes(field.component) || ['object', 'array'].includes(field.schema.type)))
const isCorrection = computed(() => submission.value?.status === 'NeedsCorrection')
const editable = computed(() => !!form.value && !formError.value && !versionConflict.value && (isCorrection.value ? allowedAction(props.user, null, 'submit') : allowedAction(props.user, form.value, submission.value ? 'updateOwnDraft' : 'create')) && (!submission.value || ['Draft', 'NeedsCorrection'].includes(submission.value.status)))
const canSubmit = computed(() => !!form.value && !formError.value && !versionConflict.value && (isCorrection.value ? allowedAction(props.user, null, 'submit') : allowedAction(props.user, form.value, 'submit') && (submission.value ? submission.value.status === 'Draft' : editable.value)))
const canReview = computed(() => !!form.value && !unsupported.value && !formError.value && !formLoading.value && ['Submitted', 'Processing'].includes(submission.value?.status) && allowedAction(props.user, form.value, 'validate'))
const eventLabels = { DraftCreated: 'Rascunho criado', DraftUpdated: 'Rascunho atualizado', Submitted: 'Enviado para análise', CorrectionRequested: 'Correção solicitada', CorrectedAndResubmitted: 'Correção reenviada', Approved: 'Aprovado', Rejected: 'Rejeitado', ActionDispatchFailed: 'A aprovação requer correção', ReprocessRequested: 'Reprocessamento solicitado' }
const formatDate = (value) => value && !Number.isNaN(Date.parse(value)) ? new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value)) : 'Data indisponível'

function useForm(value) {
  validator = createFormValidator(value)
  form.value = value
}
async function selectForm(code) {
  const revision = ++selectionRevision
  form.value = null; validator = null; formError.value = ''; formLoading.value = true; errors.value = {}; data.value = {}; message.value = ''
  try {
    const value = await getActiveIntakeForm(code)
    if (revision !== selectionRevision || disposed) return
    useForm(value)
    title.value = value.name || ''
    for (const field of Object.values(formFields(value))) {
      if (field.schema.default !== undefined) data.value[field.key] = field.schema.default
      else if (field.component === 'toggle') data.value[field.key] = false
    }
  } catch (error) { if (revision === selectionRevision) formError.value = error.response ? intakeError(error) : 'Este formulário possui um schema incompatível. Solicite a revisão da versão publicada.' }
  finally { if (revision === selectionRevision) formLoading.value = false }
}
async function resolvePinnedForm() {
  formLoading.value = true; formError.value = ''; form.value = null; validator = null
  try {
    const versionId = submission.value.formVersionId
    if (!versionId) throw new Error('unversioned')
    // Resolve exactly the pinned version; never silently edit with today's active schema.
    const current = props.catalog.find((item) => item.formVersionId === versionId)
    if (current) {
      const active = await getActiveIntakeForm(current.code)
      if (active.formVersionId === versionId) { useForm(active); return }
    }
    const definitionIds = [...new Set([submission.value.formDefinitionId, ...props.catalog.map((item) => item.formDefinitionId)].filter(Boolean))]
    for (const id of definitionIds) {
      const definition = await getIntakeDefinition(id)
      const version = definition.versions?.find((item) => item.id === versionId)
      if (version) { useForm({ ...version, name: definition.name, code: definition.code, formVersionId: version.id }); return }
    }
    throw new Error('version unavailable')
  } catch (error) { formError.value = error.response ? intakeError(error) : 'Não foi possível recuperar a versão original deste formulário. A edição e a revisão estão bloqueadas para preservar o contrato da submissão.' }
  finally { formLoading.value = false }
}
async function load() {
  if (!props.submissionId) return
  loading.value = true; loadError.value = ''
  try { submission.value = await getIntakeSubmission(props.submissionId); title.value = submission.value.title || ''; data.value = { ...submission.value.data }; await Promise.allSettled([resolvePinnedForm(), loadHistory()]) }
  catch (error) { loadError.value = intakeError(error) }
  finally { loading.value = false }
}
async function loadHistory() {
  if (!submission.value) return
  historyLoading.value = true; historyError.value = ''
  try { history.value = collection(await getIntakeHistory(submission.value.id)) }
  catch (error) { historyError.value = intakeError(error) }
  finally { historyLoading.value = false }
}
async function loadTypes() {
  typeError.value = ''
  try { documentTypes.value = collection(await listDocumentTypes()) }
  catch (error) { typeError.value = intakeError(error) }
}
async function findCustomers(search, update) {
  const revision = ++lookupRevision
  customersLoading.value = true; customerError.value = ''
  try {
    const response = await lookupCustomers({ search, pageSize: 20 })
    if (revision === lookupRevision) update(() => { customers.value = collection(response).map((item) => ({ label: item.displayName || item.name || item.id, value: item.id })) })
  } catch { if (revision === lookupRevision) { customerError.value = 'Não foi possível buscar clientes. Digite novamente para tentar.'; update(() => { customers.value = [] }) } }
  finally { if (revision === lookupRevision) customersLoading.value = false }
}
function addJob(job) {
  const existing = submission.value?.attachments?.length || 0
  if (existing + jobs.value.filter((item) => !item.linked).length >= 10) { actionError.value = 'O limite é de 10 anexos por submissão.'; return }
  jobs.value.push(job)
}
function removeJob(key) { jobs.value = jobs.value.filter((job) => job.key !== key) }
async function syncAttachments() {
  for (const job of jobs.value.filter((item) => !item.linked)) {
    if (!job.documentId) {
      const body = new FormData()
      body.append('file', job.file); body.append('documentTypeId', job.documentTypeId)
      if (job.countryId) body.append('countryId', job.countryId)
      if (job.requirementId) body.append('requirementId', job.requirementId)
      const uploaded = await write('post', `/api/v1/admin/customers/${encodeURIComponent(customerId.value)}/documents`, body, `upload:${job.key}`)
      if (!uploaded?.id) throw new Error('Document ID missing')
      job.documentId = uploaded.id
    }
    await write('post', intakePath(submission.value.id, 'attachments'), { customerUploadedDocumentId: job.documentId }, `link:${job.key}`)
    job.linked = true
  }
}
async function refreshAfterMutation() {
  emit('updated')
  await Promise.allSettled([loadHistory(), (async () => {
    try { submission.value = await getIntakeSubmission(submission.value.id) }
    catch { message.value = 'Operação salva. Não foi possível atualizar a leitura; reabra o registro para conferir o estado atual.' }
  })()])
}
async function retryAttachments() {
  if (busy.value) return
  busy.value = true; actionError.value = ''
  try { await syncAttachments(); message.value = 'Anexos vinculados.' }
  catch (error) { actionError.value = intakeError(error) }
  finally { await refreshAfterMutation(); busy.value = false }
}
async function save(submit) {
  if (busy.value || unsupported.value || (submit ? !canSubmit.value : !editable.value)) return
  actionError.value = ''; message.value = ''; validationMessage.value = ''
  const payload = cleanFormData(form.value, data.value)
  errors.value = validator(payload, submit)
  if (!title.value.trim()) errors.value.title = 'Informe um título.'
  if (!customerId.value) errors.value._form = 'Selecione o cliente para vincular esta declaração.'
  if (Object.keys(errors.value).length) {
    validationMessage.value = 'Não foi possível salvar. Revise os campos destacados antes de continuar.'
    await nextTick()
    const key = Object.keys(errors.value)[0]
    const field = editorBody.value?.querySelector(`[data-intake-field="${CSS.escape(key)}"]`)
    const target = field?.querySelector('input, button, [tabindex="0"]') || validationSummary.value?.$el
    target?.focus({ preventScroll: true })
    const scrollTarget = field || target
    scrollTarget?.scrollIntoView({ block: 'center', behavior: 'auto' })
    return
  }
  busy.value = true
  try {
    if (!submission.value) {
      submission.value = await write('post', intakePath('', 'drafts'), { title: title.value.trim(), data: payload, customerId: customerId.value, formVersionId: form.value.formVersionId })
      emit('updated')
    } else if (submission.value.status === 'Draft' && editable.value) {
      submission.value = await write('patch', intakePath(submission.value.id), { title: title.value.trim(), data: payload, expectedVersion: submission.value.version })
    }
    await syncAttachments()
    if (submit) {
      const correction = submission.value.status === 'NeedsCorrection'
      submission.value = await write('post', intakePath(submission.value.id, correction ? 'resubmit' : 'submit'), correction ? { title: title.value.trim(), data: payload, notes: notes.value || null } : { notes: notes.value || null })
      message.value = 'Formulário enviado para análise. A conclusão depende da revisão.'
    } else message.value = 'Rascunho e anexos salvos.'
  } catch (error) {
    actionError.value = intakeError(error)
    for (const item of error?.response?.data?.errors || []) {
      if (item.code === 'data_intake_submission.version_conflict') versionConflict.value = true
      if (item.field) errors.value[item.field.replace(/^data\./, '')] = 'Confira este campo ou requisito documental.'
    }
  } finally {
    if (submission.value) await refreshAfterMutation()
    busy.value = false
  }
}
function review(action) {
  if (!canReview.value || busy.value || (action !== 'approve' && !notes.value.trim())) return
  const label = { approve: 'Aprovar submissão', reject: 'Rejeitar submissão', 'correction-request': 'Solicitar correção' }[action]
  $q.dialog({ dark: true, title: label, message: action === 'approve' ? 'Confirmar a análise? A aprovação poderá registrar o patrimônio do cliente.' : action === 'reject' ? 'A rejeição é definitiva. Confirmar?' : 'Enviar as observações ao autor para correção?', cancel: true, ok: { label: 'Confirmar', flat: true }, persistent: true }).onOk(async () => {
    busy.value = true; actionError.value = ''; message.value = ''
    try {
      submission.value = await write('post', intakePath(submission.value.id, action), { notes: notes.value.trim() || null })
      message.value = submission.value.status === 'NeedsCorrection' ? 'A submissão requer correção. Consulte o histórico antes de tentar aprovar novamente.' : 'Análise registrada.'
      notes.value = ''
    } catch (error) { actionError.value = intakeError(error) }
    finally { await refreshAfterMutation(); busy.value = false }
  })
}
async function download(attachment) {
  try {
    const response = await downloadDocument(attachment.customerUploadedDocumentId)
    const url = URL.createObjectURL(response.data), link = document.createElement('a')
    link.href = url; link.download = attachment.fileName || 'documento'; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000)
  } catch (error) { actionError.value = intakeError(error) }
}
watch(busy, (value) => emit('busy', value))
onMounted(() => { load(); loadTypes() })
onBeforeUnmount(() => { disposed = true; selectionRevision++; lookupRevision++ })
</script>

<style scoped>
.intake-editor { width: min(960px, 100vw); max-width: 100vw; }
.intake-wrap { overflow-wrap: anywhere; }
.intake-editor__content { padding: 24px; container-type: inline-size; }
.intake-editor :deep(.LabelForm) { align-content: start; gap: 8px !important; }
.intake-editor :deep(.form-section) { padding: 0; margin-bottom: 24px; }
.intake-editor :deep(.text-muted),
.intake-editor :deep(.q-item__label--caption) { color: rgba(255, 255, 255, .72) !important; }
.intake-editor :deep(.q-field__bottom) { color: #ffb4bd; }
.intake-editor :deep(input::placeholder) { color: rgba(255, 255, 255, .72); opacity: 1; }
.intake-editor :deep(.q-field__control) { border-radius: 8px; }
.intake-editor .scroll { color-scheme: dark; }
.intake-editor :deep(.form-section__caption) { color: rgba(255, 255, 255, .72); }
@container (max-width: 719px) { .intake-editor :deep(.LabelForm.col-md-4) { width: 50%; } }
@container (max-width: 479px) { .intake-editor :deep(.LabelForm.col-md-4), .intake-editor :deep(.LabelForm) { width: 100%; } }
@media (max-width: 599px) { .intake-editor__content { padding: 16px; } }
</style>
