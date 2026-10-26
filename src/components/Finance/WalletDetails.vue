<template>
  <div>
    <template v-if="row.type === 'strategy'"
      ><client-portfolio-contracts
        v-for="currency in row.currencies?.filter((item) => item.currencyId) || []"
        :key="currency.currencyId"
        :customer-id="row.customerId"
        :currency-id="currency.currencyId"
        :currency-code="currency.currency"
      />
      <p v-if="!row.currencies?.some((item) => item.currencyId)">
        Vínculos dos contratos ainda indisponíveis.
      </p></template
    >
    <customer-assets v-else-if="row.type === 'assets'" :customer-id="row.customerId" />
    <wallet-overview
      v-else
      :model="{ deposit: row, principalCurrency: row.principalCurrency }"
      initial-type="deposit"
    />
  </div>
</template>
<script setup>
import ClientPortfolioContracts from 'src/components/Clients/ClientPortfolioContracts.vue'
import CustomerAssets from './CustomerAssets.vue'
import WalletOverview from './WalletOverview.vue'
defineProps({ row: { type: Object, required: true } })
</script>
