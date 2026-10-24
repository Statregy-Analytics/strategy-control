<template>
  <resource-state :state="sessions.state" @retry="load">
    <q-markup-table
      flat
      class="profile-sessions-table"
      tabindex="0"
      aria-label="Sessões de login do cliente"
    >
      <thead>
        <tr>
          <th>Data e hora</th>
          <th>IP</th>
          <th>Local</th>
          <th>Equipamento</th>
          <th>Ação</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in rows" :key="row.id">
          <td :class="row.active ? 'session-active' : 'session-inactive'">
            <span class="session-dot" aria-hidden="true" />{{ row.date }}
          </td>
          <td>{{ row.ip }}</td>
          <td>{{ row.local }}</td>
          <td>{{ row.equipment }}</td>
          <td>
            <q-btn
              flat
              dense
              no-caps
              class="session-logout"
              :aria-label="`Deslogar sessão de ${row.date}`"
              :loading="busyId === row.id"
              :disable="Boolean(busyId) || !row.id"
              @click="revoke(row.id)"
              ><IconLogout :size="14" aria-hidden="true" /><span>Deslogar</span></q-btn
            >
          </td>
        </tr>
        <tr v-if="!rows.length">
          <td colspan="5" class="profile-empty">Nenhuma sessão ativa vinculada a este cliente.</td>
        </tr>
      </tbody>
    </q-markup-table>
  </resource-state>
</template>
<script setup>
import { IconLogout } from '@tabler/icons-vue'
import { computed, onMounted, onScopeDispose, ref, watch } from 'vue'
import ResourceState from 'src/components/Finance/ResourceState.vue'
import { useFinanceResource } from 'src/composables/useFinanceResource'
import { createRequestContext } from 'src/services/requestContext'
import { listCustomerSessions, revokeCustomerSession } from 'src/services/customerSessionService'
import { customerSessionRows } from 'src/services/customerSessionPresentation'
import { getApiErrorMessage } from 'src/services/apiError'
import useNotification from 'src/composables/global/useNotification'
const props = defineProps({ customerId: { type: String, required: true } })
const { successNotify, errorNotify } = useNotification()
const sessions = useFinanceResource(),
  busyId = ref('')
const context = createRequestContext(() => props.customerId)
const rows = computed(() => customerSessionRows(sessions.state.data || []))
const load = () => {
  const id = props.customerId
  return sessions.load(() => listCustomerSessions(id))
}
async function revoke(sessionId) {
  if (busyId.value || !sessions.state.data?.some((s) => s.sessionId === sessionId)) return
  const id = props.customerId,
    active = context.capture()
  busyId.value = sessionId
  try {
    await revokeCustomerSession(id, sessionId)
    if (!active()) return
    successNotify('Sessão encerrada.')
    await load()
  } catch (error) {
    if (active())
      errorNotify(getApiErrorMessage(error, 'Não foi possível encerrar a sessão. Tente novamente.'))
  } finally {
    if (active()) busyId.value = ''
  }
}
watch(
  () => props.customerId,
  () => {
    context.invalidate()
    sessions.reset()
    busyId.value = ''
    load()
  },
  { flush: 'sync' },
)
onScopeDispose(() => {
  context.dispose()
  sessions.reset()
})
onMounted(load)
</script>
<style scoped>
.profile-sessions-table {
  color: var(--sa-text);
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--sa-border);
  border-radius: 12px;
  max-width: 100%;
  overflow-x: auto;
}
.profile-sessions-table :deep(table) {
  min-width: 560px;
}
.profile-sessions-table :deep(th) {
  text-align: left;
  font-size: 10px;
  color: var(--sa-muted);
  background: rgba(255, 255, 255, 0.05);
  letter-spacing: 0.4px;
  padding: 10px;
}
.profile-sessions-table :deep(td) {
  font-size: 12px;
  height: 62px;
  padding: 10px;
  white-space: normal;
  overflow-wrap: anywhere;
}
.profile-sessions-table :deep(th:last-child),
.profile-sessions-table :deep(td:last-child) {
  text-align: right;
}
.profile-sessions-table :deep(td:nth-child(2)) {
  font-size: 10px;
}
.session-logout {
  color: #ff8a8a;
  font-size: 12px;
}
.session-logout :deep(.q-btn__content) {
  gap: 6px;
}
.session-logout :deep(svg) {
  font-size: 16px;
  width: 16px;
  height: 16px;
  flex: none;
}
.profile-sessions-table :deep(td:first-child) {
  white-space: nowrap;
}
.session-active {
  color: #4ade80;
}
.session-inactive {
  color: var(--sa-muted);
}
.session-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 8px;
  background: currentColor;
}
.profile-empty {
  color: var(--sa-muted);
  text-align: center !important;
}
</style>
