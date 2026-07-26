import { useCartStore } from '../store/cartStore'

export default function Toast() {
  const toast = useCartStore((s) => s.toast)
  if (!toast) return null

  return (
    <div className="pointer-events-none fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 animate-toast-in">
      <div className="rounded-full bg-dark px-5 py-3 text-sm font-medium text-white shadow-xl">
        {toast}
      </div>
    </div>
  )
}
