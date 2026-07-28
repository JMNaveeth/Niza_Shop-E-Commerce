export interface DeliveryLocation {
  lat: number
  lng: number
  /** Human-readable place name when available */
  label: string
  mapsUrl: string
  source: 'current' | 'picked'
  /** GPS accuracy in meters when known */
  accuracyMeters?: number
}

export function mapsUrlFromCoords(lat: number, lng: number): string {
  // Google Maps pin — this is what delivery uses (exact coordinates)
  return `https://www.google.com/maps?q=${lat.toFixed(6)},${lng.toFixed(6)}`
}

export function createDeliveryLocation(
  lat: number,
  lng: number,
  source: DeliveryLocation['source'],
  label = '',
  accuracyMeters?: number,
): DeliveryLocation {
  return {
    lat,
    lng,
    label: label.trim() || `Pin ${lat.toFixed(5)}, ${lng.toFixed(5)}`,
    mapsUrl: mapsUrlFromCoords(lat, lng),
    source,
    accuracyMeters,
  }
}

function formatAddressParts(parts: Array<string | undefined | null>): string {
  return [...new Set(parts.filter(Boolean) as string[])].join(', ')
}

/** BigDataCloud — often better locality names, no API key for client use */
async function reverseGeocodeBigData(
  lat: number,
  lng: number,
): Promise<string> {
  try {
    const res = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`,
    )
    if (!res.ok) return ''
    const data = (await res.json()) as {
      locality?: string
      city?: string
      principalSubdivision?: string
      local?: string
      localityInfo?: {
        administrative?: Array<{ name?: string; description?: string }>
        informative?: Array<{ name?: string; description?: string }>
      }
    }

    const admin = data.localityInfo?.administrative ?? []
    const info = data.localityInfo?.informative ?? []
    const neighbourhood =
      info.find((i) =>
        /neighbourhood|neighborhood|suburb/i.test(i.description ?? ''),
      )?.name ||
      admin.find((a) =>
        /suburb|neighbourhood|quarter/i.test(a.description ?? ''),
      )?.name

    return formatAddressParts([
      neighbourhood,
      data.locality || data.local,
      data.city,
      data.principalSubdivision,
    ])
  } catch {
    return ''
  }
}

/** OpenStreetMap Nominatim — high zoom for street-level label */
async function reverseGeocodeNominatim(
  lat: number,
  lng: number,
): Promise<string> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      { headers: { Accept: 'application/json' } },
    )
    if (!res.ok) return ''
    const data = (await res.json()) as {
      display_name?: string
      name?: string
      address?: Record<string, string>
    }
    const a = data.address
    if (a) {
      return formatAddressParts([
        a.house_number
          ? `${a.road || ''} ${a.house_number}`.trim()
          : a.road || a.pedestrian,
        a.neighbourhood || a.suburb || a.quarter,
        a.village || a.town || a.city_district || a.city,
        a.state_district || a.state,
      ])
    }
    return (
      data.name || data.display_name?.split(',').slice(0, 3).join(',') || ''
    )
  } catch {
    return ''
  }
}

/** Prefer the more detailed of two free reverse-geocode sources */
export async function reverseGeocode(
  lat: number,
  lng: number,
): Promise<string> {
  const [a, b] = await Promise.all([
    reverseGeocodeBigData(lat, lng),
    reverseGeocodeNominatim(lat, lng),
  ])
  if (a && b) return a.length >= b.length ? a : b
  return a || b || ''
}

export interface PlaceSuggestion {
  lat: number
  lng: number
  label: string
}

/** Search places in Sri Lanka for “define location”. */
export async function searchPlaces(
  query: string,
): Promise<PlaceSuggestion[]> {
  const q = query.trim()
  if (q.length < 2) return []
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(q)}&countrycodes=lk&limit=6&addressdetails=1`,
      { headers: { Accept: 'application/json' } },
    )
    if (!res.ok) return []
    const data = (await res.json()) as Array<{
      lat: string
      lon: string
      display_name: string
      name?: string
    }>
    return data.map((item) => ({
      lat: Number(item.lat),
      lng: Number(item.lon),
      label: item.name
        ? `${item.name} — ${item.display_name.split(',').slice(1, 3).join(',').trim()}`
        : item.display_name.split(',').slice(0, 3).join(','),
    }))
  } catch {
    return []
  }
}

export interface AccuratePosition {
  lat: number
  lng: number
  accuracyMeters: number
}

/**
 * Fresh GPS only (no cache). Watches until accuracy is good or timeout.
 * Best for phones with GPS on — desktop Wi‑Fi location is often wrong.
 */
export function getAccuratePosition(
  options: {
    /** Stop early when accuracy is at least this good (meters) */
    targetAccuracy?: number
    /** Max wait in ms */
    timeoutMs?: number
  } = {},
): Promise<AccuratePosition> {
  const targetAccuracy = options.targetAccuracy ?? 40
  const timeoutMs = options.timeoutMs ?? 18000

  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported on this device'))
      return
    }

    let best: AccuratePosition | null = null
    let settled = false

    const finish = (pos: AccuratePosition) => {
      if (settled) return
      settled = true
      window.clearTimeout(timer)
      navigator.geolocation.clearWatch(watchId)
      resolve(pos)
    }

    const fail = (err: GeolocationPositionError | Error) => {
      if (settled) return
      if (best && best.accuracyMeters <= 250) {
        finish(best)
        return
      }
      settled = true
      window.clearTimeout(timer)
      navigator.geolocation.clearWatch(watchId)
      reject(err)
    }

    const timer = window.setTimeout(() => {
      if (best) {
        finish(best)
      } else {
        fail(new Error('Location timed out. Turn on GPS and try again.'))
      }
    }, timeoutMs)

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const next: AccuratePosition = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracyMeters: pos.coords.accuracy || 9999,
        }
        if (!best || next.accuracyMeters < best.accuracyMeters) {
          best = next
        }
        if (best.accuracyMeters <= targetAccuracy) {
          finish(best)
        }
      },
      (err) => fail(err),
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: timeoutMs,
      },
    )
  })
}

export function getCurrentPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported on this device'))
      return
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 18000,
      maximumAge: 0,
    })
  })
}

export function geolocationErrorMessage(err: unknown): string {
  if (err && typeof err === 'object' && 'code' in err) {
    const code = (err as GeolocationPositionError).code
    if (code === 1)
      return 'Location permission denied. Allow location in browser settings, or use Define location.'
    if (code === 2)
      return 'GPS unavailable. Turn on location services, or use Define location.'
    if (code === 3)
      return 'Location timed out. Use your phone with GPS on, or Define location.'
  }
  if (err instanceof Error) return err.message
  return 'Could not get GPS. Use Define location to pin the exact spot.'
}

export function isLowAccuracy(accuracyMeters?: number): boolean {
  return accuracyMeters != null && accuracyMeters > 100
}
