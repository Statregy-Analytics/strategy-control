<template>
  <div>
    <div class="text-subtitle1 text-weight-bold">Verificação e timeline</div>
    <div class="text-caption text-grey-7">Nível cadastral, áreas verificadas e histórico do cliente.</div>

    <div class="text-weight-medium q-mt-lg q-mb-sm">Verificação cadastral</div>
    <q-banner v-if="verificationError" class="bg-red-1 text-negative q-mb-md">{{ verificationError }}<template #action><q-btn flat color="negative" label="Tentar novamente" @click="loadVerification" /></template></q-banner>
    <div v-if="verificationLoading" class="row justify-center q-pa-lg"><q-spinner color="primary" size="30px" /></div>
    <template v-else>
      <q-list bordered class="q-mb-md rounded-borders"><q-item><q-item-section><q-item-label caption>Nível atual</q-item-label><q-item-label class="text-weight-medium">{{ levelLabel }}</q-item-label></q-item-section></q-item></q-list>
      <q-list v-if="areas.length" bordered separator class="history-list" role="region" tabindex="0" aria-label="Áreas de verificação cadastral">
        <q-item v-for="area in areas" :key="areaId(area)">
          <q-item-section><q-item-label>{{ area.name || area.displayName || area.code }}</q-item-label><q-item-label caption>{{ area.description || 'Área de verificação cadastral' }}</q-item-label></q-item-section>
          <q-item-section side><q-badge outline color="primary">{{ currentStatus(area) || 'Não iniciado' }}</q-badge></q-item-section>
          <q-item-section side><q-btn flat round dense color="primary" icon="edit" aria-label="Alterar status da área" @click="openArea(area)" /></q-item-section>
        </q-item>
      </q-list>
      <div v-else class="text-caption text-grey-7">Nenhuma área disponível no catálogo.</div>
    </template>

    <div class="row items-end q-col-gutter-sm q-mt-xl q-mb-sm">
      <div class="col"><div class="text-weight-medium">Timeline</div><div class="text-caption text-grey-7">Eventos administrativos em ordem cronológica.</div></div>
      <q-select v-model="eventType" :options="eventTypeOptions" emit-value map-options dense outlined clearable label="Tipo de evento" class="col-12 col-sm-3" />
      <q-select v-model="entityType" :options="entityTypeOptions" emit-value map-options dense outlined clearable label="Entidade" class="col-12 col-sm-3" />
      <div class="col-auto"><q-btn flat dense color="primary" icon="search" label="Filtrar" no-caps @click="applyFilters" /></div>
    </div>
    <q-banner v-if="timelineError" class="bg-red-1 text-negative q-mb-md">{{ timelineError }}<template #action><q-btn flat color="negative" label="Tentar novamente" @click="loadTimeline" /></template></q-banner>
    <div v-if="timelineLoading" class="row justify-center q-pa-lg"><q-spinner color="primary" size="30px" /></div>
    <template v-else>
      <q-list v-if="sortedTimeline.length" bordered separator class="history-list" role="region" tabindex="0" aria-label="Eventos administrativos"><q-item v-for="event in sortedTimeline" :key="event.id || `${eventTypeOf(event)}-${eventDate(event)}`"><q-item-section avatar><q-icon name="history" color="primary" /></q-item-section><q-item-section><q-item-label>{{ event.title || event.description || eventTypeOf(event) }}</q-item-label><q-item-label caption>{{ event.entityType || event.entityName || 'Cliente' }} · {{ formatDate(eventDate(event)) }}</q-item-label></q-item-section></q-item></q-list>
      <div v-else class="text-caption text-grey-7 q-pa-md">Nenhum evento encontrado.</div>
      <entity-table-footer :page="page" :page-size="pageSize" :total-items="totalItems" :total-pages="totalPages" :first-item="firstItem" :last-item="lastItem" :page-size-options="[5,10,20]" @page="changePage" @page-size="changePageSize" />
    </template>

    <q-dialog v-model="dialog"><q-card class="status-dialog"><title-card title="Status da verificação" @on-close="dialog=false" /><q-card-section><q-form @submit.prevent="saveArea"><label-form text-label="Status"><q-select v-model="draft.status" :options="statusOptions" emit-value map-options dense outlined :rules="requiredRules" /></label-form><label-form text-label="Justificativa"><q-input v-model.trim="draft.statusReason" type="textarea" dense outlined /></label-form><div class="row justify-end q-mt-md"><q-btn type="submit" flat color="primary" icon="save" label="Salvar status" no-caps :loading="saving" /></div></q-form></q-card-section></q-card></q-dialog>
  </div>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import EntityTableFooter from 'src/components/Entity/EntityTableFooter.vue'
import TitleCard from 'src/components/Card/TitleCard.vue'
import LabelForm from 'src/components/Form/LabelForm.vue'
import useNotification from 'src/composables/global/useNotification'
import { getApiErrorMessage } from 'src/services/apiError'
import { getCustomerTimeline, getCustomerVerificationLevel, getVerificationCatalog, updateCustomerVerificationArea } from 'src/services/verificationService'

const props = defineProps({ customerId: { type: String, required: true } })
const emit = defineEmits(['updated'])
const { successNotify, errorNotify } = useNotification()
const verificationLoading = ref(true), timelineLoading = ref(true), saving = ref(false), verificationError = ref(''), timelineError = ref('')
const catalog = ref({}), level = ref({}), timelineResponse = ref({}), timeline = ref([]), page = ref(1), pageSize = ref(10), eventType = ref(''), entityType = ref(''), dialog = ref(false), selectedArea = ref(null)
const draft = reactive({ status: '', statusReason: '' })
const collection = (value, keys = []) => Array.isArray(value) ? value : keys.map((key) => value?.[key]).find(Array.isArray) || value?.items || value?.data || []
const areas = computed(() => collection(catalog.value, ['areas', 'verificationAreas']))
const statuses = computed(() => collection(catalog.value, ['statuses', 'areaStatuses']))
const statusOptions = computed(() => (statuses.value.length ? statuses.value : ['NotStarted', 'Pending', 'InProgress', 'Verified', 'Rejected']).map((item) => typeof item === 'string' ? { label: item, value: item } : { label: item.displayName || item.name || item.code, value: item.code || item.value || item.id }))
const levelLabel = computed(() => level.value?.displayName || level.value?.levelName || level.value?.level || level.value?.verificationLevel || 'Não calculado')
const totalItems = computed(() => Number(timelineResponse.value?.totalItems ?? timelineResponse.value?.totalCount ?? timeline.value.length))
const uniqueOptions = (values) => [...new Set(values.filter(Boolean))].map((value) => ({ label: value, value }))
const eventTypeOptions = computed(() => uniqueOptions(timeline.value.map(eventTypeOf)))
const entityTypeOptions = computed(() => uniqueOptions(timeline.value.map((event) => event.entityType || event.entityName)))
const totalPages = computed(() => Math.max(1, Number(timelineResponse.value?.totalPages ?? Math.ceil(totalItems.value / pageSize.value))))
const firstItem = computed(() => totalItems.value ? (page.value - 1) * pageSize.value + 1 : 0)
const lastItem = computed(() => Math.min(page.value * pageSize.value, totalItems.value))
const areaId = (area) => area.id || area.areaId || area.verificationAreaId
const areaStatuses = computed(() => collection(level.value, ['areas', 'areaStatuses', 'verificationAreas']))
const currentStatus = (area) => areaStatuses.value.find((item) => (item.areaId || item.verificationAreaId || item.id) === areaId(area))?.status || area.status
const eventTypeOf = (event) => event.eventType || event.type || event.action || 'Evento'
const eventDate = (event) => event.occurredAtUtc || event.createdAtUtc || event.timestampUtc || event.date
const formatDate = (value) => value ? new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value)) : 'Data não informada'
const sortedTimeline = computed(() => [...timeline.value].sort((a, b) => {
  const firstDate = new Date(eventDate(a)).getTime()
  const secondDate = new Date(eventDate(b)).getTime()
  if (Number.isNaN(firstDate) && Number.isNaN(secondDate)) return 0
  if (Number.isNaN(firstDate)) return 1
  if (Number.isNaN(secondDate)) return -1
  return firstDate - secondDate
}))
const requiredRules = [(value) => Boolean(value) || 'Campo obrigatório']
const loadVerification = async () => { verificationLoading.value = true; verificationError.value = ''; const result = await Promise.allSettled([getVerificationCatalog(), getCustomerVerificationLevel(props.customerId)]); if (result[0].status === 'fulfilled') catalog.value = result[0].value || {}; if (result[1].status === 'fulfilled') level.value = result[1].value || {}; const failed = result.filter((item) => item.status === 'rejected'); if (failed.length) verificationError.value = 'Não foi possível carregar todas as informações de verificação.'; verificationLoading.value = false }
const loadTimeline = async () => { timelineLoading.value = true; timelineError.value = ''; try { timelineResponse.value = await getCustomerTimeline(props.customerId, { page: page.value, pageSize: pageSize.value, eventType: eventType.value || undefined, entityType: entityType.value || undefined }); timeline.value = collection(timelineResponse.value, ['events', 'timeline']) } catch (error) { timelineError.value = getApiErrorMessage(error, 'Não foi possível carregar a timeline.') } finally { timelineLoading.value = false } }
const applyFilters = () => { page.value = 1; loadTimeline() }
const changePage = (value) => { page.value = value; loadTimeline() }
const changePageSize = (value) => { pageSize.value = value; page.value = 1; loadTimeline() }
const openArea = (area) => { selectedArea.value = area; draft.status = currentStatus(area) || ''; draft.statusReason = ''; dialog.value = true }
const saveArea = async () => { saving.value = true; try { await updateCustomerVerificationArea(props.customerId, areaId(selectedArea.value), { status: draft.status, statusReason: draft.statusReason || null, sourceType: null, sourceId: null }); successNotify('Status de verificação atualizado.'); dialog.value = false; await loadVerification(); emit('updated') } catch (error) { errorNotify(getApiErrorMessage(error, 'Não foi possível atualizar a verificação.')) } finally { saving.value = false } }
const load = () => { page.value = 1; loadVerification(); loadTimeline() }
watch(() => props.customerId, load, { immediate: true })
</script>

<style scoped>
.history-list {
  max-height: 320px;
  overflow-y: auto;
  overscroll-behavior: contain;
  scrollbar-gutter: stable;
}
.status-dialog { width: min(560px, calc(100vw - 32px)); }
</style>
