import { useCartStore } from '../store/cartStore'

export default function Toast() {
  const toast = useCartStore((s) => s.toast)
  if (!toast) return null

  return (
    <div className="pointer-events-none fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom,0px))] left-1/2 z-[60] w-[min(92vw,24rem)] -translate-x-1/2 animate-toast-in px-3 md:bottom-6">
      <div className="rounded-full bg-dark px-4 py-3 text-center text-sm font-medium text-white shadow-xl">
        {toast}
      </div>
    </div>
  )
}
