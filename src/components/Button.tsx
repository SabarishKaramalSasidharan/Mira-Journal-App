import type { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'neutral' | 'ghost'
type Size = 'sm' | 'md' | 'lg'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
}

const SIZES: Record<Size, string> = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-5 py-2.5 text-[15px]',
  lg: 'px-6 py-3.5 text-base w-full',
}

/**
 * Chunky "3D" button — the signature playful press. The colored bottom edge
 * is a solid box-shadow that collapses on :active (see .btn3d in index.css).
 */
export default function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  style,
  ...rest
}: Props) {
  const edge =
    variant === 'primary'
      ? 'var(--accent-strong)'
      : variant === 'neutral'
        ? 'var(--border)'
        : 'transparent'

  const base =
    variant === 'primary'
      ? 'bg-accent text-on-accent'
      : variant === 'neutral'
        ? 'bg-surface text-content'
        : 'bg-transparent text-soft'

  return (
    <button
      {...rest}
      className={`btn3d disabled:opacity-40 disabled:active:translate-y-0 ${base} ${SIZES[size]} ${className}`}
      style={{
        boxShadow: variant === 'ghost' ? 'none' : `0 4px 0 0 ${edge}`,
        ...style,
      }}
    />
  )
}
