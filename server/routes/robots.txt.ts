// Dynamically served robots.txt referencing the sitemap.
export default defineEventHandler((event) => {
  const base = useRuntimeConfig().public.siteUrl
  setHeader(event, 'Content-Type', 'text/plain')
  return `User-agent: *
Allow: /

Sitemap: ${base}/sitemap.xml
`
})
