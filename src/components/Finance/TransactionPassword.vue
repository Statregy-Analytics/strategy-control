<template>
  <q-dialog :model-value="true" :persistent="busy" @update:model-value="!busy && $emit('close')">
    <q-card class="transaction-password">
      <q-form @submit="confirm" :inert="busy || undefined">
        <header>
          <div>
            <h2>Confirme sua senha</h2>
            <p>Para concluir esta ação, digite a senha do admin.</p>
          </div>
          <q-btn
            flat
            round
            dense
            aria-label="Fechar confirmação"
            :disable="busy"
            @click="$emit('close')"
            ><span class="transaction-password__close"
              ><img src="/icons/transactions/imgVector.svg" alt="" /><img
                src="/icons/transactions/imgVector1.svg"
                alt="" /></span
          ></q-btn>
        </header>
        <p class="transaction-password__summary">{{ summary }}</p>
        <label-form text-label="Senha do admin"
          ><q-input
            v-model="password"
            type="password"
            autocomplete="current-password"
            outlined
            dense
            aria-label="Senha do admin"
        /></label-form>
        <p class="transaction-password__help">
          Pedida ao executar, aprovar, reprovar, cancelar ou corrigir uma transação. Nada é apagado:
          cancelar ou corrigir registra o motivo e fica no histórico.
        </p>
        <p v-if="error" class="text-negative" role="alert">{{ error }}</p>
        <footer>
          <q-btn outline no-caps label="Cancelar" :disable="busy" @click="$emit('close')" /><q-btn
            outline
            no-caps
            type="submit"
            label="Confirmar"
            :disable="!password || busy"
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
  summary: { type: String, required: true },
  submit: { type: Function, required: true },
})
const emit = defineEmits(['close', 'completed', 'busy'])
const password = ref(''),
  busy = ref(false),
  error = ref('')
let active = true
onScopeDispose(() => {
  active = false
  password.value = ''
})
async function confirm() {
  if (busy.value || !password.value) return
  busy.value = true
  error.value = ''
  emit('busy', true)
  try {
    const result = await props.submit(password.value)
    password.value = ''
    if (active) {
      busy.value = false
      emit('busy', false)
      emit('completed', result)
    }
  } catch (e) {
    password.value = ''
    if (active)
      error.value =
        e.response?.status === 409
          ? 'A solicitação mudou. Feche e confira os dados antes de tentar novamente.'
          : 'Não foi possível confirmar a ação. Confira a senha e tente novamente.'
  } finally {
    if (active) {
      busy.value = false
      emit('busy', false)
    }
  }
}
</script>
<style scoped>
.transaction-password {
  width: 512px;
  max-width: calc(100vw - 32px);
  padding: 24px;
  border: 1px solid #269ed661;
  border-radius: 14px;
  color: #fff;
  background: linear-gradient(90deg, #ffffff14, #ffffff08, #ffffff12), #18212e;
  backdrop-filter: blur(20px);
}
header {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-start;
}
h2 {
  font-size: 18px;
  line-height: 28px;
  margin: 0;
  font-weight: 600;
}
p {
  font-size: 14px;
  line-height: 20px;
  color: #ffffffb8;
  margin: 0;
}
.transaction-password__summary {
  margin: 40px 0 16px;
  padding: 12px;
  border: 1px solid #2b7fff;
  border-radius: 8px;
  color: #bedbff;
  background: #ffffff1a;
  overflow-wrap: anywhere;
}
.transaction-password__help {
  font-size: 12px;
  line-height: 16px;
  margin-top: 8px;
}
footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 24px;
}
.q-btn {
  color: #ffffffb8;
  border-radius: 8px;
}
.transaction-password__close {
  position: relative;
  width: 16px;
  height: 16px;
  display: block;
}
.transaction-password__close img {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
.transaction-password :deep(input) {
  color: #fff;
}
</style>
