import { SITE } from '../constants/site'

/**
 * Builds the JSON-LD structured data (schema.org WebApplication) for the site.
 * Rendered as an inline <script type="application/ld+json"> in the document head.
 */
export function buildStructuredData(): string {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: SITE.name,
    description: SITE.description,
    url: SITE.url,
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Any',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD'
    }
  })
}
