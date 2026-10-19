// Translate server-generated labels, never audit data or customer-entered text.
const titles = {
  'Customer created': 'Cliente cadastrado',
  'Customer profile updated': 'Perfil do cliente atualizado',
  'Customer personal details updated': 'Dados pessoais do cliente atualizados',
  'Customer names updated': 'Nome do cliente atualizado',
  'Customer contacts updated': 'Contatos do cliente atualizados',
  'Customer addresses updated': 'Endereços do cliente atualizados',
  'Customer preferences updated': 'Preferências do cliente atualizadas',
  'Customer status changed': 'Status do cliente alterado',
  'Professional profile updated': 'Perfil profissional atualizado',
  'Financial profile registered': 'Perfil financeiro registrado',
  'Bank account created': 'Conta bancária cadastrada',
  'Bank account updated': 'Conta bancária atualizada',
  'Bank account archived': 'Conta bancária arquivada',
  'Document uploaded': 'Documento enviado',
  'Document reviewed': 'Documento revisado',
  'Document archived': 'Documento arquivado',
  'Provided document created': 'Dados do documento cadastrados',
}
const types = {
  Created: 'Cliente cadastrado',
  Updated: 'Cadastro atualizado',
  StatusChanged: 'Status do cliente alterado',
  ProfessionalProfileChanged: 'Perfil profissional atualizado',
  FinancialProfileChanged: 'Perfil financeiro atualizado',
  BankAccountChanged: 'Conta bancária alterada',
  DocumentUploaded: 'Documento enviado',
  DocumentReviewed: 'Documento revisado',
}
export function customerTimelineTitle(event) {
  const title = event?.title?.trim()
  if (Object.hasOwn(titles, title)) return titles[title]
  if (title) return title
  const type = event?.eventType || event?.type || event?.action
  return Object.hasOwn(types, type) ? types[type] : 'Evento registrado'
}
