<template>
  <q-page>
    <title-page :breadcrumbs="[{ label: 'Gestão de Dados' }, { label: 'Formulários' }]">
      <div class="row items-center justify-between q-gutter-sm">
        <div class="text-h6">Formulários</div>
        <q-btn dense no-caps color="primary" icon="add" label="Novo formulário" :disable="!catalog.length || !user || !!userError" @click="open('')" />
      </div>
    </title-page>
    <div class="q-pa-md">
      <q-banner v-if="catalogError" class="bg-red-1 text-negative q-mb-md">{{ catalogError }}<template #action><q-btn flat label="Recarregar catálogo" @click="loadCatalog" /></template></q-banner>
      <q-banner v-if="userError" class="bg-red-1 text-negative q-mb-md">{{ userError }}<template #action><q-btn flat label="Recarregar permissões" @click="loadUser" /></template></q-banner>
      <q-linear-progress v-if="catalogLoading" indeterminate aria-label="Carregando catálogo" />
      <div v-if="!catalogLoading && !catalogError && !catalog.length" class="q-mb-md text-muted">Nenhum formulário publicado neste ambiente. Publique uma versão para habilitar novas declarações.</div>
      <q-banner v-if="listError" class="bg-red-1 text-negative q-mb-md" role="alert">{{ listError }}<template #action><q-btn flat label="Tentar novamente" @click="loadList" /></template></q-banner>
      <q-table dark flat dense hide-pagination row-key="id" class="intake-table" :rows="rows" :columns="columns" :loading="loading" :pagination="{ rowsPerPage: 0 }">
        <template #top>
          <div class="row full-width items-center q-col-gutter-md">
            <label-form class-name="col-12 col-sm-5 col-md-3" text-label="Status"><q-select dark options-dense v-model="status" clearable outlined dense emit-value map-options :options="statusOptions" aria-label="Filtrar por status" @update:model-value="changePage(1)" /></label-form>
            <div class="col-auto self-end"><q-btn flat dense no-caps icon="refresh" label="Atualizar" :disable="loading" @click="loadList" /></div>
          </div>
        </template>
        <template #body-cell-title="slotProps">
          <q-td :props="slotProps"><q-item dense class="q-pa-none"><q-item-section avatar><q-avatar size="32px" color="blue-grey-1" text-color="blue-grey-7" icon="description" /></q-item-section><q-item-section><q-item-label><q-btn flat dense no-caps class="text-left" :label="slotProps.row.title || 'Sem título'" :disable="!user || !!userError" @click="open(slotProps.row.id)" /></q-item-label><q-item-label caption>ID #{{ slotProps.row.id.slice(0, 8) }}</q-item-label></q-item-section></q-item></q-td>
        </template>
        <template #body-cell-status="slotProps"><q-td :props="slotProps"><q-badge>{{ statusLabels[slotProps.value] || slotProps.value }}</q-badge></q-td></template>
        <template #body-cell-actions="slotProps"><q-td :props="slotProps"><row-actions dark v-if="user && !userError" :actions="[{ name: 'open', label: 'Abrir formulário', icon: 'edit_note' }]" @select="open(slotProps.row.id)" /></q-td></template>
        <template #no-data><div class="full-width text-center q-pa-xl text-muted">{{ listError ? 'A listagem está indisponível.' : 'Nenhuma submissão encontrada para este filtro.' }}</div></template>
      </q-table>
      <entity-table-footer dark :page="page" :page-size="pageSize" :total-items="total" :total-pages="totalPages" :first-item="total ? (page - 1) * pageSize + 1 : 0" :last-item="Math.min(page * pageSize, total)" @page="changePage" @page-size="changeSize" />
    </div>
    <q-dialog v-model="dialog" position="right" full-height class="control-width" :persistent="editorBusy">
      <intake-editor v-if="dialog && user" :key="editorKey" :submission-id="selectedId" :catalog="catalog" :user="user" @close="closeEditor" @busy="editorBusy = $event" @updated="loadList" />
    </q-dialog>
  </q-page>
</template>

<script setup>
import { computed, onMounted, onBeforeUnmount, ref } from 'vue'
import TitlePage from 'src/components/TitlePage.vue'
import LabelForm from 'src/components/Form/LabelForm.vue'
import RowActions from 'src/components/Entity/RowActions.vue'
import EntityTableFooter from 'src/components/Entity/EntityTableFooter.vue'
import IntakeEditor from 'src/components/DataIntake/IntakeEditor.vue'
import { collection, statusLabels } from 'src/components/DataIntake/formModel'
import { listIntakeForms, listIntakeSubmissions, intakeError } from 'src/services/dataIntakeService'
import { useAuthStore } from 'src/stores/auth'

const auth = useAuthStore()
const user = ref(null), userError = ref(''), rows = ref([]), catalog = ref([]), loading = ref(false), catalogLoading = ref(false), listError = ref(''), catalogError = ref('')
const page = ref(1), pageSize = ref(10), total = ref(0), status = ref(null), dialog = ref(false), selectedId = ref(''), editorKey = ref(0), editorBusy = ref(false)
let listRevision = 0
const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize.value)))
const statusOptions = Object.entries(statusLabels).map(([value, label]) => ({ label, value }))
const columns = [
  { name: 'title', label: 'Submissão', field: 'title', align: 'left' },
  { name: 'status', label: 'Status', field: 'status', align: 'left' },
  { name: 'createdAtUtc', label: 'Criada em', field: 'createdAtUtc', align: 'left', format: (value) => value && !Number.isNaN(Date.parse(value)) ? new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' }).format(new Date(value)) : '—' },
  { name: 'actions', label: '', field: 'id', align: 'right' },
]
async function loadList() {
  const revision = ++listRevision
  loading.value = true; listError.value = ''
  try {
    const response = await listIntakeSubmissions({ page: page.value, pageSize: pageSize.value, status: status.value || undefined })
    if (revision !== listRevision) return
    rows.value = collection(response); total.value = response.pagination?.totalItems ?? response.totalItems ?? rows.value.length
  } catch (error) { if (revision === listRevision) { rows.value = []; total.value = 0; listError.value = intakeError(error) } }
  finally { if (revision === listRevision) loading.value = false }
}
async function loadCatalog() {
  catalogLoading.value = true; catalogError.value = ''
  try { catalog.value = collection(await listIntakeForms()) }
  catch (error) { catalogError.value = intakeError(error) }
  finally { catalogLoading.value = false }
}
async function loadUser() {
  userError.value = ''
  try { user.value = await auth.fetchCurrentUser() }
  catch (error) { userError.value = intakeError(error) }
}
const changePage = (value) => { page.value = value; loadList() }
const changeSize = (value) => { pageSize.value = value; changePage(1) }
const open = (id) => { selectedId.value = id; editorKey.value++; editorBusy.value = false; dialog.value = true }
const closeEditor = () => { if (!editorBusy.value) dialog.value = false }
onMounted(() => { loadList(); loadCatalog(); loadUser() })
onBeforeUnmount(() => { listRevision++ })
</script>

<style scoped>
.intake-table :deep(.q-item__label--caption) { color: rgba(255, 255, 255, .72); }
.intake-table { background: var(--sa-surface); border: 1px solid var(--sa-border); border-radius: var(--sa-radius); }
</style>
