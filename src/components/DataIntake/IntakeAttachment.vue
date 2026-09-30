<template>
  <div class="intake-attachment q-py-sm">
    <div class="text-weight-medium">{{ field.label }}<span v-if="requirement"> · mínimo {{ requirement.minCount }}</span></div>
    <div v-if="error" class="text-negative q-my-sm" role="alert">{{ error }}</div>
    <div v-if="!disabled" class="row q-col-gutter-sm q-mt-xs">
      <label-form v-if="!requirement?.documentTypeId" class-name="col-12 col-md-5" text-label="Tipo de documento">
        <q-select v-model="documentTypeId" outlined dense emit-value map-options :options="typeOptions" :disable="jobs.length > 0 || busy" aria-label="Tipo de documento do anexo" />
      </label-form>
      <label-form class-name="col-12 col-md" text-label="Adicionar arquivos">
        <q-file :model-value="null" outlined dense multiple :accept="accept" :max-file-size="26214400" :disable="busy || !resolvedType || !customerId" :aria-label="`Adicionar ${field.label}`" @update:model-value="addFiles" @rejected="error = 'Use PDF, JPEG ou PNG de até 25 MB, compatível com este campo.'" />
      </label-form>
    </div>
    <div v-if="!disabled" class="text-caption text-muted q-mt-xs">PDF, JPEG ou PNG; até 25 MB por arquivo. Os arquivos serão enviados ao salvar. Limite de 10 anexos por submissão.</div>
    <q-list v-if="jobs.length" dense>
      <q-item v-for="job in jobs" :key="job.key">
        <q-item-section avatar><q-icon :name="job.linked ? 'check_circle' : 'attach_file'" :color="job.linked ? 'positive' : undefined" /></q-item-section>
        <q-item-section><q-item-label class="intake-file-name">{{ job.file.name }}</q-item-label><q-item-label caption>{{ job.linked ? 'Vinculado' : job.documentId ? 'Enviado; vínculo pendente' : 'Aguardando envio' }}</q-item-label></q-item-section>
        <q-item-section v-if="!job.documentId && !busy && !disabled" side><q-btn flat round dense icon="close" aria-label="Remover arquivo pendente" @click="remove(job)" /></q-item-section>
      </q-item>
    </q-list>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import LabelForm from 'src/components/Form/LabelForm.vue'
const props = defineProps({ field: { type: Object, required: true }, requirement: { type: Object, default: null }, types: { type: Array, default: () => [] }, customerId: { type: String, default: '' }, jobs: { type: Array, default: () => [] }, busy: Boolean, disabled: Boolean })
const emit = defineEmits(['add', 'remove'])
const documentTypeId = ref(null), error = ref('')
const resolvedType = computed(() => props.requirement?.documentTypeId || documentTypeId.value)
const typeOptions = computed(() => props.types.map((type) => ({ label: type.name, value: type.id })))
const acceptedTypes = computed(() => ['application/pdf', 'image/jpeg', 'image/png'].filter((type) => !props.requirement?.allowedContentTypes || props.requirement.allowedContentTypes.includes(type)))
const accept = computed(() => acceptedTypes.value.join(','))
function addFiles(files) {
  error.value = ''
  for (const file of files || []) {
    if (!acceptedTypes.value.includes(file.type) || file.size > 26214400 || file.size === 0) { error.value = 'Arquivo inválido. Use PDF, JPEG ou PNG não vazio de até 25 MB.'; continue }
    emit('add', { key: crypto.randomUUID(), fieldKey: props.field.key, file, documentTypeId: resolvedType.value, countryId: props.requirement?.countryId, requirementId: props.requirement?.requirementId, documentId: null, linked: false })
  }
}
const remove = (job) => emit('remove', job.key)
</script>
<style scoped>
.intake-file-name { overflow-wrap: anywhere; }
</style>
