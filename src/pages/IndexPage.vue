<template>
  <q-page
    class="IndexPage row justify-center align-center items-center bg-transparent q-gutter-lg"
    style="min-height: auto !important"
    v-if="auth.token"
  >
    <div class="col-12 text-center text-h4 text-white text-bold">Selecionar Sistema</div>
    <div class="col-12 text-center text-grey-5 q-mb-md">Escolha qual ambiente deseja acessar.</div>
    <q-card class="card-auth col-sm-12 col-12 col-md-12 text-center" style="max-width: 320px">
      <q-icon
        :name="$filtersString.resolveUrl('img:icons/screen-share.svg')"
        size="lg"
        color="primary"
        class="col self-center"
      />
      <p class="text-h7 text-white q-mt-md">
        Edição de Landing Page
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
        Inserção de Dados
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
  min-height: 100vh !important
  padding: 120px 24px
  background: radial-gradient(circle at 50% 50%, rgba(19,112,169,.45), transparent 35%), linear-gradient(135deg, #1a1e2d, #111522 65%, #4e1723) !important
  justify-items: center
  .card-auth
    background: linear-gradient(160deg, rgba(255, 255, 255, 0.10), rgba(255, 255, 255, 0.025))
    width: 496px
    max-width: calc(100vw - 32px) !important
    min-height: 300px
    border: 1px solid rgba(255,255,255,.16)
    box-shadow: 4px 4px 18px rgba(0,0,0,.28)
    backdrop-filter: blur(20px)
    border-radius: 14px
    padding: 36px
    gap: 24px
</style>
