<template>
  <div class="publication-upload" :aria-busy="checking">
    <q-banner v-if="error" class="workspace-error" role="alert">{{ error }}</q-banner>
    <pdf-preview
      v-if="kind === 'pdf' && previewUrl"
      :src="previewUrl"
      class="publication-upload__pdf"
    />
    <audio v-else-if="kind === 'audio' && previewUrl" :src="previewUrl" controls />
    <div class="publication-upload__zone">
      <img v-if="!files.length" :src="emptyIcon" alt="" />
      <strong v-if="!files.length">{{ emptyLabel }}</strong>
      <p v-if="!files.length && caption">{{ caption }}</p>
      <ul v-if="files.length">
        <li v-for="(file, index) in files" :key="index">{{ file.name }}</li>
      </ul>
      <q-btn
        outline
        no-caps
        :label="buttonLabel"
        :loading="checking"
        :disable="disabled"
        @click="input?.click()"
        ><img
          :src="
            kind === 'attachments' ? '/icons/publication/plus.svg' : '/icons/publication/upload.svg'
          "
          alt=""
      /></q-btn>
      <small v-if="hint">{{ hint }}</small>
    </div>
    <input
      ref="input"
      type="file"
      class="publication-upload__input"
      tabindex="-1"
      :accept="rule?.accept"
      :multiple="kind === 'attachments'"
      :disabled="disabled || checking"
      :aria-label="buttonLabel"
      @change="selectFiles"
    />
  </div>
</template>
<script setup>
import { computed, onScopeDispose, ref } from 'vue'
import PdfPreview from 'src/components/Entity/PdfPreview.vue'
import { publicationFileRules, validatePublicationFiles } from 'src/services/publicationFiles'
const props = defineProps({
  modelValue: { default: null },
  kind: { type: String, required: true },
  previewUrl: { type: String, default: '' },
  disabled: Boolean,
})
const emit = defineEmits(['update:modelValue'])
const input = ref(null),
  checking = ref(false),
  error = ref('')
let active = true
const files = computed(() =>
  Array.isArray(props.modelValue) ? props.modelValue : props.modelValue ? [props.modelValue] : [],
)
const rule = computed(() => publicationFileRules[props.kind])
const emptyIcon = computed(
  () =>
    '/icons/publication/' +
    { pdf: 'pdf', audio: 'audio', attachments: 'attachments' }[props.kind] +
    '-empty.svg',
)
const emptyLabel = computed(
  () =>
    ({
      pdf: 'Nenhum PDF enviado',
      audio: 'Nenhum áudio enviado',
      attachments: 'Nenhum anexo complementar',
    })[props.kind],
)
const caption = computed(
  () =>
    ({
      pdf: 'Envie o documento principal do relatório para visualizar a prévia',
      audio: 'Adicione narração ou podcast do relatório',
    })[props.kind] || '',
)
const buttonLabel = computed(
  () => ({ pdf: 'Enviar PDF', audio: 'Enviar Áudio', attachments: 'Adicionar Anexo' })[props.kind],
)
const hint = computed(
  () => ({ pdf: 'Tamanho máximo: 50MB', audio: 'MP3, WAV ou M4A • Máx: 100MB' })[props.kind] || '',
)
async function selectFiles(event) {
  if (props.disabled || checking.value) return
  const selected = [...(event.target.files || [])]
  event.target.value = ''
  if (!selected.length) return
  checking.value = true
  try {
    const message = await validatePublicationFiles(selected, props.kind)
    if (!active || props.disabled) return
    error.value = message
    if (!message) emit('update:modelValue', props.kind === 'attachments' ? selected : selected[0])
  } catch {
    if (active) error.value = 'Não foi possível ler o arquivo. Selecione novamente.'
  } finally {
    if (active) checking.value = false
  }
}
onScopeDispose(() => {
  active = false
})
</script>
<style scoped>
.publication-upload__zone {
  border: 1px dashed rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 40px 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  text-align: center;
  background: rgba(0, 0, 0, 0.08);
  min-width: 0;
}
.publication-upload__zone strong {
  font-size: 14px;
}
.publication-upload__zone p,
.publication-upload__zone small {
  font-size: 11px;
  color: var(--sa-muted, rgba(255, 255, 255, 0.72));
  margin: 0;
}
.publication-upload__zone ul {
  padding: 0;
  margin: 0;
  list-style: none;
  width: 100%;
  font-size: 12px;
  overflow-wrap: anywhere;
}
.publication-upload__zone .q-btn {
  background: rgba(255, 255, 255, 0.05);
}
.publication-upload__zone .q-btn img {
  order: -1;
  margin-right: 6px;
}
.publication-upload__pdf {
  display: block;
  width: 100%;
  border: 0;
  margin-bottom: 16px;
}
.publication-upload audio {
  display: block;
  max-width: 100%;
  margin: 0 auto 16px;
}
.publication-upload__input {
  display: none;
}
@media (max-width: 600px) {
  .publication-upload__zone {
    padding: 24px 12px;
  }
}
</style>
