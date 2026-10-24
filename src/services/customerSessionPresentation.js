export function sessionEquipment(agent) {
  if (!agent) return 'Não informado'
  const browser = /Edg\//.test(agent)
    ? 'Edge'
    : /OPR\//.test(agent)
      ? 'Opera'
      : /Firefox\/|FxiOS\//.test(agent)
        ? 'Firefox'
        : /Chrome\/|CriOS\//.test(agent)
          ? 'Chrome'
          : /Safari\//.test(agent)
            ? 'Safari'
            : ''
  const platform = /iPhone/.test(agent)
    ? 'iPhone / iOS'
    : /iPad/.test(agent)
      ? 'iPad / iOS'
      : /Android/.test(agent)
        ? 'Android'
        : /Windows/.test(agent)
          ? 'PC / Windows'
          : /Macintosh|Mac OS X/.test(agent)
            ? 'Mac / macOS'
            : /Linux/.test(agent)
              ? 'PC / Linux'
              : ''
  return [platform, browser].filter(Boolean).join(' / ') || 'Não informado'
}
export function customerSessionRows(sessions) {
  return sessions.map((session) => {
    const date = session.createdAtUtc ? new Date(session.createdAtUtc) : null
    const ip = String(session.ipAddress || '')
    return {
      id: session.sessionId,
      date:
        date && !Number.isNaN(date.getTime())
          ? new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(
              date,
            )
          : 'Não informado',
      ip: !ip
        ? 'Não informado'
        : ip.includes('*')
          ? ip
          : ip.includes('.') && !ip.includes(':')
            ? ip.split('.').slice(0, 2).join('.') + '.***.***'
            : ip.slice(0, 4) + ':****:****',
      // No location/geolocation is provided. Never infer it from IP or user-agent.
      local: 'Não informado',
      equipment: sessionEquipment(session.userAgent),
      active: Boolean(
        session.expiresAtUtc && new Date(session.expiresAtUtc).getTime() > Date.now(),
      ),
    }
  })
}
