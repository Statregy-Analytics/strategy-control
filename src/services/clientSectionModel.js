import { copy, equal } from './sectionEditor.js'
import { profileDecimal, compareProfileDecimals } from './profileDecimal.js'
const amountFields = ['individualMonthlyIncome', 'householdMonthlyIncome', 'declaredNetWorth']
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
  'neighborhood',
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
    neighborhood: address?.neighborhood || '',
    cityState: [address?.city, address?.stateOrProvince].filter(Boolean).join(' / '),
    city: address?.city || '',
    stateOrProvince: address?.stateOrProvince || '',
    countryId: address?.countryId || null,
    postalCode: address?.postalCode || '',
  }
}
export function sectionEditable(key, source) {
  const values = sectionValues(key, source)
  if (key !== 'identification') return Object.keys(values)
  const keys = ['birthDate', 'primaryEmail', 'mobilePhone', 'secondaryPhone']
  if (primary(source.names)) keys.push('fullName')
  const address = selected(source.addresses, (x) => x.kind === 'Residential')
  if (!address || address.id)
    keys.push(
      'line1',
      'line2',
      'neighborhood',
      'cityState',
      'city',
      'stateOrProvince',
      'countryId',
      'postalCode',
    )
  return keys
}
const validBirthDate = (value, today) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return false
  const [, year, month, day] = match.map(Number)
  if (year < 1) return false
  const parsed = new Date(0)
  parsed.setFullYear(year, month - 1, day)
  parsed.setHours(0, 0, 0, 0)
  const end = new Date(today)
  end.setHours(0, 0, 0, 0)
  return (
    parsed.getFullYear() === year &&
    parsed.getMonth() === month - 1 &&
    parsed.getDate() === day &&
    parsed <= end
  )
}
export function sectionValidation(key, value, source, today = new Date()) {
  const errors = {}
  if (key === 'professional') {
    if (!value.occupation?.trim()) errors.occupation = 'Informe a profissão.'
    for (const field of amountFields) {
      try {
        profileDecimal(value[field])
      } catch {
        errors[field] = 'Informe um valor válido igual ou maior que zero.'
      }
    }
    if (
      !errors.individualMonthlyIncome &&
      !errors.householdMonthlyIncome &&
      profileDecimal(value.householdMonthlyIncome) !== null &&
      profileDecimal(value.individualMonthlyIncome) !== null &&
      compareProfileDecimals(value.householdMonthlyIncome, value.individualMonthlyIncome) < 0
    )
      errors.householdMonthlyIncome = 'Não pode ser menor que a renda individual'
  }
  if (key === 'identification') {
    if (String(value.neighborhood ?? '').trim().length > 120)
      errors.neighborhood = 'O bairro deve ter até 120 caracteres.'
    if (
      value.birthDate != null &&
      value.birthDate !== '' &&
      !validBirthDate(value.birthDate, today)
    )
      errors.birthDate = 'Informe uma data de nascimento válida, sem ser no futuro.'
    if (primary(source?.names) && !value.fullName.trim())
      errors.fullName = 'Informe o nome completo.'
    if (value.primaryEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.primaryEmail))
      errors.primaryEmail = 'Informe um e-mail válido.'
    const original = sectionValues('identification', source || {})
    const addressChanged = [
      'line1',
      'line2',
      'neighborhood',
      'cityState',
      'city',
      'stateOrProvince',
      'countryId',
      'postalCode',
    ].some((k) => Object.hasOwn(value, k) && value[k] !== original[k])
    if (addressChanged) {
      if (!(value.countryId || original.countryId))
        errors.countryId = 'Informe o país de residência.'
      if (!(value.line1 ?? original.line1)?.trim()) errors.line1 = 'Informe o endereço residencial.'
      const city =
        value.city !== original.city ? value.city : value.cityState?.split('/')[0] || original.city
      if (!city?.trim()) errors.city = 'Informe o município.'
    }
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
    if (amountFields.some((k) => profileDecimal(draft[k]) !== profileDecimal(original[k]))) {
      if (!f.currencyCode || !f.effectiveFrom)
        throw Error('Moeda e vigência do perfil financeiro não foram informadas pela API.')
      add('post', base + '/financial-profiles', {
        ...Object.fromEntries(amountFields.map((k) => [k, profileDecimal(draft[k])])),
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
    if (
      [
        'line1',
        'line2',
        'neighborhood',
        'cityState',
        'city',
        'stateOrProvince',
        'countryId',
        'postalCode',
      ].some((k) => draft[k] !== original[k])
    ) {
      const addresses = copy(source.addresses || [])
      let row = selected(addresses, (x) => x.kind === 'Residential')
      if (!row) {
        row = { id: null, kind: 'Residential', isPrimary: addresses.length === 0 }
        addresses.push(row)
      }
      if (!draft.countryId && !row.countryId)
        throw Error('O país do endereço não foi informado pela API.')
      const slash = draft.cityState.lastIndexOf('/')
      Object.assign(row, {
        line1: draft.line1.trim(),
        line2: draft.line2.trim() || null,
        neighborhood: draft.neighborhood?.trim() || null,
        city:
          draft.city !== original.city
            ? draft.city.trim()
            : slash < 0
              ? draft.cityState.trim()
              : draft.cityState.slice(0, slash).trim(),
        stateOrProvince:
          draft.stateOrProvince !== original.stateOrProvince
            ? draft.stateOrProvince.trim() || null
            : slash < 0
              ? row.stateOrProvince
              : draft.cityState.slice(slash + 1).trim(),
        countryId: draft.countryId || row.countryId,
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
                ? [
                    'line1',
                    'line2',
                    'neighborhood',
                    'cityState',
                    'city',
                    'stateOrProvince',
                    'countryId',
                    'postalCode',
                  ]
                : ['birthDate']
          : Object.keys(draft)
  }
  return steps
}
export const sectionChanged = (current, original, key) => {
  if (amountFields.includes(key)) {
    try {
      return profileDecimal(current?.[key]) !== profileDecimal(original?.[key])
    } catch {
      return true
    }
  }
  return !equal(current?.[key], original?.[key])
}
export const sectionHasChanges = (key, current, original) =>
  key === 'professional'
    ? Object.keys(current).some((field) => sectionChanged(current, original, field))
    : !equal(current, original)
