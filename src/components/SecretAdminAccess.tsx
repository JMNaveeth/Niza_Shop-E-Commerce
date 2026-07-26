import { useCallback, useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'

const SECRET_CODE = 'nizaadmin'
const BUFFER_RESET_MS = 2500

/**
 * Hidden admin entry:
 * - Type "nizaadmin" anywhere (when not in an input)
 * - Or tap the logo 5 times quickly, then type the same code
 */
export function useSecretAdminAccess(enabled = true) {
  const navigate = useNavigate()
  const bufferRef = useRef('')
  const timerRef = useRef<number | null>(null)
  const [promptOpen, setPromptOpen] = useState(false)

  const goAdmin = useCallback(() => {
    setPromptOpen(false)
    bufferRef.current = ''
    navigate('/admin')
  }, [navigate])

  const tryUnlock = useCallback(
    (value: string) => {
      if (value.trim().toLowerCase() === SECRET_CODE) {
        goAdmin()
        return true
      }
      return false
    },
    [goAdmin],
  )

  useEffect(() => {
    if (!enabled) return

    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      const tag = target?.tagName
      if (
        tag === 'INPUT' ||
        tag === 'TEXTAREA' ||
        tag === 'SELECT' ||
        target?.isContentEditable
      ) {
        return
      }

      if (e.key === 'Escape') {
        bufferRef.current = ''
        setPromptOpen(false)
        return
      }

      if (e.key.length !== 1 || e.ctrlKey || e.metaKey || e.altKey) return

      bufferRef.current = (bufferRef.current + e.key).toLowerCase().slice(-SECRET_CODE.length)

      if (timerRef.current) window.clearTimeout(timerRef.current)
      timerRef.current = window.setTimeout(() => {
        bufferRef.current = ''
      }, BUFFER_RESET_MS)

      if (bufferRef.current === SECRET_CODE) {
        goAdmin()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      if (timerRef.current) window.clearTimeout(timerRef.current)
    }
  }, [enabled, goAdmin])

  return {
    promptOpen,
    openPrompt: () => setPromptOpen(true),
    closePrompt: () => setPromptOpen(false),
    tryUnlock,
    secretHint: SECRET_CODE,
  }
}

interface AdminUnlockModalProps {
  open: boolean
  onClose: () => void
  onUnlock: (code: string) => boolean
}

export function AdminUnlockModal({ open, onClose, onUnlock }: AdminUnlockModalProps) {
  const [code, setCode] = useState('')
  const [error, setError] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) {
      setCode('')
      setError(false)
      return
    }
    const t = window.setTimeout(() => inputRef.current?.focus(), 50)
    return () => window.clearTimeout(t)
  }, [open])

  if (!open) return null

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!onUnlock(code)) {
      setError(true)
      setCode('')
      inputRef.current?.focus()
    }
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center">
      <button
        type="button"
        className="absolute inset-0 bg-black/55"
        aria-label="Close"
        onClick={onClose}
      />
      <form
        onSubmit={submit}
        className="relative z-10 w-full max-w-sm rounded-t-3xl bg-white p-5 shadow-2xl sm:rounded-3xl sm:p-6"
        style={{ paddingBottom: 'max(1.25rem, env(safe-area-inset-bottom))' }}
      >
        <p className="text-center text-2xl" aria-hidden>
          🔐
        </p>
        <h2 className="mt-2 text-center text-lg font-bold text-gray-900">Staff access</h2>
        <p className="mt-1 text-center text-sm text-gray-500">Enter access code to continue</p>
        <input
          ref={inputRef}
          type="password"
          autoComplete="off"
          value={code}
          onChange={(e) => {
            setCode(e.target.value)
            setError(false)
          }}
          placeholder="Access code"
          className={`mt-4 w-full rounded-xl border px-4 py-3 text-base outline-none focus:ring-2 ${
            error
              ? 'border-red-400 focus:ring-red-200'
              : 'border-border focus:border-primary focus:ring-primary/20'
          }`}
        />
        {error && (
          <p className="mt-2 text-center text-sm text-red-600">Wrong code. Try again.</p>
        )}
        <button
          type="submit"
          className="mt-4 min-h-12 w-full rounded-xl bg-dark text-sm font-bold text-white"
        >
          Enter
        </button>
      </form>
    </div>
  )
}
