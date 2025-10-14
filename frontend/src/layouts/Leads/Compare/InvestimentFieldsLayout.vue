<template>
  <div class="row InvestimentFieldsLayout">
    <div class="col-12 q-px-md text-bold">Investimento</div>
    <div class="row q-pa-md" style="align-items: flex-start">
      <div style="width: 250px; flex: 0 0 250px">
        <div class="compare-labels" style="padding: 8px">
          <div class="compare-label">Classificação</div>
          <div class="compare-label">Saldo disponível</div>
          <div class="compare-label">Assessor Responsável</div>
          <div class="compare-label">Data de dividendo</div>
          <div class="compare-label">Valor do dividendo</div>
        </div>
      </div>
      <div style="flex: 1 1 auto; min-width: 0">
        <div
          class="compare-columns"
          style="
            display: flex;
            gap: 12px;
            padding: 8px;
            align-items: flex-start;
            min-width: 0;
            width: var(--compare-inner-width);
            box-sizing: border-box;
          "
        >
          <div v-for="(item, index) in compare" :key="index" class="compare-card">
            <div v-if="item.id != 0">
              <info-compare-layout
                class="q-pa-md"
                v-bind="
                  (function () {
                    const lead = item || {}
                    const inv = lead.investment || lead.invest || lead.investments || {}
                    const raw = lead._raw || {}
                    const divid = inv.dividendo || lead.dividendo || raw.dividendo || {}
                    const contrato = inv.contrato || lead.contrato || raw.contrato || {}
                    const safe = (v) =>
                      v === null || v === undefined
                        ? '-'
                        : typeof v === 'object'
                          ? JSON.stringify(v)
                          : String(v)
                    return {
                      item_one: safe(
                        inv.classification ||
                          inv.classificacao ||
                          lead.classification ||
                          raw.classification ||
                          '-',
                      ),
                      item_two: safe(
                        inv.saldo ||
                          inv.saldo_disponivel ||
                          lead.saldo ||
                          raw.saldo ||
                          contrato.total ||
                          '-',
                      ),
                      item_three: safe(inv.assessor || lead.assessor || raw.assessor || '-'),
                      item_four: safe(divid.data || divid.data_dividendo || divid.date || '-'),
                      item_five: safe(divid.total || divid.valor_dividendo || divid.valor || '-'),
                    }
                  })()
                "
              />
            </div>
            <div v-else>
              <div class="q-pa-md text-center text-grey">&nbsp;</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import InfoCompareLayout from 'src/layouts/Clients/Compare/InfoCompareLayout.vue'
import { defineComponent } from 'vue'
import { useLeadStore } from 'src/stores/lead'
import { storeToRefs } from 'pinia'
const leadStore = useLeadStore()
const { compare } = storeToRefs(leadStore)
defineComponent({
  name: 'InvestimentFieldsLayoutLeads',
})
</script>

<style scoped>
.compare-labels {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.compare-label {
  min-height: 44px;
  display: flex;
  align-items: center;
}
</style>
