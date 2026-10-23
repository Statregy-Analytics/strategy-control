<template>
  <q-layout view="lHh Lpr fff" class="sa-shell">
    <q-drawer
      v-model="drawerOpen"
      show-if-above
      :width="256"
      :breakpoint="900"
      :behavior="$q.screen.width < 900 ? 'mobile' : 'desktop'"
      :mini="mini"
      :mini-width="72"
      bordered
      class="sa-sidebar"
    >
      <div class="sa-sidebar__content">
        <div class="sa-sidebar__brand">
          <img v-if="!mini" src="/icons/admin-menu/logo.svg" alt="Strategy Analytics" />
        </div>
        <q-list class="sa-sidebar__nav" aria-label="Menu administrativo">
          <q-item
            v-for="item in navigationItems"
            :key="item.label"
            v-ripple
            :clickable="Boolean(item.to)"
            :to="item.to || undefined"
            exact
            :disable="!item.to"
            :title="!item.to ? 'Indisponível' : undefined"
            :active="navigationIsActive(item, route.path)"
            :aria-current="navigationIsActive(item, route.path) ? 'page' : undefined"
            active-class="sa-sidebar__item--active"
            class="sa-sidebar__item"
          >
            <q-item-section avatar
              ><img
                :src="
                  navigationIsActive(item, route.path) && item.activeIcon
                    ? item.activeIcon
                    : item.icon
                "
                alt=""
            /></q-item-section>
            <q-item-section v-if="!mini">{{ item.label }}</q-item-section
            ><q-tooltip v-else>{{ item.label }}</q-tooltip>
          </q-item>
        </q-list>
        <div class="sa-sidebar__footer">
          <q-expansion-item
            v-model="settingsOpen"
            hide-expand-icon
            class="sa-sidebar__settings"
            :header-class="['sa-sidebar__item', settingsActive ? 'sa-sidebar__item--active' : '']"
            @before-show="mini = false"
          >
            <template #header
              ><q-item-section avatar
                ><img src="/icons/admin-menu/settings.svg" alt="" /></q-item-section
              ><q-item-section v-if="!mini">Configurações</q-item-section
              ><q-tooltip v-else>Configurações</q-tooltip></template
            >
            <q-list v-if="!mini" class="sa-sidebar__settings-links">
              <q-item
                v-for="item in adminSettings"
                :key="item.to"
                clickable
                :to="item.to"
                exact
                active-class="sa-sidebar__item--active"
                class="sa-sidebar__item"
                ><q-item-section>{{ item.label }}</q-item-section></q-item
              >
            </q-list>
          </q-expansion-item>
          <q-select
            v-if="!mini && workspaceOptions.length > 1"
            v-model="selectedWorkspace"
            :options="workspaceOptions"
            emit-value
            map-options
            dense
            outlined
            dark
            options-dense
            label="Workspace"
            class="q-mb-sm"
            @update:model-value="changeWorkspace"
          />
          <q-item v-if="!mini && (user?.name || user?.email)" class="sa-user-card">
            <q-item-section avatar
              ><q-avatar color="white" text-color="dark" icon="person" size="32px"
            /></q-item-section>
            <q-item-section>
              <q-item-label v-if="user?.name">{{ user.name }}</q-item-label>
              <q-item-label v-if="user?.email" caption>{{ user.email }}</q-item-label>
            </q-item-section>
          </q-item>
          <q-item
            clickable
            :to="{ name: 'Selected' }"
            class="sa-sidebar__item sa-sidebar__system"
            aria-label="Trocar Sistema"
            ><q-item-section avatar
              ><img src="/icons/admin-menu/systems.svg" alt="" /></q-item-section
            ><q-item-section v-if="!mini">Trocar Sistema</q-item-section
            ><q-tooltip v-else>Trocar Sistema</q-tooltip></q-item
          >
          <q-item
            clickable
            class="sa-sidebar__item sa-sidebar__logout"
            aria-label="Sair"
            @click="onLogout"
            ><q-item-section avatar
              ><img src="/icons/admin-menu/logout.svg" alt="" /></q-item-section
            ><q-item-section v-if="!mini">Sair</q-item-section
            ><q-tooltip v-else>Sair</q-tooltip></q-item
          >
        </div>
        <q-btn
          v-if="$q.screen.width >= 900"
          round
          flat
          dense
          class="sa-sidebar__collapse"
          :aria-label="mini ? 'Expandir menu' : 'Recolher menu'"
          @click="mini = !mini"
          ><img src="/icons/admin-menu/collapse.svg" alt="" :class="{ 'sa-sidebar__expand': mini }"
        /></q-btn>
      </div>
    </q-drawer>
    <q-header class="sa-mobile-header text-white">
      <q-toolbar
        ><q-btn
          flat
          round
          dense
          icon="menu"
          aria-label="Abrir navegação"
          @click="drawerOpen = !drawerOpen"
        /><q-toolbar-title>Strategy Analytics</q-toolbar-title></q-toolbar
      >
    </q-header>
    <q-page-container class="sa-page-container">
      <router-view v-slot="{ Component }"
        ><transition name="fade" mode="out-in"
          ><component :is="Component" :key="route.path" /></transition
      ></router-view>
    </q-page-container>
    <q-dialog v-model="dialogConfirmAction"><request-success /></q-dialog>
  </q-layout>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { LocalStorage, useQuasar } from 'quasar'
import { storeToRefs } from 'pinia'
import RequestSuccess from 'src/components/Card/RequestSuccess.vue'
import { useLayoutStore } from 'src/stores/layout'
import { useAuthStore } from 'src/stores/auth'
import useNotification from 'src/composables/global/useNotification'
import { getMySystems, selectWorkspace } from 'src/services/authService'
import { WORKSPACE_KEY } from 'src/boot/axios'
import { adminNavigation, adminSettings, navigationIsActive } from 'src/services/adminNavigation'

const route = useRoute()
const router = useRouter()
const layoutStore = useLayoutStore()
const authStore = useAuthStore()
const { dialogConfirmAction } = storeToRefs(layoutStore)
const { user } = storeToRefs(authStore)
const { showLoading, hideLoading, successNotify } = useNotification()
const drawerOpen = ref(false)
const mini = ref(false)
const settingsActive = computed(() =>
  adminSettings.some((item) => navigationIsActive(item, route.path)),
)
const settingsOpen = ref(settingsActive.value)
const $q = useQuasar()
watch(
  () => route.fullPath,
  () => {
    if ($q.screen.width < 900) drawerOpen.value = false
    if (settingsActive.value) settingsOpen.value = true
  },
)
watch(
  () => $q.screen.width,
  (width) => {
    if (width < 900) {
      mini.value = false
      drawerOpen.value = false
    }
  },
)
const systems = ref([])
const selectedWorkspace = ref(LocalStorage.getItem(WORKSPACE_KEY) || null)
const navigationItems = adminNavigation
const collection = (value) =>
  Array.isArray(value) ? value : value?.systems || value?.items || value?.data || []
const workspaces = computed(() =>
  systems.value
    .flatMap((system) => system.workspaces || system.workspaceIds || [])
    .map((workspace) =>
      typeof workspace === 'string' ? { id: workspace, name: workspace } : workspace,
    ),
)
const workspaceOptions = computed(() =>
  workspaces.value
    .map((workspace) => ({
      value: workspace.id || workspace.workspaceId,
      label: workspace.name || workspace.displayName || workspace.id || workspace.workspaceId,
    }))
    .filter((item) => item.value),
)
const changeWorkspace = (workspaceId) => {
  selectWorkspace(workspaceId)
  window.location.reload()
}
onMounted(async () => {
  try {
    systems.value = collection(await getMySystems())
    if (!selectedWorkspace.value && workspaceOptions.value.length === 1) {
      selectedWorkspace.value = workspaceOptions.value[0].value
      selectWorkspace(selectedWorkspace.value)
    }
  } catch {
    systems.value = []
  }
})
const onLogout = async () => {
  try {
    showLoading('Saindo...')
    await authStore.logoutAction()
  } finally {
    hideLoading()
    successNotify('Sessão encerrada.')
    router.push({ name: 'Auth' })
  }
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 240ms ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
:global(.sa-sidebar.q-drawer__content) {
  overflow: visible;
}
.sa-sidebar__content {
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;
}
.sa-sidebar__brand {
  height: 80px;
  flex: none;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
}
.sa-sidebar__brand img {
  width: 182px;
  height: 39.13px;
}
.sa-sidebar__nav {
  min-height: 0;
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 16px 12px;
}
.sa-sidebar__item {
  min-height: 36px;
  margin-bottom: 4px;
  padding: 8px 12px;
  border: 1px solid transparent;
  border-radius: 10px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
  line-height: 20px;
}
.sa-sidebar__item .q-item__section--avatar {
  min-width: 32px;
  padding-right: 12px;
}
.sa-sidebar__item .q-item__section--main {
  min-width: 0;
  overflow-wrap: anywhere;
}
.sa-sidebar img {
  flex: none;
}
.sa-sidebar__item .q-item__section--avatar img,
.sa-sidebar__settings :deep(.q-item__section--avatar img) {
  width: 20px;
  height: 20px;
}
.sa-sidebar__item--active {
  color: #00a3ff;
  border-color: rgba(255, 255, 255, 0.72);
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.04));
}
.sa-sidebar__footer {
  flex: none;
  padding: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.12);
  max-height: 65%;
  overflow-y: auto;
  overflow-x: hidden;
}
.sa-sidebar__settings-links {
  padding-left: 16px;
}
.sa-sidebar__settings :deep(.q-item__section--avatar) {
  min-width: 32px;
  padding-right: 12px;
}
.sa-sidebar__collapse {
  position: absolute;
  right: -12px;
  top: 50%;
  width: 24px;
  min-height: 24px;
  height: 24px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.05);
}
.sa-sidebar__collapse img {
  width: 12px;
  height: 12px;
}
.sa-sidebar__expand {
  transform: rotate(180deg);
}
.sa-sidebar__system {
  color: #00a3ff;
  margin-top: 4px;
}
.sa-sidebar__logout {
  color: #c10007;
}
.sa-user-card {
  min-height: 56px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.06);
}
.sa-user-card .q-item__section {
  min-width: 0;
}
.sa-user-card :deep(.q-item__label) {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 12px;
}
.sa-user-card :deep(.q-item__label--caption) {
  color: rgba(255, 255, 255, 0.52);
}
.sa-mobile-header {
  display: none;
  background: rgba(12, 15, 27, 0.92);
  backdrop-filter: blur(18px);
}
@media (max-width: 899px) {
  .sa-mobile-header {
    display: block;
  }
}
</style>
