<template>
  <q-layout class="system-selection">
    <q-page-container
      ><q-page class="system-selection__page">
        <main class="system-selection__main">
          <h1>Selecionar Sistema</h1>
          <resource-state :state="resource.state" @retry="load">
            <div class="system-selection__cards">
              <component
                :is="destination(system) ? 'router-link' : 'div'"
                v-for="system in systemDefinitions"
                :key="system.id"
                :to="destination(system) || undefined"
                :aria-disabled="!destination(system) || undefined"
                :title="!destination(system) ? 'Indisponível' : undefined"
                class="system-selection__card"
                :class="{ 'system-selection__card--disabled': !destination(system) }"
              >
                <span class="system-selection__icon"><img :src="system.icon" alt="" /></span>
                <h2>{{ system.label }}<img src="/icons/admin-menu/system-arrow.svg" alt="" /></h2>
                <p>{{ system.description }}</p>
                <div class="system-selection__tags">
                  <span v-for="tag in system.tags" :key="tag">{{ tag }}</span>
                </div>
              </component>
            </div>
          </resource-state>
        </main>
        <footer>
          © {{ new Date().getFullYear() }} Strategy Analytics. Todos os direitos reservados.
        </footer>
      </q-page></q-page-container
    >
  </q-layout>
</template>
<script setup>
import { onMounted, onScopeDispose } from 'vue'
import ResourceState from 'src/components/Finance/ResourceState.vue'
import { useFinanceResource } from 'src/composables/useFinanceResource'
import { getMySystems } from 'src/services/authService'
import { availableSystemRoute, systemDefinitions } from 'src/services/adminNavigation'
const resource = useFinanceResource()
const load = () =>
  resource.load(async () => {
    const result = await getMySystems()
    if (!Array.isArray(result?.systems)) throw Error('Resposta de sistemas indisponível.')
    return result
  })
const destination = (system) => availableSystemRoute(system, resource.state.data)
onMounted(load)
onScopeDispose(resource.reset)
</script>
<style scoped>
.system-selection {
  color: var(--sa-text, white);
  background: linear-gradient(
    -29.1578deg,
    #1a1e2d 0%,
    #1a1e2d 7%,
    #13476d 23%,
    #10517e 28%,
    #10517e 30%,
    #124e78 33%,
    #1a1e2d 53%,
    #1a1e2d 84%,
    #4e1723 100%
  );
}
.system-selection__page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
.system-selection__main {
  width: min(1200px, calc(100% - 64px));
  margin: auto;
  padding: 80px 0;
}
h1 {
  margin: 0 0 96px;
  text-align: center;
  font-size: 36px;
  line-height: 40px;
  font-weight: 700;
}
.system-selection__cards {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 32px;
}
.system-selection__card {
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 343px;
  padding: 32px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  text-decoration: none;
  color: inherit;
}
a.system-selection__card:hover,
a.system-selection__card:focus-visible {
  border-color: rgba(255, 255, 255, 0.5);
  outline: none;
}
.system-selection__card--disabled {
  opacity: 0.55;
}
.system-selection__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.08),
    rgba(255, 255, 255, 0.03),
    rgba(255, 255, 255, 0.07)
  );
}
.system-selection__icon img {
  width: 32px;
  height: 32px;
}
h2 {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 24px 0 12px;
  font-size: 24px;
  line-height: 32px;
  font-weight: 700;
}
h2 img {
  width: 24px;
  height: 24px;
  flex: none;
}
p {
  margin: 0 0 24px;
  font-size: 16px;
  line-height: 26px;
  color: rgba(255, 255, 255, 0.72);
}
.system-selection__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: auto;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}
.system-selection__tags span {
  padding: 4px 12px;
  border: 0.5px solid white;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  font-size: 12px;
  line-height: 16px;
}
footer {
  padding: 8px 24px;
  text-align: center;
  color: rgba(255, 255, 255, 0.72);
  font-size: 14px;
  line-height: 20px;
}
@media (max-width: 800px) {
  .system-selection__main {
    width: calc(100% - 32px);
    padding: 48px 0;
  }
  h1 {
    font-size: 28px;
    margin-bottom: 40px;
  }
  .system-selection__cards {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  .system-selection__card {
    padding: 24px;
  }
}
</style>
