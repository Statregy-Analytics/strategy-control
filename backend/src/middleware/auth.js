// simple dev-friendly auth middleware
// Accepts Authorization: Bearer <base64(json)> where json is { id, email, role }
module.exports = function (req, res, next) {
  const auth = req.get('Authorization') || req.get('authorization')
  if (!auth) return next()
  const parts = String(auth).split(' ')
  if (parts.length !== 2) return next()
  const scheme = parts[0]
  const token = parts[1]
  if (scheme !== 'Bearer') return next()
  try {
    const json = Buffer.from(token, 'base64').toString('utf8')
    const parsed = JSON.parse(json)
    req.user = parsed
  } catch (e) {
    // ignore parsing errors
  }
  return next()
}
