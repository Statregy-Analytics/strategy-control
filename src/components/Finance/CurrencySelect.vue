<template>
  <resource-state :state="resource.state" @retry="load">
    <q-select
      :model-value="modelValue"
      :disable="disable"
      :options="options"
      option-value="id"
      :option-label="detailed ? 'label' : 'name'"
      emit-value
      map-options
      outlined
      dense
      clearable
      popup-content-class="profile-glass-menu"
      aria-label="Moeda"
      @update:model-value="$emit('update:modelValue', $event)"
      ><template v-if="detailed" #selected-item="scope"
        ><span class="currency-option"
          ><span aria-hidden="true">{{ scope.opt.flag }}</span
          >{{ scope.opt.label }}</span
        ></template
      ><template v-if="detailed" #option="scope"
        ><q-item v-bind="scope.itemProps"
          ><q-item-section
            ><span class="currency-option"
              ><span aria-hidden="true">{{ scope.opt.flag }}</span
              >{{ scope.opt.label }}</span
            ></q-item-section
          ></q-item
        ></template
      ></q-select
    >
    <p v-if="!options.length" class="text-caption q-mt-sm">
      {{
        useCatalog
          ? 'Nenhuma moeda disponível no catálogo.'
          : customerId
            ? 'Nenhuma moeda disponível nas carteiras deste cliente.'
            : 'Selecione um cliente para consultar as moedas disponíveis.'
      }}
    </p>
  </resource-state>
</template>
<script setup>
import { WALLET_CURRENCIES } from 'src/services/walletModel'
import { computed, watch } from 'vue'
import ResourceState from './ResourceState.vue'
import { useFinanceResource } from 'src/composables/useFinanceResource'
import { financeGet } from 'src/services/financeService'
const props = defineProps({
  disable: Boolean,
  detailed: Boolean,
  useCatalog: Boolean,
  customerId: { type: String, default: null },
  modelValue: { type: String, default: null },
  current: { type: Object, default: null },
})
const emit = defineEmits(['update:modelValue', 'currency-code'])
const resource = useFinanceResource()
const options = computed(() => {
  const items = (resource.state.data || []).map((w) => ({
    id: w.currencyId,
    name: w.currencyIsoCode,
  }))
  if (props.current?.id && !items.some((i) => i.id === props.current.id)) items.push(props.current)
  return [...new Map(items.filter((i) => i.id).map((i) => [i.id, i])).values()]
    .filter(
      (i) =>
        !props.detailed ||
        WALLET_CURRENCIES.some((c) => c.code === i.name) ||
        i.id === props.modelValue,
    )
    .map((i) => {
      if (!props.detailed) return i
      const definition = WALLET_CURRENCIES.find((c) => c.code === i.name)
      const country = {
        BRL: 'BR',
        USD: 'US',
        EUR: 'EU',
        CAD: 'CA',
        JPY: 'JP',
        CNY: 'CN',
        AUD: 'AU',
      }[i.name]
      return {
        ...i,
        label: props.detailed && definition ? `${definition.name} · ${i.name}` : i.name,
        flag: country
          ? country
              .split('')
              .map((c) => String.fromCodePoint(127397 + c.charCodeAt(0)))
              .join('')
          : '',
      }
    })
})
const load = () =>
  resource.load(async () => {
    if (props.useCatalog) {
      const catalog = (await financeGet('preferences/catalog')).data
      return (catalog?.currencies || [])
        .filter((currency) => currency.id)
        .map((currency) => ({ currencyId: currency.id, currencyIsoCode: currency.value }))
    }
    return props.customerId
      ? (await financeGet(`admin/customers/${props.customerId}/wallets`)).data
      : []
  })
watch([() => (props.useCatalog ? null : props.customerId), () => props.useCatalog], load, {
  immediate: true,
})
watch(
  () =>
    options.value.find((option) => option.id === props.modelValue)?.name ||
    (props.modelValue ? null : 'BRL'),
  (code) => {
    if (code) emit('currency-code', code)
  },
  { immediate: true },
)
</script>

<style scoped>
.currency-option {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
</style>
