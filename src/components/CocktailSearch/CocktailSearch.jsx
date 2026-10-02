import React, { useState } from 'react'
import { FiSearch, FiLoader } from 'react-icons/fi'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { CocktailCard } from './CocktailCard'

const COCKTAIL_DB_SEARCH =
   'https://www.thecocktaildb.com/api/json/v1/1/search.php?s='

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

   const getCocktails = async (e) => {
      e.preventDefault()
      const query = cocktail.trim()
      if (!query) return

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
         const drinks = data.drinks
         if (!drinks || drinks.length === 0) {
            setError(
               "Aucun cocktail trouvé pour ces termes. Essayez un autre nom."
            )
            setCocktailData([])
         } else {
            setCocktailData(drinks.map(mapDrink))
         }
      } catch (err) {
         console.error(err)
         setError('Une erreur est survenue. Réessayez dans un instant.')
         setCocktailData([])
      } finally {
         setLoading(false)
      }
   }

   return (
      <div className="flex w-full flex-col gap-10">
         <header className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
            <p className="rounded-full border border-glass-border bg-glass-fill px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-accent">
               TheCocktailDB
            </p>
            <h1 className="font-display text-4xl font-semibold tracking-tight text-ink sm:text-5xl md:text-6xl">
               Cocktail{' '}
               <span className="bg-gradient-to-r from-accent to-accent-soft bg-clip-text text-transparent">
                  Search
               </span>
            </h1>
            <p className="max-w-md text-base text-ink-muted sm:text-lg">
               Trouvez recettes, ingrédients et instructions — UI glass à la
               21st.dev.
            </p>
         </header>

         <form
            className="mx-auto flex w-full max-w-xl flex-col gap-3 sm:flex-row sm:items-stretch"
            onSubmit={getCocktails}
            role="search"
         >
            <label htmlFor="cocktail-query" className="sr-only">
               Search for a cocktail
            </label>
            <div className="relative flex-1">
               <FiSearch
                  className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint"
                  aria-hidden
               />
               <Input
                  id="cocktail-query"
                  type="search"
                  value={cocktail}
                  onChange={(e) => setCocktail(e.target.value)}
                  placeholder="Margarita, Mojito, Negroni…"
                  className="pl-10"
                  autoComplete="off"
                  disabled={loading}
               />
            </div>
            <Button type="submit" disabled={loading || !cocktail.trim()}>
               {loading ? (
                  <>
                     <FiLoader className="h-4 w-4 animate-spin" aria-hidden />
                     Recherche…
                  </>
               ) : (
                  <>
                     <FiSearch className="h-4 w-4" aria-hidden />
                     Find
                  </>
               )}
            </Button>
         </form>

         {error ? (
            <div
               role="status"
               className="mx-auto max-w-md rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-center text-sm text-red-200"
            >
               {error}
            </div>
         ) : null}

         {loading ? (
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

         {!loading && cocktailData.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
            <div className="mx-auto flex max-w-sm flex-col items-center gap-3 rounded-2xl border border-dashed border-glass-border bg-glass-fill/50 px-6 py-10 text-center">
               <span className="text-3xl" aria-hidden>
                  🍸
               </span>
               <p className="text-sm text-ink-muted">
                  Lancez une recherche pour afficher des cartes cocktail —
                  image, nom, ingrédients et instructions.
               </p>
            </div>
         ) : null}
      </div>
   )
}
