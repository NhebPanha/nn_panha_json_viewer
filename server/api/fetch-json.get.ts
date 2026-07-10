// Server-side proxy so the browser can load JSON from any URL without CORS issues.
export default defineEventHandler(async (event) => {
  const url = getQuery(event).url as string | undefined

  if (!url || !/^https?:\/\//i.test(url)) {
    throw createError({ statusCode: 400, statusMessage: 'A valid http(s) URL is required' })
  }

  try {
    const res = await $fetch<unknown>(url, {
      responseType: 'text',
      timeout: 10000,
      headers: { accept: 'application/json, text/plain, */*' }
    })
    const data = typeof res === 'string' ? res : JSON.stringify(res)
    return { data }
  } catch {
    throw createError({ statusCode: 502, statusMessage: 'Could not fetch JSON from that URL' })
  }
})
