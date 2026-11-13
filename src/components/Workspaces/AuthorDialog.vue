<template>
  <q-dialog :model-value="true" @update:model-value="!$event && $emit('close')"
    ><q-card class="workspace-modal"
      ><div class="workspace-record-head">
        <h2>Criar Novo Redator</h2>
        <q-btn flat round dense aria-label="Fechar" icon="close" @click="$emit('close')" />
      </div>
      <p>Preencha as informações do redator/autor</p>
      <q-banner v-if="error" class="workspace-error" role="alert">{{ error }}</q-banner>
      <div class="author-photo">
        <q-avatar size="72px"
          ><img v-if="preview" :src="preview" alt="Foto de perfil selecionada" /><span v-else>{{
            form.name?.trim().slice(0, 1) || 'R'
          }}</span></q-avatar
        ><q-file
          v-model="photo"
          outlined
          dark
          dense
          accept="image/*"
          label="Enviar Foto"
          aria-label="Enviar Foto"
        />
      </div>
      <div class="workspace-form-grid">
        <workspace-field
          v-for="field in fields"
          :key="field.key"
          v-model="form[field.key]"
          :field="field"
        />
      </div>
      <div class="workspace-actions">
        <q-btn flat no-caps label="Cancelar" @click="$emit('close')" /><q-btn
          outline
          no-caps
          label="Criar Redator"
          @click="submit"
        /></div></q-card
  ></q-dialog>
</template>
<script setup>
import { ref, watch, onScopeDispose } from 'vue'
import WorkspaceField from './WorkspaceField.vue'
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
  photo = ref(null),
  preview = ref(''),
  error = ref('')
const fields = [
  { key: 'name', label: 'Nome Completo *', wide: true, placeholder: 'Ex: João Silva Machado' },
  { key: 'role', label: 'Função *', placeholder: 'Ex: Assessor' },
  { key: 'attribution', label: 'Atribuição *', placeholder: 'Ex: Escritor' },
  ...['Visão Econômica', 'Visão Política', 'Filosofia de Vida', 'Mini Biografia'].map(
    (label, i) => ({
      key: ['economicView', 'politicalView', 'philosophy', 'biography'][i],
      label,
      kind: 'textarea',
      wide: true,
    }),
  ),
]
watch(photo, (file) => {
  if (preview.value) URL.revokeObjectURL(preview.value)
  preview.value = ''
  if (file?.type?.startsWith('image/')) preview.value = URL.createObjectURL(file)
  else if (file) {
    error.value = 'Selecione uma imagem válida.'
    photo.value = null
  }
})
function submit() {
  error.value = ''
  if (!form.value.name.trim() || !form.value.role.trim() || !form.value.attribution.trim()) {
    error.value = 'Informe nome, função e atribuição.'
    return
  }
  error.value = 'Não foi possível salvar o redator. Serviço indisponível no momento.'
}
onScopeDispose(() => {
  if (preview.value) URL.revokeObjectURL(preview.value)
})
</script>
<style scoped>
.author-photo {
  display: flex;
  gap: 20px;
  align-items: center;
  margin: 24px 0;
}
.author-photo .q-avatar {
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.05);
  flex: none;
}
.author-photo .q-file {
  flex: 1;
  min-width: 0;
}
</style>
