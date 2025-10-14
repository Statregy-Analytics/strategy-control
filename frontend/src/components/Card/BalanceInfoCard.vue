<template>
  <q-card class="BalanceInfoCard q-pa-sm" bordered flat :class="bgColor">
    <q-card-section class="q-pa-none">
      <div class="text-caption text-grey-8" style="display: inline-flex">
        {{ title }}
        <span>
          <IconInfoCircle size="20px" />
        </span>
      </div>
      <!-- <div class="text-h5 text-grey-8">{{ subTitle }}</div> -->
      <div class="text-h6">{{ value }}</div>
    </q-card-section>
  </q-card>
</template>
<script>
import { defineComponent } from 'vue'
export default defineComponent({
  name: 'BalanceInfoCard',
  props: {
    title: {
      type: String,
      default: 'Title',
    },
    subTitle: {
      type: String,
      default: 'Subtitle',
    },
    value: {
      type: String,
      default: 'R$ 0,00',
    },
    moreInfo: {
      type: String,
      default: 'Mais informações',
    },
    bgColor: {
      type: String,
      default: 'primary',
    },
  },
})
</script>
