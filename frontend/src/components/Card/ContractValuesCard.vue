<template>
  <q-card class="ContractDetailsCard q-pa-sm" bordered flat :class="bgColor">
    <q-card-section class="q-pa-none">
      <div class="text-caption text-grey-8">
        {{ title }}
      </div>
      <!-- <div class="text-h5 text-grey-8">{{ subTitle }}</div> -->
      <div class="text-h6" :class="iconValue && badgeText ? 'section-card' : ''">
        <q-icon
          v-if="iconValue"
          :name="iconValue"
          class="text-h6"
          :color="iconValue == 'arrow_downward' ? 'red' : 'green'"
        />
        <p class="text-h7" v-if="value" style="margin: auto">{{ value }}</p>
        <q-chip
          outline
          square
          v-if="badgeText"
          class=""
          :label="badgeText"
          :color="badgeColor"
          size="sm"
        />
      </div>
    </q-card-section>
  </q-card>
</template>
<script>
import { defineComponent } from 'vue'
export default defineComponent({
  name: 'ContractDetailsCard',
  props: {
    title: {
      type: String,
    },
    value: {
      type: String,
    },
    iconValue: {
      type: String,
    },
    iconColor: {
      type: String,
    },
    badgeText: {
      type: String,
    },
    badgeColor: {
      type: String,
      default: 'primary',
    },
    bgColor: {
      type: String,
      default: 'primary',
    },
  },
})
</script>
<style lang="sass">
.section-card
  display: flex
  align-items: center
  justify-content: center
  align-content: center
  flex-direction: row
</style>
