<template>
  <q-dialog :model-value="true" :persistent="busy" @update:model-value="!busy && emit('close')">
    <q-card class="transaction-state">
      <q-form @submit="confirm">
        <h2>{{ titles[mode] }}</h2>
        <div class="transaction-state__body">
          <template v-if="mode === 'correction'">
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
            :disable="busy || (mode !== 'receipt' && !content.trim())"
            :loading="busy"
          />
        </footer>
      </q-form>
    </q-card>
  </q-dialog>
</template>
<script setup>
import { ref, onScopeDispose } from 'vue'
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
}
const content = ref(''),
  busy = ref(false),
  error = ref('')
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
  if (busy.value || (props.mode !== 'receipt' && !content.value.trim())) return
  busy.value = true
  emit('busy', true)
  error.value = ''
  try {
    const result = await props.submit(content.value.trim())
    if (active && complete) emit('completed', result)
  } catch {
    if (active) error.value = 'Não foi possível concluir a ação. Tente novamente.'
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
