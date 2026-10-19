import { copy, equal } from './sectionEditor.js'
const date = (value) => value?.slice(0, 10) || null
const selected = (rows, test) => {
  const choices = (rows || []).filter(test)
  return choices.find((x) => x.isPrimary) || choices[0]
}
const primary = (rows) =>
  (rows || []).find((x) => x.isPrimary) || (rows?.length === 1 ? rows[0] : null)
const contact = (source, kind) =>
  selected(source.contacts, (x) =>
    kind === 'MobilePhone'
      ? ['MobilePhone', 'Mobile'].includes(x.kind)
      : kind === 'SecondaryPhone'
        ? ['SecondaryPhone', 'Phone'].includes(x.kind)
        : x.kind === kind,
  )
const nameKeys = ['id', 'kind', 'displayName', 'validFrom', 'validTo', 'isPrimary']
const contactKeys = ['id', 'kind', 'value', 'isPrimary']
const addressKeys = [
  'id',
  'kind',
  'line1',
  'line2',
  'city',
  'stateOrProvince',
  'postalCode',
  'countryId',
  'isPrimary',
]
const pick = (value, keys) => Object.fromEntries(keys.map((key) => [key, value[key] ?? null]))
export function sectionValues(key, source) {
  if (key === 'professional')
    return {
      occupation: source.professional.occupation || '',
      employerName: source.professional.employerName || '',
      individualMonthlyIncome: source.financial.individualMonthlyIncome ?? null,
      householdMonthlyIncome: source.financial.householdMonthlyIncome ?? null,
      declaredNetWorth: source.financial.declaredNetWorth ?? null,
    }
  if (key === 'preferences')
    return pick(source, [
      'primaryCurrencyCode',
      'secondaryCurrencyCode',
      'languageCode',
      'timeZoneId',
      'theme',
    ])
  if (key === 'security') return { userName: source.name }
  if (key === 'compliance') return { description: source.description || '' }
  const name = primary(source.names),
    address = selected(source.addresses, (x) => x.kind === 'Residential')
  return {
    fullName: name?.displayName || '',
    birthDate: date(source.birthDate),
    primaryEmail: contact(source, 'Email')?.value || '',
    mobilePhone: contact(source, 'MobilePhone')?.value || '',
    secondaryPhone: contact(source, 'SecondaryPhone')?.value || '',
    line1: address?.line1 || '',
    line2: address?.line2 || '',
    cityState: [address?.city, address?.stateOrProvince].filter(Boolean).join(' / '),
    postalCode: address?.postalCode || '',
  }
}
export function sectionEditable(key, source) {
  const values = sectionValues(key, source)
  if (key !== 'identification') return Object.keys(values)
  const keys = ['birthDate', 'primaryEmail', 'mobilePhone', 'secondaryPhone']
  if (primary(source.names)) keys.push('fullName')
  const address = selected(source.addresses, (x) => x.kind === 'Residential')
  if (address?.id && address.countryId) keys.push('line1', 'line2', 'cityState', 'postalCode')
  return keys
}
export function sectionValidation(key, value, source) {
  const errors = {}
  if (key === 'professional') {
    if (!value.occupation?.trim()) errors.occupation = 'Informe a profissão.'
    for (const field of ['individualMonthlyIncome', 'householdMonthlyIncome', 'declaredNetWorth'])
      if (
        value[field] !== null &&
        value[field] !== '' &&
        (!Number.isFinite(Number(value[field])) || Number(value[field]) < 0)
      )
        errors[field] = 'Informe um valor igual ou maior que zero.'
    if (
      value.householdMonthlyIncome !== null &&
      value.householdMonthlyIncome !== '' &&
      value.individualMonthlyIncome !== null &&
      value.individualMonthlyIncome !== '' &&
      Number(value.householdMonthlyIncome) < Number(value.individualMonthlyIncome)
    )
      errors.householdMonthlyIncome = 'Não pode ser menor que a renda individual'
  }
  if (key === 'identification') {
    if (primary(source?.names) && !value.fullName.trim())
      errors.fullName = 'Informe o nome completo.'
    if (value.primaryEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.primaryEmail))
      errors.primaryEmail = 'Informe um e-mail válido.'
    if (value.line1 && !value.cityState?.trim()) errors.cityState = 'Informe município e UF.'
  }
  if (key === 'security' && !value.userName?.trim()) errors.userName = 'Informe o usuário.'
  return errors
}
export function sectionPlan(key, source, draft, original) {
  const base = 'admin/customers/' + source.customerId
  const steps = [],
    add = (method, path, payload) => steps.push({ method, path, payload })
  if (key === 'preferences') {
    add('patch', base + '/preferences', {
      ...pick(source, [
        'primaryCurrencyCode',
        'secondaryCurrencyCode',
        'languageCode',
        'timeZoneId',
        'theme',
        'countryId',
      ]),
      ...draft,
    })
  } else if (key === 'professional') {
    const p = source.professional,
      f = source.financial
    if (draft.occupation !== original.occupation || draft.employerName !== original.employerName) {
      if (!p.validFrom) throw Error('A vigência do perfil profissional não foi informada pela API.')
      add('put', base + '/professional-profile', {
        occupation: draft.occupation.trim(),
        employerName: draft.employerName.trim() || null,
        validFrom: date(p.validFrom),
        validTo: date(p.validTo),
        isCurrent: p.isCurrent,
      })
    }
    if (
      ['individualMonthlyIncome', 'householdMonthlyIncome', 'declaredNetWorth'].some(
        (k) => draft[k] !== original[k],
      )
    ) {
      if (!f.currencyCode || !f.effectiveFrom)
        throw Error('Moeda e vigência do perfil financeiro não foram informadas pela API.')
      add('post', base + '/financial-profiles', {
        ...Object.fromEntries(
          ['individualMonthlyIncome', 'householdMonthlyIncome', 'declaredNetWorth'].map((k) => [
            k,
            draft[k] === null || draft[k] === '' ? null : Number(draft[k]),
          ]),
        ),
        currencyCode: f.currencyCode,
        effectiveFrom: date(f.effectiveFrom),
        effectiveTo: date(f.effectiveTo),
      })
    }
  } else if (key === 'security') {
    add('patch', 'admin/users/' + source.id, {
      name: draft.userName.trim(),
      email: source.email,
      workspaceId: source.workspaceId,
    })
  } else if (key === 'compliance') {
    add('patch', base + '/compliance/flags/' + source.id, {
      ...pick(source, [
        'severity',
        'status',
        'monitoringFrequency',
        'relatedPepDescription',
        'relatedPepRelationship',
      ]),
      description: draft.description || null,
    })
  } else {
    if (draft.birthDate !== original.birthDate)
      add('patch', base, { kind: source.kind, birthDate: draft.birthDate || null })
    if (draft.fullName !== original.fullName) {
      const names = copy(source.names),
        row = primary(names)
      if (!row) throw Error('O nome principal não foi informado pela API.')
      row.displayName = draft.fullName.trim()
      add('put', base + '/names', { names: names.map((x) => pick(x, nameKeys)) })
    }
    if (['primaryEmail', 'mobilePhone', 'secondaryPhone'].some((k) => draft[k] !== original[k])) {
      const contacts = copy(source.contacts || [])
      for (const [field, kind] of [
        ['primaryEmail', 'Email'],
        ['mobilePhone', 'MobilePhone'],
        ['secondaryPhone', 'SecondaryPhone'],
      ]) {
        const row = contact({ contacts }, kind),
          value = draft[field].trim()
        if (row && value) row.value = value
        else if (row) contacts.splice(contacts.indexOf(row), 1)
        else if (value) contacts.push({ id: null, kind, value, isPrimary: contacts.length === 0 })
      }
      add('put', base + '/contacts', { contacts: contacts.map((x) => pick(x, contactKeys)) })
    }
    if (['line1', 'line2', 'cityState', 'postalCode'].some((k) => draft[k] !== original[k])) {
      const addresses = copy(source.addresses),
        row = selected(addresses, (x) => x.kind === 'Residential')
      if (!row?.countryId) throw Error('O país do endereço não foi informado pela API.')
      const slash = draft.cityState.lastIndexOf('/')
      Object.assign(row, {
        line1: draft.line1.trim(),
        line2: draft.line2.trim() || null,
        city: slash < 0 ? draft.cityState.trim() : draft.cityState.slice(0, slash).trim(),
        stateOrProvince: slash < 0 ? row.stateOrProvince : draft.cityState.slice(slash + 1).trim(),
        postalCode: draft.postalCode.trim() || null,
      })
      add('put', base + '/addresses', { addresses: addresses.map((x) => pick(x, addressKeys)) })
    }
  }
  for (const step of steps) {
    step.fields =
      key === 'professional'
        ? step.path.endsWith('/professional-profile')
          ? ['occupation', 'employerName']
          : ['individualMonthlyIncome', 'householdMonthlyIncome', 'declaredNetWorth']
        : key === 'identification'
          ? step.path.endsWith('/names')
            ? ['fullName']
            : step.path.endsWith('/contacts')
              ? ['primaryEmail', 'mobilePhone', 'secondaryPhone']
              : step.path.endsWith('/addresses')
                ? ['line1', 'line2', 'cityState', 'postalCode']
                : ['birthDate']
          : Object.keys(draft)
  }
  return steps
}
export const sectionChanged = (current, original, key) => !equal(current?.[key], original?.[key])
