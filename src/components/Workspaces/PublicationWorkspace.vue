<template>
  <div class="workspace publication-editor-page">
    <header class="workspace-header">
      <div class="publication-heading">
        <q-btn flat dense aria-label="Voltar para Comunicados" @click="$emit('close')"
          ><img src="/icons/publication/editor-back.svg" alt=""
        /></q-btn>
        <div>
          <p class="publication-breadcrumb">
            <span>Comunicados</span> / Administração /
            {{ recordId ? 'Editar Conteúdo' : 'Novo Conteúdo' }}
          </p>
          <div class="publication-title">
            <h1>{{ recordId ? 'Editar Conteúdo' : 'Novo ' + (kind || 'Conteúdo') }}</h1>
            <publication-status :status="source?.status || (recordId ? null : 'Draft')" />
          </div>
        </div>
      </div>
      <div class="workspace-actions">
        <q-btn flat no-caps label="Descartar" :disable="busy" @click="$emit('close')" /><q-btn
          outline
          no-caps
          label="Salvar Rascunho"
          :loading="busy"
          :disable="locked || (recordId && !dirty)"
          @click="save(false)"
          ><img src="/icons/publication/editor-save.svg" alt="" /></q-btn
        ><q-btn
          outline
          no-caps
          label="Publicar Agora"
          :loading="busy"
          :disable="locked || source?.status === 'Published'"
          @click="save(true)"
          ><img src="/icons/publication/editor-publish.svg" alt=""
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
                ><div class="workspace-form-grid publication-report-grid">
                  <workspace-field
                    v-model="form.title"
                    :field="{
                      readonly: locked,
                      label: 'Título do Relatório *',
                      wide: true,
                      placeholder: 'Ex: Relatório Econômico - Q1 2026',
                    }"
                  /><workspace-field
                    v-model="form.code"
                    :field="{ readonly: locked, label: 'Código', placeholder: 'REL-2026-001' }"
                  /><workspace-field
                    v-model="form.version"
                    :field="{ readonly: locked, label: 'Versão', placeholder: '1.0' }"
                  /><workspace-field
                    v-model="form.period"
                    :field="{ readonly: locked, label: 'Período', placeholder: 'Q1 2026' }"
                  /><workspace-field
                    v-model="form.summary"
                    :field="{
                      readonly: locked,
                      label: 'Resumo Curto (opcional)',
                      kind: 'textarea',
                      wide: true,
                      hint: 'Usado apenas para cards/listagens. O PDF é o conteúdo principal.',
                    }"
                  /></div></profile-section
              ><profile-section
                title="PDF Principal do Relatório"
                caption="Este é o elemento principal do relatório"
                icon-src="/icons/publication/pdf-heading.svg"
                ><publication-upload
                  v-model="form.pdf"
                  kind="pdf"
                  :preview-url="pdfUrl"
                  :disabled="locked" /></profile-section
              ><profile-section
                title="Áudio do Relatório (Opcional)"
                icon-src="/icons/publication/audio-heading.svg"
                ><publication-upload
                  v-model="form.audio"
                  kind="audio"
                  :preview-url="audioUrl"
                  :disabled="locked" /></profile-section
              ><profile-section
                title="Anexos Complementares"
                caption="Planilhas, documentos de apoio, imagens adicionais"
                icon-src="/icons/publication/attachments-heading.svg"
                ><publication-upload
                  v-model="form.attachments"
                  kind="attachments"
                  :disabled="locked" /></profile-section></template
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
              /><publication-blocks
                v-model="form.body"
                v-model:blocks="form.blocks"
                :readonly="locked"
              />
              <div class="publication-media-help">
                💡 Como adicionar mídia ao conteúdo
                <p>
                  Use os blocos do editor acima para inserir imagens, vídeos, documentos e links
                  exatamente onde você quer que apareçam no texto. Clique no botão + entre os blocos
                  para escolher o tipo de mídia.
                </p>
              </div></profile-section
            >
          </div>
          <aside>
            <profile-section title="Configurações de Publicação" class="publication-settings">
              <p class="publication-label">Categoria do Conteúdo</p>
              <div
                class="publication-category"
                role="textbox"
                aria-label="Categoria do Conteúdo"
                aria-readonly="true"
              >
                <div>
                  <strong>{{ kind || 'Indisponível' }}</strong
                  ><small>Categoria definida na criação</small>
                </div>
                <span>Bloqueado</span>
              </div>
              <p class="publication-label">Status Atual</p>
              <span class="publication-current-status"
                ><i
                  :data-status="source?.status || (recordId ? null : 'Draft')"
                  aria-hidden="true"
                />{{ workspaceStatus(source?.status || (recordId ? null : 'Draft'))
                }}{{ !source || source.status === 'Draft' ? ' (Não visível)' : '' }}</span
              >
              <p>Agendamento</p>
              <q-btn-toggle
                v-model="form.schedule"
                :disable="locked"
                no-caps
                :options="[
                  { label: 'Publicar Agora', value: 'now' },
                  { label: 'Programar', value: 'scheduled', disable: true },
                ]"
              /><workspace-field
                v-model="form.author"
                :field="{
                  readonly: locked,
                  label: 'Redator / Autor',
                  kind: 'select',
                  options: [],
                  disabled: true,
                  placeholder: 'Selecione o redator',
                  dropdownIcon: 'img:/icons/publication/editor-chevron.svg',
                }"
              /><q-btn
                outline
                no-caps
                label="Criar novo redator"
                :disable="locked"
                class="full-width q-mt-sm publication-author-create"
                @click="authorOpen = true"
                ><img src="/icons/publication/editor-author-plus.svg" alt=""
              /></q-btn>
              <p>Temas do Conteúdo *</p>
              <div class="row no-wrap items-center">
                <q-input
                  v-model="themeInput"
                  :readonly="locked"
                  outlined
                  dense
                  dark
                  placeholder="Ex: Economia, Política..."
                  aria-label="Tema do conteúdo"
                  @keyup.enter="addTheme"
                /><q-btn
                  outline
                  dense
                  aria-label="Adicionar tema"
                  :disable="locked"
                  @click="addTheme"
                  ><img src="/icons/publication/editor-theme-plus.svg" alt=""
                /></q-btn>
              </div>
              <q-chip
                v-for="theme in form.themes"
                :key="theme"
                :removable="!locked"
                @remove="form.themes = form.themes.filter((t) => t !== theme)"
                >{{ theme }}</q-chip
              ><small
                >Usado para organização, busca e sugestões de conteúdos relacionados</small
              ></profile-section
            ><profile-section
              v-if="kind !== 'Relatório'"
              title="Imagem de Capa"
              icon-src="/icons/publication/editor-cover-heading.svg"
              class="publication-cover-section"
              ><label class="publication-cover-picker"
                ><img
                  v-if="coverUrl"
                  :src="coverUrl"
                  alt="Capa selecionada"
                  class="publication-cover" /><template v-else
                  ><img src="/icons/publication/editor-cover-empty.svg" alt="" /><span
                    >Clique para adicionar imagem de capa</span
                  ></template
                ><input
                  type="file"
                  accept="image/*"
                  aria-label="Imagem de capa"
                  :disabled="locked"
                  @change="chooseCover" /></label></profile-section
            ><profile-section
              v-if="kind === 'Insight'"
              title="Insights Relacionados"
              icon-src="/icons/publication/editor-related.svg"
              caption="Define o que aparecerá na coluna direita"
              ><workspace-field
                v-model="form.relatedMode"
                :field="{
                  readonly: locked,
                  label: 'Modo de Seleção',
                  disabled: locked,
                  kind: 'select',
                  options: ['Baseado em Tema'],
                  dropdownIcon: 'img:/icons/publication/editor-chevron.svg',
                }"
              />
              <p class="publication-label">Configuração</p>
              <p class="publication-related-hint">
                Sugere conteúdos baseados nos temas cadastrados acima.
              </p>
              <p v-if="!form.themes.length" class="publication-related-empty">
                Adicione temas acima para ativar sugestões automáticas
              </p>
              <p v-else class="publication-related-empty">
                Consulta de sugestões indisponível.
              </p></profile-section
            ><profile-section
              v-else
              title="Índice do Conteúdo"
              icon-src="/icons/publication/editor-index.svg"
              caption="Gerado automaticamente a partir dos tópicos H2 e H3"
              ><ol v-if="headings.length" class="publication-content-index">
                <li
                  v-for="heading in headings"
                  :key="heading.id"
                  :class="{ nested: heading.level === 'h3' }"
                >
                  {{ heading.text }}
                </li>
              </ol>
              <p v-else>Adicione tópicos H2 e H3 no editor para gerar o índice</p></profile-section
            ><profile-section
              v-if="kind === 'Comunicado Oficial'"
              title="Informações do Comunicado"
              icon-src="/icons/publication/editor-information.svg"
              ><div class="workspace-form-grid">
                <workspace-field
                  v-model="form.code"
                  :field="{ readonly: locked, label: 'Código *', placeholder: 'Ex: COM-2024-001' }"
                /><workspace-field
                  v-model="form.version"
                  :field="{ readonly: locked, label: 'Versão', placeholder: '1.0' }"
                /><workspace-field
                  v-model="form.notes"
                  :field="{ readonly: locked, label: 'Notas', kind: 'textarea', wide: true }"
                /><workspace-field
                  v-model="form.references"
                  :field="{ readonly: locked, label: 'Referências', kind: 'textarea', wide: true }"
                /><workspace-field
                  v-model="form.bibliography"
                  :field="{ readonly: locked, label: 'Bibliografia', kind: 'textarea', wide: true }"
                /></div></profile-section
            ><profile-section
              title="Disparo de Notificações"
              icon-src="/icons/publication/editor-notifications.svg"
              class="publication-notifications"
              ><q-checkbox
                dark
                v-model="form.push"
                label="Notificação Push (App)"
                :disable="locked"
              /><small>Envia um alerta para o celular dos clientes.</small
              ><q-checkbox
                dark
                v-model="form.email"
                label="Disparo de E-mail"
                :disable="locked"
              /><small>Envia o comunicado completo por e-mail.</small></profile-section
            ><q-btn
              outline
              no-caps
              label="Visualizar como Cliente"
              class="full-width"
              @click="previewOpen = true"
              ><img src="/icons/publication/editor-preview.svg" alt=""
            /></q-btn>
          </aside>
        </div>
      </resource-state>
      <profile-section v-if="recordId" title="Histórico de Alterações"
        ><resource-state :state="history.state" @retry="loadHistory"
          ><q-table
            class="publication-history"
            dark
            flat
            dense
            :rows="history.state.data || []"
            :columns="historyColumns"
            row-key="id"
            hide-pagination
            :pagination="{ rowsPerPage: 0 }"
            no-data-label="Nenhuma alteração registrada." /></resource-state
      ></profile-section>
    </main>
    <author-dialog v-if="authorOpen" @close="authorOpen = false" />
    <publication-preview
      :open="previewOpen"
      :kind="kind"
      :form="form"
      :source="source"
      :pdf-url="pdfUrl"
      @close="previewOpen = false"
    />
  </div>
</template>
<script setup>
import { computed, onScopeDispose, ref, watch } from 'vue'
import { useQuasar } from 'quasar'
import { onBeforeRouteLeave, onBeforeRouteUpdate } from 'vue-router'
import ProfileSection from 'src/components/Entity/ProfileSection.vue'
import ResourceState from 'src/components/Finance/ResourceState.vue'
import WorkspaceField from './WorkspaceField.vue'
import AuthorDialog from './AuthorDialog.vue'
import PublicationUpload from './PublicationUpload.vue'
import PublicationPreview from './PublicationPreview.vue'
import PublicationStatus from './PublicationStatus.vue'
import PublicationBlocks from './PublicationBlocks.vue'
import { publicationHeadings } from 'src/services/publicationBlocks'
import { financeGet, financeWrite, columns } from 'src/services/financeService'
import { useFinanceResource } from 'src/composables/useFinanceResource'
import { createAuditService } from 'src/services/auditService'
import {
  announcementTextPayload,
  validatePublication,
  publicationEditLocked,
  workspaceStatus,
} from 'src/services/adminWorkspaceModel'
import { auditAction, auditField, auditValue, auditDate } from 'src/services/auditModel'
import { validatePublicationCover } from 'src/services/publicationFiles'
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
    blocks: [],
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
let active = true,
  detailRevision = 0,
  historyRevision = 0
const extras = () =>
  Object.fromEntries(
    Object.entries(form.value).filter(([k]) => !['title', 'summary', 'body'].includes(k)),
  )
const headings = computed(() => publicationHeadings(form.value.blocks))
const dirty = computed(() => JSON.stringify(form.value) !== baseline.value),
  locked = computed(() =>
    publicationEditLocked({
      source: source.value,
      recordId: props.recordId,
      loading: detail.state.loading,
      error: detail.state.error,
      busy: busy.value,
    }),
  )

const historyColumns = columns([
  ['occurredAtUtc', 'Data/Hora', (r) => auditDate(r.occurredAtUtc)],
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
function chooseCover(event) {
  if (locked.value) return
  const file = event.target.files?.[0]
  event.target.value = ''
  if (!file) return
  const message = validatePublicationCover(file)
  if (message) {
    error.value = message
    return
  }
  form.value.cover = file
  error.value = ''
}
function addTheme() {
  if (locked.value) return
  const value = themeInput.value.trim()
  if (value && !form.value.themes.includes(value)) {
    form.value.themes.push(value)
    themeInput.value = ''
  }
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
  const revision = ++detailRevision
  source.value = null
  await detail.load(async () => {
    const response = await financeGet('admin/announcements/' + props.recordId)
    if (!active || revision !== detailRevision) throw new Error('Consulta substituída.')
    const d = response?.data
    if (!d || d.id !== props.recordId || typeof d.title !== 'string' || typeof d.body !== 'string')
      throw new Error('Publicação indisponível.')
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
  const revision = ++historyRevision
  const reader = createAuditService({
    read: financeGet,
    assertCurrent: () => {
      if (!active || revision !== historyRevision) throw new Error('Consulta substituída.')
    },
  })
  await history.load(() => reader.history('Announcement', props.recordId))
}
async function save(publish) {
  if (busy.value || locked.value) return
  error.value = ''
  if (form.value.blocks.length) {
    error.value =
      'A gravação de blocos e mídias ainda não está disponível. Use a prévia para conferir o conteúdo; ele não foi salvo.'
    return
  }
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
  detailRevision++
  historyRevision++
  detail.reset()
  history.reset()
  for (const u of [coverUrl, pdfUrl, audioUrl]) if (u.value) URL.revokeObjectURL(u.value)
})
</script>
<style scoped>
.publication-history :deep(table) {
  table-layout: fixed;
  width: 100%;
  min-width: 620px;
}
.publication-history :deep(th:nth-child(1)),
.publication-history :deep(td:nth-child(1)) {
  width: 145px;
}
.publication-history :deep(th:nth-child(2)),
.publication-history :deep(td:nth-child(2)) {
  width: 120px;
}
.publication-history :deep(th:nth-child(3)),
.publication-history :deep(td:nth-child(3)) {
  width: 160px;
}
.publication-history :deep(td) {
  white-space: normal;
  overflow-wrap: anywhere;
  vertical-align: top;
}

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

<style scoped src="./publicationEditor.scss"></style>
