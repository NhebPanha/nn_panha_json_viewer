// Pretty short-link route: /s/<id> -> /?id=<id>
// A plain server redirect keeps the client simple (no flash of content).
export default defineEventHandler((event) => {
  const id = getRouterParam(event, 'id') || ''
  if (!SHARE_ID_PATTERN.test(id)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid share id' })
  }
  return sendRedirect(event, `/?id=${encodeURIComponent(id)}`, 302)
})
