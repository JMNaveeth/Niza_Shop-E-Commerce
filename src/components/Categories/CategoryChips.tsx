import type { Category, Gender } from '../../types'

interface CategoryChipsProps {
  categories: Category[]
  gender: Gender
  selectedSlug: string | null
  onSelect: (slug: string | null) => void
}

export default function CategoryChips({
  categories,
  gender,
  selectedSlug,
  onSelect,
}: CategoryChipsProps) {
  const filtered =
    gender === 'all'
      ? categories
      : categories.filter((c) => c.gender === gender || c.gender === 'unisex')

  return (
    <div className="scrollbar-hide -mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
      <button
        type="button"
        onClick={() => onSelect(null)}
        className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition ${
          selectedSlug === null
            ? 'bg-dark text-white'
            : 'bg-white text-gray-700 ring-1 ring-border hover:bg-gray-50'
        }`}
      >
        All
      </button>
      {filtered.map((cat) => {
        const active = selectedSlug === cat.slug
        return (
          <button
            key={cat.id}
            type="button"
            onClick={() => onSelect(active ? null : cat.slug)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition ${
              active
                ? 'bg-dark text-white'
                : 'bg-white text-gray-700 ring-1 ring-border hover:bg-gray-50'
            }`}
          >
            <span className="mr-1.5">{cat.icon}</span>
            {cat.name}
          </button>
        )
      })}
    </div>
  )
}
