import { Card, CardBody, CardMedia } from '../ui/Card'
import { Badge } from '../ui/Badge'

function formatName(name) {
  if (!name) return ''
  return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase()
}

export function CocktailCard({ cocktail, style }) {
  const { name, instructions, ingredients, image } = cocktail

  return (
    <Card className="flex flex-col animate-fade-up" style={style}>
      <CardMedia src={image} alt={name} />
      <CardBody>
        <h3 className="font-display text-xl font-semibold tracking-tight text-ink transition-colors group-hover:text-accent-soft">
          {formatName(name)}
        </h3>

        {ingredients?.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {ingredients.map((ingredient) => (
              <Badge key={ingredient}>{ingredient}</Badge>
            ))}
          </div>
        ) : null}

        {instructions ? (
          <p className="mt-auto text-sm leading-relaxed text-ink-muted/95 line-clamp-5">
            {instructions}
          </p>
        ) : null}
      </CardBody>
    </Card>
  )
}
