<template>
  <q-card class="maximed-preview-page">
    <q-card-section class="row justify-between">
      <div class="text-h6"><span class="text-muted"> Você está na </span>Pré-visualização</div>
      <q-btn v-close-popup outline color="primary" no-shadow label="Voltar para Edição" no-caps />
    </q-card-section>
    <q-card-section>
      <iframe
        src="https://strategyanalytics.com.br/"
        style="width: 100%"
        width="1000"
        frameborder="0"
        height="1000"
      ></iframe>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { defineComponent } from 'vue'

defineComponent({
  name: 'MaximedPreviewPage',
})
// Seu código aqui
</script>

<style scoped>
/* Seus estilos aqui */
</style>
