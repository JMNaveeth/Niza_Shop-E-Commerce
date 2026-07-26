import type { CartItem } from '../../types'
import { DELIVERY_FEE } from '../../types'
import { supabase, isSupabaseConfigured } from '../../lib/supabase'
import { useCatalogStore } from '../../store/catalogStore'

export function formatLkr(amount: number): string {
  return `Rs. ${amount.toLocaleString('en-LK')}`
}

function getDeliveryFee(): number {
  return useCatalogStore.getState().getDeliveryFee() || DELIVERY_FEE
}

export function buildWhatsAppMessage(
  customerName: string,
  items: CartItem[],
  subtotal: number,
): string {
  const delivery = getDeliveryFee()
  const grandTotal = subtotal + delivery

  const lines = items.map((item, index) => {
    const lineTotal = item.product.price * item.quantity
    return `${index + 1}. ${item.product.emoji} ${item.product.name} (x${item.quantity}) — ${formatLkr(lineTotal)}`
  })

  return [
    '🛍️ *Niza Shop — New Order!*',
    '',
    `👤 *Customer:* ${customerName}`,
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
  const phone = (import.meta.env.VITE_WHATSAPP_NUMBER as string | undefined) || '94XXXXXXXXX'
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
}

export async function saveOrderToSupabase(
  customerName: string,
  items: CartItem[],
  subtotal: number,
  customerPhone = '',
): Promise<void> {
  if (!isSupabaseConfigured || !supabase) return

  const delivery = getDeliveryFee()
  const orderItems = items.map((i) => ({
    product_id: i.product.id,
    name: i.product.name,
    emoji: i.product.emoji,
    quantity: i.quantity,
    price: i.product.price,
    color: i.selectedColor,
    size: i.selectedSize,
  }))

  await supabase.from('orders').insert({
    customer_name: customerName,
    customer_phone: customerPhone,
    items: orderItems,
    subtotal,
    delivery_fee: delivery,
    grand_total: subtotal + delivery,
    status: 'pending',
    whatsapp_sent_at: new Date().toISOString(),
  })
}

export function openWhatsAppOrder(
  customerName: string,
  items: CartItem[],
  subtotal: number,
): void {
  const message = buildWhatsAppMessage(customerName, items, subtotal)
  const url = getWhatsAppUrl(message)
  window.open(url, '_blank', 'noopener,noreferrer')
}
