<template>
  <q-dialog
    :model-value="true"
    :persistent="saving || busy"
    @update:model-value="!$event && !saving && $emit('close')"
    ><q-card class="contract-asset-dialog">
      <header>
        <h2>Adicionar Ativo Elegível</h2>
        <q-btn
          flat
          round
          dense
          :disable="saving || busy"
          aria-label="Fechar ativo"
          @click="$emit('close')"
          ><span class="asset-close"
            ><img src="/icons/contracts/ct06-vector.svg" alt="" /><img
              src="/icons/contracts/ct06-vector1.svg"
              alt="" /></span
        ></q-btn>
      </header>
      <q-banner v-if="error" class="asset-dialog-error" role="alert">{{ error }}</q-banner>
      <label-form text-label="Tipo de Ativo *"
        ><div class="asset-types" role="radiogroup" aria-label="Tipo de ativo">
          <button type="button" role="radio" aria-checked="true" class="asset-type">
            <span class="asset-radio"><img src="/icons/contracts/ct06-circle.svg" alt="" /></span
            >Ativo de bolsa</button
          ><button type="button" role="radio" aria-checked="false" disabled class="asset-type">
            <span class="asset-radio" />Criptoativo<q-tooltip
              >O estado do formulário de criptoativo aguarda definição do designer.</q-tooltip
            >
          </button>
        </div></label-form
      >
      <resource-state :state="markets.state" @retry="loadMarkets"
        ><label-form text-label="Bolsa / Mercado *"
          ><glass-select
            v-model="form.marketId"
            :options="marketOptions"
            option-value="id"
            option-label="label"
            placeholder="Selecione a bolsa"
            aria-label="Bolsa / Mercado *"
            :disable="saving || busy" /></label-form
      ></resource-state>
      <label-form text-label="Nome da Empresa / Ativo *"
        ><q-input
          v-model="form.name"
          outlined
          dark
          dense
          placeholder="Ex: Ambev, Apple, LVMH"
          aria-label="Nome da Empresa / Ativo *"
          :disable="saving || busy"
      /></label-form>
      <div class="asset-form-row">
        <label-form text-label="Tag / Ticker *"
          ><q-input
            v-model="form.ticker"
            outlined
            dark
            dense
            placeholder="Ex: ABEV3, AAPL"
            aria-label="Tag / Ticker *"
            :disable="saving || busy" /></label-form
        ><label-form text-label="Moeda *"
          ><q-input
            v-model="form.currency"
            outlined
            dark
            dense
            placeholder="Ex: BRL, USD"
            aria-label="Moeda do ativo *"
            :disable="saving || busy"
        /></label-form>
      </div>
      <q-banner v-if="currencies.state.error" class="asset-dialog-error"
        >Não foi possível carregar as moedas.<q-btn
          flat
          no-caps
          label="Tentar novamente"
          @click="loadCurrencies"
      /></q-banner>
      <p class="asset-note">
        <strong>Nota:</strong> A moeda é preenchida automaticamente com base na bolsa, mas pode ser
        ajustada antes de salvar.
      </p>
      <footer>
        <q-btn
          outline
          no-caps
          label="Cancelar"
          :disable="saving || busy"
          @click="$emit('close')"
        /><q-btn
          outline
          no-caps
          label="Salvar Ativo"
          :loading="saving"
          :disable="
            busy ||
            !form.marketId ||
            !form.name.trim() ||
            !form.ticker.trim() ||
            !form.currency.trim()
          "
          @click="save"
        />
      </footer> </q-card
  ></q-dialog>
</template>
<script setup>
import { computed, onScopeDispose, ref, watch } from 'vue'
import { onBeforeRouteLeave, onBeforeRouteUpdate } from 'vue-router'
import LabelForm from 'src/components/Form/LabelForm.vue'
import GlassSelect from 'src/components/Entity/GlassSelect.vue'
import ResourceState from 'src/components/Finance/ResourceState.vue'
import { useFinanceResource } from 'src/composables/useFinanceResource'
import { readCurrentPages } from 'src/services/requestContext'
import { getPreferenceCatalog } from 'src/services/customerService'
import { financeGet, financeWrite } from 'src/services/financeService'
import { eligibleAssetPayload, existingEligibleAsset } from 'src/services/eligibleAssetModel'
const props = defineProps({ busy: Boolean, submit: { type: Function, required: true } })
defineEmits(['close'])
const markets = useFinanceResource(),
  currencies = useFinanceResource(),
  saving = ref(false),
  error = ref(''),
  form = ref({ assetType: 'ExchangeTraded', marketId: null, name: '', ticker: '', currency: '' })
let active = true,
  created = null,
  createdSignature = ''
const marketOptions = computed(() =>
  (markets.state.data || [])
    .filter((m) => m.isActive !== false)
    .map((m) => ({ ...m, label: m.name })),
)
const loadMarkets = () =>
  markets.load(async () => {
    const d = (await financeGet('admin/contracts/catalog/markets')).data
    if (!Array.isArray(d)) throw Error('Catálogo indisponível.')
    return d
  })
const loadCurrencies = () =>
  currencies.load(async () => {
    const c = await getPreferenceCatalog()
    if (!Array.isArray(c.currencies)) throw Error('Catálogo indisponível.')
    return c.currencies
  })
watch(
  () => form.value.marketId,
  (id) => {
    form.value.currency =
      markets.state.data?.find((m) => m.id === id)?.defaultCurrency?.isoCode || ''
  },
)
async function save() {
  if (saving.value || props.busy) return
  error.value = ''
  let payload
  try {
    payload = eligibleAssetPayload(
      form.value,
      markets.state.data || [],
      currencies.state.data || [],
    )
  } catch (e) {
    error.value = e.message
    return
  }
  saving.value = true
  try {
    const signature = JSON.stringify(payload)
    let asset = createdSignature === signature ? created : null
    if (!asset) {
      const rows = await readCurrentPages(
        (page) =>
          financeGet('admin/contracts/catalog/assets', {
            search: payload.ticker,
            page,
            pageSize: 100,
          }),
        () => active,
      )
      if (!active) return
      asset = existingEligibleAsset(rows || [], payload)
      if (!asset) asset = await financeWrite('post', 'admin/contracts/catalog/assets', payload)
      if (!active) return
      if (!asset?.id) throw Error('O cadastro não retornou o ativo.')
      created = asset
      createdSignature = signature
    }
    const linked = await props.submit(asset)
    if (active && !linked) error.value = 'Não foi possível vincular o ativo. Tente novamente.'
  } catch (e) {
    if (active)
      error.value =
        e.response || e.isAxiosError
          ? 'Não foi possível salvar o ativo. Verifique a sessão e tente novamente.'
          : e.message || 'Não foi possível salvar o ativo. Tente novamente.'
  } finally {
    if (active) saving.value = false
  }
}
onBeforeRouteLeave(() => !saving.value)
onBeforeRouteUpdate(() => !saving.value)
loadMarkets()
loadCurrencies()
onScopeDispose(() => {
  active = false
  markets.reset()
  currencies.reset()
})
</script>
<style scoped>
.contract-asset-dialog {
  width: 512px;
  max-width: calc(100vw - 32px);
  padding: 24px 32px;
  color: var(--sa-text, #fff);
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 12px;
  backdrop-filter: blur(20px);
  box-shadow: 4px 4px 12px rgba(0, 0, 0, 0.13);
}
.contract-asset-dialog header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 24px;
}
.contract-asset-dialog h2 {
  font-size: 16px;
  line-height: 24px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  margin: 0;
}
.contract-asset-dialog .LabelForm {
  margin-bottom: 20px;
  min-width: 0;
}
.contract-asset-dialog :deep(.q-field__native),
.contract-asset-dialog :deep(.q-field__input) {
  color: var(--sa-text, #fff);
}
.contract-asset-dialog :deep(.q-field__control) {
  background: rgba(255, 255, 255, 0.04);
  border-radius: 8px;
}
.contract-asset-dialog :deep(.q-field__control::before) {
  border-color: rgba(255, 255, 255, 0.12);
}
.asset-types,
.asset-form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
.asset-type {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.04);
  color: inherit;
  font: inherit;
  text-align: left;
}
.asset-type:disabled {
  opacity: 0.5;
}
.asset-radio {
  display: grid;
  place-items: center;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  width: 16px;
  height: 16px;
}
.asset-note,
.asset-dialog-error {
  font-size: 13px;
  padding: 14px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 8px;
}
.contract-asset-dialog footer {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  padding-top: 20px;
  margin-top: 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.12);
}
.contract-asset-dialog footer .q-btn {
  font-size: 14px;
}
.asset-close {
  position: relative;
  width: 16px;
  height: 16px;
  display: block;
}
.asset-close img {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
@media (max-width: 500px) {
  .contract-asset-dialog {
    padding: 20px;
  }
  .asset-form-row {
    grid-template-columns: 1fr;
  }
  .asset-types {
    gap: 8px;
  }
  .asset-type {
    font-size: 12px;
    gap: 8px;
    padding: 10px;
  }
}
</style>
