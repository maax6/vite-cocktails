import React, { useCallback, useEffect, useRef, useState } from 'react'
import { FiSearch, FiLoader } from 'react-icons/fi'
import { Input } from '../ui/Input'
import { CocktailCard } from './CocktailCard'

const COCKTAIL_DB_SEARCH =
   'https://www.thecocktaildb.com/api/json/v1/1/search.php?s='

const DEBOUNCE_MS = 350

function mapDrink(drink) {
   const ingredients = []
   for (let i = 1; i <= 15; i++) {
      const ingredient = drink[`strIngredient${i}`]
      if (!ingredient) continue
      const measure = drink[`strMeasure${i}`]
      ingredients.push(
         measure ? `${measure.trim()} ${ingredient.trim()}` : ingredient.trim()
      )
   }
   return {
      id: drink.idDrink,
      name: drink.strDrink,
      instructions: drink.strInstructions || '',
      ingredients,
      image: drink.strDrinkThumb || null,
   }
}

export function CocktailSearch() {
   const [cocktail, setCocktail] = useState('')
   const [cocktailData, setCocktailData] = useState([])
   const [loading, setLoading] = useState(false)
   const [error, setError] = useState('')
   const [hasSearched, setHasSearched] = useState(false)
   const requestIdRef = useRef(0)

   const searchCocktails = useCallback(async (rawQuery) => {
      const query = rawQuery.trim()
      if (!query) {
         setCocktailData([])
         setError('')
         setHasSearched(false)
         setLoading(false)
         return
      }

      const requestId = ++requestIdRef.current
      setLoading(true)
      setError('')
      setHasSearched(true)

      try {
         const response = await fetch(
            `${COCKTAIL_DB_SEARCH}${encodeURIComponent(query)}`
         )

         if (!response.ok) {
            throw new Error(
               `Request failed with status code: ${response.status}`
            )
         }
         const data = await response.json()
         if (requestId !== requestIdRef.current) return

         const drinks = data.drinks
         if (!drinks || drinks.length === 0) {
            setError(
               'Aucun cocktail trouvé pour ces termes. Essayez un autre nom.'
            )
            setCocktailData([])
         } else {
            setCocktailData(drinks.map(mapDrink))
         }
      } catch (err) {
         if (requestId !== requestIdRef.current) return
         console.error(err)
         setError('Une erreur est survenue. Réessayez dans un instant.')
         setCocktailData([])
      } finally {
         if (requestId === requestIdRef.current) {
            setLoading(false)
         }
      }
   }, [])

   useEffect(() => {
      const handle = window.setTimeout(() => {
         searchCocktails(cocktail)
      }, DEBOUNCE_MS)
      return () => window.clearTimeout(handle)
   }, [cocktail, searchCocktails])

   const onSubmit = (e) => {
      e.preventDefault()
      searchCocktails(cocktail)
   }

   return (
      <div className="flex w-full flex-col gap-10">
         <header className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
            <p className="rounded-full border border-accent/30 bg-wood/60 px-3 py-1 text-xs font-medium uppercase tracking-[0.22em] text-accent-soft shadow-soft">
               Speakeasy · TheCocktailDB
            </p>
            <h1 className="font-display text-4xl font-semibold tracking-tight text-ink sm:text-5xl md:text-6xl">
               Cocktail{' '}
               <span className="bg-gradient-to-r from-accent-deep via-accent to-accent-soft bg-clip-text text-transparent">
                  Search
               </span>
            </h1>
            <p className="max-w-md text-base leading-relaxed text-ink-muted sm:text-lg">
               Derrière la porte : recettes, ingrédients et instructions —
               ambiance speakeasy, or vieilli.
            </p>
         </header>

         <form
            className="mx-auto w-full max-w-xl"
            onSubmit={onSubmit}
            role="search"
         >
            <label htmlFor="cocktail-query" className="sr-only">
               Search for a cocktail
            </label>
            <div className="relative">
               <FiSearch
                  className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-accent/70"
                  aria-hidden
               />
               <Input
                  id="cocktail-query"
                  type="search"
                  value={cocktail}
                  onChange={(e) => setCocktail(e.target.value)}
                  placeholder="Tapez un nom… Margarita, Mojito, Negroni"
                  className="pl-10 pr-11"
                  autoComplete="off"
                  aria-busy={loading}
               />
               {loading ? (
                  <FiLoader
                     className="absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-accent"
                     aria-hidden
                  />
               ) : null}
            </div>
            <p className="mt-2 text-center text-xs text-ink-faint">
               Recherche automatique · Entrée optionnelle
            </p>
         </form>

         {error ? (
            <div
               role="status"
               className="mx-auto max-w-md rounded-xl border border-accent/20 bg-wood/70 px-4 py-3 text-center text-sm text-accent-soft"
            >
               {error}
            </div>
         ) : null}

         {loading && cocktailData.length === 0 ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
               {[0, 1, 2].map((i) => (
                  <div
                     key={i}
                     className="glass-panel h-80 animate-pulse-soft"
                     style={{ animationDelay: `${i * 120}ms` }}
                  />
               ))}
            </div>
         ) : null}

         {cocktailData.length > 0 ? (
            <div
               className={`grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 ${
                  loading ? 'opacity-50' : ''
               }`}
            >
               {cocktailData.map((item, index) => (
                  <CocktailCard
                     key={item.id}
                     cocktail={item}
                     style={{ animationDelay: `${Math.min(index, 8) * 60}ms` }}
                  />
               ))}
            </div>
         ) : null}

         {!loading && hasSearched && cocktailData.length === 0 && !error ? (
            <p className="text-center text-ink-muted">Aucun résultat.</p>
         ) : null}

         {!loading && !hasSearched ? (
            <div className="speakeasy-empty mx-auto w-full max-w-lg animate-fade-up">
               <div
                  className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-accent/35 bg-canvas-elev/80 text-3xl shadow-glow animate-lamp-flicker"
                  aria-hidden
               >
                  🥃
               </div>
               <h2 className="font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
                  Quiet night. Soft jazz.
               </h2>
               <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-ink-muted sm:text-base">
                  Tapez un cocktail pour lever le rideau — cartes or &amp;
                  velours avec image, nom, ingrédients et instructions.
               </p>
               <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-[11px] uppercase tracking-[0.18em] text-accent/80">
                  <span>Ambre</span>
                  <span className="text-ink-faint" aria-hidden>
                     ·
                  </span>
                  <span>Bois</span>
                  <span className="text-ink-faint" aria-hidden>
                     ·
                  </span>
                  <span>Velours</span>
               </div>
            </div>
         ) : null}
      </div>
   )
}
