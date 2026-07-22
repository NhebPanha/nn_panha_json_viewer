import { randomBytes } from 'node:crypto'

/**
 * Minimal Redis REST client for share links.
 *
 * Works with Vercel KV (KV_REST_API_*) and Upstash Redis
 * (UPSTASH_REDIS_REST_*) — both expose the same REST API, so no SDK dependency
 * is needed. If neither is configured the feature degrades gracefully and the
 * client falls back to the long self-contained URL.
 */
const restUrl = () => process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL
const restToken = () => process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN

/** Share links expire after 30 days. */
export const SHARE_TTL_SECONDS = 60 * 60 * 24 * 30

/** Only URL-safe ids of a sane length are ever accepted as keys. */
export const SHARE_ID_PATTERN = /^[A-Za-z0-9_-]{6,16}$/

export function isShareStoreConfigured(): boolean {
  return Boolean(restUrl() && restToken())
}

export function generateShareId(): string {
  // 6 random bytes -> 8 URL-safe characters.
  return randomBytes(6).toString('base64url')
}

export async function shareSet(id: string, value: string): Promise<void> {
  await $fetch(`${restUrl()}/set/${encodeURIComponent(`share:${id}`)}?EX=${SHARE_TTL_SECONDS}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${restToken()}` },
    body: value
  })
}

export async function shareGet(id: string): Promise<string | null> {
  const res = await $fetch<{ result: string | null }>(
    `${restUrl()}/get/${encodeURIComponent(`share:${id}`)}`,
    { headers: { Authorization: `Bearer ${restToken()}` } }
  )
  return res?.result ?? null
}
