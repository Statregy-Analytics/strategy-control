<template>
  <div class="input-personal">
    <span class="text-input" :style="!localDateRange.to ? 'font-size:1.2em' : 'font-size:0.6em'">
      {{ label }}
    </span>

    <q-btn flat v-if="!localDateRange.to" :aria-label="label">
      <IconCalendarEventFilled size="16" />
      <q-popup-proxy
        @before-show="updateProxy"
        cover
        transition-show="scale"
        transition-hide="scale"
      >
        <q-date v-model="proxyDateRange" range mask="DD/MM/YYYY">
          <div class="row items-center justify-end q-gutter-sm">
            <q-btn label="Cancelar" color="primary" flat v-close-popup />
            <q-btn label="OK" color="primary" flat @click="saveDateRange" v-close-popup />
          </div>
        </q-date>
      </q-popup-proxy>
    </q-btn>
    <q-badge
      v-else
      class="custom-btn-primary"
      style="font-size: 12px !important; border: 1px solid var(--Info-200, #b9e1ff)"
    >
      {{ localDateRange.from }} - {{ localDateRange.to }}
      <IconX size="14" class="q-ml-xs cursor-pointer" @click.prevent="resetDateRange" />
    </q-badge>
  </div>
</template>

<script>
import { defineComponent, ref, watch } from 'vue'

export default defineComponent({
  name: 'DateRangePicker',
  props: {
    modelValue: {
      type: Object,
      default: () => ({ from: null, to: null }),
    },
    label: {
      type: String,
      default: 'Data de solicitação',
    },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const localDateRange = ref({ ...props.modelValue })
    const proxyDateRange = ref(props.modelValue?.from ? { ...props.modelValue } : null)

    // Atualiza o valor local quando o prop muda
    watch(
      () => props.modelValue,
      (newVal) => {
        localDateRange.value = { ...newVal }
      },
      { deep: true },
    )

    const updateProxy = () => {
      proxyDateRange.value = props.modelValue?.from ? { ...props.modelValue } : null
    }

    const saveDateRange = () => {
      const range = proxyDateRange.value
      localDateRange.value = typeof range === 'string' ? { from: range, to: range } : { ...range }
      emit('update:modelValue', { ...localDateRange.value })
    }

    const resetDateRange = () => {
      localDateRange.value = { from: null, to: null }
      emit('update:modelValue', { from: null, to: null })
    }

    return {
      localDateRange,
      proxyDateRange,
      updateProxy,
      saveDateRange,
      resetDateRange,
    }
  },
})
</script>
