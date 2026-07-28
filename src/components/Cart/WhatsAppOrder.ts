import type { CartItem } from '../../types'
import { DELIVERY_FEE } from '../../types'
import { supabase, isSupabaseConfigured } from '../../lib/supabase'
import { useCatalogStore } from '../../store/catalogStore'
import { getEffectivePrice } from '../../lib/pricing'

export function formatLkr(amount: number): string {
  return `Rs. ${amount.toLocaleString('en-LK')}`
}

/** Digits only, for WhatsApp / storage */
export function normalizePhone(input: string): string {
  return input.replace(/\D/g, '')
}

/**
 * Sri Lankan mobile validation:
 * 07XXXXXXXX (10 digits) or +947XXXXXXXX / 947XXXXXXXX
 */
export function isValidSriLankaMobile(input: string): boolean {
  const digits = normalizePhone(input)
  if (/^07\d{8}$/.test(digits)) return true
  if (/^947\d{8}$/.test(digits)) return true
  return false
}

/** Format for display: 07X XXX XXXX */
export function formatPhoneDisplay(input: string): string {
  const digits = normalizePhone(input)
  let local = digits
  if (digits.startsWith('94') && digits.length >= 11) {
    local = `0${digits.slice(2)}`
  }
  if (local.length <= 3) return local
  if (local.length <= 6) return `${local.slice(0, 3)} ${local.slice(3)}`
  return `${local.slice(0, 3)} ${local.slice(3, 6)} ${local.slice(6, 10)}`
}

export interface CustomerDetails {
  name: string
  phone: string
  address: string
}

function getDeliveryFee(): number {
  return useCatalogStore.getState().getDeliveryFee() || DELIVERY_FEE
}

function linePrice(item: CartItem): number {
  return getEffectivePrice(item.product, useCatalogStore.getState().offers)
}

export function buildWhatsAppMessage(
  customer: CustomerDetails,
  items: CartItem[],
  subtotal: number,
): string {
  const delivery = getDeliveryFee()
  const grandTotal = subtotal + delivery

  const lines = items.map((item, index) => {
    const lineTotal = linePrice(item) * item.quantity
    return `${index + 1}. ${item.product.emoji} ${item.product.name} (x${item.quantity}) — ${formatLkr(lineTotal)}`
  })

  return [
    '🛍️ *Niza Shop — New Order!*',
    '',
    `👤 *Customer:* ${customer.name}`,
    `📞 *Phone:* ${customer.phone}`,
    `📍 *Address:* ${customer.address}`,
    '',
    '📦 *Order Items:*',
    ...lines,
    '',
    `💰 *Subtotal:* ${formatLkr(subtotal)}`,
    `🚚 *Delivery:* ${formatLkr(delivery)}`,
    `💳 *Grand Total:* ${formatLkr(grandTotal)}`,
    '',
    'Please confirm my order! ✅',
  ].join('\n')
}

export function getWhatsAppUrl(message: string): string {
  const phone =
    (import.meta.env.VITE_WHATSAPP_NUMBER as string | undefined) || '94XXXXXXXXX'
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
}

export async function saveOrderToSupabase(
  customer: CustomerDetails,
  items: CartItem[],
  subtotal: number,
): Promise<void> {
  if (!isSupabaseConfigured || !supabase) return

  const delivery = getDeliveryFee()
  const orderItems = items.map((i) => ({
    product_id: i.product.id,
    name: i.product.name,
    emoji: i.product.emoji,
    quantity: i.quantity,
    price: linePrice(i),
    color: i.selectedColor,
    size: i.selectedSize,
  }))

  const payload = {
    customer_name: customer.name,
    customer_phone: customer.phone,
    items: orderItems,
    subtotal,
    delivery_fee: delivery,
    grand_total: subtotal + delivery,
    status: 'pending',
    whatsapp_sent_at: new Date().toISOString(),
  }

  const { error } = await supabase.from('orders').insert({
    ...payload,
    customer_address: customer.address,
  })

  if (error) {
    await supabase.from('orders').insert(payload)
  }
}

export function openWhatsAppOrder(
  customer: CustomerDetails,
  items: CartItem[],
  subtotal: number,
): void {
  const message = buildWhatsAppMessage(customer, items, subtotal)
  const url = getWhatsAppUrl(message)
  window.open(url, '_blank', 'noopener,noreferrer')
}
