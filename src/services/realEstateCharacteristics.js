export const characteristicOptions = [
  'Vagas de garagem',
  'Piscina',
  'Elevador',
  'Churrasqueira',
  'Área de lazer',
  'Varanda ou sacada',
  'Mobiliado',
  'Andar',
]
export const characteristicErrors = {
  'asset.real_estate_characteristics_limit_exceeded':
    'Adicione no máximo 5 características por imóvel.',
  'asset.real_estate_characteristic_name_required': 'Informe o nome da característica.',
  'asset.real_estate_characteristic_value_required': 'Informe o valor da característica.',
  'asset.real_estate_characteristic_name_too_long':
    'Use até 80 caracteres no nome da característica.',
  'asset.real_estate_characteristic_value_too_long':
    'Use até 120 caracteres no valor da característica.',
}
export const characteristicNameRule = (value) =>
  String(value ?? '').trim()
    ? String(value).trim().length <= 80 ||
      characteristicErrors['asset.real_estate_characteristic_name_too_long']
    : characteristicErrors['asset.real_estate_characteristic_name_required']
export const characteristicValueRule = (value) =>
  String(value ?? '').trim()
    ? String(value).trim().length <= 120 ||
      characteristicErrors['asset.real_estate_characteristic_value_too_long']
    : characteristicErrors['asset.real_estate_characteristic_value_required']
export const cloneCharacteristics = (rows) =>
  (rows ?? []).map(({ name, value, isCustom }) => ({
    name: name ?? '',
    value: value ?? '',
    isCustom: isCustom === true,
  }))
export function characteristicsPayload(rows) {
  const result = cloneCharacteristics(rows)
  if (result.length > 5)
    throw Error(characteristicErrors['asset.real_estate_characteristics_limit_exceeded'])
  for (const item of result) {
    for (const rule of [characteristicNameRule(item.name), characteristicValueRule(item.value)])
      if (rule !== true) throw Error(rule)
    item.name = String(item.name).trim()
    item.value = String(item.value).trim()
  }
  return result
}
