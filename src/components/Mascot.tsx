import type { MascotMood } from '../lib/mascotMood'

interface Props {
  size?: number
  mood?: MascotMood
  className?: string
  /** Decorative avatars shouldn't be announced by screen readers. */
  decorative?: boolean
}

/**
 * Mira — the friendly companion mascot. A soft teal "reflection droplet"
 * with a face. Rendered as pure SVG so it scales crisply and themes with the
 * brand accent.
 */
export default function Mascot({ size = 40, mood = 'happy', className = '', decorative = false }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      role={decorative ? undefined : 'img'}
      aria-label={decorative ? undefined : 'Mira'}
      aria-hidden={decorative || undefined}
    >
      <defs>
        <linearGradient id="mira-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--accent)" />
          <stop offset="100%" stopColor="var(--accent-strong)" />
        </linearGradient>
      </defs>

      {/* body — a rounded droplet */}
      <path
        d="M50 8 C74 30 86 46 86 62 A36 36 0 1 1 14 62 C14 46 26 30 50 8 Z"
        fill="url(#mira-body)"
      />

      {/* cheeks */}
      <ellipse cx="32" cy="66" rx="6" ry="4" fill="#ffffff" opacity="0.25" />
      <ellipse cx="68" cy="66" rx="6" ry="4" fill="#ffffff" opacity="0.25" />

      {/* eyes */}
      {mood === 'calm' ? (
        // content, relaxed ⌣ ⌣
        <>
          <path d="M34 56 q6 6 12 0" fill="none" stroke="#0b3b36" strokeWidth="4" strokeLinecap="round" />
          <path d="M54 56 q6 6 12 0" fill="none" stroke="#0b3b36" strokeWidth="4" strokeLinecap="round" />
        </>
      ) : mood === 'joy' ? (
        // bright, beaming happy squints — a fuller ⌣ ⌣
        <>
          <path d="M33 55 q7 8 14 0" fill="none" stroke="#0b3b36" strokeWidth="4" strokeLinecap="round" />
          <path d="M53 55 q7 8 14 0" fill="none" stroke="#0b3b36" strokeWidth="4" strokeLinecap="round" />
        </>
      ) : mood === 'down' ? (
        // soft, gentle ∩ ∩ — a caring, empathetic look (not cartoonishly sad)
        <>
          <path d="M34 57 q6 -4 12 0" fill="none" stroke="#0b3b36" strokeWidth="4" strokeLinecap="round" />
          <path d="M54 57 q6 -4 12 0" fill="none" stroke="#0b3b36" strokeWidth="4" strokeLinecap="round" />
        </>
      ) : (
        <>
          <circle cx="39" cy="56" r="6" fill="#0b3b36" />
          <circle cx="61" cy="56" r="6" fill="#0b3b36" />
          <circle cx="41" cy="54" r="2" fill="#ffffff" />
          <circle cx="63" cy="54" r="2" fill="#ffffff" />
        </>
      )}

      {/* mouth */}
      {mood === 'thinking' ? (
        <circle cx="50" cy="72" r="3.5" fill="#0b3b36" />
      ) : mood === 'joy' ? (
        // big, open, joyful grin
        <path d="M39 69 Q50 84 61 69 Z" fill="#0b3b36" stroke="#0b3b36" strokeWidth="2" strokeLinejoin="round" />
      ) : mood === 'down' ? (
        // small, gentle, softly-downturned mouth
        <path d="M43 73 q7 -3 14 0" fill="none" stroke="#0b3b36" strokeWidth="4" strokeLinecap="round" />
      ) : (
        <path d="M42 70 q8 8 16 0" fill="none" stroke="#0b3b36" strokeWidth="4" strokeLinecap="round" />
      )}

      {/* little shine, the "mirror" nod */}
      <path d="M40 22 q-10 8 -10 20" fill="none" stroke="#ffffff" strokeWidth="5" strokeLinecap="round" opacity="0.7" />
    </svg>
  )
}
