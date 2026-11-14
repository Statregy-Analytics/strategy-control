<template>
  <q-dialog :model-value="true" @update:model-value="!$event && $emit('close')">
    <q-card class="logic-validation">
      <header>
        <h2>Validação da Configuração</h2>
        <button aria-label="Fechar validação" @click="$emit('close')">
          <img src="/icons/logic-validation/close.svg" alt="" />
        </button>
      </header>
      <main>
        <div
          class="logic-validation__result"
          :class="{ 'logic-validation__result--valid': !error }"
          role="status"
        >
          <img v-if="!error" src="/icons/logic-validation/success.svg" alt="" />
          <div>
            <strong>{{ error || 'Configuração Válida' }}</strong>
            <p v-if="!error">Todas as regras obrigatórias foram atendidas.</p>
          </div>
        </div>
        <h3>Regras Obrigatórias</h3>
        <ul>
          <li
            v-for="rule in rules"
            :key="rule.label"
            :class="{ 'logic-validation__rule--pending': !rule.valid }"
          >
            <span class="logic-validation__rule-icon"
              ><img v-if="rule.valid" src="/icons/logic-validation/check.svg" alt="" /></span
            >{{ rule.label
            }}<span class="sr-only">{{ rule.valid ? 'Atendida' : 'Não atendida' }}</span>
          </li>
        </ul>
        <aside>
          <strong>Hierarquia Obrigatória</strong>
          <p>Intensidade positiva &lt; Teto diário &lt; Teto mensal</p>
          <p>Intensidade negativa &lt; Piso diário em módulo &lt; Piso mensal em módulo</p>
        </aside>
      </main>
    </q-card>
  </q-dialog>
</template>
<script setup>
defineProps({ error: { type: String, default: '' }, rules: { type: Array, required: true } })
defineEmits(['close'])
</script>
<style scoped>
.logic-validation {
  width: 640px;
  max-width: calc(100vw - 32px) !important;
  max-height: calc(100dvh - 48px);
  overflow: auto;
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 10px;
  background:
    linear-gradient(125deg, rgba(78, 23, 35, 0.2), rgba(16, 81, 126, 0.2)), rgba(26, 30, 45, 0.96);
  backdrop-filter: blur(20px);
  box-shadow: 4px 4px 6px rgba(0, 0, 0, 0.24);
}
header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding: 16px 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
}
h2 {
  font-size: 18px;
  font-weight: 700;
  line-height: 28px;
  margin: 0;
}
header button {
  display: grid;
  place-items: center;
  padding: 6px 10px;
  border: 1px solid rgba(255, 255, 255, 0.26);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
  cursor: pointer;
}
main {
  padding: 24px;
}
.logic-validation__result {
  display: flex;
  align-items: center;
  gap: 12px;
  border: 1px solid #ffd98a;
  background: rgba(200, 140, 0, 0.08);
  border-radius: 10px;
  padding: 16px;
  color: #ffd98a;
  font-size: 14px;
}
.logic-validation__result--valid {
  border-color: #6affaa;
  background: rgba(0, 120, 75, 0.15);
  color: #6affaa;
}
p {
  color: rgba(255, 255, 255, 0.6);
  font-size: 12px;
  line-height: 16px;
  margin: 4px 0 0;
}
h3 {
  font-size: 14px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.7px;
  margin: 24px 0 12px;
}
ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 8px;
}
li {
  display: flex;
  align-items: center;
  gap: 8px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  padding: 12px;
  font-size: 12px;
  line-height: 16px;
  color: rgba(255, 255, 255, 0.72);
  background: rgba(255, 255, 255, 0.05);
}
.logic-validation__rule-icon {
  width: 20px;
  height: 20px;
  flex: none;
}
.logic-validation__rule--pending {
  color: rgba(255, 255, 255, 0.6);
}
aside {
  margin-top: 20px;
  padding: 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.05);
  font-size: 12px;
  color: rgba(255, 255, 255, 0.72);
}
aside p {
  margin-top: 8px;
}
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
}
@media (max-width: 600px) {
  header,
  main {
    padding: 16px;
  }
  li {
    align-items: flex-start;
  }
}
</style>
