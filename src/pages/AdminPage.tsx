import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import type { Session } from '@supabase/supabase-js'
import Dashboard from '../components/Admin/Dashboard'
import { isSupabaseConfigured, supabase } from '../lib/supabase'

const DEMO_PASSWORD = 'niza-admin'

export default function AdminPage() {
  const [session, setSession] = useState<Session | null>(null)
  const [demoAuthed, setDemoAuthed] = useState(
    () => sessionStorage.getItem('niza-admin-demo') === '1',
  )
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!supabase) return

    void supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next)
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  const authenticated = Boolean(session) || demoAuthed

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      if (isSupabaseConfigured && supabase) {
        const { error: authError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (authError) throw authError
      } else {
        if (password === DEMO_PASSWORD) {
          sessionStorage.setItem('niza-admin-demo', '1')
          setDemoAuthed(true)
        } else {
          throw new Error(`Demo mode: use password "${DEMO_PASSWORD}"`)
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    sessionStorage.removeItem('niza-admin-demo')
    setDemoAuthed(false)
    if (supabase) await supabase.auth.signOut()
  }

  if (!authenticated) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12">
        <Link to="/" className="mb-6 text-sm text-primary hover:underline">
          ← Back to shop
        </Link>
        <div className="rounded-card bg-white p-6 shadow-sm ring-1 ring-border">
          <h1 className="text-2xl font-bold text-gray-900">Admin Login</h1>
          <p className="mt-1 text-sm text-gray-500">
            {isSupabaseConfigured
              ? 'Sign in with your Supabase account'
              : `Demo password: ${DEMO_PASSWORD}`}
          </p>
          <form onSubmit={(e) => void handleLogin(e)} className="mt-6 space-y-4">
            {isSupabaseConfigured && (
              <label className="block">
                <span className="mb-1 block text-sm font-medium">Email</span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-border px-3 py-2.5"
                />
              </label>
            )}
            <label className="block">
              <span className="mb-1 block text-sm font-medium">Password</span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-border px-3 py-2.5"
              />
            </label>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-dark py-3 font-semibold text-white disabled:opacity-60"
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-3 py-6 sm:px-4 sm:py-8">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 sm:mb-6">
        <div>
          <Link to="/" className="inline-flex min-h-10 items-center text-sm font-semibold text-primary">
            ← Back to shop
          </Link>
          <h1 className="mt-2 text-xl font-bold text-gray-900 sm:text-2xl">Admin Panel</h1>
        </div>
        <button
          type="button"
          onClick={() => void handleLogout()}
          className="min-h-11 rounded-full bg-gray-100 px-4 text-sm font-semibold text-gray-700"
        >
          Log out
        </button>
      </div>
      <Dashboard />
    </div>
  )
}
