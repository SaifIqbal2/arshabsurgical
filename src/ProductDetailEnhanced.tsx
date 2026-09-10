import React, { useEffect, useState, useRef } from 'react'
import {
  Award,
  Check,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  MessageCircle,
  Package,
  Ruler,
  ShieldCheck,
  ShoppingCart,
  Tag,
  Truck,
  X,
  Share2,
  Sparkles
} from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { supabase } from './utils/supabase'
import SEO from './utils/seo'
import './product-detail-enhanced.css'

type Product = {
  id?: string
  name: string
  category: string
  sku: string
  image: string
  description: string
  featured?: boolean
}

type ProductInfo = {
  description: string | null
  features: unknown
  specifications: unknown
}

const whatsappUrl = (product: string, sku: string) =>
  `https://wa.me/923436202680?text=${encodeURIComponent(
    `Hello ArShab Surgical, I am interested in: ${product} (ART# ${sku}). Please provide catalogue and pricing.`
  )}`

const toStringList = (value: unknown, fallback: string[]): string[] =>
  Array.isArray(value) && value.length > 0
    ? (value.filter(v => typeof v === 'string' && v.trim()) as string[])
    : fallback

const toSpecEntries = (value: unknown): [string, string][] =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (Object.entries(value as Record<string, unknown>).filter(
        ([, v]) => typeof v === 'string' || typeof v === 'number'
      ).map(([k, v]) => [k, String(v)]) as [string, string][])
    : []

const DEFAULT_FEATURES = [
  'Forged from certified surgical-grade stainless steel (AISI 410 / 420)',
  'Micro-machined jaw alignment and satin anti-glare finish',
  'Fully compatible with repeated autoclave sterilization (134°C / 273°F)',
  'Ergonomic grip balance reduces surgeon hand fatigue in prolonged procedures',
  '100% individual quality inspection before cleanroom packaging and dispatch',
]

const DEFAULT_SPECS: [string, string][] = [
  ['Material', 'AISI 410 / 420 Surgical Stainless Steel'],
  ['Finish', 'Medical Satin Anti-Glare (Mirror on request)'],
  ['Sterilization', 'Autoclave Compatible (134°C / 273°F)'],
  ['Quality Standards', 'ISO 9001:2015, ISO 13485:2016, CE Mark'],
  ['Origin', 'Sialkot, Pakistan (ArShab Surgical Craftsmanship)'],
  ['Reusability', 'Reusable & Passivated for Long Life'],
]

export default function ProductDetailEnhanced({
  products,
  onQuote,
}: {
  products: Product[]
  onQuote: (product: string) => void
}) {
  const location = useLocation()
  const slug = decodeURIComponent(location.pathname.split('/').filter(Boolean).pop() || '')
  const product = products.find(p => p.sku.toLowerCase() === slug.toLowerCase())

  const [gallery, setGallery] = useState<string[]>([])
  const [activeImage, setActiveImage] = useState(0)
  const [info, setInfo] = useState<ProductInfo | null>(null)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const thumbsContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setActiveImage(0)
    setLightboxOpen(false)
    if (!product?.id) return

    void (async () => {
      try {
        const [galleryRes, detailRes] = await Promise.all([
          supabase
            .from('product_images')
            .select('image_url')
            .eq('product_id', product.id)
            .order('sort_order', { ascending: true }),
          supabase
            .from('products')
            .select('description, features, specifications')
            .eq('id', product.id)
            .maybeSingle(),
        ])

        if (galleryRes.data && galleryRes.data.length > 0) {
          setGallery(galleryRes.data.map(r => r.image_url))
        } else {
          setGallery([])
        }
        setInfo(detailRes.data as ProductInfo | null)
      } catch (err) {
        console.error('Error fetching product details:', err)
      }
    })()
  }, [product?.id, product?.sku])

  // Scroll to top on load
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [location.pathname])

  if (!product) {
    return (
      <main className="pd-not-found-wrap">
        <div className="page-banner">
          <div className="container">
            <h1>Instrument Not Found</h1>
            <p>The requested surgical instrument does not exist or has been relocated.</p>
          </div>
        </div>
        <div className="container" style={{ padding: '80px 20px', textAlign: 'center' }}>
          <Package size={68} color="#108185" style={{ marginBottom: '20px' }} />
          <h2 style={{ fontSize: '24px', color: 'var(--sq-navy)', marginBottom: '12px' }}>
            Looking for a specific instrument?
          </h2>
          <p style={{ fontSize: '15px', color: '#666', maxWidth: '540px', margin: '0 auto 28px' }}>
            Please explore our comprehensive catalogue or get in touch with our team for custom fabrication.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <Link to="/products" className="btn-sq-primary">
              Browse All Instruments &raquo;
            </Link>
            <Link to="/contact" className="btn-sq-outline">
              Contact Sales Team
            </Link>
          </div>
        </div>
      </main>
    )
  }

  // Deduplicate and filter images
  const allImages = [product.image, ...gallery].filter(Boolean)
  const images = Array.from(new Set(allImages))
  if (images.length === 0) images.push('/logo.png')

  const features = toStringList(info?.features, DEFAULT_FEATURES)
  const dbSpecs = toSpecEntries(info?.specifications)
  const specs = dbSpecs.length > 0 ? dbSpecs : DEFAULT_SPECS
  const description = info?.description || product.description

  // Related products from same category
  const related = products
    .filter(p => p.sku !== product.sku && p.category === product.category)
    .slice(0, 4)

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation()
    setActiveImage(curr => (curr + 1) % images.length)
  }

  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation()
    setActiveImage(curr => (curr - 1 + images.length) % images.length)
  }

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    }
  }

  return (
    <main className="pd-page">
      <SEO
        title={`${product.name} (ART# ${product.sku})`}
        description={`${product.name} (ART# ${product.sku}) — Premium ${product.category} crafted from certified German surgical-grade stainless steel. ISO 13485 compliant, autoclave safe, exported by ArShab Surgical Sialkot.`}
        keywords={`${product.name}, ART ${product.sku}, ${product.category}, surgical instruments Sialkot, stainless steel medical instruments, ArShab Surgical`}
        canonicalUrl={`/products/${product.sku.toLowerCase()}`}
        ogImage={product.image || images[0]}
        ogType="product"
        productData={{
          name: product.name,
          sku: product.sku,
          category: product.category,
          image: product.image || images[0],
          description: description,
          material: specs.find(s => s[0].toLowerCase().includes('material'))?.[1] || 'AISI 410 / 420 Surgical Stainless Steel'
        }}
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Instruments', url: '/products' },
          { name: product.category, url: `/categories/${product.category.toLowerCase().replace(/[^a-z0-9]+/g, '-')}` },
          { name: product.name, url: `/products/${product.sku.toLowerCase()}` }
        ]}
      />

      {/* Page Header Banner */}
      <div className="page-banner">
        <div className="container">
          <div className="pd-banner-content">
            <span className="pd-banner-eyebrow">{product.category}</span>
            <h1>{product.name}</h1>
            <p>ART# {product.sku} · Hospital &amp; Surgical Grade Instrument</p>
          </div>
        </div>
      </div>

      {/* Breadcrumb Bar */}
      <div className="pd-breadcrumb">
        <div className="container">
          <nav aria-label="Breadcrumb">
            <Link to="/">Home</Link>
            <ChevronRight size={13} />
            <Link to="/products">Instruments</Link>
            <ChevronRight size={13} />
            <Link
              to={`/categories/${product.category.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
            >
              {product.category}
            </Link>
            <ChevronRight size={13} />
            <span className="pd-breadcrumb-current">{product.name}</span>
          </nav>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <section className="pd-main">
        <div className="container">
          <div className="pd-layout">
            {/* Left Column: Image Slider Showcase */}
            <div className="pd-gallery-wrapper">
              <div className="pd-gallery-stage-box">
                {/* Main Active Image Frame */}
                <div
                  className="pd-main-stage"
                  onClick={() => setLightboxOpen(true)}
                  title="Click to view high-resolution fullscreen"
                >
                  <img
                    src={images[activeImage]}
                    alt={`${product.name} view ${activeImage + 1}`}
                    className="pd-main-img"
                    onError={e => {
                      ;(e.target as HTMLImageElement).src = '/logo.png'
                    }}
                  />

                  {/* Badges on stage */}
                  <div className="pd-stage-badges">
                    {product.featured && (
                      <span className="pd-badge-featured">
                        <Award size={13} /> Featured
                      </span>
                    )}
                    <span className="pd-badge-counter">
                      {activeImage + 1} / {images.length}
                    </span>
                  </div>

                  {/* Lightbox hint button */}
                  <button
                    className="pd-expand-btn"
                    onClick={e => {
                      e.stopPropagation()
                      setLightboxOpen(true)
                    }}
                    title="Fullscreen Preview"
                    aria-label="Expand image"
                  >
                    <Maximize2 size={16} />
                  </button>

                  {/* Slider Prev / Next Arrows (shown when > 1 image) */}
                  {images.length > 1 && (
                    <>
                      <button
                        className="pd-slide-nav pd-slide-prev"
                        onClick={handlePrev}
                        aria-label="Previous image"
                        title="Previous image"
                      >
                        <ChevronLeft size={22} />
                      </button>
                      <button
                        className="pd-slide-nav pd-slide-next"
                        onClick={handleNext}
                        aria-label="Next image"
                        title="Next image"
                      >
                        <ChevronRight size={22} />
                      </button>
                    </>
                  )}
                </div>

                {/* Dot indicators */}
                {images.length > 1 && (
                  <div className="pd-dots-track">
                    {images.map((_, idx) => (
                      <button
                        key={idx}
                        className={`pd-dot ${idx === activeImage ? 'active' : ''}`}
                        onClick={() => setActiveImage(idx)}
                        aria-label={`Go to slide ${idx + 1}`}
                      />
                    ))}
                  </div>
                )}

                {/* Horizontal Thumbnail Slider Bar */}
                {images.length > 1 && (
                  <div className="pd-thumbs-container">
                    <div className="pd-thumbs-track" ref={thumbsContainerRef}>
                      {images.map((img, i) => (
                        <button
                          key={i}
                          type="button"
                          className={`pd-thumb-btn ${i === activeImage ? 'active' : ''}`}
                          onClick={() => setActiveImage(i)}
                          aria-label={`Select image ${i + 1}`}
                        >
                          <img
                            src={img}
                            alt=""
                            className="pd-thumb-img"
                            onError={e => {
                              ;(e.target as HTMLImageElement).src = '/logo.png'
                            }}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Trust highlights under gallery */}
              <div className="pd-gallery-trust">
                <div className="pd-trust-item">
                  <ShieldCheck size={18} color="#108185" />
                  <div>
                    <strong>ISO 13485 &amp; CE Certified</strong>
                    <span>Regulated medical manufacturing standards</span>
                  </div>
                </div>
                <div className="pd-trust-item">
                  <Sparkles size={18} color="#108185" />
                  <div>
                    <strong>Autoclave Compatible</strong>
                    <span>100% steam sterilization resistant</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Information & Actions */}
            <div className="pd-info-col">
              {/* Product Category & SKU Pills */}
              <div className="pd-pill-row">
                <span className="pd-cat-pill">
                  <Tag size={12} /> {product.category}
                </span>
                <span className="pd-sku-pill">ART# {product.sku}</span>
                <button
                  type="button"
                  className="pd-share-btn"
                  onClick={handleShare}
                  title="Copy link to product"
                >
                  <Share2 size={13} /> {copied ? 'Link Copied!' : 'Share'}
                </button>
              </div>

              <h1 className="pd-title">{product.name}</h1>

              <div className="pd-short-desc">
                <p>{description}</p>
              </div>

              {/* Action Buttons */}
              <div className="pd-actions-wrap">
                <button
                  type="button"
                  className="btn-sq-primary pd-cta-basket"
                  onClick={() => onQuote(product.name)}
                >
                  <ShoppingCart size={18} /> Add to Inquiry Basket
                </button>

                <a
                  href={whatsappUrl(product.name, product.sku)}
                  target="_blank"
                  rel="noreferrer"
                  className="pd-cta-wa"
                >
                  <MessageCircle size={18} /> Direct WhatsApp Inquiry
                </a>
              </div>

              {/* Quick Specification Highlights */}
              <div className="pd-quick-specs">
                <h3 className="pd-quick-title">Instrument Quick Reference</h3>
                <div className="pd-quick-table">
                  <div className="pd-quick-row">
                    <span className="pd-label">Discipline</span>
                    <span className="pd-val">{product.category}</span>
                  </div>
                  <div className="pd-quick-row">
                    <span className="pd-label">Article Number</span>
                    <span className="pd-val">ART# {product.sku}</span>
                  </div>
                  <div className="pd-quick-row">
                    <span className="pd-label">Material Grade</span>
                    <span className="pd-val">AISI 410 / 420 Surgical Stainless Steel</span>
                  </div>
                  <div className="pd-quick-row">
                    <span className="pd-label">Certification</span>
                    <span className="pd-val">ISO 9001:2015 · ISO 13485:2016 · CE</span>
                  </div>
                  <div className="pd-quick-row">
                    <span className="pd-label">Availability</span>
                    <span className="pd-val pd-in-stock">In Stock / Custom OEM Available</span>
                  </div>
                </div>
              </div>

              {/* Shipping & Assurance strip */}
              <div className="pd-shipping-strip">
                <div className="pd-ship-cell">
                  <Truck size={20} color="#0a3c61" />
                  <div>
                    <strong>Global Export</strong>
                    <p>DHL, FedEx &amp; Air Cargo from Sialkot facility</p>
                  </div>
                </div>
                <div className="pd-ship-cell">
                  <Package size={20} color="#0a3c61" />
                  <div>
                    <strong>Custom OEM / Branding</strong>
                    <p>Laser engraving &amp; sterile pouching</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs / Detail Cards Section */}
      <section className="pd-details-section">
        <div className="container">
          <div className="pd-cards-grid">
            {/* Features Card */}
            <div className="pd-card">
              <div className="pd-card-header">
                <Check size={20} className="pd-card-icon" />
                <h2>Key Clinical &amp; Material Features</h2>
              </div>
              <ul className="pd-features-list">
                {features.map((feat, idx) => (
                  <li key={idx}>
                    <Check size={16} className="pd-check-bullet" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Technical Specifications Table Card */}
            <div className="pd-card">
              <div className="pd-card-header">
                <Ruler size={20} className="pd-card-icon" />
                <h2>Technical Specifications</h2>
              </div>
              <table className="pd-specs-table">
                <tbody>
                  {specs.map(([label, val], idx) => (
                    <tr key={idx}>
                      <th>{label.replace(/_/g, ' ')}</th>
                      <td>{val}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Quality Standards & Verification Card */}
            <div className="pd-card pd-card-quality">
              <div className="pd-card-header">
                <ShieldCheck size={20} className="pd-card-icon" />
                <h2>Quality &amp; Metallurgy Assurance</h2>
              </div>
              <p className="pd-quality-text">
                Every single instrument bearing the ArShab Surgical hallmark is subjected to
                stringent multi-tier inspections in Sialkot, Pakistan. This includes Rockwell hardness
                testing, jaw alignment verification under stereomicroscopes, passive chemical treatment
                for rust-proofing, and test autoclaving before vacuum packaging.
              </p>
              <div className="pd-cert-tags-row">
                <span className="pd-cert-tag">ISO 9001:2015</span>
                <span className="pd-cert-tag">ISO 13485:2016</span>
                <span className="pd-cert-tag">CE Mark Verified</span>
                <span className="pd-cert-tag">cGMP Compliant</span>
                <span className="pd-cert-tag">Passivated AISI Steel</span>
              </div>
            </div>
          </div>

          {/* Bulk Orders / Hospital Supply CTA banner */}
          <div className="pd-bulk-banner">
            <div className="pd-bulk-text">
              <h3>Looking for Wholesale Quotation or Hospital Supply?</h3>
              <p>
                We provide discounted tier pricing for healthcare institutions, dental clinics,
                medical distributors, and tender contracts worldwide.
              </p>
            </div>
            <div className="pd-bulk-actions">
              <button
                type="button"
                className="btn-sq-primary"
                onClick={() => onQuote(product.name)}
              >
                Inquire For Bulk Quantity
              </button>
              <Link to="/contact" className="pd-bulk-contact-link">
                Speak with Export Manager &raquo;
              </Link>
            </div>
          </div>

          {/* Related Products Carousel / Grid */}
          {related.length > 0 && (
            <div className="pd-related-wrap">
              <div className="pd-related-head">
                <h2>Related Instruments in {product.category}</h2>
                <Link
                  to={`/categories/${product.category.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
                  className="pd-view-all-link"
                >
                  View Category Collection &raquo;
                </Link>
              </div>

              <div className="product-showcase-grid">
                {related.map(rel => (
                  <article key={rel.sku} className="inner_prod">
                    <Link to={`/products/${rel.sku.toLowerCase()}`}>
                      <div className="prod_img">
                        <img
                          src={rel.image}
                          alt={rel.name}
                          loading="lazy"
                          onError={e => {
                            ;(e.target as HTMLImageElement).src = '/logo.png'
                          }}
                        />
                      </div>
                      <div className="prod_name">
                        <h3>{rel.name}</h3>
                        <p>ART#{rel.sku}</p>
                      </div>
                    </Link>
                    <button
                      className="btn-add-basket"
                      onClick={() => onQuote(rel.name)}
                    >
                      Add to Basket
                    </button>
                  </article>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Lightbox Fullscreen Modal */}
      {lightboxOpen && (
        <div className="pd-lightbox-backdrop" onClick={() => setLightboxOpen(false)}>
          <div className="pd-lightbox-content" onClick={e => e.stopPropagation()}>
            <button
              className="pd-lightbox-close"
              onClick={() => setLightboxOpen(false)}
              aria-label="Close fullscreen"
            >
              <X size={26} />
            </button>

            <div className="pd-lightbox-stage">
              <img
                src={images[activeImage]}
                alt={product.name}
                className="pd-lightbox-img"
              />

              {images.length > 1 && (
                <>
                  <button
                    className="pd-lightbox-nav prev"
                    onClick={handlePrev}
                    aria-label="Previous image"
                  >
                    <ChevronLeft size={32} />
                  </button>
                  <button
                    className="pd-lightbox-nav next"
                    onClick={handleNext}
                    aria-label="Next image"
                  >
                    <ChevronRight size={32} />
                  </button>
                </>
              )}
            </div>

            <div className="pd-lightbox-footer">
              <span>{product.name}</span>
              <span>
                {activeImage + 1} of {images.length}
              </span>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
