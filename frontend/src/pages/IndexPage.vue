<template>
  <q-page
    class="IndexPage q-ma-sm row justify-center align-center items-center bg-transparent q-gutter-lg"
    style="min-height: auto !important"
    v-if="auth.token"
  >
    <div class="col-12 text-center text-h4 text-white text-bold">
      Boas Vindas, <span class="text-blue">João Silva</span>
    </div>
    <div class="col-12 text-center text-grey-5 q-mb-md">Selecione o sistema que deseja acessar</div>
    <q-card class="card-auth col-sm-12 col-12 col-md-12 text-center" style="max-width: 320px">
      <q-icon
        :name="$filtersString.resolveUrl('img:icons/screen-share.svg')"
        size="lg"
        color="primary"
        class="col self-center"
      />
      <p class="text-h7 text-white q-mt-md">
        Sistema de Edição <br />
        de Landing Page
      </p>
      <p class="text-center text-grey-5 q-mb-md">
        Gestão e monitoramento de todos os dados e sistemas da Strategy Analytics
      </p>
      <span
        class="text-primary text-h7 q-mt-md"
        style="cursor: pointer"
        @click.prevent.stop="setLandingPage()"
      >
        Acessar Sistema
      </span>
    </q-card>
    <q-card class="card-auth col-sm-12 col-12 col-md-12 text-center" style="max-width: 320px">
      <q-icon
        :name="$filtersString.resolveUrl('img:icons/nodes.svg')"
        size="lg"
        color="primary"
        class="col self-center"
      />
      <p class="text-h7 text-white q-mt-md">
        Painel de inserção <br />
        de dados
      </p>
      <p class="text-center text-grey-5 q-mb-md">
        Gestão e monitoramento de todos os dados e sistemas da Strategy Analytics
      </p>
      <span
        class="text-primary text-h7 q-mt-md"
        style="cursor: pointer"
        @click.prevent.stop="setTransiction()"
      >
        Acessar Sistema
      </span>
    </q-card>
  </q-page>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from 'src/stores/auth'
import { storeToRefs } from 'pinia'

const storeLogin = useAuthStore()
const { auth } = storeToRefs(storeLogin)
const setLandingPage = () => {
  storeLogin.setFineshed(true)
  setTimeout(() => {
    router.push({ path: '/edit-lp' })
  }, 3000)
}

const setTransiction = () => {
  storeLogin.setFineshed(true)
  setTimeout(() => {
    router.push({ path: '/transaction' })
  }, 3000)
}

const router = useRouter()
</script>
<style lang="sass">
.IndexPage
  height: auto !important
  justify-items: center
  .card-auth
    background: linear-gradient(183.42deg, rgba(255, 255, 255, 0.08) 2.82%, rgba(255, 255, 255, 0.01) 97.18%)
    width: auto
    height: auto !important
    border-radius: 8px
    padding: 48px
    gap: 24px
</style>
