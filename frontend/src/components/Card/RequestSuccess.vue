<template>
  <q-card class="q-pa-md">
    <q-card-section class="row justify-between" style="padding-inline: 0px">
      <div class="text-h7">
        <q-btn icon="check" round color="green" size="xs" />
        {{ dialogConfirmHeader }}
      </div>
      <q-btn v-close-popup flat icon="close" size="sm" rounded color="grey-6" no-shadow />
    </q-card-section>
    <q-separator />
    <q-card-section>
      <div class="text-muted">{{ dialogConfirmBody }}</div>
    </q-card-section>
    <q-separator />
    <q-card-actions align="right">
      <q-btn
        color="primary"
        :label="labelButton"
        no-caps
        @click="closeDialog"
        style="border-radius: 8px; padding-inline: 1rem; font-weight: 400; font-size: 14px"
        class="q-mt-md q-mr-sm"
      />
    </q-card-actions>
  </q-card>
</template>

<script>
import { defineComponent } from 'vue'
import { useLayoutStore } from 'src/stores/layout' // Ajuste o caminho conforme necessário

export default defineComponent({
  name: 'RequestSuccess',
  setup() {
    const storeLayout = useLayoutStore()

    const closeDialog = () => {
      storeLayout.setDialogConfirmAction(false)
    }

    return {
      dialogConfirmHeader: storeLayout.dialogConfirmHeader,
      dialogConfirmBody: storeLayout.dialogConfirmBody,
      labelButton: storeLayout.dialogLabelButton ?? 'Ok, entendido.',
      closeDialog,
    }
  },
})
</script>

<style scoped>
/* Adicione estilos personalizados aqui, se necessário */
</style>
