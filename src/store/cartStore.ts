import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartItem, Product } from '../types'
import { useCatalogStore } from './catalogStore'

interface CartState {
  items: CartItem[]
  isOpen: boolean
  toast: string | null
  openCart: () => void
  closeCart: () => void
  toggleCart: () => void
  addItem: (product: Product, opts?: { color?: string; size?: string; quantity?: number }) => void
  removeItem: (productId: string, color?: string, size?: string) => void
  updateQuantity: (productId: string, quantity: number, color?: string, size?: string) => void
  clearCart: () => void
  showToast: (message: string) => void
  clearToast: () => void
  getSubtotal: () => number
  getItemCount: () => number
  getGrandTotal: () => number
}

function itemKey(productId: string, color?: string, size?: string) {
  return `${productId}|${color ?? ''}|${size ?? ''}`
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      toast: null,

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((s) => ({ isOpen: !s.isOpen })),

      addItem: (product, opts) => {
        if (!product.is_active || product.stock_qty <= 0) {
          get().showToast('This item is sold out')
          return
        }
        const color = opts?.color ?? product.colors[0]
        const size = opts?.size ?? product.sizes?.[0]
        const quantity = opts?.quantity ?? 1
        const key = itemKey(product.id, color, size)

        set((state) => {
          const existing = state.items.find(
            (i) => itemKey(i.product.id, i.selectedColor, i.selectedSize) === key,
          )
          if (existing) {
            return {
              items: state.items.map((i) =>
                itemKey(i.product.id, i.selectedColor, i.selectedSize) === key
                  ? { ...i, quantity: i.quantity + quantity }
                  : i,
              ),
            }
          }
          return {
            items: [
              ...state.items,
              { product, quantity, selectedColor: color, selectedSize: size },
            ],
          }
        })
        get().showToast(`${product.emoji} ${product.name} added to cart`)
      },

      removeItem: (productId, color, size) => {
        const key = itemKey(productId, color, size)
        set((state) => ({
          items: state.items.filter(
            (i) => itemKey(i.product.id, i.selectedColor, i.selectedSize) !== key,
          ),
        }))
      },

      updateQuantity: (productId, quantity, color, size) => {
        if (quantity <= 0) {
          get().removeItem(productId, color, size)
          return
        }
        const key = itemKey(productId, color, size)
        set((state) => ({
          items: state.items.map((i) =>
            itemKey(i.product.id, i.selectedColor, i.selectedSize) === key
              ? { ...i, quantity }
              : i,
          ),
        }))
      },

      clearCart: () => set({ items: [] }),

      showToast: (message) => {
        set({ toast: message })
        window.setTimeout(() => {
          if (get().toast === message) set({ toast: null })
        }, 2500)
      },

      clearToast: () => set({ toast: null }),

      getSubtotal: () =>
        get().items.reduce((sum, i) => sum + i.product.price * i.quantity, 0),

      getItemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      getGrandTotal: () => {
        const subtotal = get().getSubtotal()
        if (subtotal <= 0) return 0
        return subtotal + useCatalogStore.getState().getDeliveryFee()
      },
    }),
    {
      name: 'niza-shop-cart',
      partialize: (state) => ({ items: state.items }),
    },
  ),
)
