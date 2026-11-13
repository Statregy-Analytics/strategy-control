export const publicationFileRules = {
  pdf: { accept: 'application/pdf', maxSize: 50 * 1024 * 1024, label: 'PDF até 50MB' },
  audio: {
    accept: 'audio/mpeg,audio/mp3,audio/wav,audio/x-wav,audio/x-m4a,audio/mp4',
    maxSize: 100 * 1024 * 1024,
    label: 'MP3, WAV ou M4A até 100MB',
  },
}
export async function validatePublicationFiles(files, kind) {
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
