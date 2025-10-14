<template>
  <q-card class="q-pa-md">
    <q-card-section class="row justify-between" style="padding-inline: 0px">
      <div class="text-h7">Exportar Código</div>
      <q-btn v-close-popup flat icon="close" size="sm" rounded color="grey-6" no-shadow />
    </q-card-section>
    <q-separator />
    <q-card-section>
      <div class="text-muted">
        A Landing Page será exportada com todos os arquivos HTML, CSS e JavaScript, Assets e outros,
        em formato ZIP.
      </div>
    </q-card-section>
    <q-separator />
    <q-card-actions align="right">
      <q-btn
        color="primary"
        label="Voltar"
        no-caps
        @click="emit('closeDialog')"
        style="border-radius: 8px; padding-inline: 1rem; font-weight: 400; font-size: 14px"
        class="q-mt-md q-mr-sm"
        outline
      />
      <q-btn
        color="primary"
        label="Exportar ZIP"
        no-caps
        @click="emit('closeDialog')"
        style="border-radius: 8px; padding-inline: 1rem; font-weight: 400; font-size: 14px"
        class="q-mt-md q-mr-sm"
      />
    </q-card-actions>
  </q-card>
</template>

<script setup>
import { defineComponent, defineEmits } from 'vue'
defineComponent({
  name: 'ExportCodeCard',
})
const emit = defineEmits(['closeDialog'])
</script>

<style scoped>
/* Adicione estilos personalizados aqui, se necessário */
</style>
