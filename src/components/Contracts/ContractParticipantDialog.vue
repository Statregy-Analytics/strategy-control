<template>
  <q-dialog
    :model-value="true"
    :persistent="pending"
    @update:model-value="!pending && $emit('close')"
  >
    <q-card class="participant-dialog" aria-labelledby="participant-dialog-title">
      <header>
        <h2 id="participant-dialog-title">
          <img src="/icons/contracts/ct09/plus.svg" alt="" />Adicionar Participante ao Contrato
        </h2>
        <q-btn flat round dense aria-label="Fechar" :disable="pending" @click="$emit('close')">
          <span class="participant-dialog__close"
            ><img src="/icons/contracts/ct09/close-a.svg" alt="" /><img
              src="/icons/contracts/ct09/close-b.svg"
              alt=""
          /></span>
        </q-btn>
      </header>
      <form @submit.prevent="confirm">
        <div class="participant-dialog__body">
          <h3><img src="/icons/contracts/ct09/user.svg" alt="" />1. Participante</h3>
          <label-form text-label="Cliente" style="gap: 0">
            <customer-select
              v-model="selected"
              :clearable="false"
              :disable="pending"
              :lookup="lookup"
              dark
              hide-selected
              fill-input
              behavior="menu"
              popup-content-class="profile-glass-menu"
              placeholder="Selecione o cliente"
              dropdown-icon="img:/icons/contracts/ct09/chevron.svg"
            />
          </label-form>
          <p v-if="error" class="participant-dialog__error" role="alert">{{ error }}</p>
        </div>
        <footer>
          <q-btn outline no-caps label="Cancelar" :disable="pending" @click="$emit('close')" />
          <q-btn outline no-caps type="submit" :disable="!selected || pending" :loading="pending">
            <img src="/icons/contracts/ct09/confirm-plus.svg" alt="" />Confirmar inclusão
          </q-btn>
        </footer>
      </form>
    </q-card>
  </q-dialog>
</template>
<script setup>
import { computed, onScopeDispose, ref, watch } from 'vue'
import CustomerSelect from 'src/components/Finance/CustomerSelect.vue'
import LabelForm from 'src/components/Form/LabelForm.vue'
import { lookupCustomers } from 'src/services/customerService'
const props = defineProps({
  submit: { type: Function, required: true },
  existingIds: { type: Array, default: () => [] },
  busy: Boolean,
  lookup: { type: Function, default: lookupCustomers },
})
const emit = defineEmits(['close'])
const selected = ref(null),
  saving = ref(false),
  error = ref('')
const pending = computed(() => props.busy || saving.value)
let active = true
onScopeDispose(() => {
  active = false
})
watch(selected, () => {
  error.value = ''
})
async function confirm() {
  if (!selected.value || pending.value) return
  if (props.existingIds.includes(selected.value)) {
    error.value = 'Este cliente já está vinculado.'
    return
  }
  saving.value = true
  error.value = ''
  try {
    const result = await props.submit(selected.value)
    if (!active) return
    if (result?.success === true) emit('close')
    else
      error.value = result?.message || 'Não foi possível incluir o participante. Tente novamente.'
  } catch {
    if (active) error.value = 'Não foi possível incluir o participante. Tente novamente.'
  } finally {
    if (active) saving.value = false
  }
}
</script>
<style scoped>
.participant-dialog {
  width: 512px;
  max-width: calc(100vw - 32px);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 12px;
  backdrop-filter: blur(20px);
  background:
    linear-gradient(192deg, rgba(0, 0, 0, 0.19), rgba(0, 0, 0, 0.03)), rgba(23, 29, 43, 0.94);
  box-shadow: 4px 4px 12px rgba(0, 0, 0, 0.13);
}
.participant-dialog header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
  min-height: 52px;
  gap: 8px;
}
.participant-dialog h2 {
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  line-height: 20px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.7px;
}
.participant-dialog header .q-btn {
  min-width: 24px;
  min-height: 24px;
}
.participant-dialog__close {
  display: block;
  position: relative;
  width: 16px;
  height: 16px;
}
.participant-dialog__close img {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
.participant-dialog__body {
  padding: 24px;
}
.participant-dialog h3 {
  margin: 0 0 12px;
  padding-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  line-height: 16px;
  font-weight: 700;
  letter-spacing: 0.6px;
  text-transform: uppercase;
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
}
.participant-dialog :deep(.q-field) {
  margin-top: 8px;
}
.participant-dialog :deep(.LabelForm > span) {
  line-height: 14px;
}
.participant-dialog :deep(.q-field__control) {
  height: 36px;
  min-height: 36px;
  border-radius: 8px;
  color: #fff;
  background: linear-gradient(182deg, rgba(0, 0, 0, 0.19), rgba(0, 0, 0, 0.03));
}
.participant-dialog :deep(.q-field__control:before) {
  border-color: rgba(255, 255, 255, 0.12);
}
.participant-dialog :deep(.q-field__native),
.participant-dialog :deep(.q-field__input) {
  min-height: 36px;
  padding-top: 0;
  padding-bottom: 0;
  color: #fff;
  font-size: 14px;
}
.participant-dialog :deep(input::placeholder) {
  color: #94a8c2;
  opacity: 1;
}
.participant-dialog :deep(.q-field__append) {
  height: 36px;
}
.participant-dialog :deep(.q-select__dropdown-icon) {
  width: 16px;
  height: 16px;
  font-size: 16px;
}
.participant-dialog footer {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  padding: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.12);
}
.participant-dialog footer .q-btn {
  min-height: 36px;
  padding: 0 15px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  background: rgba(255, 255, 255, 0.06);
}
.participant-dialog footer .q-btn:before {
  border-color: rgba(255, 255, 255, 0.2);
}
.participant-dialog footer img {
  margin-right: 24px;
}
.participant-dialog__error {
  margin: 12px 0 0;
  color: #ff8a8a;
  font-size: 12px;
  overflow-wrap: anywhere;
}
@media (max-width: 600px) {
  .participant-dialog h2 {
    letter-spacing: 0.3px;
  }
  .participant-dialog__body {
    padding: 20px;
  }
}
</style>
