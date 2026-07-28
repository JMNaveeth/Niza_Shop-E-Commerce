import { useEffect, useState } from 'react'
import { useCartStore } from '../../store/cartStore'
import { useCatalogStore } from '../../store/catalogStore'
import { getEffectivePrice } from '../../lib/pricing'
import { useFlashSaleStatus } from '../../hooks/useFlashSale'
import {
  createDeliveryLocation,
  geolocationErrorMessage,
  getAccuratePosition,
  isLowAccuracy,
  reverseGeocode,
  type DeliveryLocation,
} from '../../lib/deliveryLocation'
import {
  formatLkr,
  formatPhoneDisplay,
  isValidSriLankaMobile,
  openWhatsAppOrder,
  saveOrderToSupabase,
} from './WhatsAppOrder'
import LocationPickerModal from './LocationPickerModal'

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
  const [location, setLocation] = useState<DeliveryLocation | null>(null)
  const [locating, setLocating] = useState(false)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [touched, setTouched] = useState({
    name: false,
    phone: false,
    location: false,
  })
  const [ordering, setOrdering] = useState(false)

  const subtotal = getSubtotal()
  const grandTotal = subtotal > 0 ? subtotal + deliveryFee : 0

  const nameOk = customerName.trim().length >= 2
  const phoneOk = isValidSriLankaMobile(customerPhone)
  const locationOk = location != null
  const formReady = nameOk && phoneOk && locationOk

  const nameError =
    touched.name && !nameOk ? 'Please enter your full name' : null
  const phoneError =
    touched.phone && customerPhone.trim() && !phoneOk
      ? 'Enter a valid mobile (07X XXX XXXX)'
      : touched.phone && !customerPhone.trim()
        ? 'Contact number is required'
        : null
  const locationError =
    touched.location && !locationOk
      ? 'Share or define your delivery location'
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

  const shareCurrentLocation = async () => {
    setLocating(true)
    setTouched((t) => ({ ...t, location: true }))
    try {
      const pos = await getAccuratePosition({
        targetAccuracy: 35,
        timeoutMs: 18000,
      })
      const label =
        (await reverseGeocode(pos.lat, pos.lng)) || 'My GPS location'
      const loc = createDeliveryLocation(
        pos.lat,
        pos.lng,
        'current',
        label,
        pos.accuracyMeters,
      )
      setLocation(loc)

      if (isLowAccuracy(pos.accuracyMeters)) {
        useCartStore
          .getState()
          .showToast('GPS is approximate — please Adjust pin to confirm')
        setPickerOpen(true)
      } else {
        useCartStore.getState().showToast('Precise location shared ✓')
      }
    } catch (err) {
      useCartStore.getState().showToast(geolocationErrorMessage(err))
    } finally {
      setLocating(false)
    }
  }

  const handleOrder = async () => {
    setTouched({ name: true, phone: true, location: true })

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
    if (!location) {
      useCartStore
        .getState()
        .showToast('Share or define your delivery location')
      return
    }
    if (items.length === 0) return

    const customer = {
      name: customerName.trim(),
      phone: formatPhoneDisplay(customerPhone).trim() || customerPhone.trim(),
      location,
    }

    setOrdering(true)
    try {
      await saveOrderToSupabase(customer, items, subtotal)
      openWhatsAppOrder(customer, items, subtotal)
      clearCart()
      setCustomerName('')
      setCustomerPhone('')
      setLocation(null)
      setTouched({ name: false, phone: false, location: false })
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
                      Name, phone & location for WhatsApp order
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
                      enterKeyHint="done"
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

                {/* Location — no typed address */}
                <div className="block">
                  <span className="mb-1.5 flex items-center gap-1 text-xs font-semibold text-gray-600">
                    Delivery location <span className="text-primary">*</span>
                  </span>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      disabled={locating}
                      onClick={() => void shareCurrentLocation()}
                      className={`flex min-h-[4.5rem] flex-col items-center justify-center gap-1 rounded-2xl px-2 py-3 text-center transition active:scale-[0.98] ${
                        location?.source === 'current'
                          ? 'bg-emerald-50 ring-2 ring-emerald-500'
                          : 'bg-white ring-1 ring-border active:bg-gray-50'
                      }`}
                    >
                      <span className="text-xl" aria-hidden>
                        {locating ? '⏳' : '📡'}
                      </span>
                      <span className="text-[12px] font-bold leading-tight text-gray-900">
                        {locating ? 'Getting GPS…' : 'Share current'}
                      </span>
                      <span className="text-[10px] leading-tight text-gray-500">
                        {locating ? 'Wait for accuracy' : 'Phone GPS best'}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setTouched((t) => ({ ...t, location: true }))
                        setPickerOpen(true)
                      }}
                      className={`flex min-h-[4.5rem] flex-col items-center justify-center gap-1 rounded-2xl px-2 py-3 text-center transition active:scale-[0.98] ${
                        location?.source === 'picked'
                          ? 'bg-emerald-50 ring-2 ring-emerald-500'
                          : 'bg-white ring-1 ring-border active:bg-gray-50'
                      }`}
                    >
                      <span className="text-xl" aria-hidden>
                        🗺️
                      </span>
                      <span className="text-[12px] font-bold leading-tight text-gray-900">
                        Define location
                      </span>
                      <span className="text-[10px] leading-tight text-gray-500">
                        Search / pin map
                      </span>
                    </button>
                  </div>

                  {location && (
                    <div
                      className={`mt-2 rounded-xl px-3 py-2.5 ring-1 ${
                        isLowAccuracy(location.accuracyMeters)
                          ? 'bg-amber-50 ring-amber-200'
                          : 'bg-emerald-50/80 ring-emerald-200'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p
                            className={`text-[10px] font-bold uppercase tracking-wide ${
                              isLowAccuracy(location.accuracyMeters)
                                ? 'text-amber-700'
                                : 'text-emerald-700'
                            }`}
                          >
                            {location.source === 'current'
                              ? 'GPS pin'
                              : 'Pinned location'}{' '}
                            ✓
                            {location.accuracyMeters != null && (
                              <span className="ml-1 font-semibold normal-case tracking-normal">
                                · ±{Math.round(location.accuracyMeters)}m
                              </span>
                            )}
                          </p>
                          <p className="mt-0.5 text-sm font-semibold leading-snug text-gray-900">
                            {location.label}
                          </p>
                          <p className="mt-0.5 text-[10px] tabular-nums text-gray-500">
                            {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                          </p>
                          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                            <a
                              href={location.mapsUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[11px] font-bold text-primary underline-offset-2 active:underline"
                            >
                              Verify in Google Maps
                            </a>
                            <button
                              type="button"
                              onClick={() => setPickerOpen(true)}
                              className="text-[11px] font-bold text-dark underline-offset-2 active:underline"
                            >
                              Wrong? Adjust pin
                            </button>
                          </div>
                          {isLowAccuracy(location.accuracyMeters) && (
                            <p className="mt-1.5 text-[11px] font-medium leading-snug text-amber-800">
                              Accuracy is low (common on PC / Wi‑Fi). Use your
                              phone with GPS, or tap Adjust pin.
                            </p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => setLocation(null)}
                          className="shrink-0 text-[11px] font-semibold text-red-500"
                        >
                          Clear
                        </button>
                      </div>
                    </div>
                  )}

                  {locationError && (
                    <p className="mt-1.5 text-[11px] font-medium text-red-500">
                      {locationError}
                    </p>
                  )}
                </div>
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

      <LocationPickerModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        initial={location}
        onConfirm={(loc) => {
          setLocation(loc)
          useCartStore.getState().showToast('Delivery location set ✓')
        }}
      />
    </div>
  )
}
