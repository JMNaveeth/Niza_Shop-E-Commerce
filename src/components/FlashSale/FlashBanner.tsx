import { useEffect, useState } from 'react'
import { useCatalogStore } from '../../store/catalogStore'

function getRemaining(endAt: Date) {
  const diff = Math.max(0, endAt.getTime() - Date.now())
  const hours = Math.floor(diff / 3_600_000)
  const minutes = Math.floor((diff % 3_600_000) / 60_000)
  const seconds = Math.floor((diff % 60_000) / 1000)
  return { hours, minutes, seconds, expired: diff === 0 }
}

function pad(n: number) {
  return String(n).padStart(2, '0')
}

export default function FlashBanner() {
  const offers = useCatalogStore((s) => s.offers)
  const deadline = new Date(offers.flashSaleEndsAt)
  const [time, setTime] = useState(() => getRemaining(deadline))

  useEffect(() => {
    setTime(getRemaining(new Date(offers.flashSaleEndsAt)))
    const id = window.setInterval(() => {
      setTime(getRemaining(new Date(offers.flashSaleEndsAt)))
    }, 1000)
    return () => window.clearInterval(id)
  }, [offers.flashSaleEndsAt])

  if (!offers.flashSaleEnabled || time.expired) return null

  return (
    <div className="overflow-hidden rounded-card bg-gradient-to-r from-primary via-[#c026a0] to-purple px-4 py-3 text-white shadow-md">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-lg" aria-hidden>
            ⚡
          </span>
          <div>
            <p className="text-sm font-bold uppercase tracking-wide">
              {offers.flashSaleTitle}
            </p>
            <p className="text-xs text-white/85">{offers.flashSaleSubtitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 font-mono text-sm font-bold sm:text-base">
          {[
            { label: 'H', value: time.hours },
            { label: 'M', value: time.minutes },
            { label: 'S', value: time.seconds },
          ].map((unit, i) => (
            <div key={unit.label} className="flex items-center gap-1.5">
              {i > 0 && <span className="opacity-70">:</span>}
              <div className="min-w-[3rem] rounded-lg bg-black/25 px-2.5 py-1.5 text-center">
                <div>{pad(unit.value)}</div>
                <div className="text-[10px] font-medium uppercase tracking-wider opacity-80">
                  {unit.label}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
