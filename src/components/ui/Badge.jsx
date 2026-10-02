export function Badge({ children, className = '' }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border border-glass-border bg-canvas-elev/70 px-2.5 py-1 text-xs font-medium text-ink-muted transition-colors duration-200 hover:border-accent/30 hover:text-accent-soft ${className}`}
    >
      {children}
    </span>
  )
}
