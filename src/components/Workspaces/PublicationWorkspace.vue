<template>
  <div class="workspace">
    <header class="workspace-header">
      <div>
        <q-btn flat no-caps label="Comunicados" @click="$emit('close')"
          ><workspace-icon name="arrow-left"
        /></q-btn>
        <h1>{{ recordId ? 'Editar Conteúdo' : 'Novo ' + (kind || 'Conteúdo') }}</h1>
        <q-badge outline>{{ workspaceStatus(source?.status || 'Draft') }}</q-badge>
      </div>
      <div class="workspace-actions">
        <q-btn flat no-caps label="Descartar" :disable="busy" @click="$emit('close')" /><q-btn
          outline
          no-caps
          label="Salvar Rascunho"
          :loading="busy"
          :disable="locked || (recordId && !dirty)"
          @click="save(false)"
          ><workspace-icon name="save" /></q-btn
        ><q-btn
          outline
          no-caps
          label="Publicar Agora"
          :loading="busy"
          :disable="locked || source?.status === 'Published'"
          @click="save(true)"
          ><workspace-icon name="send"
        /></q-btn>
      </div>
    </header>
    <main class="workspace-main">
      <q-banner v-if="error" class="workspace-error" role="alert">{{ error }}</q-banner
      ><resource-state :state="detail.state" @retry="load"
        ><div class="workspace-editor publication-editor" :inert="busy || undefined">
          <div>
            <template v-if="kind === 'Relatório'"
              ><profile-section title="Dados Básicos do Relatório"
                ><div class="workspace-form-grid">
                  <workspace-field
                    v-model="form.title"
                    :field="{
                      label: 'Título do Relatório *',
                      wide: true,
                      placeholder: 'Ex: Relatório Econômico - Q1 2026',
                    }"
                  /><workspace-field
                    v-model="form.code"
                    :field="{ label: 'Código' }"
                  /><workspace-field
                    v-model="form.version"
                    :field="{ label: 'Versão' }"
                  /><workspace-field
                    v-model="form.period"
                    :field="{ label: 'Período' }"
                  /><workspace-field
                    v-model="form.summary"
                    :field="{
                      label: 'Resumo Curto (opcional)',
                      kind: 'textarea',
                      wide: true,
                      hint: 'Usado apenas para cards/listagens. O PDF é o conteúdo principal.',
                    }"
                  /></div></profile-section
              ><profile-section
                title="PDF Principal do Relatório"
                caption="Este é o elemento principal do relatório"
                ><iframe
                  v-if="pdfUrl"
                  :src="pdfUrl"
                  title="Prévia do PDF principal"
                  class="publication-pdf"
                />
                <div v-else class="workspace-empty">
                  Nenhum PDF enviado
                  <p>Envie o documento principal do relatório para visualizar a prévia</p>
                </div>
                <q-file
                  v-model="form.pdf"
                  outlined
                  dark
                  dense
                  accept="application/pdf"
                  max-file-size="52428800"
                  label="Enviar PDF"
                  aria-label="Enviar PDF"
                  @rejected="fileRejected('PDF até 50MB')"
                /><small>Tamanho máximo: 50MB</small></profile-section
              ><profile-section title="Áudio do Relatório (Opcional)"
                ><audio v-if="audioUrl" :src="audioUrl" controls />
                <p v-else>Nenhum áudio enviado</p>
                <q-file
                  v-model="form.audio"
                  outlined
                  dark
                  dense
                  accept="audio/mpeg,audio/wav,audio/x-m4a,audio/mp4"
                  max-file-size="104857600"
                  label="Enviar Áudio"
                  aria-label="Enviar Áudio"
                  @rejected="fileRejected('áudio até 100MB')"
                /><small>MP3, WAV ou M4A · Máx: 100MB</small></profile-section
              ><profile-section
                title="Anexos Complementares"
                caption="Planilhas, documentos de apoio, imagens adicionais"
                ><p v-if="!form.attachments?.length">Nenhum anexo complementar</p>
                <q-file
                  v-model="form.attachments"
                  multiple
                  outlined
                  dark
                  dense
                  label="Adicionar Anexo"
                  aria-label="Adicionar Anexo" /></profile-section></template
            ><profile-section v-else class="publication-content" title=""
              ><q-input
                v-model="form.title"
                outlined
                dark
                dense
                placeholder="Digite o título..."
                aria-label="Título do conteúdo"
                :readonly="locked"
              /><q-input
                v-model="form.summary"
                outlined
                dark
                dense
                placeholder="Adicione um subtítulo ou resumo (opcional)..."
                aria-label="Subtítulo ou resumo"
                :readonly="locked"
              /><q-input
                v-model="form.body"
                outlined
                dark
                type="textarea"
                rows="14"
                placeholder="Escreva um parágrafo..."
                aria-label="Conteúdo da publicação"
                :readonly="locked"
              />
              <div class="publication-media-help">
                Como adicionar mídia ao conteúdo
                <p>
                  Use os blocos do editor acima para inserir imagens, vídeos, documentos e links
                  exatamente onde você quer que apareçam no texto.
                </p>
              </div></profile-section
            >
          </div>
          <aside>
            <profile-section title="Configurações de Publicação"
              ><workspace-field
                :model-value="kind || 'Indisponível'"
                :field="{
                  label: 'Categoria do Conteúdo',
                  disabled: true,
                  hint: 'Categoria definida na criação',
                }"
              />
              <p>Status Atual</p>
              <q-badge outline
                >{{ workspaceStatus(source?.status || 'Draft')
                }}{{ !source || source.status === 'Draft' ? ' (Não visível)' : '' }}</q-badge
              >
              <p>Agendamento</p>
              <q-btn-toggle
                v-model="form.schedule"
                no-caps
                :options="[
                  { label: 'Publicar Agora', value: 'now' },
                  { label: 'Programar', value: 'scheduled', disable: true },
                ]"
              /><workspace-field
                v-model="form.author"
                :field="{
                  label: 'Redator / Autor',
                  kind: 'select',
                  options: [],
                  disabled: true,
                  placeholder: 'Selecione o redator',
                }"
              /><q-btn
                outline
                no-caps
                label="Criar novo redator"
                class="full-width q-mt-sm"
                @click="authorOpen = true"
              />
              <p>Temas do Conteúdo *</p>
              <div class="row no-wrap items-center">
                <q-input
                  v-model="themeInput"
                  outlined
                  dense
                  dark
                  placeholder="Ex: Economia, Política..."
                  aria-label="Tema do conteúdo"
                  @keyup.enter="addTheme"
                /><q-btn outline dense aria-label="Adicionar tema" @click="addTheme"
                  ><workspace-icon name="plus"
                /></q-btn>
              </div>
              <q-chip
                v-for="theme in form.themes"
                :key="theme"
                removable
                @remove="form.themes = form.themes.filter((t) => t !== theme)"
                >{{ theme }}</q-chip
              ><small
                >Usado para organização, busca e sugestões de conteúdos relacionados</small
              ></profile-section
            ><profile-section v-if="kind !== 'Relatório'" title="Imagem de Capa"
              ><img
                v-if="coverUrl"
                :src="coverUrl"
                alt="Capa selecionada"
                class="publication-cover" /><q-file
                v-model="form.cover"
                outlined
                dark
                dense
                accept="image/*"
                label="Clique para adicionar imagem de capa"
                aria-label="Imagem de capa" /></profile-section
            ><profile-section
              v-if="kind === 'Insight'"
              title="Insights Relacionados"
              caption="Define o que aparecerá na coluna direita"
              ><workspace-field
                v-model="form.relatedMode"
                :field="{ label: 'Modo de Seleção', kind: 'select', options: ['Baseado em Tema'] }"
              />
              <p>Sugere conteúdos baseados nos temas cadastrados acima.</p></profile-section
            ><profile-section
              v-else
              title="Índice do Conteúdo"
              caption="Gerado automaticamente a partir dos tópicos H2 e H3"
              ><p>Adicione tópicos H2 e H3 no editor para gerar o índice</p></profile-section
            ><profile-section v-if="kind === 'Comunicado Oficial'" title="Informações do Comunicado"
              ><div class="workspace-form-grid">
                <workspace-field
                  v-model="form.code"
                  :field="{ label: 'Código *', placeholder: 'Ex: COM-2024-001' }"
                /><workspace-field
                  v-model="form.version"
                  :field="{ label: 'Versão' }"
                /><workspace-field
                  v-model="form.notes"
                  :field="{ label: 'Notas', kind: 'textarea', wide: true }"
                /><workspace-field
                  v-model="form.references"
                  :field="{ label: 'Referências', kind: 'textarea', wide: true }"
                /><workspace-field
                  v-model="form.bibliography"
                  :field="{ label: 'Bibliografia', kind: 'textarea', wide: true }"
                /></div></profile-section
            ><profile-section title="Disparo de Notificações"
              ><q-checkbox
                v-model="form.push"
                label="Notificação Push (App)"
                :disable="locked"
              /><small>Envia um alerta para o celular dos clientes.</small
              ><q-checkbox v-model="form.email" label="Disparo de E-mail" :disable="locked" /><small
                >Envia o comunicado completo por e-mail.</small
              ></profile-section
            ><q-btn
              outline
              no-caps
              label="Visualizar como Cliente"
              class="full-width"
              @click="previewOpen = true"
            />
          </aside>
        </div>
        <profile-section v-if="recordId" title="Histórico de Alterações"
          ><resource-state :state="history.state" @retry="loadHistory"
            ><q-table
              dark
              flat
              dense
              :rows="history.state.data || []"
              :columns="historyColumns"
              row-key="id"
              hide-pagination
              no-data-label="Nenhuma alteração registrada." /></resource-state></profile-section
      ></resource-state>
    </main>
    <author-dialog v-if="authorOpen" @close="authorOpen = false" /><q-dialog v-model="previewOpen"
      ><q-card class="workspace-modal workspace-modal--wide"
        ><div class="workspace-modal-heading">
          <h2>Prévia - Visualização do Cliente</h2>
          <q-btn flat dense icon="close" aria-label="Fechar prévia" v-close-popup />
        </div>
        <h3>{{ form.title || 'Título' }}</h3>
        <p>{{ form.summary }}</p>
        <iframe v-if="pdfUrl" :src="pdfUrl" title="Prévia do relatório" class="publication-pdf" />
        <div v-else class="workspace-preview">{{ form.body }}</div></q-card
      ></q-dialog
    >
  </div>
</template>
<script setup>
import { computed, onScopeDispose, ref, watch } from 'vue'
import { useQuasar } from 'quasar'
import { onBeforeRouteLeave, onBeforeRouteUpdate } from 'vue-router'
import ProfileSection from 'src/components/Entity/ProfileSection.vue'
import ResourceState from 'src/components/Finance/ResourceState.vue'
import WorkspaceField from './WorkspaceField.vue'
import WorkspaceIcon from './WorkspaceIcon.vue'
import AuthorDialog from './AuthorDialog.vue'
import { financeGet, financeWrite, columns, dateLabel } from 'src/services/financeService'
import { useFinanceResource } from 'src/composables/useFinanceResource'
import {
  announcementTextPayload,
  validatePublication,
  workspaceStatus,
} from 'src/services/adminWorkspaceModel'
import { auditAction, auditField, auditValue } from 'src/services/auditModel'
const props = defineProps({
    recordId: { type: String, default: null },
    kind: { type: String, default: null },
  }),
  emit = defineEmits(['close', 'saved']),
  $q = useQuasar()
const detail = useFinanceResource(),
  history = useFinanceResource(),
  source = ref(null),
  form = ref({
    title: '',
    summary: '',
    body: '',
    themes: [],
    code: '',
    version: '',
    notes: '',
    references: '',
    bibliography: '',
    period: '',
    author: null,
    schedule: 'now',
    relatedMode: 'Baseado em Tema',
    push: false,
    email: false,
    cover: null,
    pdf: null,
    audio: null,
    attachments: [],
  }),
  baseline = ref(''),
  baselineExtras = ref(''),
  themeInput = ref(''),
  authorOpen = ref(false),
  previewOpen = ref(false),
  error = ref(''),
  busy = ref(false),
  coverUrl = ref(''),
  pdfUrl = ref(''),
  audioUrl = ref('')
let active = true
const extras = () =>
  Object.fromEntries(
    Object.entries(form.value).filter(([k]) => !['title', 'summary', 'body'].includes(k)),
  )
const dirty = computed(() => JSON.stringify(form.value) !== baseline.value),
  locked = computed(() => source.value?.status === 'Archived' || busy.value)
const historyColumns = columns([
  ['occurredAtUtc', 'Data/Hora', (r) => dateLabel(r.occurredAtUtc)],
  ['actorName', 'Autor'],
  ['action', 'Alteração', (r) => auditAction(r.action).label],
  [
    'changes',
    'Anterior → Novo',
    (r) =>
      r.field
        ? auditField(r.field) +
          ': ' +
          auditValue(r.field, r.oldValue) +
          ' → ' +
          auditValue(r.field, r.newValue)
        : '—',
  ],
])
function addTheme() {
  const value = themeInput.value.trim()
  if (value && !form.value.themes.includes(value)) {
    form.value.themes.push(value)
    themeInput.value = ''
  }
}
function fileRejected(label) {
  error.value = 'Selecione um arquivo válido: ' + label + '.'
}
for (const [key, url, valid] of [
  ['cover', coverUrl, (f) => f.type.startsWith('image/')],
  ['pdf', pdfUrl, (f) => f.type === 'application/pdf'],
  ['audio', audioUrl, (f) => f.type.startsWith('audio/')],
])
  watch(
    () => form.value[key],
    (file) => {
      if (url.value) URL.revokeObjectURL(url.value)
      url.value = ''
      if (file && valid(file)) url.value = URL.createObjectURL(file)
      else if (file) {
        form.value[key] = null
        error.value = 'Selecione um arquivo válido.'
      }
    },
  )
async function load() {
  if (!props.recordId) {
    baseline.value = JSON.stringify(form.value)
    baselineExtras.value = JSON.stringify(extras())
    return
  }
  await detail.load(async () => {
    const d = (await financeGet('admin/announcements/' + props.recordId)).data
    if (active) {
      source.value = d
      form.value.title = d.title
      form.value.summary = d.summary || ''
      form.value.body = d.body
      baseline.value = JSON.stringify(form.value)
      baselineExtras.value = JSON.stringify(extras())
    }
    return d
  })
}
async function loadHistory() {
  await history.load(
    async () =>
      (
        await financeGet('admin/audit/changes', {
          ResourceType: 'Announcement',
          ResourceId: props.recordId,
          PageSize: 100,
        })
      ).data || [],
  )
}
async function save(publish) {
  if (busy.value || locked.value) return
  error.value = ''
  if (!props.recordId) {
    error.value = validatePublication(form.value, props.kind)
    if (!error.value)
      error.value = 'Não foi possível salvar a publicação. Serviço indisponível no momento.'
    return
  }
  if (JSON.stringify(extras()) !== baselineExtras.value) {
    error.value =
      'Não foi possível salvar as configurações adicionais. Serviço indisponível no momento.'
    return
  }
  let payload
  try {
    payload = announcementTextPayload(source.value, form.value)
  } catch (e) {
    error.value = e.message
    return
  }
  busy.value = true
  try {
    if (dirty.value) await financeWrite('put', 'admin/announcements/' + props.recordId, payload)
    if (!active) return
    if (publish) await financeWrite('post', 'admin/announcements/' + props.recordId + '/publish')
    if (!active) return
    $q.notify({ type: 'positive', message: publish ? 'Conteúdo publicado.' : 'Conteúdo salvo.' })
    emit('saved')
  } catch (e) {
    if (active)
      error.value =
        e.response?.data?.errors?.map((x) => x.message).join(' ') ||
        'Não foi possível salvar. Tente novamente.'
  } finally {
    if (active) busy.value = false
  }
}
onBeforeRouteLeave(() => !busy.value)
onBeforeRouteUpdate(() => !busy.value)
load()
if (props.recordId) loadHistory()
onScopeDispose(() => {
  active = false
  detail.reset()
  history.reset()
  for (const u of [coverUrl, pdfUrl, audioUrl]) if (u.value) URL.revokeObjectURL(u.value)
})
</script>
<style scoped>
.publication-editor {
  margin-bottom: 32px;
}
.publication-content :deep(.q-field) {
  margin-bottom: 16px;
}
.publication-content :deep(.profile-section__heading) {
  display: none;
}
.publication-content :deep(.profile-section__body) {
  min-height: 650px;
  display: flex;
  flex-direction: column;
}
.publication-media-help {
  margin-top: auto;
  padding: 16px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 8px;
  font-size: 12px;
}
.publication-media-help p {
  font-size: 11px;
}
.publication-cover {
  display: block;
  max-width: 100%;
  max-height: 260px;
  object-fit: contain;
  margin-bottom: 16px;
}
.publication-pdf {
  border: 0;
  width: 100%;
  height: 500px;
}
.publication-editor aside .LabelForm {
  margin: 16px 0;
}
.publication-editor aside small {
  display: block;
  margin: 8px 0;
}
.publication-editor aside .q-checkbox {
  display: block;
}
</style>
