<template>
  <q-card class="SectionLPLayout" flat style="display: grid; gap: 24px">
    <div class="row justify-between q-pa-md align-center section-editor-pai">
      <p class="text-h6 text-bold">Seção Principal</p>
      <section-editor
        class="col-12 section"
        v-for="(section, index) in sections"
        :key="index"
        :title="section.title"
        :isActive="activeSection === section.type"
        @select="actionSelected(section.type)"
        @closed="activeSection = null"
        @hover="activeHover"
        @edit="editLp()"
      >
        <component :is="componentsMap[section.component]" />
      </section-editor>
    </div>
    <div class="row justify-between q-pa-md align-center section-editor-pai">
      <p class="text-h6 text-bold">Segunda Seção</p>
      <section-editor
        class="col-12 section"
        v-for="(section, index) in sectionsSecond"
        :key="index"
        :title="section.title"
        :isActive="activeSection === section.type"
        @select="actionSelected(section.type)"
        @closed="activeSection = null"
      >
        <component :is="componentsMap[section.component]" />
      </section-editor>
    </div>

    <q-dialog v-model="sendPasswordAction" persistent>
      <password-confirm
        title="Forneça sua Senha de Acesso para Habilitar a Edição"
        @passwordSubmitted="submitForm"
        @cancel="sendPasswordAction = false"
      />
    </q-dialog>
  </q-card>
</template>
<script setup>
import { defineComponent, ref } from 'vue'
import { useAuthStore } from 'src/stores/auth'
import { storeToRefs } from 'pinia'
import SectionEditor from 'src/components/LandingPage/SectionEditor.vue'
import MainTitle from 'src/components/Form/LandingPage/MainTitle.vue'
import PasswordConfirm from 'src/components/Auth/PasswordConfirm.vue'
import SectionParamenters from 'src/components/Form/LandingPage/SectionParameters.vue'
import SectionButton from 'src/components/Form/LandingPage/SectionButton.vue'
import useNotification from 'src/composables/global/useNotification'
defineComponent({
  name: 'SectionLPLayout',
})
const componentsMap = {
  MainTitle,
  SectionParamenters,
  SectionButton,
}
const { successNotifyLp } = useNotification()
const activeSection = ref(null)
const sendPasswordAction = ref(false)
const storeAuth = useAuthStore()
const { auth } = storeToRefs(storeAuth)
const actionSelected = (type) => {
  if (!auth.value.password) {
    sendPasswordAction.value = true
    return
  }
  activeSection.value = type

  console.log(`Ação selecionada: ${type}`)
}

const activeHover = () => {
  //bg-header
  console.log('Hover na seção ativa')
  // const header = document.querySelector('.bg-header')
  // const iframe = document.getElementById('preview-iframe')
  // const showActionBtn = document.getElementById('show-action')
  // const resetStylesBtn = document.getElementById('reset-styles') // Opcional
  // console.log(iframe, showActionBtn, resetStylesBtn)
  // iframe.onload = function () {
  //   const iframeDoc = iframe.contentDocument || iframe.contentWindow.document

  //   // Função para aplicar estilos
  //   function applyActionStyles() {
  //     const style = iframeDoc.createElement('style')
  //     style.id = 'dynamic-action-styles' // Para remover depois
  //     style.innerHTML = `
  //     .sua-classe-de-acao {
  //       background: yellow !important;
  //       border: 2px dashed red !important;
  //     }
  //     /* Outros estilos que você quer aplicar */
  //   `
  //     iframeDoc.head.appendChild(style)
  //   }

  //   // Função para remover estilos (opcional)
  //   function resetActionStyles() {
  //     const existingStyle = iframeDoc.getElementById('dynamic-action-styles')
  //     if (existingStyle) {
  //       existingStyle.remove()
  //     }
  //   }

  //   // Aplicar estilos ao clicar no botão
  //   showActionBtn.addEventListener('click', applyActionStyles)

  //   // Resetar estilos (opcional)
  //   resetStylesBtn?.addEventListener('click', resetActionStyles)
  // }

  // console.log(header)
}

const sections = ref([
  {
    title: 'Parâmetros da Seção',
    type: 'paramentros',
    component: 'SectionParamenters',
  },
  {
    title: 'Titulo Principal',
    type: 'titulo-principal',
    component: 'MainTitle',
  },
  {
    title: 'Texto de corpo',
    type: 'text-corpo',
    component: 'MainTitle',
  },
  {
    title: 'Botão de Ação',
    type: 'botao-action',
    component: 'SectionButton',
  },
])

const editLp = () => {
  successNotifyLp('Edição salva com sucesso!')
}
const submitForm = (value) => {
  sendPasswordAction.value = false
  auth.value.password = value
  console.log('Formulário enviado com sucesso!' + value)
}
const sectionsSecond = ref([
  {
    title: 'Parâmetros da Seção',
    type: 'paramentros-second',
    component: 'SectionParamenters',
  },
  {
    title: 'Titulo Principal',
    type: 'titulo-principal-second',
    component: 'MainTitle',
  },
  {
    title: 'Texto de corpo',
    type: 'text-corpo-second',
    component: 'MainTitle',
  },
])
</script>
<style scoped>
.section {
  cursor: url('/icons/cursor.png'), pointer !important;
}
.section-editor-pai {
  box-shadow:
    0 1px 5px rgba(0, 0, 0, 0.2),
    0 2px 2px rgba(0, 0, 0, 0.14),
    0 3px 1px -2px rgba(0, 0, 0, 0.12) !important;
  border-radius: 4px !important;
  background: #fff !important;
}
.dashed-border {
  border: dashed 10px red;
}
</style>
