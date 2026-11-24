<template>
  <q-dialog :model-value="true" @update:model-value="!$event && $emit('close')">
    <q-card class="contract-operation-dialog">
      <header>
        <h2>Adicionar Operação Intradiária</h2>
        <q-btn flat dense aria-label="Fechar operação" @click="$emit('close')"
          ><span class="operation-close"
            ><img src="/icons/contracts/ct12-close-a.svg" alt="" /><img
              src="/icons/contracts/ct12-close-b.svg"
              alt="" /></span
        ></q-btn>
      </header>
      <div class="operation-fields">
        <label-form text-label="Paridade *"
          ><q-input
            v-model="form.pair"
            outlined
            dense
            dark
            autofocus
            aria-label="Paridade"
            placeholder="Ex: BTCUSDT"
            maxlength="40"
        /></label-form>
        <label-form text-label="Direção *"
          ><div class="operation-direction" role="group" aria-label="Direção">
            <q-btn
              v-for="direction in ['LONG', 'SHORT']"
              :key="direction"
              flat
              :label="direction"
              :aria-pressed="form.direction === direction"
              :class="{ selected: form.direction === direction }"
              @click="form.direction = direction"
            /></div
        ></label-form>
        <label-form class="operation-wide" text-label="Instrumento *"
          ><q-input
            v-model="form.instrument"
            outlined
            dense
            dark
            aria-label="Instrumento"
            placeholder="Ex: USDT Perpetuals"
            maxlength="120"
        /></label-form>
        <label-form v-for="field in numberFields" :key="field.key" :text-label="field.label"
          ><q-input
            v-model="form[field.key]"
            outlined
            dense
            dark
            :aria-label="field.label"
            :placeholder="field.placeholder"
            :inputmode="field.key === 'type' ? 'text' : 'decimal'"
            maxlength="80"
        /></label-form>
        <label-form class="operation-wide" text-label="Data e Hora da Operação *"
          ><q-input
            v-model="form.occurredAt"
            outlined
            dense
            dark
            type="datetime-local"
            aria-label="Data e Hora da Operação"
        /></label-form>
      </div>
      <p class="operation-notice">
        <strong>Importante:</strong> Esta operação será registrada na Performance Histórica do
        contrato. A Relação P/L é o resultado desta operação (já com os custos) e entra no valor do
        contrato; no fechamento, vale a opção de Resultado no fechamento definida em Motores e
        Operações. Os Custos de Operação são só informativos.
      </p>
      <footer>
        <q-btn outline no-caps label="Cancelar" @click="$emit('close')" /><q-btn
          outline
          no-caps
          label="Registrar Operação"
          disable
          aria-describedby="operation-unavailable"
        />
      </footer>
      <p id="operation-unavailable" class="operation-unavailable" role="status">
        Registro de operações indisponível no momento. Nenhuma operação foi enviada.
      </p>
    </q-card>
  </q-dialog>
</template>
<script setup>
import { reactive } from 'vue'
import LabelForm from 'src/components/Form/LabelForm.vue'
defineEmits(['close'])
const form = reactive({
  pair: '',
  direction: 'LONG',
  instrument: '',
  entry: '',
  exit: '',
  quantity: '',
  type: '',
  result: '',
  costs: '',
  occurredAt: '',
})
const numberFields = [
  { key: 'entry', label: 'Preço de Entrada *', placeholder: 'Ex: 20.291,00' },
  { key: 'exit', label: 'Preço de Saída *', placeholder: 'Ex: 98.291,00' },
  { key: 'quantity', label: 'Quantidade *', placeholder: 'Ex: 0,05' },
  { key: 'type', label: 'Tipo de Operação', placeholder: 'Ex: Troca' },
  { key: 'result', label: 'Relação P/L', placeholder: 'Ex: +25,1791' },
  { key: 'costs', label: 'Custos de Operação', placeholder: 'Ex: 5,951' },
]
</script>
<style scoped>
.contract-operation-dialog {
  scrollbar-width: thin;
  scrollbar-color: #ffffff40 transparent;
  color-scheme: dark;
  width: 512px;
  max-width: calc(100vw - 32px);
  padding: 24px;
  border: 1px solid #ffffff1f;
  border-radius: 12px;
  background: linear-gradient(211deg, #ffffff08, #0000000a), var(--sa-dialog-bg, #192330);
  color: var(--sa-text, #fff);
  backdrop-filter: blur(20px);
}
header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 24px;
}
h2 {
  font:
    700 14px/20px Inter,
    sans-serif;
  letter-spacing: 0.7px;
  text-transform: uppercase;
  margin: 0;
}
header .q-btn {
  position: absolute;
  right: 12px;
  top: 12px;
  min-height: 16px;
  padding: 0;
}
.operation-close {
  display: block;
  position: relative;
  width: 16px;
  height: 16px;
  opacity: 0.7;
}
.operation-close img {
  position: absolute;
  top: 3px;
  left: 3px;
}
.operation-fields {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}
.operation-wide {
  grid-column: 1/-1;
}
.operation-fields :deep(.LabelForm) {
  min-width: 0;
  gap: 8px !important;
}
.operation-fields :deep(.LabelForm > span) {
  font:
    500 14px/14px Inter,
    sans-serif !important;
  color: #fff;
}
.operation-fields :deep(.q-field__control),
.operation-fields :deep(.q-field__marginal) {
  min-height: 36px;
  height: 36px;
  border-radius: 8px;
  background: #ffffff0d;
}
.operation-fields :deep(.q-field__native) {
  font:
    400 14px/20px Inter,
    sans-serif;
  min-width: 0;
  padding: 8px 0;
}
.operation-fields :deep(.q-field__native::placeholder) {
  color: #94a8c2;
  opacity: 1;
}
.operation-fields :deep(.q-field--focused .q-field__control:after) {
  border-color: #ffffff80;
}
.operation-direction {
  display: flex;
  gap: 8px;
}
.operation-direction .q-btn {
  flex: 1;
  min-height: 36px;
  padding: 4px 8px;
  background: #ffffff0d;
  border: 1px solid #ffffff1f;
  border-radius: 8px;
}
.operation-direction .selected {
  background: #00bc7d33;
  border-color: #00bc7d8c;
  color: #000;
}
.operation-notice {
  margin: 16px 0;
  padding: 12px;
  font:
    400 12px/19.5px Inter,
    sans-serif;
  border: 1px solid #ffffff1f;
  border-radius: 10px;
  background: #0000000a;
}
footer {
  display: flex;
  gap: 12px;
  border-top: 1px solid #ffffff1f;
  padding-top: 16px;
}
footer .q-btn {
  flex: 1;
  min-height: 36px;
  padding: 4px;
  border-radius: 8px;
  background: #ffffff0f;
  font-size: 14px;
}
.operation-unavailable {
  margin: 12px 0 0;
  color: #ffffffb8;
  font-size: 11px;
  line-height: 16px;
}
@media (max-width: 420px) {
  .operation-fields {
    grid-template-columns: 1fr;
  }
  header {
    padding-right: 10px;
  }
}
</style>
