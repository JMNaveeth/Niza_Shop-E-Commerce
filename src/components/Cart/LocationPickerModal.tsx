import { useEffect, useRef, useState } from 'react'
import {
  createDeliveryLocation,
  reverseGeocode,
  searchPlaces,
  type DeliveryLocation,
  type PlaceSuggestion,
} from '../../lib/deliveryLocation'

interface LocationPickerModalProps {
  open: boolean
  onClose: () => void
  onConfirm: (location: DeliveryLocation) => void
  initial?: DeliveryLocation | null
}

/** Colombo-ish default center for Sri Lanka map picker */
const DEFAULT_CENTER = { lat: 6.9271, lng: 79.8612 }

export default function LocationPickerModal({
  open,
  onClose,
  onConfirm,
  initial,
}: LocationPickerModalProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<PlaceSuggestion[]>([])
  const [searching, setSearching] = useState(false)
  const [pin, setPin] = useState(() =>
    initial
      ? { lat: initial.lat, lng: initial.lng, label: initial.label }
      : { ...DEFAULT_CENTER, label: 'Colombo' },
  )
  const [busy, setBusy] = useState(false)
  const debounceRef = useRef<number | null>(null)

  useEffect(() => {
    if (!open) return
    if (initial) {
      setPin({ lat: initial.lat, lng: initial.lng, label: initial.label })
    }
  }, [open, initial])

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    if (debounceRef.current) window.clearTimeout(debounceRef.current)
    if (query.trim().length < 2) {
      setResults([])
      return
    }
    debounceRef.current = window.setTimeout(() => {
      void (async () => {
        setSearching(true)
        const found = await searchPlaces(query)
        setResults(found)
        setSearching(false)
      })()
    }, 350)
    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current)
    }
  }, [query, open])

  if (!open) return null

  const delta = 0.0025

  const nudge = (dLat: number, dLng: number) => {
    setPin((p) => ({
      ...p,
      lat: Number((p.lat + dLat).toFixed(6)),
      lng: Number((p.lng + dLng).toFixed(6)),
      label: p.label.includes('Adjusted') ? p.label : `${p.label} (adjusted)`,
    }))
  }

  const selectResult = (place: PlaceSuggestion) => {
    setPin({ lat: place.lat, lng: place.lng, label: place.label })
    setQuery(place.label)
    setResults([])
  }

  const handleConfirm = async () => {
    setBusy(true)
    try {
      let label = pin.label
      if (!label || label === 'Colombo' || label.includes('adjusted')) {
        const resolved = await reverseGeocode(pin.lat, pin.lng)
        if (resolved) label = resolved
      }
      onConfirm(
        createDeliveryLocation(
          pin.lat,
          pin.lng,
          'picked',
          label,
          initial?.accuracyMeters,
        ),
      )
      onClose()
    } finally {
      setBusy(false)
    }
  }

  const bbox = [
    pin.lng - 0.02,
    pin.lat - 0.015,
    pin.lng + 0.02,
    pin.lat + 0.015,
  ].join('%2C')

  const embedSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${pin.lat}%2C${pin.lng}`

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/55 animate-fade-in"
        aria-label="Close location picker"
        onClick={onClose}
      />

      <div
        className="relative flex max-h-[92dvh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl animate-fade-in sm:max-h-[85vh] sm:rounded-3xl"
        style={{ paddingBottom: 'var(--safe-bottom)' }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="location-picker-title"
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400">
              Delivery
            </p>
            <h3
              id="location-picker-title"
              className="text-base font-extrabold text-gray-900"
            >
              Define location
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full text-gray-500 active:bg-gray-100"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="space-y-3 overflow-y-auto overscroll-contain px-4 py-3">
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-gray-600">
              Search place / landmark
            </span>
            <div className="relative">
              <span
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm"
                aria-hidden
              >
                🔎
              </span>
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. Pettah, Kandy, Galle Fort…"
                autoComplete="off"
                className="w-full rounded-xl border border-border bg-gray-50 py-3 pl-10 pr-3 text-base outline-none focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </label>

          {(searching || results.length > 0) && (
            <ul className="max-h-40 overflow-y-auto rounded-xl bg-gray-50 ring-1 ring-border">
              {searching && (
                <li className="px-3 py-2.5 text-sm text-gray-500">
                  Searching…
                </li>
              )}
              {!searching &&
                results.map((place) => (
                  <li key={`${place.lat}-${place.lng}-${place.label}`}>
                    <button
                      type="button"
                      onClick={() => selectResult(place)}
                      className="flex w-full items-start gap-2 px-3 py-2.5 text-left text-sm active:bg-primary/5"
                    >
                      <span aria-hidden>📍</span>
                      <span className="font-medium text-gray-800">
                        {place.label}
                      </span>
                    </button>
                  </li>
                ))}
            </ul>
          )}

          <div className="overflow-hidden rounded-2xl ring-1 ring-border">
            <iframe
              title="Delivery map"
              src={embedSrc}
              className="h-48 w-full border-0 sm:h-56"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>

          <div className="rounded-xl bg-gray-50 px-3 py-2.5 ring-1 ring-border">
            <p className="text-xs font-semibold text-gray-500">Selected pin</p>
            <p className="mt-0.5 text-sm font-bold text-gray-900">{pin.label}</p>
            <p className="mt-0.5 text-[11px] tabular-nums text-gray-400">
              {pin.lat.toFixed(5)}, {pin.lng.toFixed(5)}
            </p>
          </div>

          <div>
            <p className="mb-1.5 text-center text-[11px] font-semibold text-gray-500">
              Fine-tune pin
            </p>
            <div className="mx-auto grid w-36 grid-cols-3 gap-1.5">
              <span />
              <button
                type="button"
                onClick={() => nudge(delta, 0)}
                className="flex h-10 items-center justify-center rounded-xl bg-white text-lg font-bold ring-1 ring-border active:bg-gray-100"
                aria-label="Move north"
              >
                ↑
              </button>
              <span />
              <button
                type="button"
                onClick={() => nudge(0, -delta)}
                className="flex h-10 items-center justify-center rounded-xl bg-white text-lg font-bold ring-1 ring-border active:bg-gray-100"
                aria-label="Move west"
              >
                ←
              </button>
              <button
                type="button"
                onClick={() => nudge(-delta, 0)}
                className="flex h-10 items-center justify-center rounded-xl bg-white text-lg font-bold ring-1 ring-border active:bg-gray-100"
                aria-label="Move south"
              >
                ↓
              </button>
              <button
                type="button"
                onClick={() => nudge(0, delta)}
                className="flex h-10 items-center justify-center rounded-xl bg-white text-lg font-bold ring-1 ring-border active:bg-gray-100"
                aria-label="Move east"
              >
                →
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-border px-4 py-3">
          <button
            type="button"
            disabled={busy}
            onClick={() => void handleConfirm()}
            className="flex min-h-12 w-full items-center justify-center rounded-xl bg-dark text-base font-bold text-white transition active:bg-primary disabled:opacity-60"
          >
            {busy ? 'Saving…' : 'Use this location'}
          </button>
        </div>
      </div>
    </div>
  )
}
