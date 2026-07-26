import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import type { Order, Product, ProductBadge } from '../../types'
import { isSupabaseConfigured, supabase } from '../../lib/supabase'
import { SEED_CATEGORIES } from '../../data/seed'
import { useCatalogStore } from '../../store/catalogStore'
import { formatLkr } from '../Cart/WhatsAppOrder'

type Tab = 'products' | 'offers' | 'orders' | 'revenue'

const EMPTY_FORM = {
  name: '',
  category_id: SEED_CATEGORIES[0].id,
  price: 0,
  original_price: 0,
  emoji: '🛍️',
  description: '',
  colors: '#e91e8c,#7c3aed',
  sizes: 'One Size',
  stock_qty: 10,
  is_active: true,
  is_featured: false,
  is_flash_sale: false,
  badge: '' as string,
  imageFile: null as File | null,
}

function toDatetimeLocal(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export default function Dashboard() {
  const products = useCatalogStore((s) => s.products)
  const offers = useCatalogStore((s) => s.offers)
  const initCatalog = useCatalogStore((s) => s.initCatalog)
  const addProduct = useCatalogStore((s) => s.addProduct)
  const updateProduct = useCatalogStore((s) => s.updateProduct)
  const deleteProductStore = useCatalogStore((s) => s.deleteProduct)
  const toggleProductField = useCatalogStore((s) => s.toggleProductField)
  const updateOffers = useCatalogStore((s) => s.updateOffers)
  const resetOffers = useCatalogStore((s) => s.resetOffers)

  const [tab, setTab] = useState<Tab>('products')
  const [orders, setOrders] = useState<Order[]>([])
  const [form, setForm] = useState(EMPTY_FORM)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [offerDraft, setOfferDraft] = useState(offers)

  useEffect(() => {
    void initCatalog()
  }, [initCatalog])

  useEffect(() => {
    setOfferDraft(offers)
  }, [offers])

  const loadOrders = async () => {
    if (!isSupabaseConfigured || !supabase) {
      setOrders([])
      return
    }
    const { data } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
    setOrders((data as Order[]) ?? [])
  }

  useEffect(() => {
    void loadOrders()
  }, [])

  const revenue = useMemo(() => {
    const total = orders.reduce((s, o) => s + o.grand_total, 0)
    const pending = orders.filter((o) => o.status === 'pending').length
    const delivered = orders.filter((o) => o.status === 'delivered').length
    return { total, pending, delivered, count: orders.length }
  }, [orders])

  const resetForm = () => {
    setForm(EMPTY_FORM)
    setEditingId(null)
  }

  const startEdit = (p: Product) => {
    setEditingId(p.id)
    setForm({
      name: p.name,
      category_id: p.category_id,
      price: p.price,
      original_price: p.original_price,
      emoji: p.emoji,
      description: p.description,
      colors: p.colors.join(','),
      sizes: (p.sizes ?? ['One Size']).join(', '),
      stock_qty: p.stock_qty,
      is_active: p.is_active,
      is_featured: p.is_featured,
      is_flash_sale: p.is_flash_sale,
      badge: p.badge ?? '',
      imageFile: null,
    })
    setTab('products')
    setMessage(null)
  }

  const uploadImage = async (file: File): Promise<string | null> => {
    if (!supabase) return null
    const ext = file.name.split('.').pop() ?? 'jpg'
    const path = `products/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const { error } = await supabase.storage.from('product-images').upload(path, file)
    if (error) {
      setMessage(`Image upload failed: ${error.message}`)
      return null
    }
    const { data } = supabase.storage.from('product-images').getPublicUrl(path)
    return data.publicUrl
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    const colors = form.colors
      .split(',')
      .map((c) => c.trim())
      .filter(Boolean)
    const sizes = form.sizes
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)

    let images: string[] | undefined
    if (form.imageFile) {
      const url = await uploadImage(form.imageFile)
      if (url) images = [url]
    }

    const payload = {
      name: form.name.trim(),
      category_id: form.category_id,
      price: Number(form.price),
      original_price: Number(form.original_price),
      emoji: form.emoji,
      description: form.description,
      colors,
      sizes,
      stock_qty: Number(form.stock_qty),
      is_active: form.is_active,
      is_featured: form.is_featured,
      is_flash_sale: form.is_flash_sale,
      badge: (form.badge || null) as ProductBadge,
      ...(images ? { images } : {}),
    }

    try {
      if (editingId) {
        await updateProduct(editingId, payload)
        setMessage('Saved — customer shop updated instantly')
      } else {
        await addProduct({ ...payload, images: images ?? [] })
        setMessage('Product added — now live on the shop')
      }
      resetForm()
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product from the shop?')) return
    try {
      await deleteProductStore(id)
      if (editingId === id) resetForm()
      setMessage('Product removed from customer shop')
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Delete failed')
    }
  }

  const saveOffers = (e: FormEvent) => {
    e.preventDefault()
    updateOffers({
      ...offerDraft,
      deliveryFee: Math.max(0, Number(offerDraft.deliveryFee) || 0),
      flashSaleEndsAt: new Date(offerDraft.flashSaleEndsAt).toISOString(),
    })
    setMessage('Offers updated — live on customer pages now')
    setTab('offers')
  }

  const extendFlashHours = (hours: number) => {
    const next = new Date(Date.now() + hours * 60 * 60 * 1000).toISOString()
    setOfferDraft((d) => ({ ...d, flashSaleEndsAt: next, flashSaleEnabled: true }))
    updateOffers({ flashSaleEndsAt: next, flashSaleEnabled: true })
    setMessage(`Flash sale extended by ${hours}h — timer updated on shop`)
  }

  const updateOrderStatus = async (id: string, status: Order['status']) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)))
    if (supabase && isSupabaseConfigured) {
      await supabase.from('orders').update({ status }).eq('id', id)
    }
  }

  const flashCount = products.filter((p) => p.is_flash_sale).length

  return (
    <div className="space-y-6">
      <div className="rounded-card bg-dark px-4 py-3 text-sm text-white/85">
        Changes here control the live customer shop: prices, names, flash sale, badges, stock &
        offers update immediately on Home / Product pages.
      </div>

      {!isSupabaseConfigured && (
        <div className="rounded-card border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Saving in this browser (local catalog). Add Supabase env vars to sync across devices.
        </div>
      )}

      {message && (
        <div className="rounded-card bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {message}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {(
          [
            ['products', 'Products'],
            ['offers', 'Offers & Flash'],
            ['orders', 'Orders'],
            ['revenue', 'Revenue'],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${
              tab === key ? 'bg-dark text-white' : 'bg-white text-gray-700 ring-1 ring-border'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'offers' && (
        <form
          onSubmit={saveOffers}
          className="space-y-5 rounded-card bg-white p-5 ring-1 ring-border"
        >
          <div>
            <h3 className="text-lg font-bold text-gray-900">Flash Sale Banner</h3>
            <p className="text-sm text-gray-500">
              Controls the countdown banner customers see on the home page. {flashCount} product
              {flashCount === 1 ? '' : 's'} marked Flash.
            </p>
          </div>

          <label className="flex items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              checked={offerDraft.flashSaleEnabled}
              onChange={(e) =>
                setOfferDraft({ ...offerDraft, flashSaleEnabled: e.target.checked })
              }
            />
            Show flash sale banner on shop
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="mb-1 block font-medium">Title</span>
              <input
                value={offerDraft.flashSaleTitle}
                onChange={(e) =>
                  setOfferDraft({ ...offerDraft, flashSaleTitle: e.target.value })
                }
                className="w-full rounded-xl border border-border px-3 py-2"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block font-medium">Ends at</span>
              <input
                type="datetime-local"
                value={toDatetimeLocal(offerDraft.flashSaleEndsAt)}
                onChange={(e) =>
                  setOfferDraft({
                    ...offerDraft,
                    flashSaleEndsAt: new Date(e.target.value).toISOString(),
                  })
                }
                className="w-full rounded-xl border border-border px-3 py-2"
              />
            </label>
          </div>

          <label className="block text-sm">
            <span className="mb-1 block font-medium">Subtitle</span>
            <input
              value={offerDraft.flashSaleSubtitle}
              onChange={(e) =>
                setOfferDraft({ ...offerDraft, flashSaleSubtitle: e.target.value })
              }
              className="w-full rounded-xl border border-border px-3 py-2"
            />
          </label>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => extendFlashHours(6)}
              className="rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary"
            >
              +6 hours
            </button>
            <button
              type="button"
              onClick={() => extendFlashHours(24)}
              className="rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary"
            >
              +24 hours
            </button>
            <button
              type="button"
              onClick={() => {
                updateOffers({ flashSaleEnabled: false })
                setOfferDraft((d) => ({ ...d, flashSaleEnabled: false }))
                setMessage('Flash sale banner hidden on shop')
              }}
              className="rounded-full bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-700"
            >
              Hide banner now
            </button>
          </div>

          <hr className="border-border" />

          <div>
            <h3 className="text-lg font-bold text-gray-900">Promo / Offer Strip</h3>
            <p className="text-sm text-gray-500">
              Extra offer line under the flash banner (e.g. free gift, weekend discount).
            </p>
          </div>

          <label className="flex items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              checked={offerDraft.promoBannerEnabled}
              onChange={(e) =>
                setOfferDraft({ ...offerDraft, promoBannerEnabled: e.target.checked })
              }
            />
            Show promo strip on shop
          </label>

          <label className="block text-sm">
            <span className="mb-1 block font-medium">Promo text</span>
            <textarea
              rows={2}
              value={offerDraft.promoBannerText}
              onChange={(e) =>
                setOfferDraft({ ...offerDraft, promoBannerText: e.target.value })
              }
              className="w-full rounded-xl border border-border px-3 py-2"
            />
          </label>

          <hr className="border-border" />

          <label className="block text-sm max-w-xs">
            <span className="mb-1 block font-medium">Delivery fee (Rs.)</span>
            <input
              type="number"
              min={0}
              value={offerDraft.deliveryFee}
              onChange={(e) =>
                setOfferDraft({ ...offerDraft, deliveryFee: Number(e.target.value) })
              }
              className="w-full rounded-xl border border-border px-3 py-2"
            />
            <span className="mt-1 block text-xs text-gray-500">
              Used in cart + WhatsApp order totals
            </span>
          </label>

          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              className="rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white"
            >
              Save offers
            </button>
            <button
              type="button"
              onClick={() => {
                resetOffers()
                setMessage('Offers reset to defaults')
              }}
              className="rounded-xl bg-gray-100 px-5 py-2.5 text-sm font-semibold"
            >
              Reset defaults
            </button>
          </div>
        </form>
      )}

      {tab === 'revenue' && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Total Revenue', value: formatLkr(revenue.total), icon: '💰' },
            { label: 'Orders', value: String(revenue.count), icon: '📦' },
            { label: 'Pending', value: String(revenue.pending), icon: '⏳' },
            { label: 'Delivered', value: String(revenue.delivered), icon: '✅' },
          ].map((card) => (
            <div key={card.label} className="rounded-card bg-white p-5 ring-1 ring-border">
              <p className="text-2xl">{card.icon}</p>
              <p className="mt-2 text-sm text-gray-500">{card.label}</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">{card.value}</p>
            </div>
          ))}
        </div>
      )}

      {tab === 'orders' && (
        <div className="overflow-x-auto rounded-card bg-white ring-1 ring-border">
          {orders.length === 0 ? (
            <p className="p-8 text-center text-gray-500">No orders yet.</p>
          ) : (
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-border bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-4 py-3 font-semibold">Customer</th>
                  <th className="px-4 py-3 font-semibold">Items</th>
                  <th className="px-4 py-3 font-semibold">Total</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3">
                      <p className="font-medium">{o.customer_name}</p>
                      <p className="text-xs text-gray-500">
                        {o.created_at ? new Date(o.created_at).toLocaleString() : '—'}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      {o.items.map((i) => `${i.emoji} ${i.name}×${i.quantity}`).join(', ')}
                    </td>
                    <td className="px-4 py-3 font-semibold text-primary">
                      {formatLkr(o.grand_total)}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={o.status}
                        onChange={(e) =>
                          void updateOrderStatus(o.id, e.target.value as Order['status'])
                        }
                        className="rounded-lg border border-border px-2 py-1"
                      >
                        <option value="pending">pending</option>
                        <option value="confirmed">confirmed</option>
                        <option value="dispatched">dispatched</option>
                        <option value="delivered">delivered</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {tab === 'products' && (
        <div className="grid gap-6 lg:grid-cols-2">
          <form
            onSubmit={(e) => void handleSubmit(e)}
            className="space-y-3 rounded-card bg-white p-5 ring-1 ring-border"
          >
            <h3 className="text-lg font-bold">
              {editingId ? 'Edit Product (live shop)' : 'Add Product'}
            </h3>
            <input
              required
              placeholder="Product name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-xl border border-border px-3 py-2"
            />
            <select
              value={form.category_id}
              onChange={(e) => setForm({ ...form, category_id: e.target.value })}
              className="w-full rounded-xl border border-border px-3 py-2"
            >
              {SEED_CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.icon} {c.name} ({c.gender})
                </option>
              ))}
            </select>
            <div className="grid grid-cols-2 gap-3">
              <label className="text-sm">
                <span className="mb-1 block text-xs font-medium text-gray-500">Sale price</span>
                <input
                  type="number"
                  required
                  min={0}
                  placeholder="Price"
                  value={form.price || ''}
                  onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                  className="w-full rounded-xl border border-border px-3 py-2"
                />
              </label>
              <label className="text-sm">
                <span className="mb-1 block text-xs font-medium text-gray-500">
                  Original (strike)
                </span>
                <input
                  type="number"
                  required
                  min={0}
                  placeholder="Original price"
                  value={form.original_price || ''}
                  onChange={(e) =>
                    setForm({ ...form, original_price: Number(e.target.value) })
                  }
                  className="w-full rounded-xl border border-border px-3 py-2"
                />
              </label>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input
                placeholder="Emoji"
                value={form.emoji}
                onChange={(e) => setForm({ ...form, emoji: e.target.value })}
                className="rounded-xl border border-border px-3 py-2"
              />
              <input
                type="number"
                placeholder="Stock"
                value={form.stock_qty}
                onChange={(e) => setForm({ ...form, stock_qty: Number(e.target.value) })}
                className="rounded-xl border border-border px-3 py-2"
              />
            </div>
            <input
              placeholder="Colors (comma-separated hex)"
              value={form.colors}
              onChange={(e) => setForm({ ...form, colors: e.target.value })}
              className="w-full rounded-xl border border-border px-3 py-2"
            />
            <input
              placeholder="Sizes (comma-separated)"
              value={form.sizes}
              onChange={(e) => setForm({ ...form, sizes: e.target.value })}
              className="w-full rounded-xl border border-border px-3 py-2"
            />
            <textarea
              placeholder="Description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="w-full rounded-xl border border-border px-3 py-2"
            />
            <select
              value={form.badge}
              onChange={(e) => setForm({ ...form, badge: e.target.value })}
              className="w-full rounded-xl border border-border px-3 py-2"
            >
              <option value="">No badge</option>
              <option value="New">New</option>
              <option value="Hot">Hot</option>
              <option value="Sale">Sale</option>
              <option value="Trending">Trending</option>
              <option value="Premium">Premium</option>
            </select>
            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                setForm({ ...form, imageFile: e.target.files?.[0] ?? null })
              }
              className="w-full text-sm"
            />
            <div className="flex flex-wrap gap-4 text-sm">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                />
                Active (uncheck = Sold Out)
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.is_flash_sale}
                  onChange={(e) => setForm({ ...form, is_flash_sale: e.target.checked })}
                />
                Flash Sale item
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.is_featured}
                  onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
                />
                Featured
              </label>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60"
              >
                {saving ? 'Saving…' : editingId ? 'Update live shop' : 'Add to shop'}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-xl bg-gray-100 px-4 py-2.5 text-sm font-semibold"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>

          <div className="space-y-3">
            <p className="text-sm text-gray-500">{products.length} products in catalog</p>
            {products.map((p) => (
              <div
                key={p.id}
                className="flex items-start gap-3 rounded-card bg-white p-4 ring-1 ring-border"
              >
                <span className="text-3xl">{p.emoji}</span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{p.name}</p>
                  <p className="text-sm">
                    <span className="font-bold text-primary">{formatLkr(p.price)}</span>
                    {p.original_price > p.price && (
                      <span className="ml-2 text-xs text-gray-400 line-through">
                        {formatLkr(p.original_price)}
                      </span>
                    )}
                    {p.badge && (
                      <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                        {p.badge}
                      </span>
                    )}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => void toggleProductField(p.id, 'is_active', !p.is_active)}
                      className={`rounded-full px-2.5 py-1 font-semibold ${
                        p.is_active
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {p.is_active ? 'Active' : 'Sold Out'}
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        void toggleProductField(p.id, 'is_flash_sale', !p.is_flash_sale)
                      }
                      className={`rounded-full px-2.5 py-1 font-semibold ${
                        p.is_flash_sale
                          ? 'bg-primary/15 text-primary'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      Flash
                    </button>
                    <button
                      type="button"
                      onClick={() => startEdit(p)}
                      className="rounded-full bg-purple/10 px-2.5 py-1 font-semibold text-purple"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleDelete(p.id)}
                      className="rounded-full bg-red-50 px-2.5 py-1 font-semibold text-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
