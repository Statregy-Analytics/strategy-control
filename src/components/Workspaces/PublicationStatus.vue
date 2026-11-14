<template>
  <span class="publication-status" :class="tone">{{ label }}</span>
</template>
<script setup>
import { computed } from 'vue'
import { workspaceStatus } from 'src/services/adminWorkspaceModel'
const props = defineProps({ status: { type: String, default: null } })
const tone = computed(
  () =>
    ({
      Published: 'publication-status--published',
      Draft: 'publication-status--draft',
      UnderReview: 'publication-status--review',
      Archived: 'publication-status--archived',
    })[props.status] || '',
)
const label = computed(() => workspaceStatus(props.status))
</script>
<style scoped>
.publication-status {
  display: inline-flex;
  align-items: center;
  border: 0.8px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 3px 8px;
  color: white;
  font-size: 10px;
  line-height: 14.286px;
  letter-spacing: 0.25px;
  white-space: nowrap;
}
.publication-status--published {
  color: #74ffa0;
  border-color: #74ffa0;
  background: rgba(0, 122, 85, 0.2);
  text-transform: uppercase;
}
.publication-status--draft {
  color: #fee685;
  border-color: rgba(255, 255, 255, 0.13);
  background: rgba(255, 255, 255, 0.06);
  font-weight: 700;
  text-transform: uppercase;
  padding: 2px 8px;
}
.publication-status--review {
  color: #fee685;
  border-color: #fee685;
  background: rgba(187, 77, 0, 0.2);
  text-transform: uppercase;
}
.publication-status--archived {
  color: white;
  border: 0.5px solid white;
  background: rgba(0, 0, 0, 0.2);
  font-size: 12px;
  letter-spacing: normal;
  padding: 3px 10px;
}
</style>
