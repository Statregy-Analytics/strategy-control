<template>
  <q-page class="contract-page">
    <resource-state v-if="sourceId && !sourceContext" :state="source.state" @retry="loadSource" />
    <contract-request-banner
      v-if="sourceContext && !workspaceOpen"
      :context="sourceContext"
      @open="showRequest"
    />
    <contract-workspace
      v-if="workspaceOpen"
      :key="activeContract || 'new'"
      :contract-id="activeContract"
      :source-request-id="sourceId"
      :request-context="sourceContext"
      :entry-requested="route.query.addParticipant === '1'"
      @request="showRequest"
      :history-requested="route.query.history === '1'"
      @close="close"
      @saved="saved"
    />
    <keep-alive
      ><contract-selection
        v-if="!workspaceOpen"
        :key="chooseMode ? 'choose' : 'all'"
        :selection-only="chooseMode"
        :new-requests="newRequests"
        @open="open"
        @requests="showRequests"
    /></keep-alive>
    <contract-requests-dialog
      v-if="route.query.requests === '1' && !requestId"
      @close="closeRequests"
      @open="showRequest"
      @count="newRequests = $event"
    />
    <contract-request-detail
      v-if="requestId"
      :request-id="requestId"
      @close="closeRequests"
      @create="fromRequest($event, false)"
      @include="fromRequest($event, true)"
    />
  </q-page>
</template>
<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ResourceState from 'src/components/Finance/ResourceState.vue'
import ContractRequestsDialog from 'src/components/Contracts/ContractRequestsDialog.vue'
import ContractRequestDetail from 'src/components/Contracts/ContractRequestDetail.vue'
import ContractRequestBanner from 'src/components/Contracts/ContractRequestBanner.vue'
import { useFinanceResource } from 'src/composables/useFinanceResource'
import { readContractRequest } from 'src/services/contractRequests'
import ContractWorkspace from 'src/components/Contracts/ContractWorkspace.vue'
import ContractSelection from 'src/components/Contracts/ContractSelection.vue'
const route = useRoute(),
  router = useRouter()
const activeContract = computed(() =>
  typeof route.query.contractId === 'string' &&
  /^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(route.query.contractId)
    ? route.query.contractId
    : null,
)
const workspaceOpen = computed(() => Boolean(activeContract.value) || route.query.new === '1')
const source = useFinanceResource(),
  newRequests = ref(null)
const idQuery = (value) =>
  typeof value === 'string' && /^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(value)
    ? value
    : null
const sourceId = computed(() => idQuery(route.query.sourceRequest)),
  requestId = computed(() => idQuery(route.query.requestId))
const sourceContext = computed(() =>
  source.state.data?.id === sourceId.value ? source.state.data : null,
)
const chooseMode = computed(() => route.query.chooseContract === '1' && !!sourceContext.value)
const loadSource = () => source.load(() => readContractRequest(sourceId.value))
watch(
  sourceId,
  (id) => {
    if (id && source.state.data?.id !== id) loadSource()
    if (!id) source.reset()
  },
  { immediate: true },
)
const showRequests = () =>
  router.push({ name: 'contracts', query: { ...route.query, requests: '1', requestId: undefined } })
const showRequest = (id) =>
  router.push({ name: 'contracts', query: { ...route.query, requests: '1', requestId: id } })
const closeRequests = () =>
  router.push({
    name: 'contracts',
    query: { ...route.query, requests: undefined, requestId: undefined },
  })
function fromRequest(context, include) {
  source.state.data = context
  router.push({
    name: 'contracts',
    query: { sourceRequest: context.id, ...(include ? { chooseContract: '1' } : { new: '1' }) },
  })
}
const open = (id = null) =>
  router.push({
    name: 'contracts',
    query: chooseMode.value
      ? { contractId: id, sourceRequest: sourceId.value, addParticipant: '1' }
      : id
        ? { contractId: id }
        : { new: '1' },
  })
const close = () => router.push({ name: 'contracts' })
const saved = (id) => router.replace({ name: 'contracts', query: { contractId: id } })
</script>
