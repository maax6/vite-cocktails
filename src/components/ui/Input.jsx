export function Input({ className = '', ...props }) {
  return (
    <input
      className={`w-full rounded-xl border border-accent/20 bg-canvas-elev/90 px-4 py-3.5 text-ink placeholder:text-ink-faint shadow-soft transition-all duration-200 focus:border-accent/55 focus:bg-canvas-soft focus:outline-none focus:ring-2 focus:ring-accent/25 ${className}`}
      {...props}
    />
  )
}
