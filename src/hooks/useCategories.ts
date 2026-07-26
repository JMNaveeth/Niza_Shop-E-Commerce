import { useEffect, useState } from 'react'
import { SEED_CATEGORIES } from '../data/seed'
import { isSupabaseConfigured, supabase } from '../lib/supabase'
import type { Category } from '../types'

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>(SEED_CATEGORIES)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function load() {
      if (!isSupabaseConfigured || !supabase) {
        if (!cancelled) {
          setCategories(SEED_CATEGORIES)
          setLoading(false)
        }
        return
      }

      try {
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .order('name')

        if (error) throw error
        if (!cancelled) {
          setCategories(data && data.length > 0 ? (data as Category[]) : SEED_CATEGORIES)
        }
      } catch {
        if (!cancelled) setCategories(SEED_CATEGORIES)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [])

  return { categories, loading, setCategories }
}
