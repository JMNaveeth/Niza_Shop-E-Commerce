import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { attachCategories, SEED_CATEGORIES, SEED_PRODUCTS } from '../data/seed'
import { isSupabaseConfigured, supabase } from '../lib/supabase'
import type { Product, ProductBadge, ShopOffers } from '../types'
import { DELIVERY_FEE } from '../types'

const defaultEndsAt = () =>
  new Date(Date.now() + 8 * 60 * 60 * 1000 + 24 * 60 * 1000).toISOString()

export const DEFAULT_OFFERS: ShopOffers = {
  flashSaleEnabled: true,
  flashSaleTitle: 'Flash Sale',
  flashSaleSubtitle: 'Limited deals from Pettah — ends soon!',
  flashSaleEndsAt: defaultEndsAt(),
  promoBannerEnabled: false,
  promoBannerText: '🎉 Special offer — free gift with orders over Rs. 5,000!',
  deliveryFee: DELIVERY_FEE,
}

type ProductInput = Omit<Product, 'id' | 'category' | 'created_at'> & {
  id?: string
  images?: string[]
}

interface CatalogState {
  products: Product[]
  offers: ShopOffers
  loading: boolean
  hydrated: boolean
  /** Bumps on every admin change so every subscriber re-renders instantly */
  revision: number
  initCatalog: () => Promise<void>
  setProducts: (products: Product[]) => void
  addProduct: (input: ProductInput) => Promise<Product>
  updateProduct: (id: string, patch: Partial<Product>) => Promise<void>
  deleteProduct: (id: string) => Promise<void>
  toggleProductField: (
    id: string,
    field: 'is_active' | 'is_flash_sale' | 'is_featured',
    value: boolean,
  ) => Promise<void>
  updateOffers: (patch: Partial<ShopOffers>) => void
  resetOffers: () => void
  getProductById: (id: string) => Product | undefined
  getStorefrontProducts: () => Product[]
  getDeliveryFee: () => number
}

function withCategory(product: Product): Product {
  return {
    ...product,
    category:
      product.category ??
      SEED_CATEGORIES.find((c) => c.id === product.category_id),
  }
}

export const useCatalogStore = create<CatalogState>()(
  persist(
    (set, get) => ({
      products: attachCategories(SEED_PRODUCTS, SEED_CATEGORIES),
      offers: DEFAULT_OFFERS,
      loading: false,
      hydrated: false,
      revision: 0,

      initCatalog: async () => {
        // Never wipe admin edits on navigation — local catalog is live source of truth.
        // Only pull from Supabase when the catalog is still the empty seed bootstrap.
        set({ hydrated: true, loading: false })

        if (!isSupabaseConfigured || !supabase) return

        const current = get().products
        const onlySeed =
          current.length > 0 && current.every((p) => !p.id.startsWith('local-'))
        // If user already edited locally (revision > 0) or has local products, skip refetch
        if (get().revision > 0 || current.some((p) => p.id.startsWith('local-'))) {
          return
        }

        try {
          const { data, error } = await supabase
            .from('products')
            .select('*, category:categories(*)')
            .order('created_at', { ascending: false })

          if (error) throw error

          if (data && data.length > 0 && onlySeed && get().revision === 0) {
            set({
              products: (data as Product[]).map(withCategory),
              loading: false,
              hydrated: true,
            })
          }
        } catch (err) {
          console.warn('Catalog load failed, keeping local catalog:', err)
        }
      },

      setProducts: (products) =>
        set({ products: products.map(withCategory), revision: Date.now() }),

      addProduct: async (input) => {
        const product: Product = withCategory({
          id: input.id ?? `local-${Date.now()}`,
          name: input.name,
          category_id: input.category_id,
          price: input.price,
          original_price: input.original_price,
          images: input.images ?? [],
          emoji: input.emoji,
          description: input.description,
          colors: input.colors,
          sizes: input.sizes,
          stock_qty: input.stock_qty,
          is_active: input.is_active,
          is_featured: input.is_featured,
          is_flash_sale: input.is_flash_sale,
          badge: input.badge,
          created_at: new Date().toISOString(),
        })

        if (isSupabaseConfigured && supabase) {
          const { data, error } = await supabase
            .from('products')
            .insert({
              name: product.name,
              category_id: product.category_id,
              price: product.price,
              original_price: product.original_price,
              images: product.images,
              emoji: product.emoji,
              description: product.description,
              colors: product.colors,
              stock_qty: product.stock_qty,
              is_active: product.is_active,
              is_featured: product.is_featured,
              is_flash_sale: product.is_flash_sale,
              badge: product.badge,
            })
            .select('*, category:categories(*)')
            .single()

          if (error) throw error
          const saved = withCategory(data as Product)
          set((s) => ({
            products: [saved, ...s.products],
            revision: Date.now(),
          }))
          return saved
        }

        set((s) => ({
          products: [product, ...s.products],
          revision: Date.now(),
        }))
        return product
      },

      updateProduct: async (id, patch) => {
        const nextPatch = { ...patch }
        if (nextPatch.category_id) {
          nextPatch.category = SEED_CATEGORIES.find(
            (c) => c.id === nextPatch.category_id,
          )
        }

        set((s) => ({
          products: s.products.map((p) =>
            p.id === id ? withCategory({ ...p, ...nextPatch }) : p,
          ),
          revision: Date.now(),
        }))

        if (isSupabaseConfigured && supabase && !id.startsWith('local-')) {
          const {
            category: _c,
            created_at: _a,
            id: _i,
            ...dbPatch
          } = nextPatch as Partial<Product> & { id?: string }
          void _c
          void _a
          void _i
          const { error } = await supabase.from('products').update(dbPatch).eq('id', id)
          if (error) throw error
        }
      },

      deleteProduct: async (id) => {
        set((s) => ({
          products: s.products.filter((p) => p.id !== id),
          revision: Date.now(),
        }))
        if (isSupabaseConfigured && supabase && !id.startsWith('local-')) {
          const { error } = await supabase.from('products').delete().eq('id', id)
          if (error) throw error
        }
      },

      toggleProductField: async (id, field, value) => {
        await get().updateProduct(id, { [field]: value })
      },

      updateOffers: (patch) =>
        set((s) => ({
          offers: { ...s.offers, ...patch },
          revision: Date.now(),
        })),

      resetOffers: () =>
        set({
          offers: { ...DEFAULT_OFFERS, flashSaleEndsAt: defaultEndsAt() },
          revision: Date.now(),
        }),

      getProductById: (id) => get().products.find((p) => p.id === id),

      getStorefrontProducts: () => get().products,

      getDeliveryFee: () => get().offers.deliveryFee || DELIVERY_FEE,
    }),
    {
      name: 'niza-shop-catalog',
      partialize: (state) => ({
        products: state.products,
        offers: state.offers,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.products = state.products.map(withCategory)
          state.hydrated = true
        }
      },
    },
  ),
)

export type { ProductBadge }
