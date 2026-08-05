import { useEffect, useState } from 'react'
import Mascot from './Mascot'

/**
 * Brand splash shown on cold start only. It mounts with <App/> (a full page /
 * PWA launch), so tab switches — which never remount App — don't retrigger it.
 * Holds briefly, fades out, then unmounts via onDone. Dismissal is always
 * guaranteed by the timeout; it can never block the app.
 */
const HOLD_MS = 1300
const FADE_MS = 450
// Reduced motion: a short static hold, no fade, no mascot bob.
const REDUCED_HOLD_MS = 600

export default function Splash({ onDone }: { onDone: () => void }) {
  const [reduced] = useState(
    () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false,
  )
  const [leaving, setLeaving] = useState(false)

  const fade = reduced ? 0 : FADE_MS

  useEffect(() => {
    const hold = reduced ? REDUCED_HOLD_MS : HOLD_MS
    const t1 = window.setTimeout(() => setLeaving(true), hold)
    const t2 = window.setTimeout(onDone, hold + fade)
    return () => {
      window.clearTimeout(t1)
      window.clearTimeout(t2)
    }
  }, [onDone, reduced, fade])

  return (
    <div
      role="status"
      aria-label="Mira is starting"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-bg"
      style={{
        opacity: leaving ? 0 : 1,
        transition: fade ? `opacity ${fade}ms ease-out` : undefined,
        pointerEvents: leaving ? 'none' : 'auto',
      }}
    >
      <div className={`flex flex-col items-center gap-4 ${reduced ? '' : 'animate-rise'}`}>
        <Mascot size={104} mood="joy" className={reduced ? '' : 'animate-bob'} decorative />
        <div className="flex flex-col items-center gap-1">
          <span className="font-display text-4xl font-semibold tracking-tight text-content">
            Mira
          </span>
          <span className="text-sm font-medium text-soft">think out loud</span>
        </div>
      </div>
    </div>
  )
}
