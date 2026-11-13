<template>
  <q-dialog :model-value="Boolean(partner)" @update:model-value="!$event && $emit('close')">
    <q-card class="workspace-modal partner-detail">
      <header>
        <h2>Detalhes do Parceiro</h2>
        <p>Visualize e gerencie informações completas do parceiro</p>
        <q-badge v-if="partner?.status" outline :class="statusClass">{{ statusLabel }}</q-badge>
        <q-btn flat round dense aria-label="Fechar detalhes do parceiro" @click="$emit('close')"
          ><span class="partner-close"
            ><img src="/icons/partners/close-a.svg" alt="" /><img
              src="/icons/partners/close-b.svg"
              alt="" /></span
        ></q-btn>
      </header>
      <section class="partner-summary">
        <div class="partner-avatar">
          <img
            v-if="partner?.logoUrl"
            :src="partner.logoUrl"
            :alt="partner?.name || 'Parceiro'"
            class="partner-logo"
          /><img v-else src="/icons/partners/building.svg" alt="" />
        </div>
        <div class="partner-identity">
          <h3>{{ partner?.name || 'Indisponível' }}</h3>
          <p>{{ partner?.type || 'Indisponível' }}</p>
          <div class="partner-products">
            <q-badge v-for="product in products" :key="product" outline>{{ product }}</q-badge>
          </div>
        </div>
        <div class="partner-commission">
          <span>Comissão<br />Principal</span><strong>{{ commission }}</strong>
        </div>
      </section>
      <div class="partner-tabs" role="tablist" aria-label="Informações do parceiro">
        <q-btn
          v-for="item in tabs"
          :key="item"
          outline
          no-caps
          :label="item"
          role="tab"
          :aria-selected="tab === item"
          @click="tab = item"
        />
      </div>
      <div class="partner-tab-body" role="tabpanel" :aria-label="tab">
        <template v-if="tab === 'Dados Gerais'">
          <section class="partner-info">
            <h4>Dados Gerais</h4>
            <dl>
              <div>
                <dt>Tipo de Parceiro</dt>
                <dd>{{ partner?.type || 'Indisponível' }}</dd>
              </div>
              <div>
                <dt>ID do Parceiro</dt>
                <dd>{{ partner?.publicCode || 'Indisponível' }}</dd>
              </div>
              <div>
                <dt>Status</dt>
                <dd>
                  <q-badge v-if="partner?.status" outline :class="statusClass">{{
                    statusLabel
                  }}</q-badge
                  ><span v-else>Indisponível</span>
                </dd>
              </div>
              <div>
                <dt>Última Atualização</dt>
                <dd>{{ dateLabel(partner?.updatedAtUtc) }}</dd>
              </div>
            </dl>
          </section>
          <section class="partner-info partner-contact">
            <h4>Contato</h4>
            <p>
              <img src="/icons/partners/mail.svg" alt="" />{{ partner?.email || 'Não informado' }}
            </p>
            <p>
              <img src="/icons/partners/phone.svg" alt="" />{{ partner?.phone || 'Não informado' }}
            </p>
          </section>
        </template>
        <section v-else-if="tab === 'Serviços'" class="partner-info">
          <h4>Serviços</h4>
          <ul v-if="products.length">
            <li v-for="product in products" :key="product">{{ product }}</li>
          </ul>
          <p v-else>Consulta indisponível.</p>
        </section>
        <section v-else class="partner-info">
          <h4>{{ tab }}</h4>
          <p role="status">Consulta indisponível.</p>
        </section>
      </div>
      <footer>
        <q-btn outline no-caps label="Fechar" @click="$emit('close')" /><q-btn
          outline
          no-caps
          label="Editar Parceiro"
          @click="$emit('edit', partner)"
          ><img src="/icons/partners/pen.svg" alt=""
        /></q-btn>
      </footer>
    </q-card>
  </q-dialog>
</template>
<script setup>
import { computed, ref, watch } from 'vue'
import { dateLabel } from 'src/services/financeService'
const props = defineProps({ partner: { type: Object, default: null } })
defineEmits(['close', 'edit'])
const tab = ref('Dados Gerais')
const tabs = [
  'Dados Gerais',
  'Serviços',
  'Regras',
  'Comissão',
  'Documentos',
  'Procedimentos',
  'Materiais',
  'Histórico',
]
watch(
  () => props.partner,
  () => {
    tab.value = 'Dados Gerais'
  },
)
const products = computed(() =>
  Array.isArray(props.partner?.products)
    ? props.partner.products.filter((p) => typeof p === 'string' && p.trim())
    : [],
)
const statusLabel = computed(
  () =>
    ({ Active: 'Ativo', Inactive: 'Inativo' })[props.partner?.status] ||
    props.partner?.status ||
    'Indisponível',
)
const statusClass = computed(() => ({
  'partner-active': props.partner?.status === 'Active',
  'partner-inactive': props.partner?.status === 'Inactive',
}))
const commission = computed(() => {
  const value = props.partner?.commission
  return value == null || value === '' || !Number.isFinite(Number(value))
    ? 'Indisponível'
    : new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 2 }).format(
        Number(value),
      ) + '%'
})
</script>
<style scoped>
.partner-detail {
  width: 896px !important;
  max-width: calc(100vw - 32px) !important;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 28px;
}
header {
  position: relative;
  padding-right: 82px;
}
header h2 {
  margin: 0;
  font-size: 18px;
  line-height: 28px;
}
header p {
  margin: 8px 0 0;
  color: var(--sa-muted, rgba(255, 255, 255, 0.72));
  font-size: 14px;
}
header > .q-badge {
  position: absolute;
  top: 2px;
  right: 0;
  margin-right: 0;
}
header > .q-btn {
  position: absolute;
  top: -16px;
  right: -16px;
}
.partner-close {
  display: grid;
  place-items: center;
  width: 16px;
  height: 16px;
}
.partner-close img {
  grid-area: 1 / 1;
}
.partner-summary,
.partner-info {
  padding: 24px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  background: linear-gradient(165deg, rgba(255, 255, 255, 0.04), rgba(0, 0, 0, 0.04));
}
.partner-summary {
  display: flex;
  gap: 16px;
  align-items: center;
  padding: 16px;
}
.partner-avatar {
  width: 47px;
  height: 64px;
  border: 1px solid rgba(255, 255, 255, 0.72);
  border-radius: 10px;
  display: grid;
  place-items: center;
  flex: none;
}
.partner-logo {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}
.partner-identity {
  min-width: 0;
  flex: 1;
}
.partner-identity h3 {
  font-size: 20px;
  line-height: 28px;
  margin: 0;
  overflow-wrap: anywhere;
}
.partner-identity p {
  margin: 4px 0 12px;
  color: var(--sa-muted, rgba(255, 255, 255, 0.72));
}
.partner-products {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}
.partner-products .q-badge {
  white-space: normal;
  line-height: 18px;
  color: #008236;
  background: #dcfce7;
  border-color: #008236;
}
.partner-commission {
  text-align: center;
  max-width: 150px;
}
.partner-commission span {
  font-size: 12px;
  color: var(--sa-muted, rgba(255, 255, 255, 0.72));
}
.partner-commission strong {
  display: block;
  margin-top: 6px;
  font-size: 24px;
  line-height: 32px;
  color: #66e59e;
  overflow-wrap: anywhere;
}
.partner-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
}
.partner-tabs .q-btn {
  min-height: 28px;
  padding: 0 8px;
  border-radius: 8px;
  color: var(--sa-muted, rgba(255, 255, 255, 0.72));
  background: rgba(255, 255, 255, 0.04);
  font-size: 14px;
}
.partner-tabs [aria-selected='true'] {
  color: var(--sa-text, #fff);
  background: rgba(255, 255, 255, 0.1);
}
.partner-tab-body {
  display: grid;
  gap: 16px;
}
.partner-info h4 {
  text-transform: uppercase;
  margin: 0 0 28px;
  font-size: 14px;
  line-height: 20px;
  font-weight: 400;
}
.partner-info dl {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px 32px;
  margin: 0;
  max-width: 430px;
}
.partner-info dt {
  color: var(--sa-muted, rgba(255, 255, 255, 0.72));
  font-size: 12px;
  margin-bottom: 6px;
}
.partner-info dd {
  margin: 0;
  font-size: 14px;
  overflow-wrap: anywhere;
}
.partner-active {
  color: #74ffa0;
  border-color: #74ffa0;
  background: rgba(0, 122, 85, 0.2);
  text-transform: uppercase;
  font-size: 10px;
}
.partner-inactive {
  color: var(--sa-muted, rgba(255, 255, 255, 0.72));
}
.partner-contact p {
  display: flex;
  gap: 12px;
  align-items: center;
  margin: 12px 0 0;
  overflow-wrap: anywhere;
  min-width: 0;
}
.partner-contact img {
  flex: none;
}
footer {
  display: flex;
  gap: 12px;
  padding-top: 12px;
}
footer .q-btn {
  flex: 1;
}
footer img {
  order: -1;
  margin-right: 8px;
}
@media (max-width: 600px) {
  .partner-detail {
    padding: 16px;
    gap: 20px;
  }
  .partner-summary {
    flex-wrap: wrap;
  }
  .partner-commission {
    margin-left: auto;
  }
  .partner-info {
    padding: 16px;
  }
  .partner-info dl {
    grid-template-columns: 1fr;
  }
  header p {
    font-size: 12px;
  }
}
</style>
