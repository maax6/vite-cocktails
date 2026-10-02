import { Card, CardBody, CardMedia } from '../ui/Card'
import { ingredientParts } from '../../lib/recipes.mjs'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { FiHeart } from 'react-icons/fi'

export function CocktailCard({ cocktail, favorite, onFavorite, style }) {
   const { name, method, ingredients, image, glass, garnish, source, season } =
      cocktail
   return (
      <Card className="flex min-w-0 flex-col animate-fade-up" style={style}>
         <CardMedia src={image} alt={name} />
         <CardBody>
            <div className="flex items-start justify-between gap-2">
               <div className="min-w-0">
                  <Badge>
                     {source === 'api'
                        ? 'TheCocktailDB'
                        : season === 'ski'
                        ? 'Semaine ski'
                        : 'Cocktail Classique Maxime'}
                  </Badge>
                  <h2 className="mt-3 break-words font-display text-2xl font-semibold text-ink">
                     {name}
                  </h2>
               </div>
               <Button
                  variant="ghost"
                  className="shrink-0 px-3"
                  onClick={() => onFavorite(cocktail)}
                  aria-pressed={favorite}
                  aria-label={`${favorite ? 'Retirer' : 'Ajouter'} ${name} ${
                     favorite ? 'des' : 'aux'
                  } favoris`}
               >
                  <FiHeart
                     className={favorite ? 'fill-accent text-accent' : ''}
                     aria-hidden
                  />
               </Button>
            </div>
            <ul className="my-2 space-y-3">
               {ingredients.map((ingredient, index) => {
                  const item = ingredientParts(ingredient)
                  return (
                     <li
                        key={index}
                        className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-accent/10 pb-2"
                     >
                        <span className="min-w-0 flex-1 basis-24 break-words text-sm text-ink-muted">
                           {item.name}
                        </span>
                        {item.amount && (
                           <strong className="ml-auto max-w-full break-words text-right text-2xl font-semibold tabular-nums text-accent-soft">
                              {item.amount}
                           </strong>
                        )}
                     </li>
                  )
               })}
            </ul>
            <p className="whitespace-pre-line break-words text-sm leading-relaxed text-ink-muted">
               {method || 'Méthode non renseignée.'}
            </p>
            <dl className="mt-auto grid grid-cols-2 gap-3 pt-4 text-sm">
               <div>
                  <dt className="text-xs uppercase tracking-widest text-accent">
                     Verre
                  </dt>
                  <dd className="mt-1 break-words">
                     {glass || 'Non renseigné'}
                  </dd>
               </div>
               <div>
                  <dt className="text-xs uppercase tracking-widest text-accent">
                     Garniture
                  </dt>
                  <dd className="mt-1 break-words">
                     {garnish || 'Non renseignée'}
                  </dd>
               </div>
            </dl>
         </CardBody>
      </Card>
   )
}
