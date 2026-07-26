import type { Product, ShopOffers } from '../types'

/** True only while flash banner is on AND the countdown has not finished. */
export function isFlashSaleLive(offers: ShopOffers, now = Date.now()): boolean {
  if (!offers.flashSaleEnabled) return false
  const ends = new Date(offers.flashSaleEndsAt).getTime()
  return Number.isFinite(ends) && ends > now
}

/**
 * Selling price customers pay.
 * Flash-tagged items use the deal `price` only while the timer is live;
 * after it ends they automatically revert to `original_price` (regular price).
 */
export function getEffectivePrice(
  product: Product,
  offers: ShopOffers,
  now = Date.now(),
): number {
  if (product.is_flash_sale && !isFlashSaleLive(offers, now)) {
    return product.original_price > 0 ? product.original_price : product.price
  }
  return product.price
}

/** Strikethrough “was” price — only while a real discount is active. */
export function getCompareAtPrice(
  product: Product,
  offers: ShopOffers,
  now = Date.now(),
): number | null {
  const selling = getEffectivePrice(product, offers, now)
  if (product.original_price > selling) return product.original_price
  return null
}

export function getDiscountPercent(
  product: Product,
  offers: ShopOffers,
  now = Date.now(),
): number {
  const selling = getEffectivePrice(product, offers, now)
  const compare = getCompareAtPrice(product, offers, now)
  if (!compare || compare <= selling) return 0
  return Math.round(((compare - selling) / compare) * 100)
}
