<template>
  <q-card class="q-pa-md">
    <q-card-section class="row justify-between" style="padding-inline: 0px">
      <div class="text-h7">
        {{ title }}
      </div>
      <q-btn v-close-popup flat icon="close" size="sm" rounded color="grey-6" no-shadow />
    </q-card-section>
    <q-separator />
    <q-card-section>
      <div class="text-muted">{{ body }}</div>
    </q-card-section>
    <q-separator />
    <q-card-actions align="right">
      <q-btn
        outline
        label="Voltar"
        color="primary"
        no-caps
        @click="emit('closeDialog')"
        style="border-radius: 8px; padding-inline: 1rem; font-weight: 400; font-size: 14px"
        class="q-mt-md q-mr-sm"
      />
      <q-btn
        color="primary"
        :label="labelButton"
        no-caps
        @click="emit('submitAction')"
        style="border-radius: 8px; padding-inline: 1rem; font-weight: 400; font-size: 14px"
        class="q-mt-md q-mr-sm"
      />
    </q-card-actions>
  </q-card>
</template>

<script setup>
import { defineComponent, defineEmits } from 'vue'
defineComponent({
  name: 'RequestSuccess',
})
defineProps({
  title: {
    type: String,
    default: 'Confirmação',
  },
  body: {
    type: String,
    default: 'Ação realizada com sucesso.',
  },
  labelButton: {
    type: String,
    default: 'Ok, entendido.',
  },
})
const emit = defineEmits(['closeDialog', 'submitAction'])
</script>

<style scoped>
/* Adicione estilos personalizados aqui, se necessário */
</style>
