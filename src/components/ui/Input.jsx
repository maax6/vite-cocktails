export function Input({ className = '', ...props }) {
  return (
    <input
      className={`w-full rounded-xl border border-glass-border bg-canvas-elev/80 px-4 py-3 text-ink placeholder:text-ink-faint shadow-soft transition-all duration-200 focus:border-accent/50 focus:bg-canvas-soft focus:outline-none focus:ring-2 focus:ring-accent/30 ${className}`}
      {...props}
    />
  )
}
