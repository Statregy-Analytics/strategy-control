<template>
  <div class="row justify-between q-py-sm align-center SectionHeader">
    <div class="col-4">
      <span class="text-muted"> Editor: </span>
      <q-avatar size="14px" color="grey">J</q-avatar>
      João
      <span class="text-muted">| Assessor</span>
    </div>
    <div class="col" style="text-align-last: end">
      <q-btn
        label="Salvar como Rascunho"
        color="primary"
        class="q-mr-sm"
        padding="sm md"
        flat
        no-caps
      />
      <q-btn
        label="Enviar para Revisão"
        color="primary"
        class="q-mr-sm border-radius-pattern"
        padding="sm md"
        no-caps
        @click.prevent="enviarParaRevisao"
      />
      <q-btn
        color="primary"
        icon="more_vert"
        class="border-radius-pattern"
        padding="sm xs"
        outline
        no-caps
      >
        <q-menu transition-show="flip-right" transition-hide="flip-left">
          <div
            class=""
            style="
              border-radius: 12px;
              gap: 4px;
              display: flex;
              flex-direction: column;
              justify-content: start;
            "
          >
            <q-btn
              class="q-mb-xs"
              no-caps
              flat
              style="align-items: start"
              @click="historicEdit = true"
            >
              <IconClockHour4 :size="14" class="text-muted" />
              <span class="q-ml-sm text-muted" style="font-size: small; color: #656565">
                Histórico de Mudanças
              </span>
              <!-- <q-tooltip anchor="top middle" self="bottom middle" transition-show="scale">
                </q-tooltip> -->
            </q-btn>
            <q-btn
              class="q-mb-xs"
              no-caps
              flat
              style="min-width: 181px; align-items: start"
              @click.prevent="maximizedPreview = true"
            >
              <IconScreenShare :size="14" class="text-muted" />
              <span class="q-ml-sm text-muted" style="font-size: small; color: #656565">
                Pré Visualizar
              </span>
            </q-btn>
            <q-btn
              class="q-mb-xs"
              no-caps
              flat
              style="min-width: 181px; align-items: start"
              @click="exportCode = true"
            >
              <IconFileCode :size="14" class="text-muted" />
              <span class="q-ml-sm text-muted" style="font-size: small; color: #656565">
                Exportar Código
              </span>
            </q-btn>
          </div>
          <!-- <q-list style="min-width: 100px; border-radius: 12px"> </q-list> -->
        </q-menu>
      </q-btn>
    </div>
    <q-dialog v-model="sendRevisao">
      <confirm-revision
        title="Tem certeza que quer Enviar para Revisão!"
        body="Confire todas as informações da página para enviar para o administrador revisar e aprovar a página a ser publicada."
        labelButton="Enviar para Revisão"
        @closeDialog="sendRevisao = false"
        @submitAction="submit"
      />
    </q-dialog>
    <q-dialog
      v-model="historicEdit"
      position="right"
      full-height
      full-width
      maximized
      persistent
      class="control-width-historic"
    >
      <historic-edit-layout />
    </q-dialog>
    <q-dialog v-model="exportCode">
      <export-code-card @closeDialog="exportCode = false" />
    </q-dialog>
  </div>
</template>

<script setup>
import { defineComponent, ref } from 'vue'
import { useLayoutStore } from 'src/stores/layout'
import ConfirmRevision from '../Card/ConfirmRevision.vue'
import HistoricEditLayout from 'src/layouts/LandingPage/HistoricEditLayout.vue'
import ExportCodeCard from '../Card/ExportCodeCard.vue'
import { storeToRefs } from 'pinia'

defineComponent({
  name: 'SectionHeader',
})
const storeLayout = useLayoutStore()
const { maximizedPreview } = storeToRefs(storeLayout)

const sendRevisao = ref(false)
const historicEdit = ref(false)
const exportCode = ref(false)

const enviarParaRevisao = () => {
  sendRevisao.value = true
}

const submit = () => {
  sendRevisao.value = false
  storeLayout.setDialogactionHeaderBody(
    true,
    'Edição foram enviadas para Revisão!',
    'Um administrador vai revisar e aprovar ou reprovar as edições. As atualizações serão notificadas no sistema.',
    'Ir para a Home',
  )
}
// Seu código aqui
</script>

<style scoped>
/* Seus estilos aqui */
</style>
