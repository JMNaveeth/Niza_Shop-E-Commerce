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
    <div className="flex w-full justify-center">
      <div className="grid w-full max-w-md grid-cols-3 rounded-full bg-white p-1 shadow-sm ring-1 ring-border sm:inline-flex sm:w-auto sm:max-w-none">
        {TABS.map((tab) => {
          const active = value === tab.value
          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => onChange(tab.value)}
              className={`min-h-11 rounded-full px-3 text-sm font-bold transition sm:px-7 ${
                active
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-gray-600 active:bg-gray-50'
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
