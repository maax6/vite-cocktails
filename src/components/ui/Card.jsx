export function Card({ children, className = '', ...props }) {
  return (
    <article
      className={`group glass-panel overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-glow ${className}`}
      {...props}
    >
      {children}
    </article>
  )
}

export function CardMedia({ src, alt, className = '' }) {
  if (!src) return null
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <img
        src={src}
        alt={alt}
        loading="lazy"
        className="aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-canvas via-canvas/20 to-transparent opacity-90" />
      <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-accent/15" />
    </div>
  )
}

export function CardBody({ children, className = '' }) {
  return (
    <div className={`flex flex-1 flex-col gap-3 p-5 ${className}`}>
      {children}
    </div>
  )
}
