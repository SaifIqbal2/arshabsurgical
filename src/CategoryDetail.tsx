import { useEffect, useState } from 'react'
import {
  Award,
  ChevronRight,
  Package,
  ShieldCheck,
  ShoppingCart,
  Tag,
  Truck
} from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { supabase } from './utils/supabase'
import SEO from './utils/seo'

type Category = {
  id: string
  name: string
  slug?: string
  description?: string | null
  image: string
}

type Product = {
  id?: string
  name: string
  sku: string
  short_description: string | null
  main_image_url: string | null
  is_featured: boolean
}

const publicImageUrl = (value: string | null | undefined) => {
  if (!value) return '/logo.png'
  if (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('/')) return value
  return supabase.storage.from('image').getPublicUrl(value).data.publicUrl
}

export default function CategoryDetail({
  categoryList,
  onQuote
}: {
  categoryList: Category[]
  onQuote: (productName: string) => void
}) {
  const location = useLocation()
  const slug = decodeURIComponent(location.pathname.split('/').filter(Boolean).pop() || '')
  const [category, setCategory] = useState<Category | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadCategory() {
      setLoading(true)
      const normalizedSlug = slug?.toLowerCase().trim()
      const categoryData = categoryList.find(
        item =>
          item.slug?.toLowerCase() === normalizedSlug ||
          item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') === normalizedSlug
      )

      if (!categoryData) {
        setLoading(false)
        return
      }

      setCategory(categoryData)

      try {
        const { data: productData } = await supabase
          .from('products')
          .select('id, name, sku, short_description, main_image_url, is_featured')
          .eq('category_id', categoryData.id)
          .eq('is_published', true)
          .order('created_at', { ascending: false })

        setProducts(productData ?? [])
      } catch (err) {
        console.error('Error loading category products:', err)
      } finally {
        setLoading(false)
      }
    }

    void loadCategory()
  }, [slug, categoryList])

  if (loading) {
    return (
      <main>
        <div className="page-banner">
          <div className="container">
            <h1>Loading Category...</h1>
            <p>Retrieving instruments from database...</p>
          </div>
        </div>
      </main>
    )
  }

  if (!category) {
    return (
      <main>
        <div className="page-banner">
          <div className="container">
            <h1>Discipline Not Found</h1>
            <p>The instrument discipline you requested could not be located.</p>
          </div>
        </div>
        <div className="container" style={{ padding: '80px 20px', textAlign: 'center' }}>
          <Package size={64} color="#108185" style={{ marginBottom: '20px' }} />
          <h2 style={{ fontSize: '24px', color: 'var(--sq-navy)', marginBottom: '12px' }}>
            Category Unavailable
          </h2>
          <p style={{ color: '#666', marginBottom: '24px' }}>
            Please browse our complete catalog or explore all available disciplines.
          </p>
          <Link to="/categories" className="btn-sq-primary">
            View All Categories &raquo;
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main>
      <SEO
        title={`${category.name} Instruments Collection`}
        description={category.description || `Browse ArShab Surgical's complete line of ${category.name} instruments crafted from high-precision surgical stainless steel in Sialkot, Pakistan.`}
        keywords={`${category.name}, ${category.name} surgical instruments, hospital equipment, medical instruments Sialkot, ArShab Surgical`}
        canonicalUrl={`/categories/${category.slug || category.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
        ogImage={category.image || 'https://images.unsplash.com/photo-1584982751601-97dcc096659c?auto=format&fit=crop&w=1200&q=85'}
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Categories', url: '/categories' },
          { name: category.name, url: `/categories/${category.slug || category.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}` }
        ]}
      />

      {/* Page Header Banner */}
      <div className="page-banner">
        <div className="container">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span
              style={{
                fontSize: '13px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'var(--sq-teal)'
              }}
            >
              Medical Discipline
            </span>
            <h1>{category.name}</h1>
            <p>
              {category.description ||
                'Precision medical & surgical instruments engineered for clinical excellence.'}
            </p>
          </div>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="pd-breadcrumb">
        <div className="container">
          <nav aria-label="Breadcrumb">
            <Link to="/">Home</Link>
            <ChevronRight size={13} />
            <Link to="/categories">Categories</Link>
            <ChevronRight size={13} />
            <span className="pd-breadcrumb-current">{category.name}</span>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="container page-content-wrap" style={{ padding: '40px 16px 80px' }}>
        {/* Category Header Card with Banner */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            overflow: 'hidden',
            boxShadow: '0 2px 12px rgba(10,60,97,0.04)',
            marginBottom: '40px',
            display: 'grid',
            gridTemplateColumns: category.image ? '320px 1fr' : '1fr',
            gap: '24px',
            alignItems: 'center'
          }}
        >
          {category.image && (
            <div style={{ height: '100%', minHeight: '180px', maxHeight: '240px', overflow: 'hidden', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img
                src={category.image}
                alt={category.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={e => {
                  ;(e.target as HTMLImageElement).src = '/logo.png'
                }}
              />
            </div>
          )}

          <div style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span
                style={{
                  background: 'rgba(16,129,133,0.1)',
                  color: 'var(--sq-teal)',
                  fontSize: '12px',
                  fontWeight: 700,
                  padding: '4px 10px',
                  borderRadius: '20px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <Tag size={12} /> {products.length} {products.length === 1 ? 'Instrument' : 'Instruments'} Available
              </span>
              <span
                style={{
                  background: '#f1f5f9',
                  color: '#475569',
                  fontSize: '12px',
                  fontWeight: 600,
                  padding: '4px 10px',
                  borderRadius: '20px'
                }}
              >
                German Stainless Steel
              </span>
            </div>

            <h2 style={{ fontSize: '24px', color: 'var(--sq-navy)', margin: '0 0 10px', fontWeight: 700 }}>
              {category.name} Collection
            </h2>

            <p style={{ fontSize: '14px', color: '#64748b', lineHeight: '1.7', margin: '0 0 18px' }}>
              {category.description ||
                'Manufactured from surgical-grade stainless steel with precision jaw alignment and autoclave compatibility.'}
            </p>

            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '13px', color: 'var(--sq-navy)', fontWeight: 600 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldCheck size={16} color="#108185" /> ISO 13485 &amp; CE Certified
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Truck size={16} color="#108185" /> Global Export Direct from Sialkot
              </div>
            </div>
          </div>
        </div>

        {/* Instruments Grid Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ fontSize: '20px', color: 'var(--sq-navy)', margin: 0, fontWeight: 700 }}>
              Published Instruments ({products.length})
            </h3>
            <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0' }}>
              Click any instrument to view high-resolution photos, specifications, and request quotation.
            </p>
          </div>
          <Link
            to="/products"
            style={{
              color: 'var(--sq-teal)',
              fontSize: '13px',
              fontWeight: 700,
              textDecoration: 'none'
            }}
          >
            Browse All Categories &raquo;
          </Link>
        </div>

        {/* Product Showcase Grid */}
        {products.length > 0 ? (
          <div className="product-showcase-grid">
            {products.map(product => (
              <article key={product.sku || product.name} className="inner_prod">
                <Link to={`/products/${product.sku.toLowerCase()}`}>
                  <div className="prod_img">
                    <img
                      src={publicImageUrl(product.main_image_url)}
                      alt={product.name}
                      loading="lazy"
                      onError={e => {
                        ;(e.target as HTMLImageElement).src = '/logo.png'
                      }}
                    />
                    {product.is_featured && (
                      <span
                        style={{
                          position: 'absolute',
                          top: '10px',
                          left: '10px',
                          background: '#eab308',
                          color: '#fff',
                          fontSize: '10px',
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: '12px',
                          textTransform: 'uppercase',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '3px'
                        }}
                      >
                        <Award size={10} /> Featured
                      </span>
                    )}
                  </div>
                  <div className="prod_name">
                    <h3>{product.name}</h3>
                    <p>ART#{product.sku}</p>
                  </div>
                </Link>
                <button
                  className="btn-add-basket"
                  onClick={() => onQuote(product.name)}
                >
                  <ShoppingCart size={15} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                  Add to Basket
                </button>
              </article>
            ))}
          </div>
        ) : (
          <div className="catalog-empty-box">
            <h3>No instruments published in this category yet.</h3>
            <p>Our team is currently updating this catalog collection with new surgical instruments.</p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '16px' }}>
              <Link to="/products" className="btn-sq-primary">
                Browse All Instruments &raquo;
              </Link>
              <Link to="/contact" className="btn-sq-outline">
                Contact Sales Team
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
