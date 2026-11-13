<template>
  <section class="contract-asset-registry">
    <template v-if="editing"
      ><div class="asset-toolbar">
        <q-btn outline no-caps label="Adicionar Ativo" :disable="busy" @click="$emit('add')"
          ><img src="/icons/contracts/plus.svg" alt="" /></q-btn
        ><q-btn outline no-caps label="Importar Excel" disable
          ><img src="/icons/contracts/import.svg" alt="" /></q-btn
        ><q-btn outline no-caps label="Importar PDF" disable
          ><img src="/icons/contracts/import.svg" alt=""
        /></q-btn></div
    ></template>
    <template v-else
      ><p class="asset-instruction">
        <img src="/icons/contracts/ct13-info.svg" alt="" />Para inserir, editar ou remover ativos do
        contrato, clique em <strong>Editar Contrato</strong> no topo da página.
      </p>
      <div class="asset-toolbar asset-toolbar--end">
        <q-btn outline no-caps label="Baixar Excel" disable
          ><img src="/icons/contracts/ct13-download.svg" alt="" /><q-tooltip
            >A exportação Excel ainda não está disponível.</q-tooltip
          ></q-btn
        ><q-btn outline no-caps label="Exportar PDF" disable
          ><img src="/icons/contracts/ct13-download.svg" alt="" /><q-tooltip
            >A exportação PDF ainda não está disponível.</q-tooltip
          ></q-btn
        >
      </div></template
    >
    <resource-state :state="state" @retry="$emit('retry')"
      ><q-table
        dark
        dense
        flat
        :rows="items"
        :columns="assetColumns"
        row-key="contractAssetId"
        hide-pagination
        :pagination="{ rowsPerPage: 0 }"
        no-data-label="Nenhum ativo vinculado."
      >
        <template #body-cell-market="s"
          ><q-td :props="s"
            >{{ flag(s.row.market?.countryIsoCode) }}
            {{ s.row.market?.code || s.row.market?.name || s.row.network?.name || '—' }}</q-td
          ></template
        >
        <template #body-cell-ticker="s"
          ><q-td :props="s"
            ><q-badge outline>{{ s.row.ticker || s.row.tokenCode || '—' }}</q-badge></q-td
          ></template
        >
        <template #body-cell-actions="s"
          ><q-td :props="s"
            ><div v-if="editing" class="asset-actions">
              <q-btn flat dense disable aria-label="Editar ativo"
                ><img src="/icons/contracts/debt-pen.svg" alt="" /><q-tooltip
                  >A edição do vínculo aguarda suporte específico; o catálogo é
                  compartilhado.</q-tooltip
                ></q-btn
              ><q-btn
                flat
                dense
                :disable="busy"
                aria-label="Remover ativo"
                @click="$emit('remove', s.row)"
                ><img src="/icons/contracts/debt-trash2.svg" alt=""
              /></q-btn></div></q-td
        ></template>
        <template #bottom
          ><small
            >{{ items.length }} {{ items.length === 1 ? 'ativo' : 'ativos' }} • {{ markets }}
            {{ markets === 1 ? 'bolsa/mercado' : 'bolsas/mercados' }}</small
          ></template
        >
      </q-table></resource-state
    >
    <section class="asset-composition">
      <h3>
        <img src="/icons/contracts/ct13-chart-pie.svg" alt="" />Composição Estratégica do Contrato
      </h3>
      <div class="asset-composition-fields">
        <label-form
          v-for="label in ['Intradiário (%)', 'Núcleo (%)', 'Tática (%)']"
          :key="label"
          :text-label="label"
          ><q-input outlined dark dense disable placeholder="Indisponível" :aria-label="label"
        /></label-form>
      </div>
      <p class="asset-instruction">
        <strong>Informação:</strong> A soma dos três percentuais deve fechar exatamente 100%. Esses
        valores alimentarão o gráfico de composição estratégica do contrato.
      </p>
    </section>
  </section>
</template>
<script setup>
import { computed } from 'vue'
import ResourceState from 'src/components/Finance/ResourceState.vue'
import LabelForm from 'src/components/Form/LabelForm.vue'
import { columns } from 'src/services/financeService'
const props = defineProps({
  state: { type: Object, required: true },
  editing: Boolean,
  busy: Boolean,
})
defineEmits(['add', 'remove', 'retry'])
const items = computed(() => props.state.data?.items || [])
const markets = computed(
  () => new Set(items.value.map((a) => a.market?.id || a.network?.id).filter(Boolean)).size,
)
const assetColumns = columns([
  ['market', 'Bolsa'],
  ['name', 'Nome'],
  ['ticker', 'Tag'],
  ['actions', 'Ações'],
])
const flag = (iso) =>
  /^[A-Z]{2}$/.test(iso || '')
    ? [...iso].map((c) => String.fromCodePoint(c.charCodeAt(0) + 127397)).join('')
    : ''
</script>
<style scoped>
.contract-asset-registry {
  color: var(--sa-text, #fff);
}
.asset-toolbar,
.asset-actions {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 16px;
}
.asset-toolbar--end {
  justify-content: flex-end;
}
.asset-toolbar img,
.asset-instruction img {
  margin-right: 6px;
  vertical-align: middle;
}
.asset-instruction {
  font-size: 12px;
  padding: 12px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.06);
}
.asset-actions {
  margin: 0;
  flex-wrap: nowrap;
  justify-content: flex-end;
}
.contract-asset-registry :deep(.q-table__container) {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 10px;
}
.contract-asset-registry :deep(th) {
  font-size: 10px;
  text-transform: uppercase;
}
.contract-asset-registry :deep(td) {
  font-size: 12px;
}
.contract-asset-registry :deep(.q-btn) {
  font-size: 12px;
  text-transform: none;
}
.asset-composition {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.12);
}
.asset-composition h3 {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  margin: 0 0 20px;
}
.asset-composition-fields {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  margin-bottom: 16px;
}
@media (max-width: 600px) {
  .asset-composition-fields {
    grid-template-columns: 1fr;
  }
}
</style>
