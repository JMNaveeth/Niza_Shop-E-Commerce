import { useEffect, useState } from 'react'
import { useCatalogStore } from '../../store/catalogStore'

function getRemaining(endAt: Date) {
  const diff = Math.max(0, endAt.getTime() - Date.now())
  const hours = Math.floor(diff / 3_600_000)
  const minutes = Math.floor((diff % 3_600_000) / 60_000)
  const seconds = Math.floor((diff % 60_000) / 1000)
  return { hours, minutes, seconds, expired: diff === 0, totalMs: diff }
}

function pad(n: number) {
  return String(n).padStart(2, '0')
}

function TimerCell({
  value,
  label,
  urgent,
  pop,
}: {
  value: number
  label: string
  urgent: boolean
  pop?: boolean
}) {
  return (
    <div
      className={`relative min-w-[3.15rem] overflow-hidden rounded-2xl px-2.5 py-2 text-center shadow-lg sm:min-w-[3.6rem] sm:px-3 sm:py-2.5 ${
        urgent
          ? 'bg-gradient-to-b from-[#fff7ed] to-[#ffedd5] text-[#9a3412] ring-1 ring-white/50'
          : 'bg-white/15 text-white ring-1 ring-white/25 backdrop-blur-md'
      } ${pop ? 'animate-tick-pop' : ''}`}
    >
      <div
        className={`pointer-events-none absolute inset-x-0 top-0 h-1/2 ${
          urgent ? 'bg-white/40' : 'bg-white/10'
        }`}
      />
      <div className="relative font-mono text-lg font-black tabular-nums leading-none tracking-tight sm:text-xl">
        {pad(value)}
      </div>
      <div
        className={`relative mt-1 text-[9px] font-bold uppercase tracking-[0.18em] sm:text-[10px] ${
          urgent ? 'text-[#c2410c]/80' : 'text-white/75'
        }`}
      >
        {label}
      </div>
    </div>
  )
}

export default function FlashBanner() {
  const offers = useCatalogStore((s) => s.offers)
  const [time, setTime] = useState(() => getRemaining(new Date(offers.flashSaleEndsAt)))
  const [tickKey, setTickKey] = useState(0)

  useEffect(() => {
    setTime(getRemaining(new Date(offers.flashSaleEndsAt)))
    const id = window.setInterval(() => {
      setTime(getRemaining(new Date(offers.flashSaleEndsAt)))
      setTickKey((k) => k + 1)
    }, 1000)
    return () => window.clearInterval(id)
  }, [offers.flashSaleEndsAt])

  if (!offers.flashSaleEnabled || time.expired) return null

  const urgent = time.totalMs < 60 * 60 * 1000

  return (
    <div
      className={`relative overflow-hidden rounded-3xl text-white shadow-xl sm:rounded-[1.35rem] ${
        urgent
          ? 'bg-gradient-to-br from-[#ef4444] via-primary to-[#7c3aed] shadow-red-500/25'
          : 'bg-gradient-to-br from-[#ff2d9b] via-[#c026a0] to-[#6d28d9] shadow-primary/30'
      }`}
    >
      {/* Atmosphere layers */}
      <div className="pointer-events-none absolute -left-10 -top-12 h-36 w-36 rounded-full bg-gold/30 blur-3xl animate-soft-float" />
      <div className="pointer-events-none absolute -bottom-16 -right-8 h-40 w-40 rounded-full bg-white/20 blur-3xl" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.22),transparent_45%),radial-gradient(circle_at_85%_70%,rgba(245,158,11,0.25),transparent_40%)]" />

      {/* Sweeping shine */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/25 to-transparent animate-shimmer" />
      </div>

      {/* Dot pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage:
            'radial-gradient(circle, rgba(255,255,255,0.9) 1px, transparent 1px)',
          backgroundSize: '14px 14px',
        }}
      />

      <div className="relative flex flex-col gap-4 px-3.5 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-5 sm:px-5 sm:py-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="relative shrink-0">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-gold to-[#f97316] text-xl shadow-lg shadow-amber-500/40 animate-pulse-glow sm:h-14 sm:w-14 sm:text-2xl">
              <span className="animate-bolt-bounce" aria-hidden>
                ⚡
              </span>
            </div>
            <span className="absolute -right-1 -top-1 rounded-full bg-white px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wide text-primary shadow-sm">
              Hot
            </span>
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-base font-black uppercase tracking-[0.08em] drop-shadow-sm sm:text-lg">
                {offers.flashSaleTitle}
              </p>
              <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ring-1 ring-white/30 backdrop-blur-sm">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#4ade80]" />
                Live
              </span>
            </div>
            <p className="mt-1 text-xs leading-snug text-white/90 line-clamp-2 sm:text-sm">
              {offers.flashSaleSubtitle}
            </p>
            {urgent && (
              <p className="mt-1.5 text-[11px] font-bold uppercase tracking-wide text-amber-100">
                Ending soon — grab yours now
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col items-stretch gap-2 sm:items-end">
          <p className="text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-white/70 sm:text-right">
            Ends in
          </p>
          <div className="flex items-center justify-center gap-1.5 sm:justify-end sm:gap-2">
            <TimerCell value={time.hours} label="Hrs" urgent={urgent} />
            <span className="pb-4 text-lg font-black text-white/80 animate-pulse">:</span>
            <TimerCell value={time.minutes} label="Min" urgent={urgent} />
            <span className="pb-4 text-lg font-black text-white/80 animate-pulse">:</span>
            <TimerCell
              key={tickKey}
              value={time.seconds}
              label="Sec"
              urgent={urgent}
              pop
            />
          </div>
        </div>
      </div>
    </div>
  )
}
