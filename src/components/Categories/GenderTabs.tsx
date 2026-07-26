import type { Gender } from '../../types'

interface GenderTabsProps {
  value: Gender
  onChange: (gender: Gender) => void
}

const TABS: { label: string; value: Gender }[] = [
  { label: 'Girls', value: 'girls' },
  { label: 'Boys', value: 'boys' },
  { label: 'All', value: 'all' },
]

export default function GenderTabs({ value, onChange }: GenderTabsProps) {
  return (
    <div className="flex justify-center">
      <div className="inline-flex rounded-full bg-white p-1 shadow-sm ring-1 ring-border">
        {TABS.map((tab) => {
          const active = value === tab.value
          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => onChange(tab.value)}
              className={`rounded-full px-5 py-2 text-sm font-semibold transition sm:px-7 ${
                active
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
