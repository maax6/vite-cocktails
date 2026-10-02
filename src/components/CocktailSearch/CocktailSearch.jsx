import { useEffect, useMemo, useState } from 'react'
import { FiSearch, FiShuffle, FiHeart } from 'react-icons/fi'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'
import { CocktailCard } from './CocktailCard'
import {
   filterRecipes,
   ingredientName,
   localPool,
   mapDrink,
   normalize,
   recipeKey,
   validateRecipes,
} from '../../lib/recipes.mjs'

const FAVORITES_KEY = 'speakeasy:favorites:v1'
const tabs = [
   ['api', 'API'],
   ['maison', 'Cocktail Classique Maxime'],
   ['ski', 'Semaine ski'],
]

function readFavorites() {
   try {
      const stored = JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]')
      if (!Array.isArray(stored)) return []
      const valid = stored.filter((recipe) => {
         try {
            validateRecipes([recipe])
            return true
         } catch {
            return false
         }
      })
      return [
         ...new Map(
            valid.map((recipe) => [recipeKey(recipe), recipe])
         ).values(),
      ]
   } catch {
      return []
   }
}

export function CocktailSearch() {
   const [tab, setTab] = useState('api')
   const [query, setQuery] = useState('')
   const [debounced, setDebounced] = useState('')
   const [recipes, setRecipes] = useState([])
   const [localLoading, setLocalLoading] = useState(true)
   const [localError, setLocalError] = useState('')
   const [apiData, setApiData] = useState([])
   const [apiLoading, setApiLoading] = useState(false)
   const [apiError, setApiError] = useState('')
   const [online, setOnline] = useState(navigator.onLine)
   const [spirit, setSpirit] = useState('')
   const [glass, setGlass] = useState('')
   const [available, setAvailable] = useState([])
   const [favorites, setFavorites] = useState(readFavorites)
   const [favoritesOnly, setFavoritesOnly] = useState(false)
   const [storageError, setStorageError] = useState('')
   const [random, setRandom] = useState(null)
   const [reload, setReload] = useState(0)

   useEffect(() => {
      const controller = new AbortController()
      setLocalLoading(true)
      setLocalError('')
      fetch(`${import.meta.env.BASE_URL}recipes.json`, {
         signal: controller.signal,
      })
         .then((response) => {
            if (!response.ok) throw new Error('Catalogue indisponible')
            return response.json()
         })
         .then(validateRecipes)
         .then((data) => {
            if (!controller.signal.aborted) setRecipes(data)
         })
         .catch(() => {
            if (!controller.signal.aborted)
               setLocalError(
                  'Impossible de charger le carnet. Vérifiez votre connexion puis réessayez.'
               )
         })
         .finally(() => {
            if (!controller.signal.aborted) setLocalLoading(false)
         })
      return () => controller.abort()
   }, [reload])

   useEffect(() => {
      const update = () => setOnline(navigator.onLine)
      window.addEventListener('online', update)
      window.addEventListener('offline', update)
      return () => {
         window.removeEventListener('online', update)
         window.removeEventListener('offline', update)
      }
   }, [])

   useEffect(() => {
      const timer = window.setTimeout(() => setDebounced(query), 350)
      return () => window.clearTimeout(timer)
   }, [query])

   useEffect(() => {
      const controller = new AbortController()
      setApiData([])
      setApiError('')
      setApiLoading(false)
      // Immediately cancel old results while a new query is being debounced.
      if (
         tab !== 'api' ||
         !online ||
         favoritesOnly ||
         !debounced.trim() ||
         query !== debounced
      )
         return
      setApiLoading(true)
      fetch(
         `https://www.thecocktaildb.com/api/json/v1/1/search.php?s=${encodeURIComponent(
            debounced.trim()
         )}`,
         { signal: controller.signal, cache: 'no-store' }
      )
         .then((response) => {
            if (!response.ok) throw new Error('API indisponible')
            return response.json()
         })
         .then((data) => {
            if (!controller.signal.aborted)
               setApiData((data.drinks || []).map(mapDrink))
         })
         .catch(() => {
            if (!controller.signal.aborted)
               setApiError(
                  'TheCocktailDB est indisponible. Réessayez ou consultez Cocktail Classique Maxime.'
               )
         })
         .finally(() => {
            if (!controller.signal.aborted) setApiLoading(false)
         })
      return () => controller.abort()
   }, [tab, online, favoritesOnly, debounced, query, reload])

   useEffect(() => {
      setRandom(null)
   }, [tab, query, spirit, glass, available, favoritesOnly])

   const pool = useMemo(() => localPool(recipes, tab), [recipes, tab])
   const options = (field) =>
      [...new Set(pool.map((recipe) => recipe[field]).filter(Boolean))].sort(
         (a, b) => a.localeCompare(b, 'fr')
      )
   const ingredientOptions = useMemo(() => {
      const names = new Map()
      localPool(recipes, 'maison')
         .flatMap((recipe) => recipe.ingredients)
         .forEach((item) => {
            const name = ingredientName(item)
            if (name) names.set(normalize(name), name)
         })
      return [...names.values()].sort((a, b) => a.localeCompare(b, 'fr'))
   }, [recipes])
   const favoriteKeys = new Set(favorites.map(recipeKey))
   const localResults = filterRecipes(pool, {
      query: debounced,
      spirit,
      glass,
      available,
   })
   const apiResults = favoritesOnly
      ? filterRecipes(
           favorites.filter((recipe) => recipe.source === 'api'),
           { query: debounced }
        )
      : apiData
   const results = (
      tab === 'api' ? (online ? apiResults : []) : localResults
   ).filter((recipe) => !favoritesOnly || favoriteKeys.has(recipeKey(recipe)))
   // Random always uses the local pool, including when the API tab is selected.
   const randomPool = filterRecipes(pool, { spirit, glass, available }).filter(
      (recipe) => !favoritesOnly || favoriteKeys.has(recipeKey(recipe))
   )
   const suggestion =
      random &&
      randomPool.find((recipe) => recipeKey(recipe) === recipeKey(random))
   const visible = suggestion ? [suggestion] : results
   const loading =
      !suggestion &&
      (tab === 'api'
         ? online && !favoritesOnly && (apiLoading || query !== debounced)
         : localLoading)
   const error = suggestion ? '' : tab === 'api' ? apiError : localError
   const emptyTitle = favoritesOnly
      ? 'Aucun favori à servir'
      : tab === 'api' && online && !debounced.trim()
      ? 'Ouvrez le carnet du monde'
      : 'Aucune recette à servir'
   const emptyMessage =
      tab === 'api' && !online
         ? 'Choisissez Cocktail Classique Maxime ou Semaine ski pour consulter le carnet hors ligne.'
         : favoritesOnly
         ? 'Ajoutez des favoris avec le cœur des recettes, ou modifiez la recherche et les filtres.'
         : tab === 'api'
         ? debounced.trim()
            ? 'Aucun cocktail trouvé pour ce nom. Essayez un autre nom.'
            : 'Tapez un nom pour chercher dans TheCocktailDB.'
         : 'Modifiez la recherche ou les filtres du bar.'

   const changeTab = (next) => {
      setTab(next)
      setSpirit('')
      setGlass('')
      setAvailable([])
      setRandom(null)
   }
   const toggleFavorite = (recipe) => {
      const next = favoriteKeys.has(recipeKey(recipe))
         ? favorites.filter((item) => recipeKey(item) !== recipeKey(recipe))
         : [...favorites, recipe]
      setFavorites(next)
      try {
         localStorage.setItem(FAVORITES_KEY, JSON.stringify(next))
         setStorageError('')
      } catch {
         setStorageError(
            'Favoris conservés pour cette session ; le stockage local est indisponible.'
         )
      }
   }

   return (
      <div className="flex w-full flex-col gap-8">
         <header className="mx-auto max-w-2xl text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-accent-soft">
               Le carnet du bar · Speakeasy
            </p>
            <h1 className="mt-4 font-display text-4xl font-semibold text-ink sm:text-6xl">
               Le bar de <span className="text-accent">Maxime</span>
            </h1>
            <p className="mt-4 text-ink-muted">
               Classiques, Martini et soirées au chalet. Votre prochain verre
               commence ici.
            </p>
         </header>

         <div
            className="flex flex-wrap justify-center gap-2"
            role="group"
            aria-label="Catalogue de recettes"
         >
            {tabs.map(([value, label]) => (
               <Button
                  key={value}
                  variant={tab === value ? 'primary' : 'outline'}
                  aria-pressed={tab === value}
                  onClick={() => changeTab(value)}
               >
                  {label}
               </Button>
            ))}
         </div>
         {!online && (
            <p role="status" className="text-center text-sm text-accent-soft">
               Hors ligne · Cocktail Classique Maxime et Semaine ski restent
               disponibles après une première visite. L’API nécessite Internet.
            </p>
         )}

         <div role="search" className="mx-auto w-full max-w-xl">
            <label htmlFor="cocktail-query" className="sr-only">
               Nom du cocktail
            </label>
            <div className="relative">
               <FiSearch
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-accent"
                  aria-hidden
               />
               <Input
                  id="cocktail-query"
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Tapez un nom… Negroni, Martini"
                  className="pl-11"
                  autoComplete="off"
                  aria-busy={loading}
                  disabled={tab === 'api' && !online}
               />
            </div>
            <p className="mt-2 text-center text-xs text-ink-faint">
               Recherche automatique par nom
            </p>
         </div>

         {tab !== 'api' && (
            <section className="glass-panel p-5" aria-label="Filtres du bar">
               <div className="grid gap-4 sm:grid-cols-2">
                  {[
                     ['Spiritueux', spirit, setSpirit, 'spirit'],
                     ['Verre', glass, setGlass, 'glass'],
                  ].map(([label, value, setValue, field]) => (
                     <label key={field} className="text-sm text-ink-muted">
                        {label}
                        <select
                           aria-label={label}
                           className="mt-2 w-full rounded-xl border border-accent/20 bg-canvas-elev p-3 text-ink"
                           value={value}
                           onChange={(event) => setValue(event.target.value)}
                        >
                           <option value="">Tous</option>
                           {options(field).map((option) => (
                              <option key={option}>{option}</option>
                           ))}
                        </select>
                     </label>
                  ))}
               </div>
               <details className="mt-5">
                  <summary className="cursor-pointer text-sm text-accent-soft">
                     J’ai… {available.length > 0 && `(${available.length})`}
                  </summary>
                  <p className="my-3 text-xs text-ink-muted">
                     Ingrédients de Cocktail Classique Maxime. Tous les ingrédients cochés
                     doivent figurer dans la recette (correspondance partielle).
                  </p>
                  <div className="flex max-h-56 flex-wrap gap-2 overflow-y-auto">
                     {ingredientOptions.map((name) => (
                        <label
                           key={name}
                           className="flex cursor-pointer items-center gap-2 rounded-lg border border-accent/20 px-3 py-2 text-sm"
                        >
                           <input
                              type="checkbox"
                              className="accent-amber-500"
                              checked={available.includes(name)}
                              onChange={(event) =>
                                 setAvailable(
                                    event.target.checked
                                       ? [...available, name]
                                       : available.filter(
                                            (item) => item !== name
                                         )
                                 )
                              }
                           />
                           {name}
                        </label>
                     ))}
                  </div>
               </details>
               {(spirit || glass || available.length > 0) && (
                  <Button
                     variant="ghost"
                     className="mt-3"
                     onClick={() => {
                        setSpirit('')
                        setGlass('')
                        setAvailable([])
                     }}
                  >
                     Effacer les filtres
                  </Button>
               )}
            </section>
         )}

         <div className="flex flex-wrap items-center justify-center gap-3">
            <Button
               variant="outline"
               disabled={!randomPool.length}
               onClick={() => {
                  const candidates = randomPool.filter(
                     (recipe) =>
                        recipeKey(recipe) !== (random && recipeKey(random))
                  )
                  const choices = candidates.length ? candidates : randomPool
                  setRandom(choices[Math.floor(Math.random() * choices.length)])
               }}
            >
               <FiShuffle aria-hidden />
               Au hasard · {tab === 'ski' ? 'Ski' : 'Cocktail Classique Maxime'}
            </Button>
            <Button
               variant={favoritesOnly ? 'primary' : 'outline'}
               aria-pressed={favoritesOnly}
               onClick={() => setFavoritesOnly(!favoritesOnly)}
            >
               <FiHeart aria-hidden />
               Favoris ({favorites.length})
            </Button>
            {suggestion && (
               <Button variant="ghost" onClick={() => setRandom(null)}>
                  Voir les résultats
               </Button>
            )}
         </div>
         {storageError && (
            <p role="status" className="text-center text-sm text-accent-soft">
               {storageError}
            </p>
         )}
         {error && (
            <div role="alert" className="text-center text-accent-soft">
               <p>{error}</p>
               <Button variant="ghost" onClick={() => setReload(reload + 1)}>
                  Réessayer
               </Button>
            </div>
         )}
         <p
            role="status"
            aria-live="polite"
            className="text-center text-sm text-ink-muted"
         >
            {loading
               ? 'Le bar prépare les recettes…'
               : suggestion
               ? 'La suggestion du bar'
               : `${visible.length} recette${visible.length === 1 ? '' : 's'}`}
         </p>
         {visible.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
               {visible.map((recipe) => (
                  <CocktailCard
                     key={recipeKey(recipe)}
                     cocktail={recipe}
                     favorite={favoriteKeys.has(recipeKey(recipe))}
                     onFavorite={toggleFavorite}
                  />
               ))}
            </div>
         ) : (
            !loading &&
            !error && (
               <div className="speakeasy-empty mx-auto w-full max-w-lg">
                  <h2 className="font-display text-2xl">{emptyTitle}</h2>
                  <p className="mt-3 text-sm text-ink-muted">{emptyMessage}</p>
               </div>
            )
         )}
      </div>
   )
}
