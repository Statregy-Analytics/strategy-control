<template>
  <div>
    <client-portfolio-contracts
      v-if="row.type === 'strategy'"
      :customer-id="row.customerId"
      all-currencies
      compact
    />
    <customer-assets
      v-else-if="row.type === 'assets'"
      :customer-id="row.customerId"
      :wallet-assets="row.assets || []"
      :principal-currency="row.principalCurrency"
      @changed="$emit('changed')"
    />
    <wallet-overview
      v-else
      :model="row.model || { deposit: row, principalCurrency: row.principalCurrency }"
      :initial-type="row.type === 'total' ? 'total' : 'deposit'"
    />
  </div>
</template>
<script setup>
import ClientPortfolioContracts from 'src/components/Clients/ClientPortfolioContracts.vue'
import CustomerAssets from './CustomerAssets.vue'
import WalletOverview from './WalletOverview.vue'
defineEmits(['changed'])
defineProps({ compact: Boolean, row: { type: Object, required: true } })
</script>
