<template>
  <div class="publication-block-preview">
    <template v-for="block in blocks" :key="block.id">
      <h2 v-if="block.type === 'h2'">{{ block.text }}</h2>
      <h3 v-else-if="block.type === 'h3'">{{ block.text }}</h3>
      <p v-else-if="block.type === 'paragraph'">{{ block.text }}</p>
      <a
        v-else-if="block.type === 'link' && safePublicationLink(block.url)"
        :href="safePublicationLink(block.url)"
        target="_blank"
        rel="noopener noreferrer"
        >{{ block.text || block.url }}</a
      >
      <figure v-else-if="block.type === 'image' && block.previewUrl">
        <img :src="block.previewUrl" :alt="block.text || block.fileName" />
        <figcaption v-if="block.text">{{ block.text }}</figcaption>
      </figure>
      <figure v-else-if="block.type === 'video' && block.previewUrl">
        <video :src="block.previewUrl" controls preload="metadata" />
        <figcaption v-if="block.text">{{ block.text }}</figcaption>
      </figure>
      <p v-else-if="block.type === 'document' && block.fileName">
        <a :href="block.previewUrl" :download="block.fileName">{{
          block.text || block.fileName
        }}</a>
      </p>
    </template>
  </div>
</template>
<script setup>
import { safePublicationLink } from 'src/services/publicationBlocks'
defineProps({ blocks: { type: Array, default: () => [] } })
</script>
<style scoped>
.publication-block-preview {
  overflow-wrap: anywhere;
}
p {
  white-space: pre-wrap;
}
h2 {
  font-size: 24px;
  line-height: 32px;
}
h3 {
  font-size: 20px;
  line-height: 28px;
}
figure {
  margin: 16px 0;
}
img,
video {
  max-width: 100%;
  max-height: 480px;
}
figcaption {
  color: #ffffffb8;
  font-size: 12px;
}
a {
  color: #91d7ff;
}
</style>
