<template>
  <aside class="logic-create-preview">
    <section v-if="configurationValid" class="logic-create-valid" role="status">
      <h3>
        <img src="/icons/logics/create/1484-78098-imgCircleCheck.svg" alt="" />Configuração Válida
      </h3>
      <p>
        <img src="/icons/logics/create/1484-78098-imgCircleCheck1.svg" alt="" />Todas as validações
        passaram. O motor está pronto para ser criado.
      </p>
    </section>
    <h3 class="logic-create-preview-title">Preview do Motor</h3>
    <logic-draft-preview
      :model-value="modelValue"
      :currencies="currencies"
      :configuration-valid="configurationValid"
    />
    <section class="logic-create-important">
      <img src="/icons/logics/create/1484-78098-imgCircleAlert.svg" alt="" />
      <div>
        <h3>Importante</h3>
        <p>
          Ao criar o motor, ele entrará no sistema com o status selecionado. Certifique-se de que os
          parâmetros estão alinhados com a política operacional.
        </p>
      </div>
    </section>
  </aside>
</template>
<script setup>
import LogicDraftPreview from './LogicDraftPreview.vue'
defineProps({
  modelValue: { type: Object, required: true },
  currencies: { type: Array, default: () => [] },
  configurationValid: Boolean,
})
</script>
<style scoped>
.logic-create-preview {
  position: sticky;
  top: 24px;
  margin-top: 96px;
  min-width: 0;
}
.logic-create-preview :deep(.logic-draft-preview) {
  position: static;
}
.logic-create-valid {
  padding: 24px;
  border: 1px solid #74ffa0;
  background: rgba(0, 122, 85, 0.2);
  border-radius: 14px;
}
.logic-create-valid h3 {
  display: flex;
  gap: 8px;
  align-items: center;
  font-size: 14px;
  line-height: 20px;
  color: #74ffa0;
  margin: 0;
}
.logic-create-valid p {
  display: flex;
  gap: 8px;
  align-items: flex-start;
  font-size: 12px;
  line-height: 16px;
  margin: 36px 0 0;
  color: rgba(255, 255, 255, 0.6);
}
.logic-create-valid img {
  flex: none;
}
.logic-create-preview-title {
  font-size: 14px;
  line-height: 20px;
  letter-spacing: 0.7px;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.72);
  margin: 16px 0;
}
.logic-create-important {
  display: flex;
  gap: 12px;
  margin-top: 16px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.05);
  padding: 24px;
}
.logic-create-important img {
  flex: none;
  align-self: flex-start;
}
.logic-create-important h3 {
  margin: 0;
  font-size: 12px;
  line-height: 16px;
  color: #fee685;
}
.logic-create-important p {
  margin: 6px 0 0;
  color: rgba(255, 255, 255, 0.6);
  font-size: 12px;
  line-height: 20px;
}
@media (max-width: 1100px) {
  .logic-create-preview {
    position: static;
    margin-top: 0;
  }
}
</style>
