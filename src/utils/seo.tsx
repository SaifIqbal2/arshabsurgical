import { useEffect } from 'react'

export type SEOProps = {
  title?: string
  description?: string
  keywords?: string
  canonicalUrl?: string
  ogImage?: string
  ogType?: 'website' | 'article' | 'product'
  productData?: {
    name: string
    sku: string
    category: string
    image: string
    description: string
    material?: string
    availability?: string
  }
  breadcrumbs?: Array<{ name: string; url: string }>
}

const DEFAULT_TITLE = 'ArShab Surgical | Premium Medical & Surgical Instruments Manufacturer Sialkot'
const DEFAULT_DESC =
  'ArShab Surgical is a premier manufacturer & global exporter of German-grade stainless steel surgical, dental, and medical instruments from Sialkot, Pakistan. ISO 13485 & CE certified.'
const DEFAULT_KEYWORDS =
  'surgical instruments manufacturer, Sialkot surgical instruments, medical instruments exporter, German stainless steel tools, dental instruments, hospital equipment, surgical scissors, forceps, needle holders, OEM surgical manufacturing, ISO 13485, CE marked instruments'
const SITE_URL = 'https://arshabsurgicals.com'
const DEFAULT_OG_IMAGE = 'https://images.unsplash.com/photo-1584982751601-97dcc096659c?auto=format&fit=crop&w=1200&q=85'

export default function SEO({
  title,
  description = DEFAULT_DESC,
  keywords = DEFAULT_KEYWORDS,
  canonicalUrl,
  ogImage = DEFAULT_OG_IMAGE,
  ogType = 'website',
  productData,
  breadcrumbs
}: SEOProps) {
  useEffect(() => {
    // 1. Page Title
    const fullTitle = title ? `${title} | ArShab Surgical` : DEFAULT_TITLE
    document.title = fullTitle

    // Helper function to set or create meta tag
    const setMeta = (nameAttr: 'name' | 'property', attrValue: string, content: string) => {
      let element = document.querySelector(`meta[${nameAttr}="${attrValue}"]`)
      if (!element) {
        element = document.createElement('meta')
        element.setAttribute(nameAttr, attrValue)
        document.head.appendChild(element)
      }
      element.setAttribute('content', content)
    }

    // 2. Standard Meta Tags
    setMeta('name', 'description', description)
    setMeta('name', 'keywords', keywords)
    setMeta('name', 'robots', 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1')
    setMeta('name', 'author', 'ArShab Surgical')
    setMeta('name', 'publisher', 'ArShab Surgical Instruments')

    // 3. Open Graph / Facebook
    setMeta('property', 'og:title', fullTitle)
    setMeta('property', 'og:description', description)
    setMeta('property', 'og:type', ogType)
    setMeta('property', 'og:image', ogImage)
    setMeta('property', 'og:site_name', 'ArShab Surgical')
    setMeta('property', 'og:locale', 'en_US')

    const currentUrl = canonicalUrl ? `${SITE_URL}${canonicalUrl}` : `${SITE_URL}${window.location.pathname}`
    setMeta('property', 'og:url', currentUrl)

    // 4. Twitter Cards
    setMeta('name', 'twitter:card', 'summary_large_image')
    setMeta('name', 'twitter:title', fullTitle)
    setMeta('name', 'twitter:description', description)
    setMeta('name', 'twitter:image', ogImage)

    // 5. Canonical Link
    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement
    if (!canonicalLink) {
      canonicalLink = document.createElement('link')
      canonicalLink.setAttribute('rel', 'canonical')
      document.head.appendChild(canonicalLink)
    }
    canonicalLink.setAttribute('href', currentUrl)

    // 6. JSON-LD Structured Data Schema
    const scriptId = 'arshab-structured-data'
    let scriptTag = document.getElementById(scriptId) as HTMLScriptElement
    if (!scriptTag) {
      scriptTag = document.createElement('script')
      scriptTag.id = scriptId
      scriptTag.type = 'application/ld+json'
      document.head.appendChild(scriptTag)
    }

    const schemas: unknown[] = [
      {
        '@context': 'https://schema.org',
        '@type': 'MedicalBusiness',
        '@id': `${SITE_URL}/#organization`,
        name: 'ArShab Surgical',
        url: SITE_URL,
        logo: `${SITE_URL}/logo.png`,
        image: DEFAULT_OG_IMAGE,
        description: DEFAULT_DESC,
        telephone: '+92-319-7613502',
        email: 'info@arshabsurgical.com',
        priceRange: '$$',
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'Mohalla Maghribi, Wazirabad Road, PO Khas Harrar',
          addressLocality: 'Sialkot',
          addressRegion: 'Punjab',
          postalCode: '51310',
          addressCountry: 'PK'
        },
        geo: {
          '@type': 'GeoCoordinates',
          latitude: 32.4945,
          longitude: 74.5229
        },
        hasCredential: [
          'ISO 9001:2015 Certified',
          'ISO 13485:2016 Medical Devices Quality',
          'CE Marking Directive 93/42/EEC'
        ],
        areaServed: 'Worldwide'
      }
    ]

    // Product Schema (for Rich Snippets)
    if (productData) {
      schemas.push({
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: productData.name,
        image: productData.image,
        description: productData.description,
        sku: productData.sku,
        mpn: productData.sku,
        brand: {
          '@type': 'Brand',
          name: 'ArShab Surgical'
        },
        manufacturer: {
          '@type': 'Organization',
          name: 'ArShab Surgical'
        },
        material: productData.material || 'AISI 410 / 420 Surgical Stainless Steel',
        category: productData.category,
        offers: {
          '@type': 'Offer',
          url: currentUrl,
          priceCurrency: 'USD',
          price: '0.00',
          priceValidUntil: '2028-12-31',
          itemCondition: 'https://schema.org/NewCondition',
          availability: 'https://schema.org/InStock',
          seller: {
            '@type': 'Organization',
            name: 'ArShab Surgical'
          }
        }
      })
    }

    // Breadcrumb Schema
    if (breadcrumbs && breadcrumbs.length > 0) {
      schemas.push({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: breadcrumbs.map((b, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: b.name,
          item: b.url.startsWith('http') ? b.url : `${SITE_URL}${b.url}`
        }))
      })
    }

    scriptTag.text = JSON.stringify(schemas)
  }, [title, description, keywords, canonicalUrl, ogImage, ogType, productData, breadcrumbs])

  return null
}
