<template>
  <div class="TitlePage row">
    <div class="col-12 q-pa-md">
      <div class="text-subtitle2 text-caption text-grey">
        {{ subtitle }}
        <slot name="subtitleAppend"></slot>
      </div>
      <q-breadcrumbs v-if="breadcrumbs.length > 0" class="primary q-mb-md" active-color="grey">
        <q-breadcrumbs-el
          v-for="(item, index) in breadcrumbs"
          :key="index"
          :label="item.label"
          :icon="item.icon"
        />
      </q-breadcrumbs>
      <div class="text-h5 text-bold">{{ title }}</div>
      <slot></slot>
    </div>
  </div>
</template>
<script>
import { defineComponent } from 'vue'
export default defineComponent({
  name: 'TitlePage',
  props: {
    title: {
      type: String,
    },
    subtitle: {
      type: String,
    },
    breadcrumbs: {
      type: Array,
      default: () => [],
    },
  },
})
</script>
