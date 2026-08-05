import { useEffect, useState } from 'react'

const COLORS = ['var(--accent)', 'var(--gold)', 'var(--flame)', 'var(--mood-good)', 'var(--mood-rough)']

interface Piece {
  id: number
  left: number
  delay: number
  color: string
  size: number
}

/** Lightweight confetti burst for milestone moments. Self-clears. */
export default function Celebration({ show, onDone }: { show: boolean; onDone?: () => void }) {
  const [pieces, setPieces] = useState<Piece[]>([])

  useEffect(() => {
    if (!show) return
    const next: Piece[] = Array.from({ length: 48 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 0.5,
      color: COLORS[i % COLORS.length],
      size: 7 + Math.random() * 9,
    }))
    setPieces(next)
    const t = setTimeout(() => {
      setPieces([])
      onDone?.()
    }, 2600)
    return () => clearTimeout(t)
  }, [show, onDone])

  if (pieces.length === 0) return null

  return (
    <div className="pointer-events-none absolute inset-0 z-30 overflow-hidden" aria-hidden="true">
      {pieces.map((p) => (
        <span
          key={p.id}
          style={{
            position: 'absolute',
            top: '-8%',
            left: `${p.left}%`,
            width: p.size,
            height: p.size * 0.6,
            background: p.color,
            borderRadius: 2,
            animation: `confetti-fall ${1.5 + p.delay}s var(--ease-spring) ${p.delay}s forwards`,
          }}
        />
      ))}
    </div>
  )
}
