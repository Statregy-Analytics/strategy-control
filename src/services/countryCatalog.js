const regions = new Intl.DisplayNames(['pt-BR'], { type: 'region' })
export function countryName(country) {
  const iso = country?.isoCode?.toUpperCase()
  if (/^[A-Z]{2}$/.test(iso || '')) {
    const translated = regions.of(iso)
    if (translated && translated !== iso) return translated
  }
  return country?.name || 'País indisponível'
}
export const bankCountryName = (bank, countries) =>
  bank.countryId
    ? countryName(countries.find((country) => country.id === bank.countryId))
    : 'Não informado'
export const bankCountryOptions = (countries) =>
  countries
    .filter((country) => country.isActive && country.id)
    .map((country) => ({ label: countryName(country), value: country.id }))
    .sort((a, b) => a.label.localeCompare(b.label, 'pt-BR'))
export async function readCountryCatalog(read) {
  const countries = new Map()
  for (let page = 1; page <= 100; page++) {
    const response = await read({ page, pageSize: 100 })
    if (response?.success === false || !Array.isArray(response?.data))
      throw Error('Não foi possível carregar o catálogo de países.')
    for (const country of response.data) countries.set(country.id, country)
    const pagination = response.pagination
    if (pagination?.hasNextPage === true) {
      if (response.data.length === 0)
        throw Error('O catálogo de países retornou paginação inconsistente.')
      continue
    }
    if (pagination?.hasNextPage === false && page < Number(pagination.totalPages))
      throw Error('O catálogo de países retornou paginação inconsistente.')
    if (
      pagination?.hasNextPage === false ||
      page >= Number(pagination?.totalPages || Infinity) ||
      (pagination?.hasNextPage !== true && !pagination?.totalPages && response.data.length < 100)
    )
      return [...countries.values()]
  }
  throw Error('O catálogo de países retornou paginação inconsistente.')
}
