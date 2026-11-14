<template>
  <article class="author-card">
    <header class="author-card__header">
      <div class="author-card__avatar">
        <img
          v-if="author.avatarUrl && !photoFailed"
          :src="author.avatarUrl"
          :alt="author.name || 'Redator'"
          @error="photoFailed = true"
        />
        <span v-else>{{ initial }}</span>
      </div>
      <div class="author-card__identity">
        <h2>{{ author.name || 'Não informado' }}</h2>
        <p>{{ author.role || 'Não informado' }}</p>
        <small>{{ author.attribution || 'Não informado' }}</small>
      </div>
      <row-actions
        dark
        class="author-card__actions"
        :aria-label="'Opções de ' + (author.name || 'redator')"
        icon-src="/icons/publication/author-options.svg"
        :actions="[{ name: 'edit', label: 'Editar', icon: 'edit' }]"
        @select="$event === 'edit' && $emit('edit', author)"
      />
    </header>
    <dl class="author-card__summary">
      <div>
        <dt>Publicações</dt>
        <dd class="author-card__count">{{ publications }}</dd>
      </div>
      <div>
        <dt>Status</dt>
        <dd>
          <span
            class="author-card__status"
            :class="{ 'author-card__status--active': author.status === 'Active' }"
            >{{ status }}</span
          >
        </dd>
      </div>
    </dl>
    <dl class="author-card__views">
      <div v-for="field in fields" :key="field.key">
        <dt>{{ field.label }}</dt>
        <dd v-if="typeof author[field.key] === 'string' && author[field.key].trim()">
          {{ author[field.key] }}
        </dd>
      </div>
    </dl>
  </article>
</template>
<script setup>
import { computed, ref, watch } from 'vue'
import RowActions from 'src/components/Entity/RowActions.vue'
const props = defineProps({ author: { type: Object, required: true } })
defineEmits(['edit'])
const photoFailed = ref(false)
watch(
  () => props.author.avatarUrl,
  () => (photoFailed.value = false),
)
const initial = computed(() =>
  Array.from(props.author.name?.trim() || '—')[0].toLocaleUpperCase('pt-BR'),
)
const publications = computed(() => {
  const value = props.author.publicationsCount
  if (value == null || value === '' || !Number.isSafeInteger(Number(value)) || Number(value) < 0)
    return 'Indisponível'
  return Number(value).toLocaleString('pt-BR')
})
const status = computed(
  () =>
    ({ Active: 'Ativo', Inactive: 'Inativo', Archived: 'Arquivado' })[props.author.status] ||
    props.author.status ||
    'Indisponível',
)
const fields = [
  { key: 'economicView', label: 'Visão econômica' },
  { key: 'politicalView', label: 'Visão política' },
  { key: 'philosophy', label: 'Filosofia de vida' },
]
</script>
<style scoped>
.author-card {
  padding: 24px;
  border: 0.8px solid rgba(255, 255, 255, 0.12);
  border-radius: 14px;
  background:
    linear-gradient(
      191.633deg,
      rgba(0, 0, 0, 0.118) 0.52%,
      rgba(0, 0, 0, 0.039) 51.124%,
      rgba(0, 0, 0, 0.02) 99.479%
    ),
    linear-gradient(
      191.633deg,
      rgba(0, 0, 0, 0.078) 0.52%,
      rgba(0, 0, 0, 0.039) 51.124%,
      rgba(0, 0, 0, 0.01) 99.479%
    );
  backdrop-filter: blur(20px);
  box-shadow: 4px 4px 6px rgba(0, 0, 0, 0.13);
  color: white;
  min-width: 0;
}
.author-card__header {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}
.author-card__avatar {
  width: 64px;
  height: 64px;
  flex: none;
  display: grid;
  place-items: center;
  border-radius: 50%;
  overflow: hidden;
  background: linear-gradient(135deg, #2b7fff, #9810fa);
  font-size: 20px;
  font-weight: 700;
  line-height: 28px;
}
.author-card__avatar img {
  width: 64px;
  height: 64px;
  object-fit: cover;
}
.author-card__identity {
  flex: 1;
  min-width: 0;
}
.author-card h2 {
  font-size: 18px;
  font-weight: 700;
  line-height: 28px;
  margin: 0;
  overflow-wrap: anywhere;
}
.author-card p {
  font-size: 14px;
  line-height: 20px;
  margin: 0;
  color: rgba(255, 255, 255, 0.72);
  overflow-wrap: anywhere;
}
.author-card small {
  display: block;
  font-size: 12px;
  line-height: 16px;
  margin-top: 4px;
  color: rgba(255, 255, 255, 0.72);
  overflow-wrap: anywhere;
}
.author-card__actions {
  width: 32px;
  height: 32px;
  min-width: 32px !important;
  min-height: 32px !important;
  padding: 0 !important;
  flex: none;
  border-radius: 8px;
}
.author-card__summary {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  border-top: 0.8px solid rgba(255, 255, 255, 0.2);
  padding-top: 16px;
  margin: 16px 0 0;
}
.author-card dt {
  font-size: 12px;
  font-weight: 400;
  line-height: 16px;
  color: rgba(255, 255, 255, 0.72);
}
.author-card dd {
  margin: 0;
  overflow-wrap: anywhere;
}
.author-card__count {
  font-size: 20px;
  font-weight: 700;
  line-height: 28px;
}
.author-card__summary dd {
  min-height: 28px;
}
.author-card__status {
  display: inline-block;
  margin-top: 4px;
  padding: 3px 8px;
  border: 0.8px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  font-size: 10px;
  line-height: 16px;
  font-weight: 500;
  letter-spacing: 0.25px;
  text-transform: uppercase;
  max-width: 100%;
  overflow-wrap: anywhere;
}
.author-card__status--active {
  background: rgba(0, 122, 85, 0.2);
  border-color: #74ffa0;
  color: #74ffa0;
}
.author-card__views {
  display: grid;
  gap: 8px;
  margin: 16px 0 0;
}
.author-card__views dt {
  font-weight: 600;
}
.author-card__views dd {
  font-size: 12px;
  line-height: 18px;
  white-space: pre-wrap;
  color: rgba(255, 255, 255, 0.72);
  margin-top: 4px;
}
@media (max-width: 420px) {
  .author-card {
    padding: 20px;
  }
  .author-card__header {
    gap: 12px;
  }
}
</style>
