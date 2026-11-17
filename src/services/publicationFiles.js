export const publicationFileRules = {
  pdf: { accept: 'application/pdf', maxSize: 50 * 1024 * 1024, label: 'PDF até 50MB' },
  audio: {
    accept: 'audio/mpeg,audio/mp3,audio/wav,audio/x-wav,audio/x-m4a,audio/mp4',
    maxSize: 100 * 1024 * 1024,
    label: 'MP3, WAV ou M4A até 100MB',
  },
}
export async function validatePublicationFiles(files, kind) {
  if (!Array.isArray(files) || !files.length) return 'Selecione pelo menos um arquivo.'
  if (kind !== 'attachments' && files.length !== 1) return 'Selecione um único arquivo.'
  if (files.some((file) => !file || !Number.isFinite(file.size) || file.size <= 0))
    return 'Selecione um arquivo não vazio.'
  const rule = publicationFileRules[kind]
  if (!rule) return ''
  for (const file of files) {
    if (!rule.accept.split(',').includes(file.type) || file.size > rule.maxSize)
      return 'Selecione um arquivo válido: ' + rule.label + '.'
    if (kind === 'pdf') {
      const signature = new Uint8Array(await file.slice(0, 5).arrayBuffer())
      if (String.fromCharCode(...signature) !== '%PDF-')
        return 'O arquivo selecionado não é um PDF válido.'
    }
  }
  return ''
}

export function validatePublicationCover(file) {
  return file &&
    typeof file.type === 'string' &&
    file.type.startsWith('image/') &&
    Number.isFinite(file.size) &&
    file.size > 0
    ? ''
    : 'Selecione uma imagem de capa válida e não vazia.'
}
export function mergePublicationAttachments(current, selected) {
  const key = (f) => [f.name, f.size, f.type, f.lastModified].join('\u0000')
  const seen = new Set((current || []).map(key))
  return [
    ...(current || []),
    ...selected.filter((file) => {
      const k = key(file)
      if (seen.has(k)) return false
      seen.add(k)
      return true
    }),
  ]
}
