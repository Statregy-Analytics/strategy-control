<template>
  <q-dialog :model-value="true" :persistent="busy" @update:model-value="!busy && emit('close')">
    <q-card class="transaction-state">
      <q-form @submit="confirm">
        <h2>{{ titles[mode] }}</h2>
        <div class="transaction-state__body">
          <template v-if="mode === 'attachment'">
            <label-form text-label="Upload de Comprovante (PDF)"
              ><q-file
                v-model="file"
                outlined
                dense
                accept=".pdf,application/pdf"
                clearable
                aria-label="Upload de Comprovante (PDF)"
                :disable="busy"
            /></label-form>
            <label-form text-label="Descrição do documento" class="q-mt-md"
              ><q-input
                v-model="content"
                outlined
                dense
                aria-label="Descrição do documento"
                placeholder="Ex: Comprovante bancário"
                :disable="busy"
            /></label-form>
          </template>
          <template v-else-if="workflow">
            <p class="transaction-state__notice" :class="'transaction-state__notice--' + mode">
              {{ workflow.notice }}
            </p>
            <label-form :text-label="workflow.label">
              <q-input
                v-model="content"
                outlined
                :type="mode === 'execute' ? 'text' : 'textarea'"
                :autogrow="mode !== 'execute'"
                :aria-label="workflow.label"
                :placeholder="workflow.placeholder"
                :disable="busy"
              />
            </label-form>
          </template>
          <template v-else-if="mode === 'correction'">
            <p class="transaction-state__notice">Solicitar correção ao responsável</p>
            <label-form text-label="Descrição da correção necessária">
              <q-input
                v-model="content"
                outlined
                type="textarea"
                autogrow
                aria-label="Descrição da correção necessária"
                placeholder="Descreva o que precisa ser corrigido"
                :disable="busy"
              />
            </label-form>
          </template>
          <label-form v-else-if="mode === 'observation'" text-label="Observação Interna">
            <q-input
              v-model="content"
              outlined
              type="textarea"
              autogrow
              aria-label="Observação Interna"
              placeholder="Adicione uma observação que ficará registrada no histórico"
              :disable="busy"
            />
          </label-form>
          <div v-else class="transaction-state__receipt">
            <img src="/icons/transactions/receipt-file.svg" alt="" width="64" height="64" />
            <p>Visualização de comprovante</p>
            <q-btn outline no-caps label="Download PDF" :loading="busy" @click="download" />
          </div>
          <p v-if="error" role="alert" class="text-negative">{{ error }}</p>
        </div>
        <footer>
          <q-btn outline no-caps label="Voltar" :disable="busy" @click="emit('close')" />
          <q-btn
            outline
            no-caps
            type="submit"
            label="Confirmar Ação"
            :disable="busy || !valid"
            :loading="busy"
          />
        </footer>
      </q-form>
    </q-card>
  </q-dialog>
</template>
<script setup>
import { computed, ref, onScopeDispose } from 'vue'
import LabelForm from 'src/components/Form/LabelForm.vue'
const props = defineProps({
  mode: { type: String, required: true },
  submit: { type: Function, required: true },
})
const emit = defineEmits(['close', 'completed', 'busy'])
const titles = {
  correction: 'Solicitar correção',
  observation: 'Adicionar observação',
  receipt: 'Ver comprovante',
  attachment: 'Anexar documento',
  validate: 'Validar',
  approve: 'Aprovar',
  reject: 'Rejeitar',
  execute: 'Executar operação',
  cancel: 'Cancelar solicitação',
}
const workflows = {
  validate: {
    notice: 'Você está validando esta solicitação',
    label: 'Observação (opcional)',
    placeholder: 'Adicione comentários sobre a validação',
  },
  approve: {
    notice: 'Você está aprovando esta solicitação',
    label: 'Observação (opcional)',
    placeholder: 'Adicione comentários sobre a aprovação',
  },
  reject: {
    notice: 'Você está reprovando esta solicitação',
    label: 'Motivo da reprovação (obrigatório)',
    placeholder: 'Descreva o motivo da reprovação',
  },
  execute: {
    notice: 'Você está executando esta operação',
    label: 'Confirmação',
    placeholder: 'Digite CONFIRMAR para executar',
  },
  cancel: {
    notice: 'Você está cancelando esta solicitação',
    label: 'Motivo do cancelamento (obrigatório)',
    placeholder: 'Descreva o motivo do cancelamento',
  },
}
const workflow = computed(() => workflows[props.mode])
const content = ref(''),
  file = ref(null),
  busy = ref(false),
  error = ref('')
const valid = computed(
  () =>
    props.mode === 'receipt' ||
    (props.mode === 'attachment'
      ? Boolean(
          file.value?.size > 0 &&
          /\.pdf$/i.test(file.value.name) &&
          (!file.value.type || file.value.type === 'application/pdf'),
        )
      : false) ||
    ['validate', 'approve'].includes(props.mode) ||
    (props.mode === 'execute'
      ? content.value.trim() === 'CONFIRMAR'
      : props.mode !== 'attachment' && Boolean(content.value.trim())),
)
let active = true
onScopeDispose(() => {
  active = false
})
async function confirm() {
  if (props.mode === 'receipt') {
    emit('close')
    return
  }
  return perform(true)
}
async function download() {
  return perform(false)
}
async function perform(complete) {
  if (busy.value || !valid.value) return
  busy.value = true
  emit('busy', true)
  error.value = ''
  try {
    const result = await props.submit(
      props.mode === 'attachment'
        ? { file: file.value, description: content.value.trim() }
        : content.value.trim(),
    )
    if (active && complete) emit('completed', result)
  } catch {
    if (active)
      error.value =
        props.mode === 'attachment'
          ? 'Não foi possível enviar o comprovante. O arquivo e a descrição foram mantidos.'
          : 'Não foi possível concluir a ação. Tente novamente.'
  } finally {
    if (active) {
      busy.value = false
      emit('busy', false)
    }
  }
}
</script>
<style scoped>
.transaction-state {
  width: 512px;
  max-width: calc(100vw - 32px);
  padding: 24px;
  border: 1px solid #ffffff47;
  border-radius: 12px;
  color: #fff;
  background: linear-gradient(196deg, #ffffff14, #ffffff08), #18212e;
  backdrop-filter: blur(20px);
  box-shadow: 4px 4px 12px #0000003d;
}
h2 {
  margin: 0;
  font-size: 18px;
  line-height: 26px;
  font-weight: 600;
}
.transaction-state__body {
  margin-top: 40px;
  padding-top: 16px;
  border-top: 1px solid #ffffff2e;
}
.transaction-state__notice {
  padding: 12px;
  border: 1px solid #fee685;
  border-radius: 10px;
  color: #fee685;
  background: #ffffff0f;
  margin: 0 0 16px;
}
.transaction-state__receipt {
  border: 1px solid #ffffff29;
  border-radius: 12px;
  padding: 32px;
  background: #00000024;
  text-align: center;
}
.transaction-state__notice--approve {
  color: #8abaff;
  border-color: #438cff;
}
.transaction-state__notice--reject,
.transaction-state__notice--cancel {
  color: #ffa1ad;
  border-color: #fb2c36;
}
.transaction-state__notice--execute {
  color: #c4c9ff;
  border-color: #b8bfff;
}
.transaction-state__receipt p {
  color: #ffffff99;
  margin: 16px 0;
}
footer {
  display: flex;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;
}
.q-btn {
  border-radius: 8px;
  color: #ffffffb8;
  min-height: 36px;
}
.transaction-state :deep(.q-field__control) {
  border-radius: 12px;
  background: #00000024;
}
.transaction-state :deep(textarea) {
  color: #fff;
  min-height: 64px;
}
.transaction-state :deep(.q-field__control:before) {
  border-color: #ffffff29;
}
</style>

<style scoped>
.transaction-state__notice--validate {
  color: #ffffffb8;
  border: 0.8px solid #008236;
  background: linear-gradient(87.5deg, #ffffff1a, #ffffff09 50%, #ffffff13);
  font:
    400 14px/20px Inter,
    sans-serif;
}
.transaction-state :deep(textarea) {
  min-height: 46px;
}
.transaction-state :deep(.q-field--textarea .q-field__control) {
  min-height: 64px;
}
</style>

<style scoped>
.transaction-state [role='alert'] {
  color: #ffa1ad !important;
}
</style>
