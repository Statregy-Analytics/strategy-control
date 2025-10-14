<template>
  <div class="row">
    <div class="col-12 q-px-md text-bold">Informações Básicas</div>
    <div class="row q-pa-md" style="align-items: flex-start">
      <div style="width: 250px; flex: 0 0 250px">
        <div class="compare-labels" style="padding: 8px">
          <div class="compare-label">CPF</div>
          <div class="compare-label">RG</div>
          <div class="compare-label">Data de Nascimento</div>
          <div class="compare-label">Email</div>
          <div class="compare-label">Celular</div>
          <div class="compare-label">Profissão</div>
          <div class="compare-label">Renda</div>
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
                    const c = lead.cliente || {}
                    const raw = lead._raw || {}
                    const safe = (v) =>
                      v === null || v === undefined
                        ? '-'
                        : typeof v === 'object'
                          ? JSON.stringify(v)
                          : String(v)
                    return {
                      item_one: safe(lead.cpf || c.cpf || raw.cpf || c.cpfNumber || '-'),
                      item_two: safe(lead.rg || c.rg || raw.rg || '-'),
                      item_three: safe(
                        lead.birth ||
                          c.birth ||
                          raw.birth ||
                          lead.data_nascimento ||
                          c.data_nascimento ||
                          '-',
                      ),
                      item_four: safe(lead.email || c.email || raw.email || '-'),
                      item_five: safe(
                        lead.phone || c.phone || raw.phone || lead.telefone || c.telefone || '-',
                      ),
                      item_six: safe(
                        lead.profission ||
                          lead.profissao ||
                          c.profission ||
                          c.profissao ||
                          raw.profission ||
                          raw.profissao ||
                          '-',
                      ),
                      item_seven: safe(
                        lead.renda || c.renda || raw.renda || lead.saldo || raw.saldo || '-',
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
  name: 'PersonalFieldsLayoutLeads',
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
