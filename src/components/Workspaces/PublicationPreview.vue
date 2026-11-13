<template>
  <q-dialog :model-value="open" @update:model-value="!$event && $emit('close')">
    <q-card
      class="workspace-modal publication-preview"
      :class="{ 'publication-preview--formal': kind === 'Comunicado Oficial' }"
    >
      <header>
        <div>
          <h2>Prévia - Visualização do Cliente</h2>
          <p v-if="kind === 'Comunicado Oficial'">Layout Formal: Comunicado Oficial</p>
        </div>
        <q-btn flat round dense aria-label="Fechar prévia" @click="$emit('close')"
          ><img src="/icons/publication/preview-close.svg" alt=""
        /></q-btn>
      </header>
      <div class="publication-preview__body">
        <article v-if="kind === 'Comunicado Oficial'" class="formal-publication">
          <aside class="formal-publication__author">
            <div class="formal-publication__avatar" aria-hidden="true" />
            <strong>{{ author?.name || 'Autor' }}</strong
            ><span>{{ author?.role || 'Não informado' }}</span>
          </aside>
          <div class="formal-publication__content">
            <h3>{{ form.title || 'Comunicado Oficial' }}</h3>
            <p v-if="form.summary">{{ form.summary }}</p>
            <div class="workspace-preview">{{ form.body }}</div>
          </div>
          <dl>
            <div>
              <dt>Código</dt>
              <dd>{{ form.code || source?.publicCode || '—' }}</dd>
            </div>
            <div>
              <dt>Versão</dt>
              <dd>{{ form.version || '—' }}</dd>
            </div>
            <div>
              <dt>Publicação</dt>
              <dd>
                {{ source?.publishedAtUtc ? dateLabel(source.publishedAtUtc) : 'Não publicado' }}
              </dd>
            </div>
          </dl>
        </article>
        <template v-else
          ><h3>{{ form.title || 'Título' }}</h3>
          <p>{{ form.summary }}</p>
          <pdf-preview v-if="pdfUrl" :src="pdfUrl" />
          <div v-else class="workspace-preview">{{ form.body }}</div></template
        >
      </div>
    </q-card>
  </q-dialog>
</template>
<script setup>
import PdfPreview from 'src/components/Entity/PdfPreview.vue'
import { dateLabel } from 'src/services/financeService'
defineProps({
  open: Boolean,
  kind: { type: String, default: null },
  form: { type: Object, required: true },
  source: { type: Object, default: null },
  author: { type: Object, default: null },
  pdfUrl: { type: String, default: '' },
})
defineEmits(['close'])
</script>
<style scoped>
.publication-preview {
  width: 900px;
  max-width: calc(100vw - 32px);
  padding: 0;
  min-height: 500px;
}
.publication-preview--formal {
  width: 1000px;
  min-height: min(680px, calc(100dvh - 32px));
}
header {
  padding: 16px 24px 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}
header h2 {
  margin: 0;
  font-size: 18px;
  line-height: 28px;
}
header p {
  margin: 2px 0 0;
  font-size: 12px;
}
.publication-preview__body {
  padding: 32px;
}
.formal-publication {
  display: grid;
  grid-template-columns: minmax(100px, 2fr) minmax(0, 7fr) minmax(160px, 3fr);
  gap: 32px;
  padding: 32px;
  min-height: 307px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(20px);
}
.formal-publication__author {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 14px;
  text-align: center;
  min-width: 0;
  overflow-wrap: anywhere;
}
.formal-publication__avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #155dfc, #432dd7);
  flex: none;
  margin-bottom: 12px;
}
.formal-publication__author span {
  color: var(--sa-muted, rgba(255, 255, 255, 0.72));
  font-size: 12px;
}
.formal-publication__content {
  min-width: 0;
  overflow-wrap: anywhere;
}
.formal-publication__content h3 {
  font-size: 36px;
  line-height: 40px;
  margin: 0 0 24px;
  font-weight: 700;
}
.formal-publication__content p,
.formal-publication__content .workspace-preview {
  font-size: 16px;
  line-height: 26px;
  color: var(--sa-muted, rgba(255, 255, 255, 0.72));
}
.formal-publication dl {
  align-self: start;
  margin: 0;
  padding: 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  min-width: 0;
}
.formal-publication dl > div + div {
  margin-top: 12px;
}
.formal-publication dt {
  font-size: 10px;
  text-transform: uppercase;
  color: var(--sa-muted, rgba(255, 255, 255, 0.72));
}
.formal-publication dd {
  font-size: 14px;
  line-height: 20px;
  margin: 0;
  overflow-wrap: anywhere;
}
.formal-publication dl > div:first-child dd {
  font-family: 'Cascadia Mono', monospace;
  font-weight: 700;
}
@media (max-width: 800px) {
  .formal-publication {
    grid-template-columns: 1fr;
    padding: 20px;
    gap: 24px;
  }
  .formal-publication__author {
    align-items: flex-start;
    text-align: left;
  }
  .formal-publication__content h3 {
    font-size: 28px;
    line-height: 34px;
  }
  .publication-preview__body {
    padding: 16px;
  }
}
</style>
