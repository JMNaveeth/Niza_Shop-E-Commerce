import { useState } from 'react'
import { useCartStore } from '../../store/cartStore'
import { useCatalogStore } from '../../store/catalogStore'
import {
  formatLkr,
  openWhatsAppOrder,
  saveOrderToSupabase,
} from './WhatsAppOrder'

export default function CartDrawer() {
  const {
    items,
    isOpen,
    closeCart,
    updateQuantity,
    removeItem,
    getSubtotal,
    clearCart,
  } = useCartStore()
  const deliveryFee = useCatalogStore((s) => s.offers.deliveryFee)
  const [customerName, setCustomerName] = useState('')
  const [ordering, setOrdering] = useState(false)

  const subtotal = getSubtotal()
  const grandTotal = subtotal > 0 ? subtotal + deliveryFee : 0

  if (!isOpen) return null

  const handleOrder = async () => {
    const name = customerName.trim()
    if (!name) {
      useCartStore.getState().showToast('Please enter your name')
      return
    }
    if (items.length === 0) return

    setOrdering(true)
    try {
      await saveOrderToSupabase(name, items, subtotal)
      openWhatsAppOrder(name, items, subtotal)
      clearCart()
      closeCart()
      useCartStore.getState().showToast('Order opened in WhatsApp!')
    } catch {
      openWhatsAppOrder(name, items, subtotal)
      useCartStore.getState().showToast('Opened WhatsApp (order save skipped)')
    } finally {
      setOrdering(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        type="button"
        className="absolute inset-0 bg-black/50 animate-fade-in"
        aria-label="Close cart"
        onClick={closeCart}
      />

      <aside className="relative flex h-full w-full max-w-md flex-col bg-white shadow-2xl animate-slide-in-right">
        <div className="flex items-center justify-between border-b border-border px-4 py-4">
          <h2 className="text-lg font-bold text-gray-900">Your Cart</h2>
          <button
            type="button"
            onClick={closeCart}
            className="rounded-full p-2 text-gray-500 hover:bg-gray-100"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center text-gray-500">
              <p className="text-4xl">🛒</p>
              <p className="mt-3 font-medium">Your cart is empty</p>
              <p className="mt-1 text-sm">Add something stylish from Niza Shop!</p>
            </div>
          ) : (
            <ul className="space-y-4">
              {items.map((item) => (
                <li
                  key={`${item.product.id}-${item.selectedColor}-${item.selectedSize}`}
                  className="flex gap-3 rounded-card bg-gray-50 p-3"
                >
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-white text-3xl ring-1 ring-border">
                    {item.product.emoji}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="truncate font-semibold text-gray-900">
                          {item.product.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {item.product.category?.name ?? 'Fashion'}
                          {item.product.category?.gender && (
                            <span className="ml-1 capitalize rounded bg-pink-50 px-1.5 py-0.5 text-primary">
                              {item.product.category.gender}
                            </span>
                          )}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          removeItem(
                            item.product.id,
                            item.selectedColor,
                            item.selectedSize,
                          )
                        }
                        className="text-xs text-red-500 hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          className="flex h-7 w-7 items-center justify-center rounded-lg bg-white ring-1 ring-border"
                          onClick={() =>
                            updateQuantity(
                              item.product.id,
                              item.quantity - 1,
                              item.selectedColor,
                              item.selectedSize,
                            )
                          }
                        >
                          −
                        </button>
                        <span className="w-6 text-center text-sm font-semibold">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          className="flex h-7 w-7 items-center justify-center rounded-lg bg-white ring-1 ring-border"
                          onClick={() =>
                            updateQuantity(
                              item.product.id,
                              item.quantity + 1,
                              item.selectedColor,
                              item.selectedSize,
                            )
                          }
                        >
                          +
                        </button>
                      </div>
                      <span className="text-sm font-bold text-primary">
                        {formatLkr(item.product.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="border-t border-border px-4 py-4 space-y-3">
          <div className="space-y-1 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>{formatLkr(subtotal)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Delivery</span>
              <span>{formatLkr(items.length ? deliveryFee : 0)}</span>
            </div>
            <div className="flex justify-between text-base font-bold text-gray-900">
              <span>Grand Total</span>
              <span className="text-primary">{formatLkr(grandTotal)}</span>
            </div>
          </div>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-gray-700">
              Customer name
            </span>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Your full name"
              className="w-full rounded-xl border border-border px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </label>

          <button
            type="button"
            disabled={items.length === 0 || ordering}
            onClick={() => void handleOrder()}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] py-3.5 text-base font-bold text-white transition hover:bg-[#1ebe5d] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span>💬</span>
            {ordering ? 'Opening…' : 'Order via WhatsApp'}
          </button>
        </div>
      </aside>
    </div>
  )
}
