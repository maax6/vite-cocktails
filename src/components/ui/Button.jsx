export function Button({
  children,
  variant = 'primary',
  className = '',
  type = 'button',
  disabled = false,
  ...props
}) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold tracking-wide transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas disabled:pointer-events-none disabled:opacity-50'

  const variants = {
    primary:
      'bg-accent text-canvas shadow-glow hover:bg-accent-soft hover:shadow-[0_0_48px_-8px_rgba(232,168,124,0.5)] active:scale-[0.98]',
    ghost:
      'bg-transparent text-ink-muted hover:bg-glass-hover hover:text-ink border border-transparent hover:border-glass-border',
    outline:
      'border border-glass-border bg-glass-fill text-ink hover:bg-glass-hover hover:border-accent/30',
  }

  return (
    <button
      type={type}
      disabled={disabled}
      className={`${base} ${variants[variant] || variants.primary} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
