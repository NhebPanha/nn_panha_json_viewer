// Resolves a short share id back into its stored payload.
export default defineEventHandler(async (event) => {
  if (!isShareStoreConfigured()) {
    throw createError({ statusCode: 503, statusMessage: 'Share store is not configured' })
  }

  const id = getRouterParam(event, 'id') || ''
  if (!SHARE_ID_PATTERN.test(id)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid share id' })
  }

  let payload: string | null = null
  try {
    payload = await shareGet(id)
  } catch {
    throw createError({ statusCode: 502, statusMessage: 'Could not read the share link' })
  }

  if (!payload) {
    throw createError({ statusCode: 404, statusMessage: 'Share link not found or expired' })
  }

  return { payload }
})
