import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import {
  CheckCircle2,
  Edit3,
  ExternalLink,
  FolderPlus,
  Image as ImageIcon,
  LogOut,
  Mail,
  PackagePlus,
  Plus,
  Search,
  Sliders,
  Trash2,
  X,
  Layers,
  Sparkles,
  ShieldCheck,
  Eye,
  EyeOff
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from './utils/supabase'
import './admin.css'

type Category = {
  id: string
  name: string
  slug: string
  description: string | null
  image_url: string | null
  sort_order?: number
}

type Product = {
  id: string
  category_id: string | null
  name: string
  slug: string
  sku: string
  short_description: string | null
  description?: string | null
  material?: string | null
  finish?: string | null
  instrument_size?: string | null
  tip_type?: string | null
  sterilization?: string | null
  certifications?: string | null
  reusability?: string | null
  features?: string[] | null
  specifications?: Record<string, string> | null
  main_image_url: string | null
  is_published: boolean
  is_featured: boolean
  categories?: { name: string }[] | null
}

type Slide = {
  id: string
  eyebrow: string
  title: string
  accent: string
  description: string
  image_url: string
  cta_label: string
  cta_url: string
  caption: string
  sort_order: number
  is_active: boolean
  created_at?: string
}

type Inquiry = {
  id: string
  name: string
  email: string
  company: string | null
  phone?: string | null
  subject: string | null
  message: string
  status: string | null
  created_at: string
}

type ProductForm = {
  id?: string
  name: string
  slug: string
  sku: string
  category_id: string
  short_description: string
  description: string
  material: string
  finish: string
  instrument_size: string
  tip_type: string
  sterilization: string
  certifications: string
  reusability: string
  features_text: string
  main_image_url: string
  additional_image_urls: string[]
  is_published: boolean
  is_featured: boolean
}

type CategoryForm = {
  id?: string
  name: string
  slug: string
  description: string
  image_url: string
  sort_order: number
}

type SlideForm = {
  id?: string
  eyebrow: string
  title: string
  accent: string
  description: string
  image_url: string
  cta_label: string
  cta_url: string
  caption: string
  sort_order: number
  is_active: boolean
}

const blankProduct: ProductForm = {
  name: '',
  slug: '',
  sku: '',
  category_id: '',
  short_description: '',
  description: '',
  material: 'AISI 410 / 420 Surgical Stainless Steel',
  finish: 'Medical Satin Anti-Glare',
  instrument_size: '14 cm (5.5 in)',
  tip_type: 'Precision Machined Serrated',
  sterilization: 'Autoclave Compatible (134°C / 273°F)',
  certifications: 'ISO 9001:2015 · ISO 13485:2016 · CE Marked',
  reusability: 'Reusable & Chemically Passivated',
  features_text: `Forged from certified German-grade AISI 410 / 420 stainless steel
Precision-machined jaw alignment and smooth hinge movement
Satin anti-glare finish reduces optical reflection under surgical lights
100% autoclave sterilization resistant and corrosion proof
Individually inspected and passivated before cleanroom packaging`,
  main_image_url: '',
  additional_image_urls: [],
  is_published: true,
  is_featured: false
}

const blankCategory: CategoryForm = {
  name: '',
  slug: '',
  description: '',
  image_url: '',
  sort_order: 0
}

const blankSlide: SlideForm = {
  eyebrow: 'ArShab Surgical • Sialkot, Pakistan',
  title: 'Precision in Every Cut.',
  accent: 'Excellence in Healthcare.',
  description: 'Leading manufacturer and global exporter of high-precision Surgical, Dental, and Medical instruments crafted with German-grade stainless steel.',
  image_url: 'https://images.unsplash.com/photo-1584982751601-97dcc096659c?auto=format&fit=crop&w=1920&q=85',
  cta_label: 'Explore Catalogue',
  cta_url: '/products',
  caption: 'Request Inquiry',
  sort_order: 0,
  is_active: true
}

const makeSlug = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

export default function AdminPanel() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [slides, setSlides] = useState<Slide[]>([])
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [tab, setTab] = useState<'products' | 'categories' | 'slides' | 'inquiries'>('products')
  const [productForm, setProductForm] = useState<ProductForm | null>(null)
  const [categoryForm, setCategoryForm] = useState<CategoryForm | null>(null)
  const [slideForm, setSlideForm] = useState<SlideForm | null>(null)
  const [formTab, setFormTab] = useState<'basic' | 'specs' | 'features' | 'gallery'>('basic')
  const [newGalleryUrl, setNewGalleryUrl] = useState('')
  const [search, setSearch] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [authorized, setAuthorized] = useState(false)
  const navigate = useNavigate()

  async function loadData() {
    setLoading(true)
    let loadedCategories: Category[] = []
    try {
      const catRes = await supabase
        .from('categories')
        .select('id, name, slug, description, image_url, sort_order')
        .order('sort_order', { ascending: true })
        .order('name')
      if (catRes.data && !catRes.error) {
        loadedCategories = catRes.data as Category[]
      } else {
        const fb = await supabase.from('categories').select('id, name, slug, description, image_url').order('name')
        loadedCategories = (fb.data ?? []) as Category[]
      }
    } catch {
      const fb = await supabase.from('categories').select('id, name, slug, description, image_url').order('name')
      loadedCategories = (fb.data ?? []) as Category[]
    }

    const [productsResult, slidesResult, inquiriesResult] = await Promise.all([
      supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false }),
      supabase.from('hero_slides').select('*').order('sort_order', { ascending: true }),
      supabase.from('inquiries').select('*').order('created_at', { ascending: false })
    ])

    if (productsResult.error) setMessage(`Products load error: ${productsResult.error.message}`)
    if (slidesResult.error) console.warn('Slides load:', slidesResult.error.message)

    setProducts((productsResult.data ?? []) as Product[])
    setCategories(loadedCategories)
    setSlides((slidesResult.data ?? []) as Slide[])
    setInquiries((inquiriesResult.data ?? []) as Inquiry[])
    setLoading(false)
  }

  useEffect(() => {
    async function checkSession() {
      const {
        data: { session }
      } = await supabase.auth.getSession()
      if (!session) {
        navigate('/admin/login', { replace: true })
        return
      }
      setAuthorized(true)
      await loadData()
    }
    void checkSession()
  }, [navigate])

  async function openEditProduct(product: Product) {
    let galleryUrls: string[] = []
    try {
      const { data } = await supabase
        .from('product_images')
        .select('image_url')
        .eq('product_id', product.id)
        .order('sort_order', { ascending: true })
      if (data && data.length > 0) {
        galleryUrls = data.map(d => d.image_url)
      }
    } catch {
      // Ignore
    }

    const specs = product.specifications || {}
    const featuresList = Array.isArray(product.features) ? product.features : []

    setProductForm({
      id: product.id,
      name: product.name,
      slug: product.slug,
      sku: product.sku,
      category_id: product.category_id ?? '',
      short_description: product.short_description ?? '',
      description: product.description ?? '',
      material: product.material || specs['Material'] || 'AISI 410 / 420 Surgical Stainless Steel',
      finish: product.finish || specs['Finish'] || 'Medical Satin Anti-Glare',
      instrument_size: product.instrument_size || specs['Size / Length'] || specs['Size'] || '',
      tip_type: product.tip_type || specs['Tip Configuration'] || specs['Tip'] || '',
      sterilization: product.sterilization || specs['Sterilization'] || 'Autoclave Compatible (134°C / 273°F)',
      certifications: product.certifications || specs['Certifications'] || 'ISO 9001:2015 · ISO 13485:2016 · CE Marked',
      reusability: product.reusability || specs['Reusability'] || 'Reusable & Chemically Passivated',
      features_text: featuresList.length > 0 ? featuresList.join('\n') : '',
      main_image_url: product.main_image_url ?? '',
      additional_image_urls: galleryUrls,
      is_published: product.is_published,
      is_featured: product.is_featured
    })
    setFormTab('basic')
  }

  async function uploadImage(file: File, type: 'products' | 'categories' | 'gallery' | 'slides') {
    if (!file.type.startsWith('image/')) {
      setMessage('Please select an image file.')
      return
    }
    if (file.size > 8 * 1024 * 1024) {
      setMessage('Image must be smaller than 8 MB.')
      return
    }
    const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const folder = type === 'slides' ? 'slides' : 'products'
    const path = `${folder}/${crypto.randomUUID()}.${extension}`
    const { error } = await supabase.storage.from('image').upload(path, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type
    })

    if (error) {
      console.error('Supabase image upload failed', error)
      setMessage(`Upload failed: ${error.message}`)
      return
    }

    const { data } = supabase.storage.from('image').getPublicUrl(path)
    const publicUrl = data.publicUrl

    if (type === 'products' && productForm) {
      setProductForm({ ...productForm, main_image_url: publicUrl })
    } else if (type === 'gallery' && productForm) {
      setProductForm({
        ...productForm,
        additional_image_urls: [...productForm.additional_image_urls, publicUrl]
      })
    } else if (type === 'categories' && categoryForm) {
      setCategoryForm({ ...categoryForm, image_url: publicUrl })
    } else if (type === 'slides' && slideForm) {
      setSlideForm({ ...slideForm, image_url: publicUrl })
    }
    setMessage('Image uploaded successfully.')
  }

  async function signOut() {
    await supabase.auth.signOut()
    navigate('/admin/login')
  }

  // Save Product
  async function saveProduct(event: FormEvent) {
    event.preventDefault()
    if (!productForm) return
    setMessage('')
    setSaving(true)

    if (!productForm.category_id) {
      setMessage('Please select a category for this product.')
      setSaving(false)
      return
    }

    const featuresArr = productForm.features_text
      .split('\n')
      .map(f => f.trim())
      .filter(Boolean)

    const specsObj: Record<string, string> = {
      ...(productForm.material ? { 'Material': productForm.material } : {}),
      ...(productForm.finish ? { 'Finish': productForm.finish } : {}),
      ...(productForm.instrument_size ? { 'Size / Length': productForm.instrument_size } : {}),
      ...(productForm.tip_type ? { 'Tip Configuration': productForm.tip_type } : {}),
      ...(productForm.sterilization ? { 'Sterilization': productForm.sterilization } : {}),
      ...(productForm.certifications ? { 'Certifications': productForm.certifications } : {}),
      ...(productForm.reusability ? { 'Reusability': productForm.reusability } : {}),
    }

    const payload: Record<string, unknown> = {
      name: productForm.name,
      slug: productForm.slug || makeSlug(productForm.name),
      sku: productForm.sku,
      category_id: productForm.category_id || null,
      short_description: productForm.short_description || null,
      description: productForm.description || null,
      material: productForm.material || null,
      finish: productForm.finish || null,
      instrument_size: productForm.instrument_size || null,
      tip_type: productForm.tip_type || null,
      sterilization: productForm.sterilization || null,
      certifications: productForm.certifications || null,
      reusability: productForm.reusability || null,
      features: featuresArr,
      specifications: specsObj,
      main_image_url: productForm.main_image_url || null,
      is_published: productForm.is_published,
      is_featured: productForm.is_featured
    }

    let savedProductId = productForm.id
    let result = productForm.id
      ? await supabase.from('products').update(payload).eq('id', productForm.id).select('id')
      : await supabase.from('products').insert(payload).select('id')

    if (result.error && result.error.message.includes('column')) {
      const fallbackPayload = {
        name: productForm.name,
        slug: productForm.slug || makeSlug(productForm.name),
        sku: productForm.sku,
        category_id: productForm.category_id || null,
        short_description: productForm.short_description || null,
        description: productForm.description || null,
        features: featuresArr,
        specifications: specsObj,
        main_image_url: productForm.main_image_url || null,
        is_published: productForm.is_published,
        is_featured: productForm.is_featured
      }
      result = productForm.id
        ? await supabase.from('products').update(fallbackPayload).eq('id', productForm.id).select('id')
        : await supabase.from('products').insert(fallbackPayload).select('id')
    }

    if (result.error) {
      setMessage(`Error saving product: ${result.error.message}`)
      setSaving(false)
      return
    }

    if (result.data && result.data[0]) {
      savedProductId = result.data[0].id
    }

    if (savedProductId) {
      try {
        await supabase.from('product_images').delete().eq('product_id', savedProductId)
        if (productForm.additional_image_urls.length > 0) {
          const galleryRows = productForm.additional_image_urls.map((url, idx) => ({
            product_id: savedProductId,
            image_url: url,
            sort_order: idx
          }))
          await supabase.from('product_images').insert(galleryRows)
        }
      } catch (err) {
        console.warn('Gallery save notice:', err)
      }
    }

    setSaving(false)
    setProductForm(null)
    setMessage('Instrument details and specifications saved successfully!')
    await loadData()
  }

  async function deleteProduct(product: Product) {
    if (!window.confirm(`Are you sure you want to delete "${product.name}"?`)) return
    const { error } = await supabase.from('products').delete().eq('id', product.id)
    setMessage(error?.message ?? 'Product deleted.')
    if (!error) await loadData()
  }

  // Save Category
  async function saveCategory(event: FormEvent) {
    event.preventDefault()
    if (!categoryForm) return
    setMessage('')
    setSaving(true)

    const payloadWithSort = {
      name: categoryForm.name,
      slug: categoryForm.slug || makeSlug(categoryForm.name),
      description: categoryForm.description,
      image_url: categoryForm.image_url || null,
      sort_order: Number(categoryForm.sort_order) || 0
    }

    let result = categoryForm.id
      ? await supabase.from('categories').update(payloadWithSort).eq('id', categoryForm.id).select('id')
      : await supabase.from('categories').insert(payloadWithSort).select('id')

    if (result.error && (result.error.message.includes('sort_order') || result.error.code === '42703')) {
      // If sort_order column does not exist yet, fallback saving without sort_order
      const payloadWithoutSort = {
        name: categoryForm.name,
        slug: categoryForm.slug || makeSlug(categoryForm.name),
        description: categoryForm.description,
        image_url: categoryForm.image_url || null
      }
      result = categoryForm.id
        ? await supabase.from('categories').update(payloadWithoutSort).eq('id', categoryForm.id).select('id')
        : await supabase.from('categories').insert(payloadWithoutSort).select('id')

      setSaving(false)
      if (result.error) {
        setMessage(`Error saving category: ${result.error.message}`)
        return
      }
      setCategoryForm(null)
      setMessage('Category saved! (Tip: Run the SQL command in Supabase to enable custom sort order).')
      await loadData()
      return
    }

    setSaving(false)
    if (result.error) {
      setMessage(`Error saving category: ${result.error.message}`)
      return
    }

    setCategoryForm(null)
    setMessage('Category saved successfully with sort order!')
    await loadData()
  }

  async function deleteCategory(category: Category) {
    if (!window.confirm(`Delete category "${category.name}"? Products attached to it may be affected.`)) return
    const { error } = await supabase.from('categories').delete().eq('id', category.id)
    setMessage(error?.message ?? 'Category deleted.')
    if (!error) await loadData()
  }

  // Save Hero Slide
  async function saveSlide(event: FormEvent) {
    event.preventDefault()
    if (!slideForm) return
    setMessage('')
    setSaving(true)

    const payload = {
      eyebrow: slideForm.eyebrow || 'ArShab Surgical • Sialkot, Pakistan',
      title: slideForm.title,
      accent: slideForm.accent,
      description: slideForm.description,
      image_url: slideForm.image_url || 'https://images.unsplash.com/photo-1584982751601-97dcc096659c?auto=format&fit=crop&w=1920&q=85',
      cta_label: slideForm.cta_label || 'Explore Catalogue',
      cta_url: slideForm.cta_url || '/products',
      caption: slideForm.caption || 'Request Inquiry',
      sort_order: Number(slideForm.sort_order) || 0,
      is_active: slideForm.is_active
    }

    const result = slideForm.id
      ? await supabase.from('hero_slides').update(payload).eq('id', slideForm.id).select('id')
      : await supabase.from('hero_slides').insert(payload).select('id')

    setSaving(false)
    if (result.error) {
      setMessage(`Error saving hero slide: ${result.error.message}`)
      return
    }

    setSlideForm(null)
    setMessage('Hero slide saved successfully! Live on homepage.')
    await loadData()
  }

  async function toggleSlideActive(slide: Slide) {
    const nextStatus = !slide.is_active
    const { error } = await supabase.from('hero_slides').update({ is_active: nextStatus }).eq('id', slide.id)
    if (error) setMessage(error.message)
    else {
      setMessage(`Slide is now ${nextStatus ? 'ACTIVE on Homepage' : 'INACTIVE (Hidden)'}`)
      await loadData()
    }
  }

  async function deleteSlide(slide: Slide) {
    if (!window.confirm(`Delete hero slide "${slide.title}"?`)) return
    const { error } = await supabase.from('hero_slides').delete().eq('id', slide.id)
    setMessage(error?.message ?? 'Hero slide deleted.')
    if (!error) await loadData()
  }

  // Inquiries
  async function deleteInquiry(id: string) {
    if (!window.confirm('Delete this inquiry?')) return
    const { error } = await supabase.from('inquiries').delete().eq('id', id)
    if (error) setMessage(error.message)
    else {
      setMessage('Inquiry deleted.')
      await loadData()
    }
  }

  async function toggleInquiryStatus(inquiry: Inquiry) {
    const nextStatus = inquiry.status === 'read' ? 'unread' : 'read'
    const { error } = await supabase.from('inquiries').update({ status: nextStatus }).eq('id', inquiry.id)
    if (error) setMessage(error.message)
    else await loadData()
  }

  const visibleProducts = products.filter(product =>
    `${product.name} ${product.sku} ${product.material ?? ''}`.toLowerCase().includes(search.toLowerCase())
  )

  const categoryName = (product: Product) =>
    categories.find(c => c.id === product.category_id)?.name ?? 'Uncategorized'

  if (!authorized) {
    return <main className="admin-loading">Checking administrator credentials...</main>
  }

  return (
    <main className="admin-shell">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <Link to="/" className="admin-brand" title="View Website">
          <img src="/logo.png" alt="ArShab Surgical" />
        </Link>

        <p className="admin-label">Catalog Management</p>
        <button
          className={tab === 'products' ? 'admin-nav active' : 'admin-nav'}
          onClick={() => setTab('products')}
        >
          <PackagePlus size={18} />
          <span>{products.length}</span>
          Instruments
        </button>
        <button
          className={tab === 'categories' ? 'admin-nav active' : 'admin-nav'}
          onClick={() => setTab('categories')}
        >
          <FolderPlus size={18} />
          <span>{categories.length}</span>
          Disciplines
        </button>
        <button
          className={tab === 'slides' ? 'admin-nav active' : 'admin-nav'}
          onClick={() => setTab('slides')}
        >
          <Sliders size={18} />
          <span>{slides.filter(s => s.is_active).length}/{slides.length}</span>
          Hero Slides
        </button>

        <p className="admin-label" style={{ marginTop: '20px' }}>
          Customer Relations
        </p>
        <button
          className={tab === 'inquiries' ? 'admin-nav active' : 'admin-nav'}
          onClick={() => setTab('inquiries')}
        >
          <Mail size={18} />
          <span>{inquiries.filter(i => i.status !== 'read').length}</span>
          Inquiries &amp; Quotes
        </button>

        <div className="admin-sidebar-bottom">
          <a href="/" target="_blank" rel="noreferrer">
            <ExternalLink size={16} /> View Live Website
          </a>
          <button onClick={() => void signOut()}>
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Panel */}
      <section className="admin-main">
        <header className="admin-topbar">
          <div>
            <p className="eyebrow">ARSHAB SURGICAL ADMINISTRATION</p>
            <h1>
              {tab === 'products' && 'Surgical Instrument Catalog'}
              {tab === 'categories' && 'Medical Disciplines & Categories'}
              {tab === 'slides' && 'Homepage Hero Slides & Banners'}
              {tab === 'inquiries' && 'Client Inquiries & Quotation Requests'}
            </h1>
          </div>

          <div className="admin-actions">
            {tab === 'products' && (
              <button
                className="button-add"
                onClick={() => {
                  setProductForm({ ...blankProduct })
                  setFormTab('basic')
                }}
              >
                <Plus size={18} /> Add New Instrument
              </button>
            )}
            {tab === 'categories' && (
              <button className="button-add" onClick={() => setCategoryForm({ ...blankCategory })}>
                <Plus size={18} /> Add New Category
              </button>
            )}
            {tab === 'slides' && (
              <button
                className="button-add"
                onClick={() => setSlideForm({ ...blankSlide, sort_order: slides.length })}
              >
                <Plus size={18} /> Add New Hero Slide
              </button>
            )}
          </div>
        </header>

        {message && (
          <div className="admin-alert">
            <span>{message}</span>
            <button onClick={() => setMessage('')}>
              <X size={16} />
            </button>
          </div>
        )}

        {/* 1. Products Tab */}
        {tab === 'products' && (
          <>
            <div className="admin-search-row">
              <div className="search-wrap">
                <Search size={17} />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search by instrument name, article number (SKU), or steel grade..."
                />
              </div>
              <span className="count-label">
                Showing {visibleProducts.length} of {products.length} instruments
              </span>
            </div>

            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Photo</th>
                    <th>Instrument Details</th>
                    <th>Article #</th>
                    <th>Category</th>
                    <th>Material / Finish</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                        Loading instruments from Supabase...
                      </td>
                    </tr>
                  ) : visibleProducts.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                        No instruments found matching search. Click "Add New Instrument" above to create one!
                      </td>
                    </tr>
                  ) : (
                    visibleProducts.map(product => {
                      const mat = product.material || product.specifications?.['Material'] || 'Stainless Steel'
                      return (
                        <tr key={product.id}>
                          <td>
                            <img
                              src={product.main_image_url || '/logo.png'}
                              alt={product.name}
                              className="admin-product-thumb"
                            />
                          </td>
                          <td>
                            <strong>{product.name}</strong>
                            <small>{product.short_description || 'Standard precision surgical instrument'}</small>
                          </td>
                          <td>
                            <code style={{ background: '#eef5fb', padding: '3px 6px', borderRadius: '3px', fontWeight: 700, color: 'var(--admin-navy)' }}>
                              {product.sku}
                            </code>
                          </td>
                          <td>{categoryName(product)}</td>
                          <td>
                            <span style={{ fontSize: '12px', color: '#475569' }}>{mat}</span>
                          </td>
                          <td>
                            <span className={product.is_published ? 'status published' : 'status'}>
                              {product.is_published ? 'Published' : 'Draft'}
                            </span>
                            {product.is_featured && <span className="status featured">Featured</span>}
                          </td>
                          <td className="row-actions" style={{ textAlign: 'right' }}>
                            <button
                              title="Edit instrument"
                              onClick={() => void openEditProduct(product)}
                            >
                              <Edit3 size={17} />
                            </button>
                            <button
                              title="Delete instrument"
                              className="btn-delete"
                              onClick={() => void deleteProduct(product)}
                            >
                              <Trash2 size={17} />
                            </button>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* 2. Categories Tab */}
        {tab === 'categories' && (
          <div className="admin-category-grid">
              {loading ? (
                <p>Loading categories from Supabase...</p>
              ) : categories.length === 0 ? (
                <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px', color: '#666' }}>
                  No categories created yet. Click "Add New Category" above to create one.
                </div>
              ) : (
                categories.map(category => (
                  <article className="admin-category-card" key={category.id}>
                    <div>
                      {category.image_url ? (
                        <img src={category.image_url} alt={category.name} className="admin-category-img" />
                      ) : (
                        <div className="admin-category-img" style={{ display: 'grid', placeItems: 'center', color: '#888' }}>
                          <ImageIcon size={30} />
                        </div>
                      )}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span className="status" style={{ fontSize: '10px' }}>
                          Slug: /{category.slug}
                        </span>
                        <span
                          style={{
                            background: '#0a3c61',
                            color: '#ffffff',
                            fontSize: '11px',
                            fontWeight: 700,
                            padding: '3px 10px',
                            borderRadius: '12px'
                          }}
                        >
                          Order: #{category.sort_order ?? 0}
                        </span>
                      </div>
                      <h2>{category.name}</h2>
                      <p>{category.description || 'No description provided.'}</p>
                    </div>
                    <div className="row-actions" style={{ marginTop: '16px', borderTop: '1px solid #f0f0f0', paddingTop: '10px' }}>
                      <button
                        title="Edit Category"
                        onClick={() =>
                          setCategoryForm({
                            id: category.id,
                            name: category.name,
                            slug: category.slug,
                            description: category.description ?? '',
                            image_url: category.image_url ?? '',
                            sort_order: category.sort_order ?? 0
                          })
                        }
                      >
                        <Edit3 size={16} /> Edit
                      </button>
                      <button
                        title="Delete Category"
                        className="btn-delete"
                        onClick={() => void deleteCategory(category)}
                      >
                        <Trash2 size={16} /> Delete
                      </button>
                    </div>
                  </article>
                ))
              )}
            </div>
        )}

        {/* 3. Hero Slides Tab */}
        {tab === 'slides' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h3 style={{ fontSize: '18px', color: 'var(--admin-navy)', margin: 0, fontWeight: 700 }}>
                  Manage Homepage Slides ({slides.length})
                </h3>
                <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0' }}>
                  Slides that are marked <strong>Active</strong> will rotate dynamically on the website homepage.
                </p>
              </div>
            </div>

            {loading ? (
              <p>Loading hero slides from Supabase...</p>
            ) : slides.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', background: '#fff', border: '1px solid var(--admin-border)', borderRadius: '6px' }}>
                <Sliders size={48} color="#108185" style={{ marginBottom: '16px' }} />
                <h3 style={{ color: 'var(--admin-navy)', margin: '0 0 8px' }}>No dynamic hero slides yet</h3>
                <p style={{ color: '#666', maxWidth: '480px', margin: '0 auto 20px' }}>
                  The homepage currently uses default ArShab Surgical slides. Click "+ Add New Hero Slide" to add your custom banner photos and headings!
                </p>
                <button
                  className="button-add"
                  onClick={() => setSlideForm({ ...blankSlide })}
                >
                  <Plus size={16} /> Add First Hero Slide
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '20px' }}>
                {slides.map(slide => (
                  <article
                    key={slide.id}
                    style={{
                      background: '#ffffff',
                      border: '1px solid var(--admin-border)',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      opacity: slide.is_active ? 1 : 0.65
                    }}
                  >
                    <div>
                      {/* Slide Image Banner Preview */}
                      <div style={{ position: 'relative', height: '170px', background: '#0a3c61', overflow: 'hidden' }}>
                        <img
                          src={slide.image_url}
                          alt={slide.title}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={e => {
                            ;(e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1584982751601-97dcc096659c?auto=format&fit=crop&w=1920&q=85'
                          }}
                        />
                        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(10,60,97,0.85) 0%, rgba(10,60,97,0.2) 100%)' }} />
                        <div style={{ position: 'absolute', bottom: '12px', left: '14px', right: '14px', color: '#fff' }}>
                          <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--admin-teal)', fontWeight: 700 }}>
                            {slide.eyebrow}
                          </span>
                          <h3 style={{ fontSize: '17px', margin: '2px 0 0', fontWeight: 700, color: '#fff', lineHeight: 1.2 }}>
                            {slide.title} <span style={{ color: 'var(--admin-teal)' }}>{slide.accent}</span>
                          </h3>
                        </div>

                        <div style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', gap: '6px' }}>
                          <span style={{ background: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: '11px', padding: '3px 8px', borderRadius: '12px', fontWeight: 600 }}>
                            Order: #{slide.sort_order}
                          </span>
                          <span
                            style={{
                              background: slide.is_active ? '#059669' : '#64748b',
                              color: '#fff',
                              fontSize: '11px',
                              padding: '3px 8px',
                              borderRadius: '12px',
                              fontWeight: 700
                            }}
                          >
                            {slide.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>

                      {/* Slide Body */}
                      <div style={{ padding: '16px' }}>
                        <p style={{ fontSize: '13px', color: '#475569', lineHeight: '1.6', margin: '0 0 12px' }}>
                          {slide.description}
                        </p>
                        <div style={{ display: 'flex', gap: '8px', fontSize: '12px', color: 'var(--admin-navy)', fontWeight: 600 }}>
                          <span>Primary Button: <strong>{slide.cta_label}</strong> ({slide.cta_url})</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div
                      style={{
                        padding: '12px 16px',
                        background: '#f8fafc',
                        borderTop: '1px solid #e2e8f0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '8px'
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => void toggleSlideActive(slide)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          background: slide.is_active ? '#e1f5ee' : '#f1f5f9',
                          color: slide.is_active ? '#0b6b53' : '#475569',
                          border: '1px solid #cbd5e1',
                          padding: '6px 12px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        {slide.is_active ? <Eye size={14} /> : <EyeOff size={14} />}
                        {slide.is_active ? 'Active on Home' : 'Inactive (Hidden)'}
                      </button>

                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          type="button"
                          onClick={() => setSlideForm({ ...slide })}
                          style={{
                            border: '1px solid #cbd5e1',
                            background: '#fff',
                            color: 'var(--admin-navy)',
                            padding: '6px 10px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '12px',
                            fontWeight: 600
                          }}
                        >
                          <Edit3 size={14} /> Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => void deleteSlide(slide)}
                          style={{
                            border: '1px solid #fecdd3',
                            background: '#fff1f2',
                            color: '#e11d48',
                            padding: '6px 10px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '12px',
                            fontWeight: 600
                          }}
                        >
                          <Trash2 size={14} /> Delete
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 4. Inquiries Tab */}
        {tab === 'inquiries' && (
          <div>
            {loading ? (
              <p>Loading inquiries from database...</p>
            ) : inquiries.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: '#666', background: '#fff', border: '1px solid var(--admin-border)', borderRadius: '4px' }}>
                <Mail size={42} color="#0a3c61" style={{ marginBottom: '12px' }} />
                <h3>No inquiries received yet</h3>
                <p>When clients send quote requests through the website or basket, they will appear here.</p>
              </div>
            ) : (
              inquiries.map(item => (
                <div key={item.id} className="inquiry-card">
                  <div className="inquiry-header">
                    <div>
                      <span className={item.status === 'read' ? 'status published' : 'status unread'}>
                        {item.status === 'read' ? 'Read' : 'New / Unread'}
                      </span>
                      <h3 style={{ display: 'inline-block', marginLeft: '8px' }}>
                        {item.subject || 'Product Inquiry'}
                      </h3>
                    </div>
                    <span style={{ fontSize: '12px', color: 'var(--admin-muted)' }}>
                      {new Date(item.created_at).toLocaleString()}
                    </span>
                  </div>

                  <div className="inquiry-meta">
                    <span>
                      <strong>From:</strong> {item.name}
                    </span>
                    <span>
                      <strong>Email:</strong>{' '}
                      <a href={`mailto:${item.email}`} style={{ color: 'var(--admin-teal)' }}>
                        {item.email}
                      </a>
                    </span>
                    {item.phone && (
                      <span>
                        <strong>Phone:</strong> {item.phone}
                      </span>
                    )}
                    {item.company && (
                      <span>
                        <strong>Company:</strong> {item.company}
                      </span>
                    )}
                  </div>

                  <div className="inquiry-body">{item.message}</div>

                  <div className="inquiry-actions">
                    <button
                      className="admin-nav active"
                      style={{ width: 'auto', padding: '6px 14px', fontSize: '12px' }}
                      onClick={() => toggleInquiryStatus(item)}
                    >
                      <CheckCircle2 size={14} /> {item.status === 'read' ? 'Mark as Unread' : 'Mark as Read'}
                    </button>
                    <a
                      href={`mailto:${item.email}?subject=${encodeURIComponent(`Re: ${item.subject || 'ArShab Surgical Inquiry'}`)}`}
                      className="admin-nav"
                      style={{ width: 'auto', padding: '6px 14px', fontSize: '12px', background: '#eef5fb', color: 'var(--admin-navy)' }}
                    >
                      <Mail size={14} /> Reply via Email
                    </a>
                    <button
                      className="btn-delete"
                      style={{ marginLeft: 'auto', border: 0, background: 'none', cursor: 'pointer', color: '#c0202f', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}
                      onClick={() => deleteInquiry(item.id)}
                    >
                      <Trash2 size={14} /> Delete Inquiry
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </section>

      {/* Advanced Product Add/Edit Modal */}
      {productForm && (
        <div className="admin-modal-backdrop" onClick={() => setProductForm(null)}>
          <form className="admin-modal admin-modal-wide" onClick={e => e.stopPropagation()} onSubmit={saveProduct}>
            <button type="button" className="admin-modal-close" onClick={() => setProductForm(null)}>
              <X size={22} />
            </button>

            <div className="admin-modal-header">
              <p className="eyebrow">INSTRUMENT CATALOG MANAGEMENT</p>
              <h2>{productForm.id ? 'Edit Instrument & Specifications' : 'Add New Surgical Instrument'}</h2>
            </div>

            {/* Modal Form Sub-Tabs */}
            <div className="admin-form-tabs">
              <button
                type="button"
                className={`admin-form-tab ${formTab === 'basic' ? 'active' : ''}`}
                onClick={() => setFormTab('basic')}
              >
                <Layers size={15} /> Basic Details
              </button>
              <button
                type="button"
                className={`admin-form-tab ${formTab === 'specs' ? 'active' : ''}`}
                onClick={() => setFormTab('specs')}
              >
                <ShieldCheck size={15} /> Metallurgy &amp; Specs
              </button>
              <button
                type="button"
                className={`admin-form-tab ${formTab === 'features' ? 'active' : ''}`}
                onClick={() => setFormTab('features')}
              >
                <Sparkles size={15} /> Clinical Features &amp; Notes
              </button>
              <button
                type="button"
                className={`admin-form-tab ${formTab === 'gallery' ? 'active' : ''}`}
                onClick={() => setFormTab('gallery')}
              >
                <ImageIcon size={15} /> Photos &amp; Slider ({1 + productForm.additional_image_urls.length})
              </button>
            </div>

            {/* TAB 1: BASIC DETAILS */}
            {formTab === 'basic' && (
              <div className="admin-form-section">
                <label>
                  Instrument Name *
                  <input
                    value={productForm.name}
                    onChange={e =>
                      setProductForm({
                        ...productForm,
                        name: e.target.value,
                        slug: productForm.id ? productForm.slug : makeSlug(e.target.value)
                      })
                    }
                    placeholder="e.g. Mayo Hegar Needle Holder with Tungsten Carbide Jaws"
                    required
                  />
                </label>

                <div className="admin-two-col">
                  <label>
                    Article / SKU Code *
                    <input
                      value={productForm.sku}
                      onChange={e => setProductForm({ ...productForm, sku: e.target.value })}
                      placeholder="e.g. AS-01-107"
                      required
                    />
                  </label>
                  <label>
                    URL Slug *
                    <input
                      value={productForm.slug}
                      onChange={e => setProductForm({ ...productForm, slug: e.target.value })}
                      placeholder="mayo-hegar-needle-holder"
                      required
                    />
                  </label>
                </div>

                <label>
                  Discipline / Category *
                  <select
                    value={productForm.category_id}
                    onChange={e => setProductForm({ ...productForm, category_id: e.target.value })}
                    required
                  >
                    <option value="">-- Select Category --</option>
                    {categories.map(c => (
                      <option value={c.id} key={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Short Overview / Subtitle
                  <textarea
                    value={productForm.short_description}
                    onChange={e => setProductForm({ ...productForm, short_description: e.target.value })}
                    placeholder="Brief 1-2 sentence description shown in catalog cards and headers..."
                    rows={2}
                  />
                </label>

                <div className="admin-checks" style={{ marginTop: '8px' }}>
                  <label>
                    <input
                      type="checkbox"
                      checked={productForm.is_published}
                      onChange={e => setProductForm({ ...productForm, is_published: e.target.checked })}
                    />
                    Published (Visible in website catalog)
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={productForm.is_featured}
                      onChange={e => setProductForm({ ...productForm, is_featured: e.target.checked })}
                    />
                    Featured (Showcase on homepage)
                  </label>
                </div>
              </div>
            )}

            {/* TAB 2: METALLURGY & SPECIFICATIONS */}
            {formTab === 'specs' && (
              <div className="admin-form-section">
                <div className="admin-two-col">
                  <label>
                    Material / Steel Grade *
                    <input
                      value={productForm.material}
                      onChange={e => setProductForm({ ...productForm, material: e.target.value })}
                      placeholder="e.g. AISI 410 / 420 Surgical Stainless Steel"
                    />
                  </label>
                  <label>
                    Surface Finish *
                    <input
                      value={productForm.finish}
                      onChange={e => setProductForm({ ...productForm, finish: e.target.value })}
                      placeholder="e.g. Medical Satin Anti-Glare (Mirror on request)"
                    />
                  </label>
                </div>

                <div className="admin-two-col">
                  <label>
                    Working Size / Overall Length
                    <input
                      value={productForm.instrument_size}
                      onChange={e => setProductForm({ ...productForm, instrument_size: e.target.value })}
                      placeholder="e.g. 14 cm (5.5 in), 18 cm (7 in)"
                    />
                  </label>
                  <label>
                    Tip / Jaw Profile
                    <input
                      value={productForm.tip_type}
                      onChange={e => setProductForm({ ...productForm, tip_type: e.target.value })}
                      placeholder="e.g. Straight Delicate, Curved Serrated, TC Inserts"
                    />
                  </label>
                </div>

                <div className="admin-two-col">
                  <label>
                    Sterilization Protocol
                    <input
                      value={productForm.sterilization}
                      onChange={e => setProductForm({ ...productForm, sterilization: e.target.value })}
                      placeholder="e.g. Autoclave Compatible (134°C / 273°F)"
                    />
                  </label>
                  <label>
                    Quality Certifications
                    <input
                      value={productForm.certifications}
                      onChange={e => setProductForm({ ...productForm, certifications: e.target.value })}
                      placeholder="e.g. ISO 9001:2015 · ISO 13485:2016 · CE Marked"
                    />
                  </label>
                </div>

                <label>
                  Reusability &amp; Treatment
                  <input
                    value={productForm.reusability}
                    onChange={e => setProductForm({ ...productForm, reusability: e.target.value })}
                    placeholder="e.g. Reusable & Passivated for Long Life"
                  />
                </label>
              </div>
            )}

            {/* TAB 3: CLINICAL FEATURES & NOTES */}
            {formTab === 'features' && (
              <div className="admin-form-section">
                <label>
                  Key Clinical &amp; Material Features (One feature per line)
                  <textarea
                    value={productForm.features_text}
                    onChange={e => setProductForm({ ...productForm, features_text: e.target.value })}
                    placeholder={`Forged from certified German-grade AISI 410 / 420 stainless steel\nPrecision-machined jaw alignment\nSatin anti-glare finish reduces optical reflection\nAutoclave sterilization resistant\nIndividually inspected and passivated`}
                    rows={6}
                    style={{ fontFamily: 'monospace', fontSize: '13px', lineHeight: '1.6' }}
                  />
                  <span className="upload-help">Each line becomes a bullet point with a green checkmark on the product page.</span>
                </label>

                <label style={{ marginTop: '14px' }}>
                  Extended Clinical Description / Procedural Application
                  <textarea
                    value={productForm.description}
                    onChange={e => setProductForm({ ...productForm, description: e.target.value })}
                    placeholder="Detailed surgical application notes, anatomical target, clamping mechanism, handling ergonomics..."
                    rows={4}
                  />
                </label>
              </div>
            )}

            {/* TAB 4: PHOTOS & SLIDER GALLERY */}
            {formTab === 'gallery' && (
              <div className="admin-form-section">
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '16px', marginBottom: '16px' }}>
                  <h4 style={{ margin: '0 0 10px', fontSize: '14px', color: 'var(--admin-navy)' }}>
                    1. Main Showcase Image (Required)
                  </h4>
                  <div style={{ display: 'flex', gap: '14px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <label style={{ margin: 0, flex: '1 1 200px' }}>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>Upload Main Image</span>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        onChange={e => {
                          const file = e.target.files?.[0]
                          if (file) void uploadImage(file, 'products')
                        }}
                      />
                    </label>
                    <label style={{ margin: 0, flex: '2 1 260px' }}>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>Or Image URL</span>
                      <input
                        value={productForm.main_image_url}
                        onChange={e => setProductForm({ ...productForm, main_image_url: e.target.value })}
                        placeholder="https://..."
                      />
                    </label>
                  </div>
                  {productForm.main_image_url && (
                    <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <img
                        src={productForm.main_image_url}
                        alt="Main preview"
                        style={{ width: '60px', height: '60px', objectFit: 'contain', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                      />
                      <span style={{ fontSize: '12px', color: '#059669', fontWeight: 600 }}>✓ Main image set</span>
                    </div>
                  )}
                </div>

                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '16px' }}>
                  <h4 style={{ margin: '0 0 6px', fontSize: '14px', color: 'var(--admin-navy)' }}>
                    2. Additional Slider Gallery Images
                  </h4>
                  <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 12px' }}>
                    Add extra angles, close-up jaw views, or packaging photos. These will slide automatically in the product gallery slider!
                  </p>

                  <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap', marginBottom: '14px' }}>
                    <label style={{ margin: 0, flex: '1 1 200px' }}>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>Upload Gallery Photo</span>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        onChange={e => {
                          const file = e.target.files?.[0]
                          if (file) void uploadImage(file, 'gallery')
                        }}
                      />
                    </label>
                    <div style={{ display: 'flex', gap: '6px', flex: '2 1 260px' }}>
                      <input
                        value={newGalleryUrl}
                        onChange={e => setNewGalleryUrl(e.target.value)}
                        placeholder="Paste additional image URL..."
                        style={{ flex: 1 }}
                      />
                      <button
                        type="button"
                        className="btn-sq-primary"
                        style={{ padding: '8px 14px', fontSize: '12px', height: '38px' }}
                        onClick={() => {
                          if (newGalleryUrl.trim()) {
                            setProductForm({
                              ...productForm,
                              additional_image_urls: [...productForm.additional_image_urls, newGalleryUrl.trim()]
                            })
                            setNewGalleryUrl('')
                          }
                        }}
                      >
                        Add URL
                      </button>
                    </div>
                  </div>

                  {/* Gallery Thumbnails List */}
                  {productForm.additional_image_urls.length > 0 ? (
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '10px' }}>
                      {productForm.additional_image_urls.map((imgUrl, i) => (
                        <div
                          key={i}
                          style={{
                            position: 'relative',
                            width: '80px',
                            height: '80px',
                            border: '1px solid #cbd5e1',
                            borderRadius: '6px',
                            overflow: 'hidden',
                            background: '#fff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <img
                            src={imgUrl}
                            alt=""
                            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setProductForm({
                                ...productForm,
                                additional_image_urls: productForm.additional_image_urls.filter((_, idx) => idx !== i)
                              })
                            }
                            style={{
                              position: 'absolute',
                              top: '2px',
                              right: '2px',
                              background: 'rgba(192, 32, 47, 0.9)',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '50%',
                              width: '20px',
                              height: '20px',
                              display: 'grid',
                              placeItems: 'center',
                              cursor: 'pointer',
                              padding: 0
                            }}
                            title="Remove image from slider"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ fontSize: '12px', color: '#94a3b8', margin: '4px 0' }}>
                      No additional gallery images added yet.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Modal Footer with Save & Nav */}
            <div className="admin-modal-footer">
              <div style={{ display: 'flex', gap: '8px' }}>
                {formTab !== 'basic' && (
                  <button
                    type="button"
                    className="admin-btn-secondary"
                    onClick={() => {
                      if (formTab === 'specs') setFormTab('basic')
                      if (formTab === 'features') setFormTab('specs')
                      if (formTab === 'gallery') setFormTab('features')
                    }}
                  >
                    &laquo; Previous Section
                  </button>
                )}
                {formTab !== 'gallery' ? (
                  <button
                    type="button"
                    className="admin-btn-secondary"
                    onClick={() => {
                      if (formTab === 'basic') setFormTab('specs')
                      if (formTab === 'specs') setFormTab('features')
                      if (formTab === 'features') setFormTab('gallery')
                    }}
                  >
                    Next Section &raquo;
                  </button>
                ) : null}
              </div>

              <div style={{ display: 'flex', gap: '10px', marginLeft: 'auto' }}>
                <button
                  type="button"
                  onClick={() => setProductForm(null)}
                  className="admin-btn-secondary"
                >
                  Cancel
                </button>
                <button
                  className="button-add"
                  type="submit"
                  disabled={saving}
                  style={{ minWidth: '180px', justifyContent: 'center' }}
                >
                  {saving ? 'Saving to Supabase...' : 'Save Instrument &raquo;'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Category Add/Edit Modal */}
      {categoryForm && (
        <div className="admin-modal-backdrop" onClick={() => setCategoryForm(null)}>
          <form className="admin-modal" onClick={e => e.stopPropagation()} onSubmit={saveCategory}>
            <button type="button" className="admin-modal-close" onClick={() => setCategoryForm(null)}>
              <X size={22} />
            </button>
            <p className="eyebrow">CATEGORY MANAGEMENT</p>
            <h2>{categoryForm.id ? 'Edit Category' : 'Add New Category'}</h2>

            <div className="admin-two-col">
              <label>
                Category Name *
                <input
                  value={categoryForm.name}
                  onChange={e =>
                    setCategoryForm({
                      ...categoryForm,
                      name: e.target.value,
                      slug: categoryForm.id ? categoryForm.slug : makeSlug(e.target.value)
                    })
                  }
                  placeholder="e.g. Surgical Instruments"
                  required
                />
              </label>

              <label>
                Display Order / Sort Number *
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={categoryForm.sort_order ?? 0}
                  onChange={e =>
                    setCategoryForm({
                      ...categoryForm,
                      sort_order: parseInt(e.target.value, 10) || 0
                    })
                  }
                  placeholder="1 = First, 2 = Second, 3 = Third..."
                  required
                />
              </label>
            </div>

            <label>
              URL Slug *
              <input
                value={categoryForm.slug}
                onChange={e => setCategoryForm({ ...categoryForm, slug: e.target.value })}
                placeholder="surgical-instruments"
                required
              />
            </label>

            <label>
              Category Description
              <textarea
                value={categoryForm.description}
                onChange={e => setCategoryForm({ ...categoryForm, description: e.target.value })}
                placeholder="Brief summary of instruments included in this medical discipline..."
              />
            </label>

            <label>
              Upload Category Banner Image
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={e => {
                  const file = e.target.files?.[0]
                  if (file) void uploadImage(file, 'categories')
                }}
              />
              <span className="upload-help">JPG, PNG or WEBP (Max 5 MB)</span>
            </label>

            <label>
              Or Direct Image URL
              <input
                value={categoryForm.image_url}
                onChange={e => setCategoryForm({ ...categoryForm, image_url: e.target.value })}
                placeholder="https://..."
              />
              {categoryForm.image_url && (
                <div className="upload-preview">
                  <img src={categoryForm.image_url} alt="Preview" />
                  <span style={{ fontSize: '12px', color: 'var(--admin-teal)' }}>Image loaded &amp; ready</span>
                </div>
              )}
            </label>

            <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
              <button
                className="button-add"
                type="submit"
                disabled={saving}
                style={{ flexGrow: 1, justifyContent: 'center', padding: '13px' }}
              >
                {saving ? 'Saving...' : 'Save Category to Supabase \u00BB'}
              </button>
              <button
                type="button"
                onClick={() => setCategoryForm(null)}
                style={{
                  padding: '13px 20px',
                  background: '#f0f0f0',
                  color: '#333',
                  borderRadius: '3px',
                  fontWeight: 600
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Hero Slide Add/Edit Modal */}
      {slideForm && (
        <div className="admin-modal-backdrop" onClick={() => setSlideForm(null)}>
          <form className="admin-modal admin-modal-wide" onClick={e => e.stopPropagation()} onSubmit={saveSlide}>
            <button type="button" className="admin-modal-close" onClick={() => setSlideForm(null)}>
              <X size={22} />
            </button>
            <div className="admin-modal-header">
              <p className="eyebrow">HOMEPAGE BANNER MANAGEMENT</p>
              <h2>{slideForm.id ? 'Edit Hero Slide' : 'Add New Hero Slide'}</h2>
            </div>

            <label>
              Eyebrow / Small Header Tag
              <input
                value={slideForm.eyebrow}
                onChange={e => setSlideForm({ ...slideForm, eyebrow: e.target.value })}
                placeholder="e.g. ArShab Surgical • Sialkot, Pakistan"
              />
            </label>

            <div className="admin-two-col">
              <label>
                Main Slide Heading *
                <input
                  value={slideForm.title}
                  onChange={e => setSlideForm({ ...slideForm, title: e.target.value })}
                  placeholder="e.g. Precision in Every Cut."
                  required
                />
              </label>
              <label>
                Highlight / Accent Heading *
                <input
                  value={slideForm.accent}
                  onChange={e => setSlideForm({ ...slideForm, accent: e.target.value })}
                  placeholder="e.g. Excellence in Healthcare."
                  required
                />
              </label>
            </div>

            <label>
              Slide Description *
              <textarea
                value={slideForm.description}
                onChange={e => setSlideForm({ ...slideForm, description: e.target.value })}
                placeholder="Describe instruments, German steel quality, or OEM export capacity..."
                rows={3}
                required
              />
            </label>

            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '16px' }}>
              <h4 style={{ margin: '0 0 10px', fontSize: '14px', color: 'var(--admin-navy)' }}>
                Slide Banner Photo (1920x800 recommended)
              </h4>
              <div style={{ display: 'flex', gap: '14px', alignItems: 'center', flexWrap: 'wrap' }}>
                <label style={{ margin: 0, flex: '1 1 200px' }}>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>Upload Photo</span>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={e => {
                      const file = e.target.files?.[0]
                      if (file) void uploadImage(file, 'slides')
                    }}
                  />
                </label>
                <label style={{ margin: 0, flex: '2 1 260px' }}>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>Or Photo URL</span>
                  <input
                    value={slideForm.image_url}
                    onChange={e => setSlideForm({ ...slideForm, image_url: e.target.value })}
                    placeholder="https://..."
                    required
                  />
                </label>
              </div>

              {slideForm.image_url && (
                <div style={{ marginTop: '12px', height: '120px', borderRadius: '6px', overflow: 'hidden', border: '1px solid #cbd5e1' }}>
                  <img
                    src={slideForm.image_url}
                    alt="Preview"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
              )}
            </div>

            <div className="admin-two-col">
              <label>
                Primary Button Label
                <input
                  value={slideForm.cta_label}
                  onChange={e => setSlideForm({ ...slideForm, cta_label: e.target.value })}
                  placeholder="e.g. Explore Catalogue"
                />
              </label>
              <label>
                Primary Button Link
                <input
                  value={slideForm.cta_url}
                  onChange={e => setSlideForm({ ...slideForm, cta_url: e.target.value })}
                  placeholder="/products"
                />
              </label>
            </div>

            <div className="admin-two-col">
              <label>
                Secondary Button Label / Caption
                <input
                  value={slideForm.caption}
                  onChange={e => setSlideForm({ ...slideForm, caption: e.target.value })}
                  placeholder="e.g. Contact Our Team"
                />
              </label>
              <label>
                Display Order (0 = First, 1 = Second)
                <input
                  type="number"
                  value={slideForm.sort_order}
                  onChange={e => setSlideForm({ ...slideForm, sort_order: Number(e.target.value) })}
                />
              </label>
            </div>

            <div className="admin-checks">
              <label>
                <input
                  type="checkbox"
                  checked={slideForm.is_active}
                  onChange={e => setSlideForm({ ...slideForm, is_active: e.target.checked })}
                />
                Active (Display on live website homepage slider)
              </label>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '14px', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
              <button
                className="button-add"
                type="submit"
                disabled={saving}
                style={{ flexGrow: 1, justifyContent: 'center', padding: '13px' }}
              >
                {saving ? 'Saving Slide...' : 'Save Hero Slide to Homepage \u00BB'}
              </button>
              <button
                type="button"
                onClick={() => setSlideForm(null)}
                style={{
                  padding: '13px 20px',
                  background: '#f0f0f0',
                  color: '#333',
                  borderRadius: '3px',
                  fontWeight: 600
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </main>
  )
}
