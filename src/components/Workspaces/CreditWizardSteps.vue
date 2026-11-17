<template>
  <ol class="credit-wizard-steps" aria-label="Etapas da nova operação">
    <li :aria-current="step === 1 ? 'step' : undefined"><span>1</span>Tipo</li>
    <li class="credit-wizard-line" aria-hidden="true"></li>
    <li :aria-current="step === 2 ? 'step' : undefined"><span>2</span>Cliente</li>
  </ol>
</template>
<script setup>
defineProps({ step: { type: Number, required: true } })
</script>
<style scoped>
.credit-wizard-steps {
  display: flex;
  align-items: center;
  gap: 8px;
  list-style: none;
  margin: 16px -24px 40px;
  padding: 0 24px 24px;
  border-bottom: 1px solid #ffffff33;
}
li {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #ffffffb8;
}
li span {
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #e2e8f0;
  color: #101828;
  font-size: 14px;
  font-weight: 600;
}
li[aria-current='step'] span {
  background: #b6b6b6;
}
.credit-wizard-line {
  height: 4px;
  background: #d1d5dc;
  flex: 1;
  border-radius: 10px;
}
</style>
