<template>
  <div class="row LoanFieldsLayout">
    <div class="col-12 q-px-md text-bold">Empréstimo</div>
    <div class="row q-pa-md" style="align-items: flex-start">
      <div style="width: 250px; flex: 0 0 250px">
        <div class="compare-labels" style="padding: 8px">
          <div class="compare-label">Situação do Empréstimo</div>
          <div class="compare-label">Valor Emprestado</div>
          <div class="compare-label">Data do Valor Emprestado</div>
          <div class="compare-label">Valor Total Dívida</div>
          <div class="compare-label">Valor Atual da Dívida</div>
          <div class="compare-label">Valor para Antecipação</div>
          <div class="compare-label">Número Parcelas</div>
          <div class="compare-label">Dia de Pagamento da Parcelas</div>
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
                    const raw = lead._raw || {}
                    const wl =
                      (lead && lead.weLend && lead.weLend[0]) ||
                      lead.weLend ||
                      lead.weLend0 ||
                      raw.weLend ||
                      raw.weLend0 ||
                      {}
                    const emprestimo =
                      lead.emprestimo || raw.emprestimo || lead.valor_emprestimo || {}
                    const divid = lead.dividendo || raw.dividendo || {}
                    const contrato = lead.contrato || raw.contrato || {}
                    const safe = (v) =>
                      v === null || v === undefined
                        ? '-'
                        : typeof v === 'object'
                          ? JSON.stringify(v)
                          : String(v)
                    return {
                      item_one: safe(
                        wl.status || wl.situacao || lead.loan_status || emprestimo || '-',
                      ),
                      item_two: safe(
                        wl.valor || wl.value || lead.valor_emprestimo || contrato.total || '-',
                      ),
                      item_three: safe(
                        wl.data_loan || wl.data_emprestimo || wl.date || divid.data || '-',
                      ),
                      item_four: safe(
                        wl.value_dividendo ||
                          wl.value_dividendo_total ||
                          contrato.total ||
                          divid.total ||
                          '-',
                      ),
                      item_five: safe(wl.value_now_dividendo || wl.current_value || '-'),
                      item_six: safe(wl.value_finish || wl.finish_value || '-'),
                      item_seven: safe(wl.value_before || wl.before_value || '-'),
                      item_eight: safe(
                        wl.number_parcelas ||
                          wl.numero_parcelas ||
                          wl.installments ||
                          contrato.quantity ||
                          '-',
                      ),
                      item_nine: safe(
                        wl.date_payment || wl.data_pagamento || wl.payment_date || '-',
                      ),
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
  name: 'LoanFieldsLayoutLeads',
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
