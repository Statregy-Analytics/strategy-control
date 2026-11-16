import { computed, ref, onScopeDispose } from 'vue'
import { useFinanceResource } from './useFinanceResource'
import { financeGet } from 'src/services/financeService'
import { distributionCustomers } from 'src/services/contractDistributionCustomers'
import { capitalCents, centsDecimal, localizedDecimal } from 'src/services/contractDistribution'
import {
  sourceWalletOptions,
  walletContributionState,
  walletLineKey,
  validWalletQuote,
} from 'src/services/contractWalletCapital'

export function useContractWalletCapital(props, emit) {
  const customers = useFinanceResource(),
    wallets = useFinanceResource()
  const search = ref(''),
    client = ref(null),
    lines = ref([]),
    note = ref(''),
    picking = ref(false),
    tab = ref('Applied')
  const quotes = ref({})
  let active = true,
    revision = 0,
    quoteRevision = 0
  const snapshots = new Map()
  const read = props.read || financeGet
  const lookup = props.lookup || distributionCustomers
  const loadCustomers = () => {
    const term = search.value
    return customers.load(
      async () =>
        (await lookup({ search: term }, () => active && search.value === term)).customers || [],
    )
  }
  const loadWallets = () => {
    const key = client.value?.customerId
    return wallets.load(async () => {
      const data = (await read(`admin/customers/${key}/wallets`)).data
      // Reject ambiguous/partial data instead of presenting unknown balances as zero.
      for (const type of ['Applied', 'Free']) sourceWalletOptions(data, type)
      return data
    })
  }
  function remember() {
    if (client.value)
      snapshots.set(client.value.customerId, {
        lines: lines.value.map((line) => ({ ...line })),
        note: note.value,
      })
  }
  async function choose(customer) {
    remember()
    const current = ++revision
    client.value = customer
    picking.value = false
    quotes.value = {}
    const previous = snapshots.get(customer.customerId)
    lines.value = previous?.lines.map((line) => ({ ...line })) || []
    note.value = previous?.note || ''
    await loadWallets()
    if (!active || current !== revision) return
    for (const line of lines.value)
      if (line.currencyIsoCode !== props.currency) loadQuote(line.currencyIsoCode)
  }
  const options = computed(() =>
    wallets.state.data ? sourceWalletOptions(wallets.state.data, tab.value) : [],
  )
  function availableLine(line) {
    const options = wallets.state.data ? sourceWalletOptions(wallets.state.data, line.type) : []
    const wallet = options.find((option) => option.code === line.currencyIsoCode)
    return {
      ...line,
      walletId: wallet?.active && wallet?.walletId === line.walletId ? line.walletId : null,
      available: wallet?.available === null || !wallet ? null : centsDecimal(wallet.available),
      quote:
        line.currencyIsoCode === props.currency
          ? null
          : quotes.value[line.currencyIsoCode]?.data || null,
    }
  }
  const state = computed(() =>
    walletContributionState(lines.value.map(availableLine), props.currency),
  )
  const loadingQuotes = computed(() =>
    lines.value.some(
      (line) =>
        line.currencyIsoCode !== props.currency && quotes.value[line.currencyIsoCode]?.loading,
    ),
  )
  const existingIds = computed(() => props.existingIds || [])
  function canAdd(option) {
    return !!(
      option.active &&
      option.walletId &&
      option.currencyId &&
      option.available !== null &&
      option.available > 0n &&
      !lines.value.some((line) => walletLineKey(line) === `${option.type}:${option.code}`)
    )
  }
  function add(option) {
    if (!canAdd(option)) return
    lines.value.push({
      walletId: option.walletId,
      type: option.type,
      currencyId: option.currencyId,
      currencyIsoCode: option.code,
      amount: null,
    })
    picking.value = false
    if (option.code !== props.currency) loadQuote(option.code)
  }
  async function loadQuote(from) {
    if (from === props.currency) return
    const current = revision,
      request = ++quoteRevision
    quotes.value[from] = { data: null, loading: true, error: '', request }
    try {
      const quote = (await read('admin/exchange-rates/latest', { from, to: props.currency })).data
      if (!validWalletQuote(quote, from, props.currency)) throw Error('Cotação indisponível.')
      if (active && current === revision && quotes.value[from]?.request === request)
        quotes.value[from] = { data: quote, loading: false, error: '' }
    } catch {
      if (active && current === revision && quotes.value[from]?.request === request)
        quotes.value[from] = {
          data: null,
          loading: false,
          error: 'Não foi possível consultar a PTAX desta moeda.',
        }
    }
  }
  function setAmount(line, value) {
    const amount = capitalCents(localizedDecimal(value))
    line.amount = amount === null ? null : centsDecimal(amount)
  }
  function remove(key) {
    lines.value = lines.value.filter((line) => walletLineKey(line) !== key)
  }
  function back() {
    remember()
    revision++
    client.value = null
    wallets.reset()
    quotes.value = {}
    picking.value = false
  }
  function confirm() {
    if (
      !state.value.valid ||
      loadingQuotes.value ||
      wallets.state.loading ||
      wallets.state.error ||
      existingIds.value.includes(client.value?.customerId)
    )
      return
    emit('confirm', {
      clientId: client.value.customerId,
      displayName: client.value.displayName,
      maskedDocument: client.value.maskedDocument,
      allocatedAmount: centsDecimal(state.value.total),
      walletSources: state.value.rows.map((line) => ({
        walletId: line.walletId,
        type: line.type,
        currencyId: line.currencyId,
        currencyIsoCode: line.currencyIsoCode,
        amount: line.amount,
        available: line.available,
        convertedAmount: centsDecimal(line.converted),
        quote: line.quote
          ? { ...line.quote, quotes: line.quote.quotes.map((quote) => ({ ...quote })) }
          : null,
      })),
      walletNote: note.value.trim() || null,
    })
    emit('close')
  }
  onScopeDispose(() => {
    active = false
    revision++
    customers.reset()
    wallets.reset()
  })
  loadCustomers()
  return {
    customers,
    wallets,
    search,
    client,
    lines,
    note,
    picking,
    tab,
    quotes,
    state,
    options,
    loadingQuotes,
    existingIds,
    loadCustomers,
    loadWallets,
    choose,
    canAdd,
    add,
    loadQuote,
    setAmount,
    remove,
    back,
    confirm,
  }
}
