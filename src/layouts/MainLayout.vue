<template>
  <q-layout view="lHh Lpr fff" class="sa-shell">
    <q-drawer v-model="drawerOpen" show-if-above :width="256" :breakpoint="900" bordered class="sa-sidebar">
      <div class="sa-sidebar__brand">Strategy Analytics</div>
      <q-list class="sa-sidebar__nav q-pa-sm">
        <q-item v-for="item in navigationItems" :key="item.to" v-ripple clickable :to="item.to" exact
          active-class="sa-sidebar__item--active" class="sa-sidebar__item">
          <q-item-section avatar><q-icon :name="item.icon" size="20px" /></q-item-section>
          <q-item-section>{{ item.label }}</q-item-section>
        </q-item>
      </q-list>
      <div class="sa-sidebar__footer q-pa-sm">
        <q-select v-if="workspaceOptions.length > 1" v-model="selectedWorkspace" :options="workspaceOptions"
          emit-value map-options dense outlined dark options-dense label="Workspace" class="q-mb-sm"
          @update:model-value="changeWorkspace" />
        <q-item v-if="user?.name || user?.email" class="sa-user-card">
          <q-item-section avatar><q-avatar color="white" text-color="dark" icon="person" size="32px" /></q-item-section>
          <q-item-section>
            <q-item-label v-if="user?.name">{{ user.name }}</q-item-label>
            <q-item-label v-if="user?.email" caption>{{ user.email }}</q-item-label>
          </q-item-section>
        </q-item>
        <q-btn flat no-caps color="negative" icon="logout" label="Sair" class="full-width justify-start" @click="onLogout" />
      </div>
    </q-drawer>
    <q-header class="sa-mobile-header text-white">
      <q-toolbar><q-btn flat round dense icon="menu" aria-label="Abrir navegação" @click="drawerOpen = !drawerOpen" /><q-toolbar-title>Strategy Analytics</q-toolbar-title></q-toolbar>
    </q-header>
    <q-page-container class="sa-page-container">
      <router-view v-slot="{ Component }"><transition name="fade" mode="out-in"><component :is="Component" :key="route.path" /></transition></router-view>
    </q-page-container>
    <q-dialog v-model="dialogConfirmAction"><request-success /></q-dialog>
  </q-layout>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { LocalStorage } from 'quasar'
import { storeToRefs } from 'pinia'
import RequestSuccess from 'src/components/Card/RequestSuccess.vue'
import { useLayoutStore } from 'src/stores/layout'
import { useAuthStore } from 'src/stores/auth'
import useNotification from 'src/composables/global/useNotification'
import { getMySystems, selectWorkspace } from 'src/services/authService'
import { WORKSPACE_KEY } from 'src/boot/axios'

const route = useRoute()
const router = useRouter()
const layoutStore = useLayoutStore()
const authStore = useAuthStore()
const { dialogConfirmAction } = storeToRefs(layoutStore)
const { user } = storeToRefs(authStore)
const { showLoading, hideLoading, successNotify } = useNotification()
const drawerOpen = ref(false)
const systems = ref([])
const selectedWorkspace = ref(LocalStorage.getItem(WORKSPACE_KEY) || null)
const navigationItems = [
  { label: 'Clientes', icon: 'group', to: '/dataManagement' },
  { label: 'Formulários', icon: 'description', to: '/dataManagement/forms' },
]
const collection = (value) => Array.isArray(value) ? value : value?.systems || value?.items || value?.data || []
const workspaces = computed(() => systems.value.flatMap((system) => system.workspaces || system.workspaceIds || []).map((workspace) => typeof workspace === 'string' ? { id: workspace, name: workspace } : workspace))
const workspaceOptions = computed(() => workspaces.value.map((workspace) => ({ value: workspace.id || workspace.workspaceId, label: workspace.name || workspace.displayName || workspace.id || workspace.workspaceId })).filter((item) => item.value))
const changeWorkspace = (workspaceId) => { selectWorkspace(workspaceId); window.location.reload() }
onMounted(async () => {
  try {
    systems.value = collection(await getMySystems())
    if (!selectedWorkspace.value && workspaceOptions.value.length === 1) {
      selectedWorkspace.value = workspaceOptions.value[0].value
      selectWorkspace(selectedWorkspace.value)
    }
  } catch { systems.value = [] }
})
const onLogout = async () => {
  try { showLoading('Saindo...'); await authStore.logoutAction() }
  finally { hideLoading(); successNotify('Sessão encerrada.'); router.push({ name: 'Auth' }) }
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 240ms ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.sa-sidebar__brand { height: 80px; display: flex; align-items: center; padding: 0 20px; font-size: 17px; font-weight: 700; border-bottom: 1px solid rgba(255,255,255,.14); }
.sa-sidebar__nav { padding-top: 14px; }
.sa-sidebar__item { min-height: 40px; margin-bottom: 2px; border: 1px solid transparent; border-radius: 10px; color: rgba(255,255,255,.68); }
.sa-sidebar__item .q-item__section--avatar { min-width: 34px; }
.sa-sidebar__item--active { color: #51b8ff; border-color: rgba(255,255,255,.72); background: linear-gradient(90deg, rgba(255,255,255,.10), rgba(255,255,255,.04)); }
.sa-sidebar__footer { position: absolute; right: 0; bottom: 0; left: 0; border-top: 1px solid rgba(255,255,255,.14); }
.sa-user-card { min-height: 56px; border: 1px solid rgba(255,255,255,.14); border-radius: 10px; background: rgba(255,255,255,.06); }
.sa-user-card :deep(.q-item__label--caption) { color: rgba(255,255,255,.52); }
.sa-mobile-header { display: none; background: rgba(12,15,27,.92); backdrop-filter: blur(18px); }
@media (max-width: 899px) { .sa-mobile-header { display: block; } }
</style>
