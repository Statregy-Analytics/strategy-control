<template>
  <span
    v-if="type === 'status'"
    class="customer-badge"
    :class="`customer-badge--${customerStatusTone(value)}`"
    >{{ customerStatusLabel(value) }}</span
  >
  <span v-else-if="type === 'classification'" class="classification-badge">{{ value || '—' }}</span>
  <span
    v-else-if="type === 'compliance'"
    class="customer-badge"
    :class="`customer-badge--${compliance.tone}`"
  >
    <img
      v-if="compliance.tone !== 'inactive'"
      :src="`/icons/client-selection/compliance-${compliance.tone === 'alert' ? 'pending' : compliance.tone}.svg`"
      alt=""
      width="12"
      height="12"
    />{{ prefix }}{{ compliance.label }}
  </span>
  <span
    v-else
    class="document-level"
    :aria-label="value == null ? 'Nível documental não informado' : `Nível documental ${value}`"
  >
    <img src="/icons/client-selection/document-level.svg" alt="" width="14" height="14" />
    <span v-if="value == null">—</span>
    <span v-else class="document-level__bars"
      ><i v-for="level in 3" :key="level" :class="{ filled: Number(value) >= level }"
    /></span>
  </span>
</template>
<script setup>
import { computed } from 'vue'
import {
  customerStatusLabel,
  customerStatusTone,
  compliancePresentation,
} from 'src/services/customerPresentation'
const props = defineProps({
  type: { type: String, required: true },
  prefix: { type: String, default: '' },
  value: { type: [String, Number], default: null },
})
const compliance = computed(() => compliancePresentation(props.value))
</script>
<style scoped>
.customer-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  width: fit-content;
  padding: 3px 8px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  font-size: 10px;
  line-height: 14px;
  white-space: nowrap;
}
.customer-badge--ok {
  color: #74ffa0;
  border-color: rgba(116, 255, 160, 0.4);
  background: rgba(0, 200, 80, 0.12);
}
.customer-badge--pending {
  color: #fee685;
  border-color: rgba(254, 230, 133, 0.4);
  background: rgba(254, 230, 133, 0.12);
}
.customer-badge--alert {
  color: #fee685;
  border: 0.8px solid #fee685;
  background: rgba(187, 77, 0, 0.2);
}
.customer-badge--blocked {
  color: #ffc9c9;
  border-color: rgba(255, 100, 100, 0.4);
  background: rgba(255, 40, 40, 0.2);
}
.customer-badge--inactive {
  color: rgba(255, 255, 255, 0.6);
  background: rgba(255, 255, 255, 0.06);
}
.classification-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  padding: 3px 8px;
  border: 1px solid rgba(255, 255, 255, 0.28);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.06);
  font-size: 12px;
  line-height: 18px;
}
.document-level {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 24px;
}
.document-level__bars {
  display: flex;
  gap: 2px;
}
.document-level__bars i {
  width: 18px;
  height: 5px;
  border-radius: 2px;
  background: rgba(255, 255, 255, 0.28);
}
.document-level__bars i.filled {
  background: #fff;
}
</style>
