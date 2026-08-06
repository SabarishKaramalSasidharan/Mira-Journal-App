import { useCallback, useEffect, useRef, useState } from 'react'
import { Delete } from 'lucide-react'
import { verifyPin, type LockConfig } from '../lib/storage'
import Mascot from './Mascot'

interface Props {
  config: LockConfig
  onUnlock: () => void
}

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'] as const

/**
 * Full-screen PIN gate shown at cold launch when an app lock is set. Brand
 * styled, mascot-led, numeric keypad with an error shake on a wrong PIN. Purely
 * a UI gate (see security note in storage.ts) — the local data is not encrypted.
 */
export default function LockScreen({ config, onUnlock }: Props) {
  const [pin, setPin] = useState('')
  const [error, setError] = useState(false)
  const [checking, setChecking] = useState(false)
  const frameRef = useRef<HTMLDivElement>(null)

  const submit = useCallback(
    async (value: string) => {
      setChecking(true)
      const ok = await verifyPin(value, config)
      setChecking(false)
      if (ok) {
        onUnlock()
      } else {
        setError(true)
        setPin('')
        // Clear the error class after the shake so it can retrigger.
        window.setTimeout(() => setError(false), 450)
      }
    },
    [config, onUnlock],
  )

  const press = useCallback(
    (digit: string) => {
      if (checking) return
      setPin((prev) => {
        if (prev.length >= config.length) return prev
        const next = prev + digit
        if (next.length === config.length) void submit(next)
        return next
      })
    },
    [checking, config.length, submit],
  )

  const backspace = useCallback(() => {
    setError(false)
    setPin((prev) => prev.slice(0, -1))
  }, [])

  // Physical keyboard support.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        e.preventDefault()
        press(e.key)
      } else if (e.key === 'Backspace') {
        e.preventDefault()
        backspace()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [press, backspace])

  // Move focus into the lock so it's obvious where you are.
  useEffect(() => {
    frameRef.current?.focus()
  }, [])

  return (
    <div
      className="absolute inset-0 z-40 flex flex-col items-center justify-center gap-8 bg-bg px-8"
      role="dialog"
      aria-modal="true"
      aria-label="App locked. Enter your PIN to unlock."
    >
      <div
        ref={frameRef}
        tabIndex={-1}
        className={`flex flex-col items-center gap-5 outline-none ${error ? 'animate-shake' : ''}`}
      >
        <Mascot size={72} mood="calm" className="animate-bob" />
        <div className="text-center">
          <h1 className="font-display text-2xl font-semibold text-content">Mira is locked</h1>
          <p className="mt-1 text-sm font-medium text-mute">
            {error ? 'Wrong PIN — try again' : 'Enter your PIN to continue'}
          </p>
        </div>

        {/* PIN dots */}
        <div
          className="flex items-center gap-3"
          role="status"
          aria-live="polite"
          aria-label={`${pin.length} of ${config.length} digits entered`}
        >
          {Array.from({ length: config.length }).map((_, i) => (
            <span
              key={i}
              className={`h-3.5 w-3.5 rounded-full transition-all ${
                i < pin.length ? 'scale-100 bg-accent' : 'scale-90 bg-border'
              }`}
              aria-hidden="true"
            />
          ))}
        </div>
      </div>

      {/* Keypad */}
      <div className="grid w-full max-w-[260px] grid-cols-3 gap-3" role="group" aria-label="PIN keypad">
        {KEYS.map((k, i) => {
          if (k === '') return <span key={`sp-${i}`} aria-hidden="true" />
          if (k === 'del') {
            return (
              <button
                key="del"
                type="button"
                onClick={backspace}
                disabled={checking || pin.length === 0}
                className="grid h-16 place-items-center rounded-2xl text-soft transition active:scale-90 disabled:opacity-40"
                aria-label="Delete last digit"
              >
                <Delete size={22} aria-hidden="true" />
              </button>
            )
          }
          return (
            <button
              key={k}
              type="button"
              onClick={() => press(k)}
              disabled={checking}
              className="grid h-16 place-items-center rounded-2xl bg-surface font-display text-2xl font-semibold text-content shadow-sm transition active:scale-90 disabled:opacity-60"
              aria-label={`Digit ${k}`}
            >
              {k}
            </button>
          )
        })}
      </div>
    </div>
  )
}
