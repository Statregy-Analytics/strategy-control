<template>
  <q-form class="InfoCompareLayout info-compare">
    <div class="compare-field">
      <q-input readonly outlined :placeholder="item_one" dense class="compare-input" />
    </div>

    <div class="compare-field">
      <q-input readonly outlined :placeholder="item_two" dense class="compare-input" />
    </div>

    <div class="compare-field">
      <q-input readonly outlined :placeholder="item_three" dense class="compare-input" />
    </div>

    <div class="compare-field">
      <q-input readonly outlined :placeholder="item_four" dense class="compare-input" />
    </div>

    <div class="compare-field">
      <q-input readonly outlined :placeholder="item_five" dense class="compare-input" />
    </div>

    <div v-if="item_six" class="compare-field">
      <q-input readonly outlined :placeholder="item_six" dense class="compare-input" />
    </div>

    <div v-if="item_seven" class="compare-field">
      <q-input readonly outlined :placeholder="item_seven" dense class="compare-input" />
    </div>

    <div v-if="item_eight" class="compare-field">
      <q-input readonly outlined :placeholder="item_eight" dense class="compare-input" />
    </div>
  </q-form>
</template>
<script>
// import labelForm from 'src/components/Form/LabelForm.vue'
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'InfoCompareLayout',
  props: {
    item_one: {
      type: [String, Number],
    },
    item_two: {
      type: [String, Number],
    },
    item_three: {
      type: [String, Number],
    },
    item_four: {
      type: [String, Number],
    },
    item_five: {
      type: [String, Number],
    },
    item_six: {
      type: [String, Number],
    },
    item_seven: {
      type: [String, Number],
    },
    item_eight: {
      type: [String, Number],
    },
  },
})
</script>

<style scoped>
.info-compare {
  display: flex;
  flex-direction: column;
}
.info-compare .compare-field {
  margin-bottom: 14px;
}
.info-compare .compare-field:last-child {
  margin-bottom: 0;
}
.info-compare .q-field__control {
  min-height: 44px; /* ensure same height as label rows */
  display: flex;
  align-items: center;
}
</style>
