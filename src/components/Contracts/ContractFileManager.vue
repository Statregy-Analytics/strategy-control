<template>
  <section>
    <div v-if="uploadSlots" class="contract-file-slots">
      <q-btn
        v-for="item in documentTypes"
        :key="item.value"
        outline
        no-caps
        :label="item.label"
        icon="img:/icons/contracts/upload.svg"
        :disable="saving"
        @click="chooseType(item.value)"
      />
    </div>
    <contract-documents
      add-label="Enviar Arquivo"
      :show-add="!uploadSlots"
      :state="files.state"
      :busy="saving"
      :opening="opening"
      :downloading="downloading"
      @retry="load"
      @add="open = true"
      @open="view"
      @download="download"
      @remove="remove"
    />
    <q-dialog v-model="open" :persistent="saving">
      <q-card class="contract-file-dialog">
        <q-form @submit="upload">
          <h2>Enviar arquivo do contrato</h2>
          <label-form text-label="Tipo de documento"
            ><glass-select
              v-model="type"
              :options="documentTypes"
              aria-label="Tipo de documento"
              :disable="saving"
          /></label-form>
          <label-form text-label="Arquivo"
            ><q-file
              v-model="file"
              outlined
              dense
              clearable
              aria-label="Arquivo do contrato"
              :disable="saving"
          /></label-form>
          <label-form text-label="Descrição (opcional)"
            ><q-input
              v-model="description"
              outlined
              dense
              maxlength="1000"
              aria-label="Descrição do arquivo"
              :disable="saving"
          /></label-form>
          <q-checkbox
            v-model="visible"
            label="Liberar aos participantes do contrato"
            :disable="saving"
          />
          <p v-if="error" role="alert" class="text-negative">{{ error }}</p>
          <footer>
            <q-btn flat no-caps label="Cancelar" :disable="saving" @click="open = false" /><q-btn
              outline
              no-caps
              type="submit"
              label="Enviar arquivo"
              :loading="saving"
              :disable="!file || saving"
            />
          </footer>
        </q-form>
      </q-card>
    </q-dialog>
    <p v-if="actionError" role="alert" class="text-negative">{{ actionError }}</p>
  </section>
</template>
<script setup>
import { ref, watch, onScopeDispose } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'src/boot/axios'
import { financeGet, financeWrite } from 'src/services/financeService'
import { useFinanceResource } from 'src/composables/useFinanceResource'
import { getApiErrorMessage } from 'src/services/apiError'
import { createDocumentWindow } from 'src/services/documentWindow'
import ContractDocuments from './ContractDocuments.vue'
import LabelForm from 'src/components/Form/LabelForm.vue'
import GlassSelect from 'src/components/Entity/GlassSelect.vue'
const props = defineProps({ contractId: { type: String, required: true }, uploadSlots: Boolean })
const documentTypes = [
  { label: 'Contrato Digitalizado', value: 'ScannedContract' },
  { label: 'Documento Complementar', value: 'SupplementaryDocument' },
  { label: 'Termo de Adesão', value: 'AdhesionTerm' },
  { label: 'Outros Documentos', value: 'Other' },
]
const type = ref('ScannedContract'),
  downloading = ref(null)
const emit = defineEmits(['changed', 'loaded'])
const q = useQuasar(),
  files = useFinanceResource(),
  documentWindow = createDocumentWindow()
const open = ref(false),
  file = ref(null),
  description = ref(''),
  visible = ref(false),
  saving = ref(false),
  error = ref(''),
  actionError = ref(''),
  opening = ref(null)
let active = true,
  uploadKey = null
const base = () => `admin/contracts/${props.contractId}/files`
function chooseType(value) {
  type.value = value
  open.value = true
}
async function load() {
  await files.load(async () => {
    const result = await financeGet(base())
    if (!Array.isArray(result.data)) throw Error('Lista de arquivos indisponível.')
    return result.data.map((row) => ({
      ...row,
      documentId: row.fileId,
      documentTypeName:
        documentTypes.find((item) => item.value === row.type)?.label ||
        row.type ||
        'Arquivo do contrato',
    }))
  })
  if (active) emit('loaded', files.state.error ? null : (files.state.data?.length ?? null))
}
watch([file, type, description, visible], () => {
  uploadKey = null
  error.value = ''
})
watch(() => props.contractId, load, { immediate: true })
async function upload() {
  if (!file.value || saving.value) return
  saving.value = true
  error.value = ''
  const data = new FormData()
  data.append('file', file.value)
  data.append('type', type.value)
  if (description.value.trim()) data.append('description', description.value.trim())
  data.append('visibleToClient', String(visible.value))
  uploadKey ||= crypto.randomUUID()
  try {
    const response = await api.post(`/api/v1/${base()}`, data, {
      headers: { 'Idempotency-Key': uploadKey },
    })
    if (response.data?.success === false) throw Error('O arquivo não foi aceito.')
    if (!active) return
    uploadKey = null
    file.value = null
    description.value = ''
    open.value = false
    await load()
    emit('changed')
  } catch (e) {
    if (active)
      error.value = getApiErrorMessage(e, 'Não foi possível enviar o arquivo. Tente novamente.')
  } finally {
    if (active) saving.value = false
  }
}
async function view(row) {
  if (opening.value) return
  opening.value = row.documentId
  actionError.value = ''
  try {
    await documentWindow.open(
      async () => {
        const result = await financeGet(
          `${base()}/${encodeURIComponent(row.documentId)}/temporary-url`,
        )
        return result.data?.url || result.data?.temporaryUrl
      },
      { current: () => active },
    )
  } catch {
    if (active) actionError.value = 'Não foi possível abrir o arquivo. Tente novamente.'
  } finally {
    if (active) opening.value = null
  }
}
async function download(row) {
  if (downloading.value) return
  downloading.value = row.documentId
  actionError.value = ''
  try {
    const result = await financeGet(`${base()}/${encodeURIComponent(row.documentId)}/temporary-url`)
    const url = new URL(result.data?.url || result.data?.temporaryUrl)
    if (url.protocol !== 'https:') throw Error('Endereço do arquivo inválido.')
    const response = await fetch(url.href, { credentials: 'omit', referrerPolicy: 'no-referrer' })
    if (!response.ok) throw Error('Arquivo indisponível.')
    const blob = await response.blob()
    if (!active) return
    const objectUrl = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = objectUrl
    link.download = row.fileName || 'documento'
    link.click()
    setTimeout(() => URL.revokeObjectURL(objectUrl), 1000)
  } catch (e) {
    if (active)
      actionError.value = getApiErrorMessage(
        e,
        'Não foi possível baixar o arquivo. Tente novamente.',
      )
    if (active && e instanceof TypeError)
      actionError.value =
        'O download direto está indisponível. Use Visualizar documento e baixe pelo visualizador.'
  } finally {
    if (active) downloading.value = null
  }
}
function remove(row) {
  q.dialog({
    title: 'Remover arquivo',
    message: `Remover ${row.fileName} deste contrato?`,
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    if (saving.value) return
    saving.value = true
    actionError.value = ''
    try {
      await financeWrite('delete', `${base()}/${encodeURIComponent(row.documentId)}`)
      if (active) {
        await load()
        emit('changed')
      }
    } catch (e) {
      if (active) actionError.value = getApiErrorMessage(e, 'Não foi possível remover o arquivo.')
    } finally {
      if (active) saving.value = false
    }
  })
}
onScopeDispose(() => {
  active = false
  files.reset()
  documentWindow.dispose()
})
</script>
<style scoped>
.contract-file-slots {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}
@media (max-width: 600px) {
  .contract-file-slots {
    grid-template-columns: 1fr;
  }
}
.contract-file-dialog {
  width: 512px;
  max-width: calc(100vw - 32px);
  padding: 24px;
  color: var(--sa-text, #fff);
  background: #18212e;
  border: 1px solid #ffffff33;
  border-radius: 12px;
}
form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
h2 {
  margin: 0;
  font-size: 18px;
}
footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
