<template>
  <q-page class="contract-page">
    <contract-workspace
      v-if="workspaceOpen"
      :key="activeContract || 'new'"
      :contract-id="activeContract"
      :history-requested="route.query.history === '1'"
      @close="close"
      @saved="saved"
    />
    <keep-alive><contract-selection v-if="!workspaceOpen" @open="open" /></keep-alive>
  </q-page>
</template>
<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
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
const open = (id = null) =>
  router.push({ name: 'contracts', query: id ? { contractId: id } : { new: '1' } })
const close = () => router.push({ name: 'contracts' })
const saved = (id) => router.replace({ name: 'contracts', query: { contractId: id } })
</script>
