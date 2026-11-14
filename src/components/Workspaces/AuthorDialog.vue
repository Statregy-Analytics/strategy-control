<template>
  <q-dialog :model-value="true" @update:model-value="!$event && $emit('close')">
    <q-card class="author-dialog">
      <header>
        <h2>Criar Novo Redator</h2>
        <p>Preencha as informações do redator/autor</p>
        <button class="author-close" aria-label="Fechar" @click="$emit('close')">
          <img src="/icons/publication/author-close.svg" alt="" />
        </button>
      </header>
      <main>
        <q-banner v-if="error" class="author-error" role="alert">{{ error }}</q-banner>
        <label-form text-label="Foto de Perfil"
          ><div class="author-photo">
            <q-avatar size="80px"
              ><img v-if="preview" :src="preview" alt="Foto de perfil selecionada" /><span v-else
                >R</span
              ></q-avatar
            >
            <button class="author-upload" @click="fileInput?.click()">
              <img src="/icons/publication/author-upload.svg" alt="" />Enviar Foto
            </button>
            <input
              ref="fileInput"
              type="file"
              accept="image/*"
              class="author-file"
              aria-label="Selecionar foto de perfil"
              tabindex="-1"
              @change="selectPhoto"
            /></div
        ></label-form>
        <div class="author-fields">
          <workspace-field
            v-for="field in fields"
            :key="field.key"
            v-model="form[field.key]"
            :field="field"
          />
        </div>
        <aside>
          <strong>Nota:</strong> O número de publicações será calculado automaticamente conforme os
          conteúdos publicados.
        </aside>
      </main>
      <footer>
        <q-btn outline no-caps label="Cancelar" @click="$emit('close')" /><q-btn
          outline
          no-caps
          label="Criar Redator"
          :disable="!valid"
          @click="submit"
        />
      </footer>
    </q-card>
  </q-dialog>
</template>
<script setup>
import { computed, ref, onScopeDispose } from 'vue'
import WorkspaceField from './WorkspaceField.vue'
import LabelForm from 'src/components/Form/LabelForm.vue'
defineEmits(['close'])
const form = ref({
    name: '',
    role: '',
    attribution: '',
    economicView: '',
    politicalView: '',
    philosophy: '',
    biography: '',
  }),
  preview = ref(''),
  error = ref(''),
  fileInput = ref(null)
let active = true,
  sequence = 0
const valid = computed(() =>
  [form.value.name, form.value.role, form.value.attribution].every((x) => x.trim()),
)
const fields = [
  { key: 'name', label: 'Nome Completo *', wide: true, placeholder: 'Ex: João Silva Machado' },
  { key: 'role', label: 'Função *', placeholder: 'Ex: Assessor' },
  { key: 'attribution', label: 'Atribuição *', placeholder: 'Ex: Escritor' },
  ...[
    ['economicView', 'Visão Econômica', 'Descreva a visão econômica...'],
    ['politicalView', 'Visão Política', 'Descreva a visão política...'],
    ['philosophy', 'Filosofia de Vida', 'Descreva a filosofia de vida...'],
    ['biography', 'Mini Biografia', 'Escreva uma breve biografia...'],
  ].map(([key, label, placeholder]) => ({
    key,
    label,
    placeholder,
    kind: 'textarea',
    rows: 1,
    wide: true,
  })),
]
async function selectPhoto(event) {
  const file = event.target.files?.[0]
  event.target.value = ''
  if (!file) return
  const owner = ++sequence
  if (!file.type.startsWith('image/')) {
    error.value = 'Selecione uma imagem válida.'
    return
  }
  const url = URL.createObjectURL(file),
    image = new Image()
  image.src = url
  try {
    await image.decode()
    if (!active || owner !== sequence) {
      URL.revokeObjectURL(url)
      return
    }
    if (preview.value) URL.revokeObjectURL(preview.value)
    preview.value = url
    error.value = ''
  } catch {
    URL.revokeObjectURL(url)
    if (active && owner === sequence) error.value = 'Selecione uma imagem válida.'
  }
}
function submit() {
  if (!valid.value) return
  error.value = 'Não foi possível salvar o redator. Serviço indisponível no momento.'
}
onScopeDispose(() => {
  active = false
  sequence++
  if (preview.value) URL.revokeObjectURL(preview.value)
})
</script>
<style scoped>
.author-dialog {
  width: 512px;
  max-width: calc(100vw - 32px) !important;
  max-height: calc(100dvh - 48px);
  overflow: auto;
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 12px;
  background:
    linear-gradient(125deg, rgba(78, 23, 35, 0.2), rgba(16, 81, 126, 0.2)), rgba(26, 30, 45, 0.96);
  backdrop-filter: blur(20px);
  box-shadow: 4px 4px 6px rgba(0, 0, 0, 0.13);
}
header {
  position: relative;
  padding: 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}
h2 {
  font-size: 18px;
  line-height: 28px;
  font-weight: 700;
  margin: 0;
  padding-right: 32px;
}
header p {
  font-size: 14px;
  line-height: 20px;
  margin: 8px 0 0;
  color: rgba(255, 255, 255, 0.72);
}
.author-close {
  position: absolute;
  top: 16px;
  right: 16px;
  border: 0;
  background: transparent;
  padding: 0;
  display: grid;
  place-items: center;
  cursor: pointer;
}
main {
  padding: 40px 24px;
}
.author-photo {
  display: flex;
  align-items: center;
  gap: 16px;
  margin: 12px 0 24px;
}
.author-photo .q-avatar {
  background: linear-gradient(135deg, #2b7fff, #9810fa);
  flex: none;
  color: white;
  font-size: 24px;
  font-weight: 700;
}
.author-photo .q-avatar span {
  font-size: 24px;
  line-height: 32px;
}
.author-photo .q-avatar img {
  object-fit: cover;
}
.author-upload {
  display: flex;
  align-items: center;
  gap: 16px;
  border: 1px solid rgba(255, 255, 255, 0.28);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.06);
  padding: 6px 12px;
  color: #fff;
  font: inherit;
  font-size: 14px;
  cursor: pointer;
}
.author-file {
  display: none;
}
.author-fields {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 24px 16px;
}
.author-fields .workspace-wide {
  grid-column: 1/-1;
}
.author-dialog :deep(.LabelForm) {
  min-width: 0;
}
.author-dialog :deep(.q-field__control) {
  min-height: 36px;
  height: auto;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.03);
}
.author-dialog :deep(.q-field__control:before) {
  border-color: rgba(255, 255, 255, 0.2);
}
.author-dialog :deep(.q-field__native) {
  color: #fff;
  min-height: 36px;
  padding: 8px 0;
  font-size: 14px;
  line-height: 20px;
}
.author-fields :deep(.q-textarea.q-field--dense .q-field__control) {
  min-height: 36px;
}
.author-dialog :deep(textarea.q-field__native) {
  min-height: 36px;
  resize: vertical;
}

aside {
  margin-top: 24px;
  padding: 12px;
  border: 1px solid rgba(43, 127, 255, 0.5);
  border-radius: 10px;
  background: rgba(43, 127, 255, 0.15);
  color: rgba(255, 255, 255, 0.72);
  font-size: 12px;
  line-height: 16px;
}
footer {
  display: flex;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
}
footer .q-btn {
  flex: 1;
  border-radius: 8px;
  font-size: 14px;
  min-height: 36px;
  color: rgba(255, 255, 255, 0.72);
}
.author-error {
  margin-bottom: 20px;
  background: rgba(187, 77, 0, 0.15);
  color: #fee685;
  font-size: 13px;
}
@media (max-width: 480px) {
  header {
    padding: 20px;
  }
  main {
    padding: 24px 20px;
  }
  .author-fields {
    grid-template-columns: 1fr;
  }
  footer {
    padding: 16px 20px;
  }
  .author-upload {
    gap: 8px;
  }
}
</style>
