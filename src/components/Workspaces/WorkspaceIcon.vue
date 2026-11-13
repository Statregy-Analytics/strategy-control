<template>
  <img :src="'/icons/workspaces/' + name + '.svg'" alt="" class="workspace-icon" />
</template>
<script setup>
defineProps({ name: { type: String, required: true } })
</script>
