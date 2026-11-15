<template>
  <div
    ref="trigger"
    class="logic-summary-trigger"
    tabindex="0"
    :aria-label="`Resumo executivo de ${name}`"
    :aria-describedby="open ? panelId : undefined"
    @mouseenter="show"
    @mouseleave="scheduleClose"
    @focus="show"
    @blur="scheduleClose"
    @click="show"
    @keydown.esc.stop.prevent="open = false"
    @keydown.enter.prevent="show"
    @keydown.space.prevent="show"
  >
    <slot />
    <q-menu
      v-model="open"
      no-parent-event
      no-focus
      no-refocus
      :anchor="$q.screen.lt.md ? 'bottom middle' : 'center right'"
      :self="$q.screen.lt.md ? 'top middle' : 'center left'"
      :offset="$q.screen.lt.md ? [0, 12] : [12, 0]"
      class="logic-summary-menu"
      @mouseenter="cancelClose"
      @mouseleave="scheduleClose"
    >
      <section
        :id="panelId"
        role="tooltip"
        class="logic-summary"
        :aria-label="`Resumo executivo de ${name}`"
      >
        <h3>Resumo Executivo</h3>
        <p class="logic-summary-description">
          {{ description || 'Resumo operacional indisponível.' }}
        </p>
        <div class="logic-summary-performance">
          <span>Performance do ciclo atual</span><strong>Indisponível</strong>
        </div>
        <div class="logic-summary-chart" role="status">Performance indisponível.</div>
        <h4>Papéis / Contratos (indisponível)</h4>
        <div class="logic-summary-contracts" role="status">Consulta indisponível.</div>
        <p class="logic-summary-detail">Ciclo: Indisponível</p>
        <p class="logic-summary-detail">Próxima atualização: Indisponível</p>
        <span class="logic-summary-closure">Fechamento indisponível</span>
      </section>
    </q-menu>
  </div>
</template>
<script setup>
import { onScopeDispose, ref, useId } from 'vue'
defineProps({ name: { type: String, required: true }, description: { type: String, default: '' } })
const open = ref(false)
const trigger = ref(null)
const panelId = `logic-summary-${useId()}`
let closeTimer
function cancelClose() {
  clearTimeout(closeTimer)
}
function show() {
  cancelClose()
  open.value = true
}
function scheduleClose() {
  cancelClose()
  if (trigger.value?.matches(':focus')) return
  closeTimer = setTimeout(() => {
    open.value = false
  }, 180)
}
onScopeDispose(cancelClose)
</script>
<style>
.logic-summary-menu {
  width: 430px;
  max-width: calc(100vw - 24px);
  max-height: calc(100vh - 24px);
  color: #fff;
  background: rgba(25, 32, 43, 0.94);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  box-shadow: 4px 4px 12px rgba(0, 0, 0, 0.13);
  backdrop-filter: blur(20px);
  color-scheme: dark;
  scrollbar-color: rgba(255, 255, 255, 0.3) transparent;
  scrollbar-width: thin;
}
</style>
<style scoped>
.logic-summary-trigger {
  min-width: 0;
  max-width: 240px;
  border-radius: 8px;
  cursor: default;
}
.logic-summary-trigger :deep(h2) {
  display: flex;
  align-items: center;
  gap: 8px;
  overflow-wrap: anywhere;
}
.logic-summary-trigger:focus-visible {
  outline: 2px solid #00a3ff;
  outline-offset: 4px;
}
.logic-summary {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 20px;
  min-height: 558px;
  overflow-wrap: anywhere;
}
.logic-summary h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  line-height: 24px;
}
.logic-summary-description {
  margin: 0;
  min-height: 48px;
  color: rgba(255, 255, 255, 0.72);
  font-size: 14px;
  line-height: 17px;
}
.logic-summary-performance {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  min-height: 22px;
}
.logic-summary-performance span,
.logic-summary h4 {
  margin: 0;
  font-size: 12px;
  font-weight: 600;
  line-height: 15px;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.72);
}
.logic-summary-performance strong {
  font-size: 14px;
  font-weight: 600;
}
.logic-summary-chart {
  min-height: 70px;
  display: grid;
  place-items: center;
  padding: 8px;
  border: 1px solid #00a3ff;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
  font-size: 12px;
  color: rgba(255, 255, 255, 0.72);
}
.logic-summary-contracts {
  min-height: 130px;
  padding: 8px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
  font-size: 12px;
  color: rgba(255, 255, 255, 0.72);
}
.logic-summary-detail {
  margin: 0;
  min-height: 36px;
  padding: 9px 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 7px;
  background: rgba(255, 255, 255, 0.05);
  font-size: 12px;
  line-height: 16px;
  color: rgba(255, 255, 255, 0.72);
}
.logic-summary-closure {
  align-self: flex-start;
  border: 0.5px solid #fff;
  border-radius: 8px;
  padding: 3px 10px;
  background: rgba(0, 0, 0, 0.2);
  font-size: 12px;
  font-weight: 500;
  line-height: 15px;
}
@media (max-width: 480px) {
  .logic-summary-performance {
    flex-wrap: wrap;
    gap: 4px;
  }
}
</style>
