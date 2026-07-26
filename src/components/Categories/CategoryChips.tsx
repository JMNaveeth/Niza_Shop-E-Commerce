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
    <div className="scrollbar-hide -mx-3 flex gap-2 overflow-x-auto overscroll-x-contain px-3 pb-1 snap-x-mandatory sm:-mx-4 sm:px-4">
      <button
        type="button"
        onClick={() => onSelect(null)}
        className={`snap-start shrink-0 rounded-full px-4 py-2.5 text-sm font-semibold transition touch-target ${
          selectedSlug === null
            ? 'bg-dark text-white'
            : 'bg-white text-gray-700 ring-1 ring-border active:bg-gray-50'
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
            className={`snap-start shrink-0 rounded-full px-4 py-2.5 text-sm font-semibold transition touch-target ${
              active
                ? 'bg-dark text-white'
                : 'bg-white text-gray-700 ring-1 ring-border active:bg-gray-50'
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
