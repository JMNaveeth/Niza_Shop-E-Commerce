import { useEffect, useState } from 'react'
import { useCatalogStore } from '../store/catalogStore'
import {
  getCompareAtPrice,
  getDiscountPercent,
  getEffectivePrice,
  isFlashSaleLive,
} from '../lib/pricing'

/** Keeps UI in sync so prices flip the second the flash timer hits zero. */
export function useFlashSaleStatus() {
  const offers = useCatalogStore((s) => s.offers)
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (!offers.flashSaleEnabled) return
    const id = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(id)
  }, [offers.flashSaleEnabled, offers.flashSaleEndsAt])

  const live = isFlashSaleLive(offers, now)

  return {
    offers,
    now,
    live,
    getPrice: (product: Parameters<typeof getEffectivePrice>[0]) =>
      getEffectivePrice(product, offers, now),
    getCompareAt: (product: Parameters<typeof getCompareAtPrice>[0]) =>
      getCompareAtPrice(product, offers, now),
    getDiscount: (product: Parameters<typeof getDiscountPercent>[0]) =>
      getDiscountPercent(product, offers, now),
  }
}
