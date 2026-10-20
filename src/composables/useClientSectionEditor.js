import { reactive, ref, onScopeDispose } from 'vue'
import {
  getCustomerIdentificationContact,
  getCustomerProfessionalProfile,
  getCustomerCurrentFinancialProfile,
  getCustomerPreferences,
  getPreferenceCatalog,
  getCustomerAccountSecurity,
} from 'src/services/customerService'
import { getComplianceCard } from 'src/services/complianceService'
import { financeGet, financeWrite } from 'src/services/financeService'
import { getApiErrorMessage } from 'src/services/apiError'
import { createSectionEditor } from 'src/services/sectionEditor'
import {
  sectionValues,
  sectionEditable,
  sectionPlan,
  sectionValidation,
  sectionHasChanges,
} from 'src/services/clientSectionModel'
export function useClientSectionEditor(customerId, refresh) {
  const state = reactive({
    active: null,
    source: null,
    draft: null,
    original: null,
    editable: [],
    loading: false,
    saving: false,
    error: '',
    errorSection: null,
    fields: {},
    partial: false,
  })
  const savedSection = ref(null)
  let timer
  const controller = createSectionEditor(state, {
    read: async (key) => {
      savedSection.value = null
      const id = customerId.value
      let source
      if (key === 'identification') source = await getCustomerIdentificationContact(id)
      if (key === 'professional') {
        const [professional, financial] = await Promise.all([
          getCustomerProfessionalProfile(id),
          getCustomerCurrentFinancialProfile(id),
        ])
        source = { professional: professional || {}, financial: financial || {} }
      }
      if (key === 'preferences') {
        source = await getCustomerPreferences(id)
        await getPreferenceCatalog()
      }
      if (key === 'security') {
        const overview = await getCustomerAccountSecurity(id)
        const security = overview.accountSecurity
        if (!overview.hasUserAccount || !security?.userId)
          throw Error('Nenhuma conta de acesso vinculada.')
        source = (await financeGet('admin/users/' + security.userId)).data
        if (source?.id !== security.userId || source.name !== security.userName)
          throw Error('Não foi possível confirmar o usuário vinculado.')
      }
      if (key === 'compliance') {
        const card = await getComplianceCard(id)
        source = card?.primaryAlert
        if (!source?.id)
          throw Error('A API não oferece edição de observações sem um alerta existente.')
      }
      if (!source || (source.customerId && source.customerId !== id))
        throw Error('Não foi possível confirmar os dados deste cliente.')
      source = { ...source, customerId: id }
      return { source, values: sectionValues(key, source), editable: sectionEditable(key, source) }
    },
    plan: sectionPlan,
    validate: sectionValidation,
    hasChanges: sectionHasChanges,
    write: (step) => {
      if (state.source?.customerId !== customerId.value) throw Error('O cliente foi alterado.')
      return financeWrite(step.method, step.path, step.payload)
    },
    errorMessage: (error) =>
      getApiErrorMessage(error, 'Não foi possível salvar as alterações. Tente novamente.'),
    refresh,
    saved: (key) => {
      savedSection.value = key
      clearTimeout(timer)
      timer = setTimeout(() => (savedSection.value = null), 3000)
    },
  })
  const dispose = controller.dispose
  controller.dispose = () => {
    dispose()
    savedSection.value = null
    clearTimeout(timer)
  }
  onScopeDispose(() => {
    controller.dispose()
    clearTimeout(timer)
  })
  return { state, controller, savedSection }
}
