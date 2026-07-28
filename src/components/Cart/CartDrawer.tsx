import { useEffect, useState } from 'react'
import { useCartStore } from '../../store/cartStore'
import { useCatalogStore } from '../../store/catalogStore'
import { getEffectivePrice } from '../../lib/pricing'
import { useFlashSaleStatus } from '../../hooks/useFlashSale'
import {
  formatLkr,
  formatPhoneDisplay,
  isValidSriLankaMobile,
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
  const offers = useCatalogStore((s) => s.offers)
  useFlashSaleStatus()
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerAddress, setCustomerAddress] = useState('')
  const [touched, setTouched] = useState({
    name: false,
    phone: false,
    address: false,
  })
  const [ordering, setOrdering] = useState(false)

  const subtotal = getSubtotal()
  const grandTotal = subtotal > 0 ? subtotal + deliveryFee : 0

  const nameOk = customerName.trim().length >= 2
  const phoneOk = isValidSriLankaMobile(customerPhone)
  const addressOk = customerAddress.trim().length >= 8
  const formReady = nameOk && phoneOk && addressOk

  const nameError =
    touched.name && !nameOk ? 'Please enter your full name' : null
  const phoneError =
    touched.phone && customerPhone.trim() && !phoneOk
      ? 'Enter a valid mobile (07X XXX XXXX)'
      : touched.phone && !customerPhone.trim()
        ? 'Contact number is required'
        : null
  const addressError =
    touched.address && !addressOk
      ? 'Enter your delivery address (city / area)'
      : null

  useEffect(() => {
    if (!isOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [isOpen])

  if (!isOpen) return null

  const handlePhoneChange = (raw: string) => {
    const cleaned = raw.replace(/[^\d+\s-]/g, '').slice(0, 16)
    setCustomerPhone(cleaned)
  }

  const handleOrder = async () => {
    setTouched({ name: true, phone: true, address: true })

    if (!nameOk) {
      useCartStore.getState().showToast('Please enter your name')
      return
    }
    if (!phoneOk) {
      useCartStore
        .getState()
        .showToast('Enter a valid contact number (07X XXX XXXX)')
      return
    }
    if (!addressOk) {
      useCartStore.getState().showToast('Please enter your delivery address')
      return
    }
    if (items.length === 0) return

    const customer = {
      name: customerName.trim(),
      phone: formatPhoneDisplay(customerPhone).trim() || customerPhone.trim(),
      address: customerAddress.trim(),
    }

    setOrdering(true)
    try {
      await saveOrderToSupabase(customer, items, subtotal)
      openWhatsAppOrder(customer, items, subtotal)
      clearCart()
      setCustomerName('')
      setCustomerPhone('')
      setCustomerAddress('')
      setTouched({ name: false, phone: false, address: false })
      closeCart()
      useCartStore.getState().showToast('Order opened in WhatsApp!')
    } catch {
      openWhatsAppOrder(customer, items, subtotal)
      useCartStore.getState().showToast('Opened WhatsApp (order save skipped)')
    } finally {
      setOrdering(false)
    }
  }

  const fieldClass = (hasError: boolean, isValid = false) =>
    `w-full rounded-xl border bg-gray-50/80 px-3 py-3 text-base outline-none transition focus:bg-white focus:ring-2 ${
      hasError
        ? 'border-red-400 focus:border-red-400 focus:ring-red-100'
        : isValid
          ? 'border-emerald-400 focus:border-emerald-500 focus:ring-emerald-100'
          : 'border-border focus:border-primary focus:ring-primary/20'
    }`

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        type="button"
        className="absolute inset-0 bg-black/50 animate-fade-in"
        aria-label="Close cart"
        onClick={closeCart}
      />

      <aside
        className="relative flex h-full w-full max-w-md flex-col bg-white shadow-2xl animate-slide-in-right"
        style={{
          paddingTop: 'var(--safe-top)',
          paddingBottom: 'var(--safe-bottom)',
        }}
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3 sm:py-4">
          <h2 className="text-lg font-bold text-gray-900">
            Your Cart{' '}
            {items.length > 0 &&
              `(${items.reduce((n, i) => n + i.quantity, 0)})`}
          </h2>
          <button
            type="button"
            onClick={closeCart}
            className="flex h-11 w-11 items-center justify-center rounded-full text-gray-500 active:bg-gray-100"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain px-3 py-3 sm:px-4 sm:py-4">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center px-4 text-center text-gray-500">
              <p className="text-4xl">🛒</p>
              <p className="mt-3 font-medium">Your cart is empty</p>
              <p className="mt-1 text-sm">
                Add something stylish from Niza Shop!
              </p>
              <button
                type="button"
                onClick={closeCart}
                className="mt-5 min-h-11 rounded-full bg-dark px-6 text-sm font-semibold text-white"
              >
                Continue shopping
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <ul className="space-y-3">
                {items.map((item) => (
                  <li
                    key={`${item.product.id}-${item.selectedColor}-${item.selectedSize}`}
                    className="flex gap-3 rounded-2xl bg-gray-50 p-3"
                  >
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-white text-3xl ring-1 ring-border">
                      {item.product.emoji}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
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
                          className="min-h-8 shrink-0 px-1 text-xs font-semibold text-red-500"
                        >
                          Remove
                        </button>
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-lg font-bold ring-1 ring-border active:bg-gray-100"
                            onClick={() =>
                              updateQuantity(
                                item.product.id,
                                item.quantity - 1,
                                item.selectedColor,
                                item.selectedSize,
                              )
                            }
                            aria-label="Decrease quantity"
                          >
                            −
                          </button>
                          <span className="w-7 text-center text-sm font-bold">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-lg font-bold ring-1 ring-border active:bg-gray-100"
                            onClick={() =>
                              updateQuantity(
                                item.product.id,
                                item.quantity + 1,
                                item.selectedColor,
                                item.selectedSize,
                              )
                            }
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>
                        <span className="text-sm font-bold text-primary">
                          {formatLkr(
                            getEffectivePrice(item.product, offers) *
                              item.quantity,
                          )}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              {/* Delivery details — scrolls with items on small screens */}
              <div className="space-y-2.5 rounded-2xl bg-gradient-to-br from-white to-pink-50/40 p-3.5 shadow-sm ring-1 ring-border">
                <div className="flex items-center gap-2.5">
                  <span
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-base"
                    aria-hidden
                  >
                    📝
                  </span>
                  <div>
                    <p className="text-sm font-bold text-gray-900">
                      Delivery details
                    </p>
                    <p className="text-[11px] leading-snug text-gray-500">
                      Fill these to place your WhatsApp order
                    </p>
                  </div>
                </div>

                <label className="block">
                  <span className="mb-1 flex items-center gap-1 text-xs font-semibold text-gray-600">
                    Your name <span className="text-primary">*</span>
                  </span>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    onBlur={() => setTouched((t) => ({ ...t, name: true }))}
                    placeholder="Full name"
                    autoComplete="name"
                    enterKeyHint="next"
                    aria-invalid={!!nameError}
                    className={fieldClass(!!nameError, nameOk)}
                  />
                  {nameError && (
                    <p className="mt-1 text-[11px] font-medium text-red-500">
                      {nameError}
                    </p>
                  )}
                </label>

                <label className="block">
                  <span className="mb-1 flex items-center gap-1 text-xs font-semibold text-gray-600">
                    Contact number <span className="text-primary">*</span>
                  </span>
                  <div className="relative">
                    <span
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400"
                      aria-hidden
                    >
                      📞
                    </span>
                    <input
                      type="tel"
                      inputMode="tel"
                      value={customerPhone}
                      onChange={(e) => handlePhoneChange(e.target.value)}
                      onBlur={() => {
                        setTouched((t) => ({ ...t, phone: true }))
                        if (isValidSriLankaMobile(customerPhone)) {
                          setCustomerPhone(formatPhoneDisplay(customerPhone))
                        }
                      }}
                      placeholder="07X XXX XXXX"
                      autoComplete="tel"
                      enterKeyHint="next"
                      maxLength={16}
                      aria-invalid={!!phoneError}
                      className={`${fieldClass(!!phoneError, phoneOk && !!customerPhone)} pl-10 pr-9`}
                    />
                    {phoneOk && customerPhone && (
                      <span
                        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 font-bold text-emerald-500"
                        aria-hidden
                      >
                        ✓
                      </span>
                    )}
                  </div>
                  {phoneError ? (
                    <p className="mt-1 text-[11px] font-medium text-red-500">
                      {phoneError}
                    </p>
                  ) : (
                    <p className="mt-1 text-[11px] text-gray-400">
                      Sri Lankan mobile · e.g. 077 123 4567
                    </p>
                  )}
                </label>

                <label className="block">
                  <span className="mb-1 flex items-center gap-1 text-xs font-semibold text-gray-600">
                    Delivery address <span className="text-primary">*</span>
                  </span>
                  <div className="relative">
                    <span
                      className="pointer-events-none absolute left-3 top-3 text-sm text-gray-400"
                      aria-hidden
                    >
                      📍
                    </span>
                    <textarea
                      value={customerAddress}
                      onChange={(e) => setCustomerAddress(e.target.value)}
                      onBlur={() =>
                        setTouched((t) => ({ ...t, address: true }))
                      }
                      placeholder="Street, city / town, district"
                      autoComplete="street-address"
                      rows={2}
                      enterKeyHint="done"
                      aria-invalid={!!addressError}
                      className={`${fieldClass(!!addressError, addressOk)} resize-none pl-10 leading-snug`}
                    />
                  </div>
                  {addressError && (
                    <p className="mt-1 text-[11px] font-medium text-red-500">
                      {addressError}
                    </p>
                  )}
                </label>
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-border bg-white px-4 py-3 space-y-3 sm:py-4">
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

          <button
            type="button"
            disabled={items.length === 0 || ordering}
            onClick={() => void handleOrder()}
            className={`flex min-h-12 w-full items-center justify-center gap-2 rounded-xl text-base font-bold text-white shadow-md transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 ${
              formReady && items.length > 0
                ? 'bg-[#25D366] shadow-[#25D366]/30 active:bg-[#1ebe5d]'
                : 'bg-[#25D366]/80 shadow-none'
            }`}
          >
            <span aria-hidden>💬</span>
            {ordering ? 'Opening…' : 'Order via WhatsApp'}
          </button>
        </div>
      </aside>
    </div>
  )
}
