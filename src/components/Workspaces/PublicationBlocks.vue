<template>
  <div class="publication-blocks">
    <div
      v-for="(block, index) in visibleBlocks"
      :key="block.id"
      class="publication-block"
      :class="'publication-block--' + block.type"
    >
      <div v-if="blocks.length" class="block-controls">
        <span>{{ label(block.type) }}</span>
        <q-btn
          flat
          dense
          no-caps
          label="Subir"
          :disable="readonly || index === 0"
          :aria-label="'Subir bloco ' + (index + 1)"
          @click="move(index, -1)"
        />
        <q-btn
          flat
          dense
          no-caps
          label="Descer"
          :disable="readonly || index === visibleBlocks.length - 1"
          :aria-label="'Descer bloco ' + (index + 1)"
          @click="move(index, 1)"
        />
        <q-btn
          flat
          dense
          no-caps
          label="Remover"
          :disable="readonly"
          :aria-label="'Remover bloco ' + (index + 1)"
          @click="remove(index)"
        />
      </div>
      <q-input
        v-if="['paragraph', 'h2', 'h3'].includes(block.type)"
        :model-value="block.text"
        outlined
        dense
        dark
        :type="block.type === 'paragraph' ? 'textarea' : 'text'"
        :rows="3"
        :placeholder="
          block.type === 'paragraph' ? 'Escreva um parágrafo...' : 'Escreva um título...'
        "
        :aria-label="
          blocks.length ? label(block.type) + ' ' + (index + 1) : 'Conteúdo da publicação'
        "
        :readonly="readonly"
        @update:model-value="updateText(index, $event)"
      />
      <template v-else-if="block.type === 'link'">
        <q-input
          :model-value="block.text"
          outlined
          dense
          dark
          placeholder="Texto do link"
          :aria-label="'Texto do link ' + (index + 1)"
          :readonly="readonly"
          @update:model-value="update(index, { text: $event })"
        />
        <q-input
          :model-value="block.url"
          outlined
          dense
          dark
          placeholder="https://"
          :aria-label="'Endereço do link ' + (index + 1)"
          :readonly="readonly"
          :error="Boolean(block.url) && !safeLink(block.url)"
          error-message="Informe um endereço http ou https válido."
          @update:model-value="update(index, { url: $event })"
        />
      </template>
      <template v-else>
        <q-file
          :model-value="block.file || null"
          outlined
          dense
          dark
          :accept="accept(block.type)"
          :label="label(block.type)"
          :aria-label="label(block.type) + ' ' + (index + 1)"
          :disable="readonly"
          clearable
          @update:model-value="chooseFile(index, $event)"
        />
        <img
          v-if="block.type === 'image' && block.previewUrl"
          class="block-image"
          :src="block.previewUrl"
          :alt="block.text || block.fileName"
        />
        <video
          v-if="block.type === 'video' && block.previewUrl"
          :src="block.previewUrl"
          controls
          preload="metadata"
        />
        <q-input
          :model-value="block.text"
          outlined
          dense
          dark
          :placeholder="block.type === 'image' ? 'Descrição da imagem' : 'Legenda (opcional)'"
          :aria-label="'Descrição do bloco ' + (index + 1)"
          :readonly="readonly"
          @update:model-value="update(index, { text: $event })"
        />
      </template>
      <div class="block-insert">
        <q-btn
          flat
          dense
          round
          :disable="readonly"
          :aria-label="'Inserir bloco após ' + (index + 1)"
          ><img src="/icons/publication/plus.svg" alt="" />
          <q-menu class="glass-menu"
            ><q-list dense
              ><q-item
                v-for="type in types"
                :key="type.value"
                clickable
                v-close-popup
                @click="insert(index, type.value)"
                ><q-item-section>{{ type.label }}</q-item-section></q-item
              ></q-list
            ></q-menu
          >
        </q-btn>
      </div>
    </div>
    <p v-if="error" role="alert" class="block-error">{{ error }}</p>
  </div>
</template>
<script setup>
import { computed, onScopeDispose, ref } from 'vue'
import { safePublicationLink } from 'src/services/publicationBlocks'
const props = defineProps({
  modelValue: { type: String, default: '' },
  blocks: { type: Array, default: () => [] },
  readonly: Boolean,
})
const emit = defineEmits(['update:modelValue', 'update:blocks'])
const error = ref(''),
  urls = new Set()
const types = [
  { value: 'paragraph', label: 'Parágrafo' },
  { value: 'h2', label: 'Título H2' },
  { value: 'h3', label: 'Título H3' },
  { value: 'image', label: 'Imagem' },
  { value: 'video', label: 'Vídeo' },
  { value: 'document', label: 'Documento' },
  { value: 'link', label: 'Link' },
]
const visibleBlocks = computed(() =>
  props.blocks.length ? props.blocks : [{ id: 'body', type: 'paragraph', text: props.modelValue }],
)
const label = (type) => types.find((t) => t.value === type)?.label || 'Bloco'
const safeLink = safePublicationLink
const accept = (type) =>
  type === 'image'
    ? 'image/png,image/jpeg,image/webp,image/gif'
    : type === 'video'
      ? 'video/mp4,video/webm'
      : '.pdf,.txt,.csv,.doc,.docx,.xls,.xlsx'
function publish(blocks) {
  emit('update:blocks', blocks)
  emit(
    'update:modelValue',
    blocks
      .filter((b) => ['paragraph', 'h2', 'h3'].includes(b.type))
      .map((b) => b.text || '')
      .join('\n\n'),
  )
}
function update(index, changes) {
  if (props.readonly) return
  publish(visibleBlocks.value.map((b, i) => (i === index ? { ...b, ...changes } : b)))
}
function updateText(index, text) {
  if (props.readonly) return
  if (!props.blocks.length) emit('update:modelValue', text)
  else update(index, { text })
}
function insert(index, type) {
  if (props.readonly) return
  const blocks = [...visibleBlocks.value]
  blocks.splice(index + 1, 0, { id: crypto.randomUUID(), type, text: '', url: '' })
  publish(blocks)
}
function release(block) {
  if (block.previewUrl && urls.has(block.previewUrl)) {
    URL.revokeObjectURL(block.previewUrl)
    urls.delete(block.previewUrl)
  }
}
function remove(index) {
  if (props.readonly) return
  release(visibleBlocks.value[index])
  const blocks = visibleBlocks.value.filter((_, i) => i !== index)
  publish(blocks)
}
function move(index, offset) {
  if (props.readonly) return
  const blocks = [...visibleBlocks.value],
    target = index + offset
  if (target < 0 || target >= blocks.length) return
  ;[blocks[index], blocks[target]] = [blocks[target], blocks[index]]
  publish(blocks)
}
function chooseFile(index, file) {
  if (props.readonly) return
  error.value = ''
  const block = visibleBlocks.value[index]
  if (file) {
    const allowed =
      block.type === 'image'
        ? /^image\/(png|jpeg|webp|gif)$/.test(file.type)
        : block.type === 'video'
          ? /^video\/(mp4|webm)$/.test(file.type)
          : /\.(pdf|txt|csv|docx?|xlsx?)$/i.test(file.name)
    if (!allowed || file.size > 25 * 1024 * 1024) {
      error.value = 'Selecione um arquivo compatível de até 25 MB.'
      return
    }
  }
  release(block)
  const previewUrl = file ? URL.createObjectURL(file) : ''
  if (previewUrl) urls.add(previewUrl)
  update(index, { file, fileName: file?.name || '', previewUrl })
}
onScopeDispose(() => {
  for (const url of urls) URL.revokeObjectURL(url)
})
</script>
<style scoped>
.publication-block {
  min-width: 0;
}
.block-controls {
  display: flex;
  gap: 4px;
  align-items: center;
  flex-wrap: wrap;
  color: #ffffffb8;
  font-size: 11px;
  margin-bottom: 8px;
}
.block-controls > span {
  margin-right: auto;
}
.block-controls .q-btn {
  font-size: 10px;
}
.block-insert {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 8px 0;
}
.block-insert:before,
.block-insert:after {
  content: '';
  flex: 1;
  border-top: 1px solid #ffffff33;
}
.block-insert .q-btn {
  min-height: 24px;
  width: 24px;
  opacity: 0.4;
}
.block-insert:focus-within .q-btn,
.block-insert:hover .q-btn {
  opacity: 1;
}
.block-insert img {
  display: block;
}
.publication-block--h2 :deep(input) {
  font-size: 22px !important;
  font-weight: 600;
}
.publication-block--h3 :deep(input) {
  font-size: 18px !important;
  font-weight: 600;
}
.block-image,
video {
  display: block;
  max-width: 100%;
  max-height: 360px;
  margin: 12px auto;
  object-fit: contain;
}
.block-error {
  color: #ffb4b4;
  font-size: 12px;
}
</style>
