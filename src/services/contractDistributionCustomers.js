import { listCustomerCards } from './customerService'
import { customerDisplayName, customerMaskedDocument } from './customerPresentation'
import { readCurrentPages } from './requestContext'

export async function distributionCustomers({ search = '' } = {}, active = () => true) {
  const cards = await readCurrentPages(
    (page) => listCustomerCards({ search: search.trim() || undefined, page, pageSize: 100 }),
    active,
  )
  return {
    customers: (cards || []).map((card) => ({
      customerId: card.customerId || card.id,
      displayName: customerDisplayName(card.displayName || card.primaryName),
      maskedDocument: customerMaskedDocument(card.maskedDocument),
      status: card.status,
      personType: card.personType || card.customerKind || card.kind,
    })),
  }
}
