<template>
  <q-dialog :model-value="true" @update:model-value="$emit('close')">
    <q-card class="wallet-capital" aria-labelledby="wallet-capital-title">
      <header>
        <h2 id="wallet-capital-title">
          {{ client ? 'Configurar Vínculo' : 'Selecionar Cliente' }}
        </h2>
        <button type="button" aria-label="Fechar" @click="$emit('close')">
          <img :src="asset(client ? configNode : '2325-281', 'Icon')" alt="" />
        </button>
      </header>
      <section v-if="!client" class="wallet-capital__body">
        <p class="wallet-capital__info">
          <img :src="asset('2325-281', 'Info')" alt="" />Escolha um cliente por vez. Na próxima
          etapa você define quanto sai da Carteira Strategy e da Carteira de Depósito dele, moeda
          por moeda; o capital do contrato é a soma dos aportes.
        </p>
        <q-input
          v-model="search"
          outlined
          dense
          debounce="350"
          placeholder="Nome, ID, CPF/CNPJ..."
          aria-label="Buscar clientes para aporte"
          @update:model-value="loadCustomers"
          ><template #prepend><img :src="asset('2325-281', 'Search')" alt="" /></template
        ></q-input>
        <resource-state :state="customers.state" @retry="loadCustomers">
          <p v-if="!customers.state.data?.length" class="wallet-capital__hint">
            Nenhum cliente encontrado.
          </p>
          <div class="wallet-capital__clients">
            <button
              v-for="customer in customers.state.data || []"
              :key="customer.customerId"
              type="button"
              :disabled="existingIds.includes(customer.customerId)"
              @click="choose(customer)"
            >
              <span class="wallet-capital__avatar"
                ><img
                  :src="
                    asset(
                      '2325-281',
                      ['LegalEntity', 'Organization', 'PJ'].includes(customer.personType)
                        ? 'Building2'
                        : 'User',
                    )
                  "
                  alt="" /></span
              ><span class="wallet-capital__identity"
                ><strong>{{ customer.displayName }}</strong
                ><small>{{ customer.maskedDocument }}</small></span
              >
            </button>
          </div>
        </resource-state>
      </section>
      <section v-else class="wallet-capital__body">
        <div class="wallet-capital__customer">
          <span class="wallet-capital__avatar"
            ><img :src="asset(picking ? '2326-281' : configNode, 'User')" alt=""
          /></span>
          <div class="wallet-capital__identity">
            <strong>{{ client.displayName }}</strong
            ><small>{{ client.maskedDocument }}</small>
          </div>
        </div>
        <contract-wallet-sources :flow="flow" :currency="currency" />
        <label-form text-label="Observação (opcional)"
          ><q-input
            v-model="note"
            outlined
            dense
            type="textarea"
            rows="2"
            placeholder="Informações adicionais sobre este vínculo..."
            aria-label="Observação do vínculo"
        /></label-form>
      </section>
      <footer>
        <q-btn
          outline
          no-caps
          :label="client ? 'Voltar' : 'Cancelar'"
          @click="client ? back() : $emit('close')"
        /><q-btn
          v-if="client"
          outline
          no-caps
          label="Confirmar Vínculo"
          :disable="!state.valid || loadingQuotes || wallets.state.loading || !!wallets.state.error"
          @click="confirm"
        />
      </footer>
    </q-card>
  </q-dialog>
</template>
<script setup>
import { computed } from 'vue'
import ResourceState from 'src/components/Finance/ResourceState.vue'
import LabelForm from 'src/components/Form/LabelForm.vue'
import ContractWalletSources from './ContractWalletSources.vue'
import { useContractWalletCapital } from 'src/composables/useContractWalletCapital'
const props = defineProps({
  initialClient: { type: Object, default: null },
  currency: { type: String, required: true },
  existingIds: { type: Array, default: () => [] },
  read: { type: Function, default: undefined },
  lookup: { type: Function, default: undefined },
})
const emit = defineEmits(['close', 'confirm'])
const flow = useContractWalletCapital(props, emit)
const {
  customers,
  wallets,
  search,
  client,
  lines,
  note,
  picking,
  state,
  loadingQuotes,
  loadCustomers,
  choose,
  back,
  confirm,
} = flow
const configNode = computed(() => (lines.value.length > 1 ? '2325-594' : '2325-394'))
const asset = (node, name) => `/icons/contracts/wallet-capital/${node}-img${name}.svg`
</script>
<style scoped>
.wallet-capital {
  width: 512px;
  max-width: calc(100vw - 32px);
  max-height: calc(100dvh - 32px);
  display: flex;
  flex-direction: column;
  color: #fff;
  background: linear-gradient(215deg, #0000001f, #00000005), rgba(23, 29, 43, 0.94);
  border: 1px solid #ffffff1f;
  border-radius: 12px;
  backdrop-filter: blur(20px);
  box-shadow: 4px 4px 12px #0002;
}
.wallet-capital header {
  position: relative;
  flex: none;
  padding: 16px 48px 16px 24px;
  border-bottom: 1px solid #ffffff1f;
}
.wallet-capital h2 {
  font-size: 14px;
  font-weight: 700;
  line-height: 20px;
  letter-spacing: 0.7px;
  text-transform: uppercase;
  margin: 0;
}
.wallet-capital header button {
  position: absolute;
  right: 16px;
  top: 16px;
  display: grid;
  place-items: center;
  width: 20px;
  height: 20px;
  padding: 2px;
  border: 0;
  background: transparent;
  cursor: pointer;
}
.wallet-capital__body {
  padding: 24px;
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow-y: auto;
  scrollbar-color: #ffffff50 transparent;
}
.wallet-capital p {
  margin: 0;
}
.wallet-capital__info {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  border: 1px solid #fff3;
  background: #ffffff0f;
  border-radius: 10px;
  font-size: 12px;
  line-height: 19.5px;
}
.wallet-capital__info img {
  flex: none;
}
.wallet-capital__clients {
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-height: 440px;
  overflow: auto;
}
.wallet-capital__clients > button {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border: 1.6px solid #ffffff1f;
  border-radius: 10px;
  background: transparent;
  color: inherit;
  text-align: left;
  cursor: pointer;
}
.wallet-capital__clients > button:hover {
  background: #ffffff1a;
  border-color: #2b7fff;
}
.wallet-capital__clients > button:disabled {
  opacity: 0.4;
  cursor: default;
}
.wallet-capital__avatar {
  width: 32px;
  height: 32px;
  display: grid;
  place-items: center;
  border: 1px solid #fff;
  border-radius: 50%;
  flex: none;
}
.wallet-capital__identity {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  overflow-wrap: anywhere;
}
.wallet-capital__identity strong {
  font-size: 14px;
  line-height: 20px;
  font-weight: 600;
}
.wallet-capital__identity small {
  font-size: 10px;
  color: #ffffffb8;
}
.wallet-capital__customer {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border: 1px solid #fff3;
  border-radius: 10px;
  background: #ffffff0f;
}
.wallet-capital h3 {
  font-size: 14px;
  font-weight: 500;
  line-height: 20px;
  margin: 0 0 4px;
}
.wallet-capital__hint {
  font-size: 12px;
  line-height: 18px;
  color: #ffffffb8;
  overflow-wrap: anywhere;
}
.wallet-capital__lines {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.wallet-capital__line {
  padding: 12px 14px;
  border: 1px solid #fff3;
  border-radius: 10px;
  background: #ffffff0f;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.wallet-capital__line-heading {
  display: flex;
  gap: 8px;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  flex-wrap: wrap;
}
.wallet-capital__line-heading strong {
  font-size: 13px;
  font-weight: 600;
}
.wallet-capital__line-heading span {
  color: #ffffffb8;
}
.wallet-capital__unit {
  font-size: 12px;
  font-weight: 700;
  color: #ffffffb8;
}
.wallet-capital__line-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  font-size: 12px;
  color: #ffffffb8;
}
.wallet-capital__line-footer button {
  font: inherit;
  font-weight: 500;
  color: inherit;
  background: none;
  border: 0;
  cursor: pointer;
  padding: 0;
}
.wallet-capital__error {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  font-size: 12px;
  line-height: 16px;
  font-weight: 500;
  color: #ffc9c9;
}
.wallet-capital__error img {
  flex: none;
}
.wallet-capital__add {
  width: 100%;
  margin-top: 16px;
  min-height: 36px;
  border-radius: 8px;
  color: #ffffffb8;
}
.wallet-capital__add:deep(:before) {
  border: 1px dashed #fff3;
}
.wallet-capital__add.open:deep(:before) {
  border: 1.2px solid #2b7fff;
}
.wallet-capital__add img {
  margin-right: 8px;
}
.wallet-capital__picker {
  border: 1px solid #ffffff1f;
  padding: 4px;
  margin-top: 8px;
  border-radius: 8px;
  background: linear-gradient(195deg, #0003, #0000000a);
  box-shadow: 0 8px 12px #0006;
}
.wallet-capital__picker [role='tablist'] {
  display: flex;
  gap: 4px;
  padding: 3px;
  border-radius: 6px;
  background: #ffffff0f;
}
.wallet-capital__picker [role='tab'] {
  flex: 1;
  min-width: 0;
  padding: 6px 10px;
  border: 1px solid transparent;
  border-radius: 5px;
  background: none;
  color: #ffffffb8;
  font-size: 13px;
  cursor: pointer;
}
.wallet-capital__picker [role='tab'][aria-selected='true'] {
  border-color: #2b7fff;
  background: #ffffff1a;
  color: #fff;
  font-weight: 600;
}
.wallet-capital__picker [role='option'] {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 8px 10px;
  width: 100%;
  border: 0;
  border-radius: 6px;
  color: #fff;
  background: none;
  text-align: left;
  font-size: 14px;
  cursor: pointer;
}
.wallet-capital__picker [role='option'] span {
  min-width: 0;
  overflow-wrap: anywhere;
}
.wallet-capital__picker [role='option'] strong {
  font-size: 12px;
  font-weight: 600;
  color: #ffffffb8;
}
.wallet-capital__picker [role='option']:hover {
  background: #ffffff1a;
}
.wallet-capital__picker [role='option']:disabled {
  opacity: 0.4;
  cursor: default;
}
.wallet-capital__picker > p {
  margin: 16px 0 0;
  padding: 0 6px 6px;
}
.wallet-capital__conversion {
  padding: 14px 16px;
  border: 1px solid #fff3;
  border-radius: 10px;
  background: #ffffff0f;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.wallet-capital h4 {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  font-weight: 600;
  margin: 0;
}
.wallet-capital__conversion table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
  table-layout: fixed;
}
.wallet-capital__conversion th,
.wallet-capital__conversion td {
  padding: 7px 3px;
  border-bottom: 1px solid #ffffff1a;
  overflow-wrap: anywhere;
  text-align: left;
  font-weight: 400;
}
.wallet-capital__conversion th {
  color: #ffffffb8;
  font-weight: 500;
}
.wallet-capital__conversion th:nth-last-child(-n + 2),
.wallet-capital__conversion td:nth-last-child(-n + 2) {
  text-align: right;
}
.wallet-capital__conversion td:last-child {
  font-weight: 600;
}
.wallet-capital__total {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding-top: 8px;
}
.wallet-capital__total strong {
  font-size: 12px;
}
.wallet-capital__total strong:last-child {
  font-size: 16px;
  overflow-wrap: anywhere;
}
.wallet-capital footer {
  display: flex;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid #ffffff1f;
  flex: none;
}
.wallet-capital footer:deep(.q-btn) {
  flex: 1;
  min-width: 0;
  min-height: 36px;
  border-radius: 8px;
  font-size: 14px;
  background: #ffffff0f;
}
.wallet-capital footer:deep(.q-btn:before) {
  border-color: #ffffff47;
}
.wallet-capital footer:deep(.q-btn.disabled) {
  opacity: 0.4 !important;
}
.wallet-capital:deep(.q-field__control) {
  height: 36px;
  min-height: 36px;
  border-radius: 8px;
}
.wallet-capital:deep(.q-field__control:before) {
  border-color: #ffffff1f;
}
.wallet-capital:deep(.q-field--focused .q-field__control:after) {
  border-color: #2b7fff;
}
.wallet-capital:deep(.insufficient .q-field__control:before),
.wallet-capital:deep(.insufficient .q-field__control:after) {
  border-color: #ffc9c9;
}
.wallet-capital:deep(.q-field__marginal) {
  height: 36px;
}
.wallet-capital:deep(.q-field__native) {
  min-width: 0;
  color: #fff;
  font-size: 14px;
}
.wallet-capital__line:deep(.q-field__native) {
  font-weight: 700;
}
.wallet-capital:deep(.q-textarea .q-field__control) {
  height: auto;
  min-height: 64px;
}
.wallet-capital:deep(.q-field__native::placeholder) {
  color: #ffffffb8;
  opacity: 1;
}
.wallet-capital button:focus-visible {
  outline: 2px solid #2b7fff;
  outline-offset: 2px;
}
@media (max-width: 400px) {
  .wallet-capital__body {
    padding: 16px;
  }
  .wallet-capital header {
    padding-left: 16px;
  }
  .wallet-capital footer {
    padding: 16px;
  }
  .wallet-capital__picker [role='tab'] {
    font-size: 12px;
    padding: 6px 4px;
  }
}
</style>
