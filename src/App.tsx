import React, { useEffect, useMemo, useState } from 'react'
import { BrowserRouter, Link, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import {
  ArrowUp,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Globe,
  Mail,
  Menu,
  MessageCircle,
  Phone,
  Search,
  ShieldCheck,
  ShoppingCart,
  Trash2,
  X,
  Award,
  Box,
  Users,
  Send,
  Loader2
} from 'lucide-react'
import { supabase } from './utils/supabase'
import AdminPanel from './AdminPanel'
import ProductDetail from './ProductDetailEnhanced'
import CategoryDetail from './CategoryDetail'
import SEO from './utils/seo'
import './sq-surgical.css'

// Types
export type Product = {
  id?: string
  name: string
  category: string
  sku: string
  image: string
  description: string
  featured?: boolean
}

export type Category = {
  id: string
  name: string
  slug?: string
  count?: string
  image: string
  description?: string | null
}

export type BasketItem = {
  product: Product
  quantity: number
}

// Hero banners matching ArShab Surgical logo styling (Deep Navy & Medical Teal)
const HERO_SLIDES = [
  {
    tag: 'ArShab Surgical • Sialkot, Pakistan',
    title: 'Precision in Every Cut.',
    titleAccent: 'Excellence in Healthcare.',
    desc: 'Leading manufacturer and global exporter of high-precision Surgical, Dental, and Medical instruments crafted with German-grade stainless steel.',
    image: 'https://images.unsplash.com/photo-1584982751601-97dcc096659c?auto=format&fit=crop&w=1920&q=85',
    ctaPrimary: 'Explore Catalogue',
    ctaPrimaryLink: '/products',
    ctaSecondary: 'Request Inquiry',
    ctaSecondaryLink: '/contact'
  },
  {
    tag: 'German-Grade Stainless Steel',
    title: 'Engineered for Clinical Mastery,',
    titleAccent: 'Built for Longevity.',
    desc: 'Uncompromising attention to balance, material integrity, and sharp precision edges trusted by surgeons and healthcare organizations worldwide.',
    image: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&w=1920&q=85',
    ctaPrimary: 'View Categories',
    ctaPrimaryLink: '/categories',
    ctaSecondary: 'Quality Promise',
    ctaSecondaryLink: '/quality'
  },
  {
    tag: 'Global Sourcing & OEM Partner',
    title: 'International Standards,',
    titleAccent: 'Artisan Metalwork.',
    desc: 'Compliant with ISO 9001, ISO 13485, and CE mark specifications. Providing bespoke OEM manufacturing and global healthcare supplies.',
    image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=1920&q=85',
    ctaPrimary: 'Browse Products',
    ctaPrimaryLink: '/products',
    ctaSecondary: 'Contact Our Team',
    ctaSecondaryLink: '/contact'
  }
]

const whatsappUrl = (message?: string) =>
  `https://wa.me/923436202680?text=${encodeURIComponent(
    message ?? 'Hello ArShab Surgical, I am interested in your surgical instruments. Please provide catalogue and pricing.'
  )}`

const publicImageUrl = (value: string | null | undefined) => {
  if (!value) return '/logo.png'
  if (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('/')) return value
  return supabase.storage.from('image').getPublicUrl(value).data.publicUrl
}

// --------------------------------------------------------------------------
// Top Bar Component
// --------------------------------------------------------------------------
function TopBar() {
  return (
    <div className="topbar">
      <div className="container">
        <div className="top-left">
          <ul>
            <li>
              <Mail size={14} color="#108185" />
              <a href="mailto:info@arshabsurgical.com">EMAIL : info@arshabsurgical.com</a>
            </li>
            <li>
              <Phone size={14} color="#108185" />
              <a href="tel:+923197613502">PHONE : +92 - 319-7613502</a>
            </li>
          </ul>
        </div>
        <div className="top-right">
          <ul>
            <li>
              <a href="https://facebook.com" target="_blank" rel="noreferrer" title="Facebook">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
              </a>
            </li>
            <li>
              <a href="https://instagram.com" target="_blank" rel="noreferrer" title="Instagram">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
              </a>
            </li>
            <li>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" title="LinkedIn">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
              </a>
            </li>
            <li>
              <a href={whatsappUrl()} target="_blank" rel="noreferrer" title="WhatsApp">
                <MessageCircle size={15} />
              </a>
            </li>
            <li>
              <select className="language-select" aria-label="Language selection" defaultValue="en">
                <option value="en">Language: English</option>
                <option value="de">German</option>
                <option value="fr">French</option>
                <option value="es">Spanish</option>
                <option value="ar">Arabic</option>
                <option value="ur">Urdu</option>
              </select>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}

// --------------------------------------------------------------------------
// Middle Bar / Header Component
// --------------------------------------------------------------------------
function Header({
  basketCount,
  onOpenBasket,
  onOpenSearch,
  categories
}: {
  basketCount: number
  onOpenBasket: () => void
  onOpenSearch: () => void
  categories: Category[]
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()

  return (
    <header className="middle-bar">
      <div className="container">
        <div className="logo">
          <Link to="/">
            <img src="/logo.png" alt="ArShab Surgical" />
          </Link>
        </div>

        <div className="main_nav">
          <ul className="lk">
            <li className="mobile_none">
              <Link to="/" className={location.pathname === '/' ? 'active' : ''}>
                Home
              </Link>
            </li>
            <li className="mobile_none">
              <Link to="/about" className={location.pathname === '/about' ? 'active' : ''}>
                About us
              </Link>
            </li>
            <li className="mobile_none nav-dropdown">
              <Link to="/products" className={location.pathname.startsWith('/products') ? 'active' : ''}>
                PRODUCTS ▾
              </Link>
              <ul className="l2_ul">
                {categories.length > 0 ? (
                  categories.map(cat => (
                    <li className="l2_li" key={cat.id}>
                      <Link to={`/categories/${cat.slug || cat.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}>
                        {cat.name}
                      </Link>
                    </li>
                  ))
                ) : (
                  <li className="l2_li">
                    <Link to="/products">All Products</Link>
                  </li>
                )}
                <li className="l2_li" style={{ borderTop: '1px solid rgba(255,255,255,0.15)' }}>
                  <Link to="/products" style={{ color: 'var(--sq-teal)' }}>
                    &bull; View All Instruments
                  </Link>
                </li>
              </ul>
            </li>
            <li className="mobile_none">
              <Link to="/quality" className={location.pathname === '/quality' ? 'active' : ''}>
                Quality
              </Link>
            </li>
            <li className="mobile_none">
              <button
                onClick={onOpenBasket}
                style={{
                  cursor: 'pointer',
                  padding: '12px 16px',
                  fontFamily: 'inherit',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  fontSize: '15px',
                  color: 'var(--sq-navy)'
                }}
              >
                Inquiry
              </button>
            </li>
            <li className="mobile_none">
              <Link to="/contact" className={location.pathname === '/contact' ? 'active' : ''}>
                CONTACT US
              </Link>
            </li>

            {/* Cart / Basket Action Button */}
            <li className="custom_syle">
              <button onClick={onOpenBasket} aria-label="Open inquiry basket" title="Inquiry Basket">
                <ShoppingCart size={20} />
                {basketCount > 0 && <span className="basket-badge">{basketCount}</span>}
              </button>
            </li>

            {/* Search Action Button */}
            <li className="custom_syle">
              <button onClick={onOpenSearch} aria-label="Search instruments" title="Search Instruments">
                <Search size={20} />
              </button>
            </li>

            {/* Mobile Menu Button */}
            <li className="custom_syle mobile-menu-toggle">
              <button onClick={() => setMobileMenuOpen(true)} aria-label="Toggle navigation menu">
                <Menu size={22} />
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* Mobile Slide-in Drawer */}
      {mobileMenuOpen && (
        <div className="sidenav-backdrop" onClick={() => setMobileMenuOpen(false)}>
          <div className="sidenav open" onClick={e => e.stopPropagation()}>
            <span className="closebtn" onClick={() => setMobileMenuOpen(false)}>
              &times;
            </span>
            <ul>
              <li>
                <Link to="/" onClick={() => setMobileMenuOpen(false)}>
                  Home
                </Link>
              </li>
              <li>
                <Link to="/about" onClick={() => setMobileMenuOpen(false)}>
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/products" onClick={() => setMobileMenuOpen(false)}>
                  Products
                </Link>
                <ul className="sidenav-sub">
                  {categories.map(cat => (
                    <li key={cat.id}>
                      <Link
                        to={`/categories/${cat.slug || cat.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {cat.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
              <li>
                <Link to="/quality" onClick={() => setMobileMenuOpen(false)}>
                  Quality &amp; Standards
                </Link>
              </li>
              <li>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false)
                    onOpenBasket()
                  }}
                  style={{
                    color: '#fff',
                    fontSize: '16px',
                    fontFamily: 'var(--font-serif)',
                    textTransform: 'uppercase',
                    padding: '12px 0',
                    width: '100%',
                    textAlign: 'left'
                  }}
                >
                  Inquiry Basket ({basketCount})
                </button>
              </li>
              <li>
                <Link to="/contact" onClick={() => setMobileMenuOpen(false)}>
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/admin/login" onClick={() => setMobileMenuOpen(false)} style={{ color: 'var(--sq-teal)' }}>
                  Admin Login
                </Link>
              </li>
            </ul>
          </div>
        </div>
      )}
    </header>
  )
}

// --------------------------------------------------------------------------
// Full-Screen Search Modal (.open-search)
// --------------------------------------------------------------------------
function SearchOverlay({
  open,
  onClose,
  products
}: {
  open: boolean
  onClose: () => void
  products: Product[]
}) {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  const results = useMemo(() => {
    if (!query.trim()) return []
    const q = query.toLowerCase()
    return products.filter(
      p => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
    )
  }, [query, products])

  if (!open) return null

  return (
    <div className="open-search" onClick={onClose}>
      <div className="closing-search" onClick={onClose} aria-label="Close search">
        <X size={34} />
      </div>
      <div className="search-target" onClick={e => e.stopPropagation()}>
        <form
          onSubmit={e => {
            e.preventDefault()
            if (results.length > 0) {
              navigate(`/products/${results[0].sku.toLowerCase()}`)
              onClose()
            }
          }}
        >
          <input
            type="text"
            placeholder="Search instruments by name, SKU (e.g. AS-01-107)..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            autoFocus
          />
          <button type="submit" aria-label="Submit search">
            <Search size={28} />
          </button>
        </form>

        {query.trim() && (
          <div className="search-results">
            {results.length > 0 ? (
              results.slice(0, 6).map(item => (
                <div
                  key={item.sku}
                  className="search-item"
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    navigate(`/products/${item.sku.toLowerCase()}`)
                    onClose()
                  }}
                >
                  <img src={item.image} alt={item.name} />
                  <div className="search-item-info">
                    <h4>{item.name}</h4>
                    <p>
                      {item.category} &bull; ART#{item.sku}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p style={{ color: '#aaa', padding: '16px', textAlign: 'center' }}>No matching instruments found.</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// --------------------------------------------------------------------------
// Inquiry Basket Drawer / Modal
// --------------------------------------------------------------------------
function InquiryBasketModal({
  open,
  onClose,
  basket,
  onUpdateQty,
  onRemoveItem,
  onClearBasket
}: {
  open: boolean
  onClose: () => void
  basket: BasketItem[]
  onUpdateQty: (sku: string, delta: number) => void
  onRemoveItem: (sku: string) => void
  onClearBasket: () => void
}) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [company, setCompany] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [sentSuccess, setSentSuccess] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  if (!open) return null

  const totalItems = basket.reduce((acc, item) => acc + item.quantity, 0)

  const handleWhatsAppSend = () => {
    const list = basket.map(item => `• ${item.product.name} (ART# ${item.product.sku}) - Qty: ${item.quantity}`).join('\n')
    const text = `Hello ArShab Surgical, I would like to request an inquiry for the following instruments:\n\n${list}\n\nClient: ${name || 'N/A'}\nEmail: ${email || 'N/A'}\nCompany: ${company || 'N/A'}\nNote: ${message || 'Please provide quotation & delivery times.'}`
    window.open(whatsappUrl(text), '_blank')
  }

  const handleSubmitInquiry = async (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true)
    setErrorMessage('')

    const listText = basket.map(i => `${i.product.name} (SKU: ${i.product.sku}) x ${i.quantity}`).join(', ')
    const fullMessage = `Basket Items:\n${listText}\n\nPhone: ${phone}\nNotes: ${message}`

    const { error } = await supabase.from('inquiries').insert({
      name,
      email,
      company,
      subject: `Inquiry for ${totalItems} instruments`,
      message: fullMessage,
      status: 'unread'
    })

    setSending(false)
    if (error) {
      setErrorMessage(error.message)
      return
    }

    setSentSuccess(true)
    onClearBasket()
  }

  return (
    <div className="basket-backdrop" onClick={onClose}>
      <div className="basket-modal" onClick={e => e.stopPropagation()}>
        <div className="basket-header">
          <h3>
            <ShoppingCart size={20} /> Inquiry Basket ({totalItems} items)
          </h3>
          <button onClick={onClose} style={{ color: '#fff', cursor: 'pointer' }} aria-label="Close basket">
            <X size={24} />
          </button>
        </div>

        <div className="basket-body">
          {sentSuccess ? (
            <div className="basket-empty">
              <CheckCircle2 size={54} color="#108185" />
              <h3 style={{ margin: '14px 0 8px', color: '#0a3c61' }}>Inquiry Sent Successfully!</h3>
              <p>Thank you. Our sales and technical team will contact you shortly with quotation details.</p>
              <button
                className="btn-sq-primary"
                style={{ marginTop: '20px' }}
                onClick={() => {
                  setSentSuccess(false)
                  onClose()
                }}
              >
                Continue Browsing
              </button>
            </div>
          ) : basket.length === 0 ? (
            <div className="basket-empty">
              <ShoppingCart size={48} color="#0a3c61" />
              <h3 style={{ color: '#0a3c61' }}>Your basket is empty</h3>
              <p>Browse our instruments catalog and click "Add to Basket" on products you want to inquire about.</p>
              <button className="btn-sq-primary" style={{ marginTop: '16px' }} onClick={onClose}>
                Browse Products
              </button>
            </div>
          ) : (
            <>
              {basket.map(item => (
                <div key={item.product.sku} className="basket-item">
                  <img src={item.product.image} alt={item.product.name} />
                  <div className="basket-item-info">
                    <h4>{item.product.name}</h4>
                    <span>ART# {item.product.sku}</span>
                  </div>
                  <div className="basket-item-qty">
                    <button onClick={() => onUpdateQty(item.product.sku, -1)}>-</button>
                    <span style={{ fontSize: '13px', fontWeight: 700, minWidth: '20px', textAlign: 'center' }}>
                      {item.quantity}
                    </span>
                    <button onClick={() => onUpdateQty(item.product.sku, 1)}>+</button>
                  </div>
                  <button
                    className="basket-remove-btn"
                    onClick={() => onRemoveItem(item.product.sku)}
                    title="Remove item"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}

              <form className="basket-form" onSubmit={handleSubmitInquiry}>
                <h4>Inquiry Contact Details</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <input
                    placeholder="Your Name *"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                  />
                  <input
                    placeholder="Business Email *"
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <input
                    placeholder="Phone / WhatsApp Number"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                  />
                  <input
                    placeholder="Company / Hospital / Clinic"
                    value={company}
                    onChange={e => setCompany(e.target.value)}
                  />
                </div>
                <textarea
                  placeholder="Additional specifications, required sizes, packaging, or questions..."
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                />

                {errorMessage && (
                  <p style={{ color: '#c0202f', fontSize: '13px', marginBottom: '10px' }}>{errorMessage}</p>
                )}

                <div style={{ display: 'flex', gap: '12px', marginTop: '10px', flexWrap: 'wrap' }}>
                  <button
                    type="submit"
                    className="btn-sq-primary"
                    disabled={sending}
                    style={{ flexGrow: 1, justifyContent: 'center' }}
                  >
                    {sending ? 'Submitting...' : 'Submit Official Inquiry'}
                  </button>
                  <button
                    type="button"
                    onClick={handleWhatsAppSend}
                    style={{
                      backgroundColor: '#25D366',
                      color: '#fff',
                      padding: '12px 20px',
                      borderRadius: '3px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontFamily: 'var(--font-serif)',
                      fontWeight: 700,
                      fontSize: '13px',
                      textTransform: 'uppercase'
                    }}
                  >
                    <MessageCircle size={18} /> Inquire via WhatsApp
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// --------------------------------------------------------------------------
// Home Page Component
// --------------------------------------------------------------------------
function HomePage({
  products,
  categories,
  onAddToBasket
}: {
  products: Product[]
  categories: Category[]
  onAddToBasket: (p: Product) => void
}) {
  const [activeSlide, setActiveSlide] = useState(0)
  const [slides, setSlides] = useState(HERO_SLIDES)

  // Fetch dynamic hero slides from Supabase
  useEffect(() => {
    async function loadSlides() {
      try {
        const { data } = await supabase
          .from('hero_slides')
          .select('*')
          .eq('is_active', true)
          .order('sort_order', { ascending: true })

        if (data && data.length > 0) {
          const formatted = data.map(s => ({
            tag: s.eyebrow || 'ArShab Surgical • Sialkot, Pakistan',
            title: s.title,
            titleAccent: s.accent || '',
            desc: s.description,
            image: publicImageUrl(s.image_url),
            ctaPrimary: s.cta_label || 'Explore Catalogue',
            ctaPrimaryLink: s.cta_url || '/products',
            ctaSecondary: s.caption || 'Request Inquiry',
            ctaSecondaryLink: '/contact'
          }))
          setSlides(formatted)
        }
      } catch (err) {
        console.warn('Dynamic slides notice:', err)
      }
    }
    void loadSlides()
  }, [])

  // Autoplay slider
  useEffect(() => {
    if (slides.length <= 1) return
    const timer = setInterval(() => {
      setActiveSlide(idx => (idx + 1) % slides.length)
    }, 6500)
    return () => clearInterval(timer)
  }, [slides.length])

  return (
    <main>
      <SEO
        title="Premium Medical & Surgical Instruments Manufacturer"
        description="ArShab Surgical is a premier manufacturer and global exporter of high-precision German-grade stainless steel surgical, dental, and medical instruments from Sialkot, Pakistan. ISO 13485 & CE compliant."
        keywords="surgical instruments manufacturer Sialkot, dental instruments exporter, hospital equipment Pakistan, German stainless steel tools, ArShab Surgical"
        canonicalUrl="/"
      />

      {/* 1. Hero Slideshow Banner (.main_slider) */}
      <section className="main_slider">
        <div className="carousel-inner">
          {slides.map((slide, index) => (
            <div key={index} className={`carousel-item ${index === activeSlide ? 'active' : ''}`}>
              <img src={slide.image} alt={slide.title} className="carousel-bg-img" />
              <div className="carousel-caption-custom">
                <div className="caption-content">
                  <span className="carousel-tag">{slide.tag}</span>
                  <h1>
                    {slide.title} <br />
                    <span>{slide.titleAccent}</span>
                  </h1>
                  <p>{slide.desc}</p>
                  <div className="carousel-actions">
                    <Link to={slide.ctaPrimaryLink} className="btn-sq-primary">
                      {slide.ctaPrimary} &raquo;
                    </Link>
                    <Link to={slide.ctaSecondaryLink} className="btn-sq-outline">
                      {slide.ctaSecondary}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Carousel controls */}
        {slides.length > 1 && (
          <>
            <button
              className="carousel-control-prev"
              onClick={() => setActiveSlide(i => (i - 1 + slides.length) % slides.length)}
              aria-label="Previous Slide"
            >
              <ChevronLeft size={28} />
            </button>
            <button
              className="carousel-control-next"
              onClick={() => setActiveSlide(i => (i + 1) % slides.length)}
              aria-label="Next Slide"
            >
              <ChevronRight size={28} />
            </button>
          </>
        )}
      </section>

      {/* 2. Real Category Cards (.cate_main) from Supabase */}
      <section className="cate_main">
        <div className="container">
          {categories.length > 0 ? (
            <div className="cate_grid">
              {categories.map(cat => (
                <Link
                  key={cat.id}
                  to={`/categories/${cat.slug || cat.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
                  className="inner_cate"
                >
                  <div className="cate-img">
                    <img src={cat.image} alt={cat.name} loading="lazy" />
                  </div>
                  <div className="cate-name">
                    <h2>{cat.name}</h2>
                    <div className="icon_class">
                      <span>
                        <ChevronRight size={22} />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="catalog-empty-box">
              <h3>Categories will appear here once added in the Admin Panel</h3>
              <p>You can create and manage your surgical categories easily from the Admin Portal.</p>
              <Link to="/admin" className="btn-sq-primary">
                Open Admin Panel &raquo;
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* 3. Welcome / About Section (.about_main pad_40) */}
      <section className="about_main">
        <div className="container">
          <div className="about_grid">
            <div className="about-left">
              <h3>Welcome to</h3>
              <h2>ArShab Surgical</h2>
              <p>
                Founded in the world-renowned industrial hub of Sialkot, Pakistan — the global center of excellence for surgical instrument manufacturing. ArShab Surgical stands at the forefront of providing premium quality Surgical, Dental, Diagnostic, and Medical instruments to healthcare professionals, hospitals, and distributors worldwide.
              </p>
              <p>
                Our company is firmly dedicated to the modern healthcare industry. As dedicated specialist producers, we consistently deliver unrivaled metallurgical precision, ergonomic craftsmanship, and dependable clinical functionality under flexible, customer-first trade terms. We proudly maintain an esteemed reputation across healthcare institutions and clinics internationally.
              </p>
              <Link to="/about" className="read-more-btn">
                Read More &raquo;
              </Link>
            </div>
            <div className="about-right">
              <img
                src="https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=1000&q=80"
                alt="ArShab Surgical Craftsmanship"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 4. Five-Column Service Highlights / Metrics Bar (.service-main) */}
      <section className="service-main">
        <div className="container">
          <div className="service-grid">
            <div className="service">
              <div className="u-shap">
                <Award size={22} />
              </div>
              <h2>40+ YEARS</h2>
              <p>In Business &amp; Craft</p>
            </div>
            <div className="service">
              <div className="u-shap">
                <Globe size={22} />
              </div>
              <h2>150 +</h2>
              <p>Supplier Partners</p>
            </div>
            <div className="service">
              <div className="u-shap">
                <Box size={22} />
              </div>
              <h2>50 +</h2>
              <p>Boxes Shipped Daily</p>
            </div>
            <div className="service">
              <div className="u-shap">
                <Users size={22} />
              </div>
              <h2>100+</h2>
              <p>Master Artisans</p>
            </div>
            <div className="service">
              <div className="u-shap">
                <ShieldCheck size={22} />
              </div>
              <h2>99.5 %</h2>
              <p>Order Fulfillment Rate</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Featured Products Section (Real Data from Supabase) with Rotated Ribbon */}
      <section className="feature_prod_section">
        <div className="container">
          <div className="feature_prod">
            <div className="feature_prod_container">
              {/* Vertical Rotated Ribbon */}
              <div className="heading">
                <h2>Featured Products</h2>
              </div>

              {/* Products Grid */}
              <div className="main_inner">
                {products.length > 0 ? (
                  <div className="product-showcase-grid">
                    {products.map(product => (
                      <article key={product.sku || product.name} className="inner_prod">
                        <Link to={`/products/${product.sku.toLowerCase()}`}>
                          <div className="prod_img">
                            <img src={product.image} alt={product.name} loading="lazy" />
                          </div>
                          <div className="prod_name">
                            <h3>{product.name}</h3>
                            <p>ART#{product.sku}</p>
                          </div>
                        </Link>
                        <button
                          className="btn-add-basket"
                          onClick={() => onAddToBasket(product)}
                        >
                          Add to Basket
                        </button>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="catalog-empty-box">
                    <h3>No products published yet in Supabase database</h3>
                    <p>Create and publish real surgical instruments from the Admin Panel to display them here.</p>
                    <Link to="/admin" className="btn-sq-primary">
                      Add Instruments in Admin &raquo;
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Dual Split Promo Banners */}
      <section className="dual_promo_section">
        <div className="exbition">
          <div>
            <h2>Fairs &amp; Exhibitions</h2>
            <p>
              ArShab Surgical proudly exhibits at premier international medical expos including Medica Düsseldorf, Arab Health Dubai, and IDS Cologne. Connect with our export executives to examine our latest instrument innovations.
            </p>
          </div>
          <img
            src="https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80"
            alt="International Medical Fairs"
            className="exbition-img"
          />
        </div>

        <div className="main_display">
          <div className="catelog">
            <h3>Product</h3>
            <h2>Catalogues</h2>
            <p>
              Download our 2026 comprehensive PDF product catalogues featuring our complete collection of German-grade instruments.
            </p>
            <Link to="/products">View Catalogue &raquo;</Link>
          </div>
          <div className="catelog-img">
            <img src="/logo.png" alt="ArShab Surgical Catalogue" />
          </div>
        </div>
      </section>

      {/* 7. Certifications & Quality Compliance Strip */}
      <section className="certifications_strip">
        <div className="container">
          <div className="cert_grid">
            <div className="cert_badge">
              <ShieldCheck size={32} />
              <div className="cert_badge_text">
                <strong>ISO 9001:2015</strong>
                <span>Certified Quality Management</span>
              </div>
            </div>
            <div className="cert_badge">
              <ShieldCheck size={32} />
              <div className="cert_badge_text">
                <strong>ISO 13485:2016</strong>
                <span>Medical Devices Standard</span>
              </div>
            </div>
            <div className="cert_badge">
              <Award size={32} />
              <div className="cert_badge_text">
                <strong>CE Marked</strong>
                <span>European Conformity Verified</span>
              </div>
            </div>
            <div className="cert_badge">
              <CheckCircle2 size={32} />
              <div className="cert_badge_text">
                <strong>cGMP Compliant</strong>
                <span>Current Good Manufacturing Practice</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

// --------------------------------------------------------------------------
// Products Catalog Page (Real Data Only)
// --------------------------------------------------------------------------
function ProductsPage({
  products,
  categories,
  onAddToBasket
}: {
  products: Product[]
  categories: Category[]
  onAddToBasket: (p: Product) => void
}) {
  const [query, setQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')

  const categoryOptions = useMemo(() => {
    const names = Array.from(new Set(categories.map(c => c.name)))
    return ['All', ...names]
  }, [categories])

  const filtered = useMemo(() => {
    return products.filter(p => {
      const matchCat = selectedCategory === 'All' || p.category.toLowerCase() === selectedCategory.toLowerCase()
      const matchQuery =
        !query ||
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.sku.toLowerCase().includes(query.toLowerCase()) ||
        p.description.toLowerCase().includes(query.toLowerCase())
      return matchCat && matchQuery
    })
  }, [products, query, selectedCategory])

  return (
    <main>
      <SEO
        title="Complete Instruments Catalogue"
        description="Explore ArShab Surgical's full catalogue of hospital-grade stainless steel surgical instruments, needle holders, forceps, scissors, and dental tools. Request quotes and private label OEM."
        keywords="surgical instruments catalogue, hospital tools list, dental surgical instruments, scissors, needle holders, ArShab Surgical"
        canonicalUrl="/products"
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Products Catalogue', url: '/products' }
        ]}
      />
      <div className="page-banner">
        <div className="container">
          <h1>Our Instruments Collection</h1>
          <p>Explore high-precision surgical, dental, and medical instruments engineered for surgical mastery.</p>
        </div>
      </div>

      <div className="container page-content-wrap">
        <div className="catalog-toolbar">
          <div className="catalog-tabs">
            {categoryOptions.map(cat => (
              <button
                key={cat}
                className={`catalog-tab-btn ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          <div style={{ position: 'relative', width: '280px' }}>
            <input
              type="text"
              placeholder="Search by name or SKU..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 36px 8px 12px',
                border: '1px solid #ccc',
                borderRadius: '2px',
                fontFamily: 'var(--font-sans)',
                fontSize: '13px'
              }}
            />
            <Search size={16} style={{ position: 'absolute', right: '12px', top: '10px', color: '#888' }} />
          </div>
        </div>

        {filtered.length > 0 ? (
          <div className="product-showcase-grid">
            {filtered.map(product => (
              <article key={product.sku || product.name} className="inner_prod">
                <Link to={`/products/${product.sku.toLowerCase()}`}>
                  <div className="prod_img">
                    <img src={product.image} alt={product.name} loading="lazy" />
                  </div>
                  <div className="prod_name">
                    <h3>{product.name}</h3>
                    <p>ART#{product.sku}</p>
                  </div>
                </Link>
                <button
                  className="btn-add-basket"
                  onClick={() => onAddToBasket(product)}
                >
                  Add to Basket
                </button>
              </article>
            ))}
          </div>
        ) : (
          <div className="catalog-empty-box">
            <h3>No instruments found matching your criteria.</h3>
            <p>
              {products.length === 0
                ? 'No published products found in Supabase database. Add products from the admin panel.'
                : 'Try another search keyword or clear the filter.'}
            </p>
            {products.length === 0 && (
              <Link to="/admin" className="btn-sq-primary">
                Add Products in Admin &raquo;
              </Link>
            )}
          </div>
        )}
      </div>
    </main>
  )
}

// --------------------------------------------------------------------------
// Simple Content Page Component (About, Quality, Contact)
// --------------------------------------------------------------------------
function SimplePage({
  title,
  subtitle,
  children
}: {
  title: string
  subtitle: string
  children: React.ReactNode
}) {
  return (
    <main>
      <SEO
        title={title}
        description={subtitle}
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: title, url: window.location.pathname }
        ]}
      />
      <div className="page-banner">
        <div className="container">
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>
      </div>
      <div className="container page-content-wrap" style={{ maxWidth: '960px' }}>
        {children}
      </div>
    </main>
  )
}

// --------------------------------------------------------------------------
// Admin Login Page
// --------------------------------------------------------------------------
function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  return (
    <main>
      <div className="page-banner">
        <div className="container">
          <h1>Admin Portal</h1>
          <p>Sign in to manage catalog instruments, categories, and client inquiries.</p>
        </div>
      </div>
      <div className="container page-content-wrap" style={{ maxWidth: '480px' }}>
        <form
          onSubmit={async e => {
            e.preventDefault()
            setLoading(true)
            setError('')
            const { error: loginError } = await supabase.auth.signInWithPassword({ email, password })
            setLoading(false)
            if (loginError) {
              setError(loginError.message)
              return
            }
            navigate('/admin')
          }}
          style={{ background: '#fbfbfb', padding: '30px', border: '1px solid #e0e0e0', borderRadius: '4px' }}
        >
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: 'var(--sq-navy)' }}>
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="admin@arshabsurgical.com"
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #ccc', borderRadius: '2px' }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: 'var(--sq-navy)' }}>
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #ccc', borderRadius: '2px' }}
            />
          </div>

          {error && <p style={{ color: '#c0202f', fontSize: '13px', marginBottom: '16px' }}>{error}</p>}

          <button
            type="submit"
            className="btn-sq-primary"
            disabled={loading}
            style={{ width: '100%', justifyContent: 'center' }}
          >
            {loading ? 'Authenticating...' : 'Sign In to Dashboard'}
          </button>
        </form>
      </div>
    </main>
  )
}

// --------------------------------------------------------------------------
// Contact Page Component (Mobile-Responsive)
// --------------------------------------------------------------------------
function ContactPage() {
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSending(true)
    const form = new FormData(e.currentTarget)
    await supabase.from('inquiries').insert({
      name: form.get('name'), email: form.get('email'), company: form.get('company'),
      subject: 'Contact Form Message', message: form.get('message'), status: 'unread'
    })
    setSending(false)
    setSent(true)
    e.currentTarget.reset()
  }
  const inputStyle = { width: '100%', padding: '10px 12px', marginBottom: '12px', border: '1px solid #ccc', borderRadius: '2px', fontFamily: 'var(--font-sans)', fontSize: '14px' } as const
  return (
    <SimplePage title="Contact Us" subtitle="Connect with our export sales division for quotations, catalogues, and customer service.">
      <div className="contact-page-grid">
        <div>
          <h3 style={{ fontSize: '22px', color: 'var(--sq-navy)', marginBottom: '16px' }}>Get In Touch</h3>
          <p style={{ fontSize: '14px', color: '#666', lineHeight: '1.7', marginBottom: '24px' }}>
            Whether you are an overseas hospital procurement director, medical distributor, or clinical practitioner, our dedicated export support team is available 24/7.
          </p>
          {[
            { label: 'Manufacturing Facility & Head Office:', text: 'Mohalla Maghribi, Wazirabad Road, PO Khas Harrar, Sialkot 51310, Pakistan.' },
            { label: 'Telephone & WhatsApp:', text: 'Phone: +92 - 319-7613502\nWhatsApp: +92 - 343-6202680' },
          ].map(item => (
            <div key={item.label} style={{ marginBottom: '16px' }}>
              <strong style={{ display: 'block', fontSize: '13px', color: 'var(--sq-teal)', textTransform: 'uppercase', marginBottom: '4px' }}>{item.label}</strong>
              <p style={{ fontSize: '14px', color: '#333', whiteSpace: 'pre-line' }}>{item.text}</p>
            </div>
          ))}
          <div style={{ marginBottom: '28px' }}>
            <strong style={{ display: 'block', fontSize: '13px', color: 'var(--sq-teal)', textTransform: 'uppercase', marginBottom: '4px' }}>Email Inquiries:</strong>
            <p style={{ fontSize: '14px' }}>
              <a href="mailto:info@arshabsurgical.com" style={{ color: 'var(--sq-teal)' }}>info@arshabsurgical.com</a><br />
              <a href="mailto:hello@arshabsurgical.com" style={{ color: 'var(--sq-teal)' }}>hello@arshabsurgical.com</a>
            </p>
          </div>
          <a href={whatsappUrl()} target="_blank" rel="noreferrer" style={{ backgroundColor: '#25D366', color: '#fff', padding: '12px 24px', borderRadius: '3px', display: 'inline-flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontFamily: 'var(--font-serif)', textTransform: 'uppercase', fontSize: '13px' }}>
            <MessageCircle size={18} /> Chat Live on WhatsApp
          </a>
        </div>
        <div style={{ background: '#f8fafc', padding: '30px', border: '1px solid #dce6ed', borderRadius: '4px' }}>
          <h3 style={{ fontSize: '20px', color: 'var(--sq-navy)', marginBottom: '14px' }}>Direct Message</h3>
          {sent ? (
            <div style={{ textAlign: 'center', padding: '30px 20px' }}>
              <CheckCircle2 size={48} color="#108185" style={{ margin: '0 auto 16px', display: 'block' }} />
              <h4 style={{ color: 'var(--sq-navy)', fontSize: '20px', marginBottom: '8px' }}>Message Sent!</h4>
              <p style={{ color: '#666', fontSize: '14px', marginBottom: '20px' }}>Thank you. Our team will respond to your inquiry shortly.</p>
              <button className="btn-sq-primary" onClick={() => setSent(false)} style={{ margin: '0 auto' }}>Send Another Message</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <input name="name" placeholder="Your Full Name *" required style={inputStyle} />
              <input name="email" type="email" placeholder="Your Email *" required style={inputStyle} />
              <input name="company" placeholder="Company / Clinic / Organization" style={inputStyle} />
              <textarea name="message" placeholder="Your message, questions, or instrument requirements *" required style={{ ...inputStyle, minHeight: '110px', marginBottom: '14px', resize: 'vertical' }} />
              <button type="submit" className="btn-sq-primary" disabled={sending} style={{ width: '100%', justifyContent: 'center', gap: '8px' }}>
                {sending ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : null}
                {sending ? 'Sending...' : 'Send Message »'}
              </button>
            </form>
          )}
        </div>
      </div>
    </SimplePage>
  )
}

// --------------------------------------------------------------------------
// Newsletter Form Component
// --------------------------------------------------------------------------
function NewsletterForm() {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)
  const [busy, setBusy] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    await supabase.from('inquiries').insert({
      name: 'Newsletter Subscriber',
      email,
      subject: 'Newsletter Subscription',
      message: `Newsletter subscription from: ${email}`,
      status: 'newsletter'
    })
    setBusy(false)
    setSubscribed(true)
  }

  if (subscribed) {
    return (
      <p style={{ color: '#38c8ce', fontSize: '13px', margin: '8px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <CheckCircle2 size={16} /> Subscribed! Thank you.
      </p>
    )
  }

  return (
    <form className="newsletter-form" onSubmit={handleSubmit}>
      <input
        type="email"
        placeholder="Enter your email address"
        required
        value={email}
        onChange={e => setEmail(e.target.value)}
      />
      <button type="submit" aria-label="Subscribe" disabled={busy}>
        {busy ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={16} />}
      </button>
    </form>
  )
}

// --------------------------------------------------------------------------
// Footer Component (.top-footer, .bottom-footer)
// --------------------------------------------------------------------------
function Footer({ categories }: { categories: Category[] }) {

  return (
    <footer>
      <div className="top-footer">
        <div className="container">
          <div className="footer-columns">
            {/* 1. Contact Info */}
            <div className="inner-link">
              <h2>Contact Info</h2>
              <div className="contact-item">
                <div className="contact-icon">
                  <Globe size={18} />
                </div>
                <div className="contact-body">
                  <h5>ArShab Surgical</h5>
                  <p>Mohalla Maghribi, Wazirabad Road, PO Khas Harrar, Sialkot 51310, Pakistan.</p>
                </div>
              </div>

              <div className="contact-item">
                <div className="contact-icon">
                  <Mail size={18} />
                </div>
                <div className="contact-body">
                  <h5>Email</h5>
                  <p>
                    <a href="mailto:info@arshabsurgical.com">info@arshabsurgical.com</a>
                  </p>
                </div>
              </div>

              <div className="contact-item">
                <div className="contact-icon">
                  <Phone size={18} />
                </div>
                <div className="contact-body">
                  <h5>Phone</h5>
                  <p>+92 - 319-7613502</p>
                </div>
              </div>
            </div>

            {/* 2. Support / Quick Links */}
            <div className="inner-link">
              <h2>Support</h2>
              <ul>
                <li>
                  <Link to="/">
                    <span className="arrow-icon">&raquo;</span> Home
                  </Link>
                </li>
                <li>
                  <Link to="/products">
                    <span className="arrow-icon">&raquo;</span> Products
                  </Link>
                </li>
                <li>
                  <Link to="/about">
                    <span className="arrow-icon">&raquo;</span> About Us
                  </Link>
                </li>
                <li>
                  <Link to="/quality">
                    <span className="arrow-icon">&raquo;</span> Quality &amp; Standards
                  </Link>
                </li>
                <li>
                  <Link to="/categories">
                    <span className="arrow-icon">&raquo;</span> Categories
                  </Link>
                </li>
                <li>
                  <Link to="/contact">
                    <span className="arrow-icon">&raquo;</span> Contact Us
                  </Link>
                </li>
              </ul>
            </div>

            {/* 3. Categories (Real Data from Supabase) */}
            <div className="inner-link">
              <h2>Categories</h2>
              <ul>
                {categories.length > 0 ? (
                  categories.map(cat => (
                    <li key={cat.id}>
                      <Link to={`/categories/${cat.slug || cat.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}>
                        <span className="arrow-icon">&raquo;</span> {cat.name}
                      </Link>
                    </li>
                  ))
                ) : (
                  <li>
                    <Link to="/products">
                      <span className="arrow-icon">&raquo;</span> All Products
                    </Link>
                  </li>
                )}
              </ul>
            </div>

            {/* 4. Newsletter Sign Up */}
            <div className="inner-link newsletter-box">
              <h2>Newsletter Sign Up</h2>
              <p>
                Subscribe to ArShab Surgical's newsletter to receive new catalogue releases, offers, and product updates.
              </p>
              <NewsletterForm />

              <div className="footer-socials">
                <a href="https://facebook.com" target="_blank" rel="noreferrer" title="Facebook">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                </a>
                <a href="https://instagram.com" target="_blank" rel="noreferrer" title="Instagram">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noreferrer" title="LinkedIn">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
                </a>
                <a href={whatsappUrl()} target="_blank" rel="noreferrer" title="WhatsApp">
                  <MessageCircle size={16} />
                </a>
              </div>
            </div>
          </div>
        </div>

      </div>

      <div className="bottom-footer">
        <div className="container">
          <div className="copy_right">
            <p>ArShab Surgical &copy; 2026. All rights reserved.</p>
          </div>
          <div className="design">
            <p>
              Precision Medical Manufacturing &bull; Sialkot, Pakistan
              <Link to="/admin/login">Admin Login</Link>
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}

// --------------------------------------------------------------------------
// Floating Scroll-to-Top Button
// --------------------------------------------------------------------------
function ScrollToTopButton() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  if (!visible) return null

  return (
    <button
      className="floating-scroll-top"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Scroll to top"
    >
      <ArrowUp size={20} />
    </button>
  )
}

// --------------------------------------------------------------------------
// Root Application
// --------------------------------------------------------------------------
function App() {
  const [catalog, setCatalog] = useState<Product[]>([])
  const [categoryList, setCategoryList] = useState<Category[]>([])
  const [basket, setBasket] = useState<BasketItem[]>([])
  const [basketOpen, setBasketOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  const location = useLocation()
  const navigate = useNavigate()

  // Update page title based on route
  useEffect(() => {
    const titles: Record<string, string> = {
      '/': 'ArShab Surgical – Precision Surgical Instruments | Sialkot, Pakistan',
      '/products': 'Products Catalogue | ArShab Surgical',
      '/categories': 'Instrument Categories | ArShab Surgical',
      '/about': 'About Us | ArShab Surgical',
      '/quality': 'Quality Standards | ArShab Surgical',
      '/contact': 'Contact Us | ArShab Surgical',
      '/admin': 'Admin Dashboard | ArShab Surgical',
      '/admin/login': 'Admin Login | ArShab Surgical',
    }
    document.title = titles[location.pathname] ?? 'ArShab Surgical – Premium Medical Instruments'
  }, [location.pathname])

  // Load purely REAL data from Supabase without any mock data
  useEffect(() => {
    async function loadData() {
      try {
        const { data: catData } = await supabase
          .from('categories')
          .select('id, name, slug, description, image_url')
          .order('name')

        if (catData && catData.length > 0) {
          const formattedCategories: Category[] = catData.map(c => ({
            id: c.id,
            name: c.name,
            slug: c.slug || c.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            description: c.description,
            count: 'Explore range',
            image: publicImageUrl(c.image_url)
          }))
          setCategoryList(formattedCategories)
        } else {
          setCategoryList([])
        }

        const { data: prodData } = await supabase
          .from('products')
          .select('id, name, sku, short_description, main_image_url, is_featured, categories(name)')
          .eq('is_published', true)
          .order('created_at', { ascending: false })

        if (prodData && prodData.length > 0) {
          const formattedProducts: Product[] = prodData.map(p => ({
            id: p.id,
            name: p.name,
            sku: p.sku,
            category: Array.isArray(p.categories) ? p.categories[0]?.name ?? 'Surgical Instruments' : 'Surgical Instruments',
            image: publicImageUrl(p.main_image_url),
            description: p.short_description || 'Precision surgical instrument engineered for clinical mastery.',
            featured: p.is_featured
          }))
          setCatalog(formattedProducts)
        } else {
          setCatalog([])
        }
      } catch (err) {
        console.error('Error loading Supabase data:', err)
      } finally {
        setLoading(false)
      }
    }
    void loadData()
  }, [])

  // Basket Handlers
  const handleAddToBasket = (product: Product) => {
    setBasket(current => {
      const existing = current.find(item => item.product.sku === product.sku)
      if (existing) {
        return current.map(item =>
          item.product.sku === product.sku ? { ...item, quantity: item.quantity + 1 } : item
        )
      }
      return [...current, { product, quantity: 1 }]
    })
    setBasketOpen(true)
  }

  const handleUpdateQty = (sku: string, delta: number) => {
    setBasket(current =>
      current
        .map(item => {
          if (item.product.sku === sku) {
            const nextQty = item.quantity + delta
            return nextQty > 0 ? { ...item, quantity: nextQty } : null
          }
          return item
        })
        .filter(Boolean) as BasketItem[]
    )
  }

  const handleRemoveItem = (sku: string) => {
    setBasket(current => current.filter(item => item.product.sku !== sku))
  }

  const handleClearBasket = () => {
    setBasket([])
  }

  // Admin routes
  if (location.pathname === '/admin') return <AdminPanel />
  if (location.pathname === '/admin/login') {
    return (
      <>
        <TopBar />
        <Header
          basketCount={basket.reduce((a, b) => a + b.quantity, 0)}
          onOpenBasket={() => setBasketOpen(true)}
          onOpenSearch={() => setSearchOpen(true)}
          categories={categoryList}
        />
        <AdminLogin />
        <Footer categories={categoryList} />
      </>
    )
  }

  // Show full-screen loader while data loads
  if (loading) {
    return (
      <div className="app-loading-screen">
        <img src="/logo.png" alt="ArShab Surgical" className="loading-logo" />
        <Loader2 size={36} className="loading-spinner" />
        <p>Loading ArShab Surgical…</p>
      </div>
    )
  }

  return (
    <>
      <TopBar />
      <Header
        basketCount={basket.reduce((a, b) => a + b.quantity, 0)}
        onOpenBasket={() => setBasketOpen(true)}
        onOpenSearch={() => setSearchOpen(true)}
        categories={categoryList}
      />

      <Routes>
        <Route
          path="/"
          element={
            <HomePage
              products={catalog}
              categories={categoryList}
              onAddToBasket={handleAddToBasket}
            />
          }
        />
        <Route
          path="/products"
          element={
            <ProductsPage
              products={catalog}
              categories={categoryList}
              onAddToBasket={handleAddToBasket}
            />
          }
        />
        <Route
          path="/products/:slug"
          element={
            <ProductDetail
              products={catalog}
              onQuote={pName => {
                const found = catalog.find(x => x.name.toLowerCase() === (pName ?? '').toLowerCase())
                if (found) handleAddToBasket(found)
                else setBasketOpen(true)
              }}
            />
          }
        />
        <Route
          path="/categories"
          element={
            <main>
              <SEO
                title="Specialist Instrument Categories"
                description="Select a medical discipline to browse ArShab Surgical's dedicated surgical, dental, orthopedic, ENT, and veterinary collections."
                keywords="surgical categories, dental instruments, surgical instruments Sialkot, ArShab Surgical"
                canonicalUrl="/categories"
                breadcrumbs={[
                  { name: 'Home', url: '/' },
                  { name: 'Categories', url: '/categories' }
                ]}
              />
              <div className="page-banner">
                <div className="container">
                  <h1>Specialist Instrument Categories</h1>
                  <p>Select a discipline to browse our dedicated surgical, dental, and medical instrument collections.</p>
                </div>
              </div>
              <div className="container page-content-wrap">
                {categoryList.length > 0 ? (
                  <div className="cate_grid">
                    {categoryList.map(cat => (
                      <Link
                        key={cat.id}
                        to={`/categories/${cat.slug || cat.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
                        className="inner_cate"
                      >
                        <div className="cate-img">
                          <img src={cat.image} alt={cat.name} loading="lazy" />
                        </div>
                        <div className="cate-name">
                          <h2>{cat.name}</h2>
                          <div className="icon_class">
                            <span>
                              <ChevronRight size={22} />
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="catalog-empty-box">
                    <h3>No categories available yet</h3>
                    <p>Add your first category from the admin panel.</p>
                    <Link to="/admin" className="btn-sq-primary">
                      Open Admin Panel &raquo;
                    </Link>
                  </div>
                )}
              </div>
            </main>
          }
        />
        <Route
          path="/categories/:slug"
          element={
            <CategoryDetail
              categoryList={categoryList}
              onQuote={pName => {
                const found = catalog.find(x => x.name.toLowerCase() === (pName ?? '').toLowerCase())
                if (found) handleAddToBasket(found)
                else setBasketOpen(true)
              }}
            />
          }
        />
        <Route
          path="/about"
          element={
            <SimplePage
              title="About ArShab Surgical"
              subtitle="Specialist manufacturer & exporter of fine medical instruments based in Sialkot, Pakistan."
            >
              <div style={{ fontSize: '15px', lineHeight: '1.8', color: '#444' }}>
                <h3 style={{ fontSize: '24px', color: 'var(--sq-navy)', marginBottom: '14px' }}>
                  Our Legacy of Metalworking &amp; Precision
                </h3>
                <p style={{ marginBottom: '18px' }}>
                  ArShab Surgical was established in Sialkot, Pakistan — globally acclaimed as the epicenter of surgical instrument manufacturing. With decades of metallurgical experience passed through generations of master craftsmen, we produce surgical instruments that deliver surgical mastery, durability, and tactile responsiveness.
                </p>
                <p style={{ marginBottom: '18px' }}>
                  From raw surgical-grade stainless steel forging, precision milling, heat treatment, ultrasonic cleaning, and hand-polishing to rigorous quality control inspections, every single instrument undergoes meticulous quality checkpoints before leaving our facility.
                </p>

                <h3 style={{ fontSize: '24px', color: 'var(--sq-navy)', margin: '30px 0 14px' }}>
                  Global Distribution &amp; OEM Sourcing
                </h3>
                <p style={{ marginBottom: '18px' }}>
                  We support hospitals, healthcare distributors, clinics, and private label partners across Europe, North America, the Middle East, and Asia. Our flexible production capabilities allow us to accommodate standard catalogue supply as well as bespoke custom instrument fabrication according to technical drawings and prototypes.
                </p>

                <div style={{ marginTop: '30px', display: 'flex', gap: '16px' }}>
                  <Link to="/products" className="btn-sq-primary">
                    Explore Catalogue &raquo;
                  </Link>
                  <Link to="/contact" className="btn-sq-outline" style={{ color: 'var(--sq-navy)', borderColor: 'var(--sq-navy)' }}>
                    Contact Our Team
                  </Link>
                </div>
              </div>
            </SimplePage>
          }
        />
        <Route
          path="/quality"
          element={
            <SimplePage
              title="Quality Standards &amp; Assurance"
              subtitle="Uncompromising discipline in material selection, finishing, and clinical performance."
            >
              <div style={{ fontSize: '15px', lineHeight: '1.8', color: '#444' }}>
                <h3 style={{ fontSize: '24px', color: 'var(--sq-navy)', marginBottom: '14px' }}>
                  The ArShab Standard of Excellence
                </h3>
                <p style={{ marginBottom: '24px' }}>
                  In surgical procedures, every millimeter counts. Our instruments undergo multi-stage inspections to guarantee smooth hinge movements, flawless tungsten carbide jaw alignment, microscopic sharpness, and resistance to corrosion during autoclave sterilization.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px', margin: '30px 0' }}>
                  <div style={{ background: '#f9fbfd', padding: '24px', border: '1px solid #d8e5ee', borderRadius: '3px' }}>
                    <ShieldCheck size={32} color="#108185" style={{ marginBottom: '12px' }} />
                    <h4 style={{ fontSize: '18px', color: 'var(--sq-navy)', marginBottom: '8px' }}>Material Integrity</h4>
                    <p style={{ fontSize: '13px', color: '#666' }}>
                      AISI 410, 420, and 304 surgical stainless steel with certified hardness ratings, ensuring corrosion resistance and edge retention.
                    </p>
                  </div>
                  <div style={{ background: '#f9fbfd', padding: '24px', border: '1px solid #d8e5ee', borderRadius: '3px' }}>
                    <Award size={32} color="#108185" style={{ marginBottom: '12px' }} />
                    <h4 style={{ fontSize: '18px', color: 'var(--sq-navy)', marginBottom: '8px' }}>International Compliance</h4>
                    <p style={{ fontSize: '13px', color: '#666' }}>
                      Strict adherence to ISO 9001:2015, ISO 13485:2016, and CE marking protocols required by regulatory bodies worldwide.
                    </p>
                  </div>
                  <div style={{ background: '#f9fbfd', padding: '24px', border: '1px solid #d8e5ee', borderRadius: '3px' }}>
                    <CheckCircle2 size={32} color="#108185" style={{ marginBottom: '12px' }} />
                    <h4 style={{ fontSize: '18px', color: 'var(--sq-navy)', marginBottom: '8px' }}>Individual Inspection</h4>
                    <p style={{ fontSize: '13px', color: '#666' }}>
                      Every instrument is manually inspected for alignment, lock tension, tactile balance, and flawless finish before shipping.
                    </p>
                  </div>
                </div>

                <div style={{ marginTop: '30px' }}>
                  <button className="btn-sq-primary" onClick={() => setBasketOpen(true)}>
                    Request Quality Certificate &amp; Sample
                  </button>
                </div>
              </div>
            </SimplePage>
          }
        />
        <Route
          path="/contact"
          element={
            <ContactPage />
          }
        />
        <Route
          path="*"
          element={
            <SimplePage title="Page Not Found" subtitle="The requested instrument page does not exist.">
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <p style={{ marginBottom: '20px' }}>Please return to our home page or explore our complete catalog.</p>
                <button className="btn-sq-primary" onClick={() => navigate('/')}>
                  Back to Home Page &raquo;
                </button>
              </div>
            </SimplePage>
          }
        />
      </Routes>

      <Footer categories={categoryList} />

      <ScrollToTopButton />

      {/* Interactive Overlays */}
      <SearchOverlay
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        products={catalog}
      />

      <InquiryBasketModal
        open={basketOpen}
        onClose={() => setBasketOpen(false)}
        basket={basket}
        onUpdateQty={handleUpdateQty}
        onRemoveItem={handleRemoveItem}
        onClearBasket={handleClearBasket}
      />
    </>
  )
}

export default function AppRoot() {
  return (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  )
}
