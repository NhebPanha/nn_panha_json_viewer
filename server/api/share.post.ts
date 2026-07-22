// Creates a short share link: stores the encoded payload and returns its id.
export default defineEventHandler(async (event) => {
  if (!isShareStoreConfigured()) {
    throw createError({ statusCode: 503, statusMessage: 'Share store is not configured' })
  }

  const body = await readBody<{ payload?: unknown }>(event)
  const payload = body?.payload

  if (typeof payload !== 'string' || !payload) {
    throw createError({ statusCode: 400, statusMessage: 'A payload string is required' })
  }
  if (payload.length > 400_000) {
    throw createError({ statusCode: 413, statusMessage: 'JSON is too large to share' })
  }

  const id = generateShareId()
  try {
    await shareSet(id, payload)
  } catch {
    throw createError({ statusCode: 502, statusMessage: 'Could not store the share link' })
  }

  return { id }
})
