<template>
  <section class="logic-detail-links" tabindex="-1">
    <h2 class="logic-detail-section-title">Papéis Vinculados ao Motor</h2>
    <div class="logic-detail-links-panel">
      <p>
        Papéis possuem valor real. O motor apenas indexa a performance proporcionalmente ao índice
        de conexão de cada papel.
      </p>
      <resource-state :state="state" @retry="$emit('retry')"
        ><div
          class="logic-detail-links-scroll"
          role="region"
          aria-label="Papéis vinculados"
          tabindex="0"
        >
          <table>
            <thead>
              <tr>
                <th>Papel</th>
                <th>Valor de entrada</th>
                <th>Índice na conexão <img :src="info" alt="" /></th>
                <th>Índice atual do motor</th>
                <th>Valor atual</th>
                <th>Variação desde conexão</th>
                <th>Status do vínculo</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in state.data || []" :key="row.id">
                <th scope="row">{{ row.name || row.id }}</th>
                <td>{{ num(row.entryAmount) }}</td>
                <td>{{ num(row.connectionIndex) }}</td>
                <td>{{ num(row.currentIndex) }}</td>
                <td>
                  <strong>{{ num(row.currentAmount) }}</strong>
                </td>
                <td :class="tone(row.variationPercent)">
                  {{ percent(row.variationPercent, 3, true) }}
                </td>
                <td :class="{ positive: row.status === 'Active' }">
                  {{ row.status === 'Active' ? 'Ativo' : row.status || 'Indisponível' }}
                </td>
              </tr>
              <tr v-if="!state.data?.length">
                <td colspan="7">
                  {{
                    state.data === null
                      ? 'Vínculos indisponíveis nesta consulta.'
                      : 'Nenhum papel vinculado.'
                  }}
                </td>
              </tr>
            </tbody>
          </table>
        </div></resource-state
      >
      <div class="logic-detail-link-formula">
        <strong>Fórmula de cálculo</strong>
        <p>
          Valor atual do papel = Valor de entrada × Índice atual do motor ÷ Índice do motor na
          conexão<br /><small>Exemplo: 500 × 104,80 ÷ 102,00 = 513,73</small>
        </p>
      </div>
      <p class="logic-detail-links-note">
        <strong>Importante:</strong> Papéis não herdam performance anterior à data de conexão.
      </p>
      <nav v-if="editing" aria-label="Ações dos papéis vinculados">
        <button
          v-for="action in actions"
          :key="action"
          type="button"
          disabled
          :title="'Operação de vínculo indisponível'"
        >
          {{ action }}
        </button>
      </nav>
    </div>
  </section>
</template>
<script setup>
import { computed } from 'vue'
import ResourceState from 'src/components/Finance/ResourceState.vue'
import { structuralAsset } from 'src/services/logicStructuralAssets'
import {
  structuralNumber as num,
  structuralPercent as percent,
} from 'src/services/logicStructuralModel'
import { numberInputValue } from 'src/services/numberInputValue'
const props = defineProps({
  editing: Boolean,
  state: { type: Object, default: () => ({ loading: false, error: null, data: null }) },
})
defineEmits(['retry'])
const info = computed(() => structuralAsset(props.editing ? '1484:80717' : '1484:78914', 'imgInfo'))
const tone = (value) =>
  numberInputValue(value) > 0 ? 'positive' : numberInputValue(value) < 0 ? 'negative' : ''
const actions = ['Adicionar papel', 'Pausar vínculo', 'Encerrar vínculo', 'Remover vínculo']
</script>
<style scoped>
.logic-detail-links {
  min-width: 0;
  margin-top: 24px;
  scroll-margin-top: 24px;
}
.logic-detail-section-title {
  font-size: 12px;
  line-height: 20px;
  font-weight: 700;
  letter-spacing: 0.6px;
  text-transform: uppercase;
  margin: 0 0 16px;
  padding-left: 12px;
}
.logic-detail-links-panel {
  padding: 24px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 14px;
  background: linear-gradient(215deg, rgba(0, 0, 0, 0.118), rgba(0, 0, 0, 0.02));
  box-shadow: 4px 4px 12px rgba(0, 0, 0, 0.13);
}
.logic-detail-links-panel > p {
  margin: 0 0 24px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 12px;
  line-height: 20px;
}
.logic-detail-links-scroll {
  overflow: auto;
  scrollbar-color: rgba(255, 255, 255, 0.3) transparent;
}
.logic-detail-links table {
  border-collapse: collapse;
  min-width: 1000px;
  width: 100%;
  font-size: 14px;
  line-height: 20px;
}
.logic-detail-links th,
.logic-detail-links td {
  padding: 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  text-align: left;
}
.logic-detail-links thead th {
  font-weight: 500;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  background: rgba(255, 255, 255, 0.05);
}
.logic-detail-links img {
  display: inline-block;
  vertical-align: middle;
  margin-left: 4px;
}
.logic-detail-links td {
  color: rgba(255, 255, 255, 0.72);
}
.logic-detail-links td strong {
  color: white;
}
.logic-detail-links .positive {
  color: #66e59e;
}
.logic-detail-links .negative {
  color: #ff6467;
}
.logic-detail-link-formula {
  padding: 12px;
  margin-top: 16px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  font-size: 12px;
  line-height: 20px;
  color: rgba(255, 255, 255, 0.6);
}
.logic-detail-link-formula > strong {
  font-weight: 500;
}
.logic-detail-link-formula p {
  margin: 4px 0 0;
}
.logic-detail-link-formula small {
  font-size: 10px;
}
.logic-detail-links-panel .logic-detail-links-note {
  color: #fee685;
  margin: 24px 0 0;
  font-size: 12px;
  line-height: 20px;
}
.logic-detail-links nav {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 16px;
}
.logic-detail-links button {
  padding: 4px 8px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.6);
  font-size: 10px;
  line-height: 15px;
  opacity: 0.5;
}
.logic-detail-links:focus-visible,
.logic-detail-links-scroll:focus-visible {
  outline: 2px solid #4bc7ff;
  outline-offset: 3px;
}
@media (max-width: 600px) {
  .logic-detail-links-panel {
    padding: 16px;
  }
}
</style>
