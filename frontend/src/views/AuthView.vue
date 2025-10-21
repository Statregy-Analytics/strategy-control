<template>
  <q-layout class="AuthView">
    <!-- :class="data ? data.login : ''" -->
    <q-header class="bg-transparent text-white">
      <q-toolbar class="q-ma-sm">
        <CompletBrand />
      </q-toolbar>
    </q-header>
    <q-page-container padding>
      <video autoplay muted loop class="auth-video" v-if="!finished">
        <source src="media/authentication.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <video autoplay muted loop class="auth-video" v-else>
        <source src="media/video-saida-auth.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <initial-auth-layout v-if="!selectedInitial" />
      <router-view v-slot="{ Component }" v-else-if="selectedInitial && !finished">
        <transition name="fade" mode="out-in">
          <component :is="Component"></component>
        </transition>
      </router-view>
    </q-page-container>
    <q-footer class="q-pb-lg bg-transparent text-grey">
      <p class="q-ml-md q-ma-sm">Strategy Analytics | Sistemas</p>
    </q-footer>
  </q-layout>
</template>
<script setup>
import CompletBrand from 'src/components/brand/CompletBrand.vue'
import InitialAuthLayout from 'src/layouts/Auth/InitialAuthLayout.vue'
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
// import useAuth from "../composables/Helpers/useAuth.js";
import { useAuthStore } from 'src/stores/auth'
import { storeToRefs } from 'pinia'
// import IconleftBack from "../components/footer/IconleftBack.vue";
// const { stateAuth } = useAuth();
const route = useRoute()
const storeLogin = useAuthStore()
const { selectedInitial, finished } = storeToRefs(storeLogin)
onMounted(async () => {
  if (route.name === 'Auth' || route.name === 'Register') {
    storeLogin.selectedInitial = true
  }
  console.log(route.query)
  console.log('[DEBUG] AuthView mounted - state', {
    selectedInitial: storeLogin.selectedInitial,
    finished: storeLogin.finished,
    auth: storeLogin.auth,
  })
  if (route.query.q) {
    console.log(route.name)
    // await stateAuth(route.query.q, route.name);
  } else if (route.query.recovery) {
    console.log('Amigo estou aqui!!!')
  }
})
</script>
<style scoped lang="sass">
.fade-enter-active,
.fade-leave-active
  transition: opacity 555ms

.fade-enter,
.fade-leave-to
  opacity: 0

.AuthView
  position: relative
  min-height: 100vh
  overflow: hidden
  background: url('assets/images/Auth_loading_inicial.png') no-repeat center center
  background-size: cover

  .auth-video
    position: fixed
    top: 0
    left: 0
    width: 100vw
    height: 100vh
    object-fit: cover
    z-index: -1
    pointer-events: none

  .q-page-container
    position: relative // Garante que o conteúdo fique acima do vídeo
    z-index: 1
</style>
