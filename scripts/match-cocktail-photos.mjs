#!/usr/bin/env node
import { readFile, writeFile } from 'node:fs/promises'
import { pathToFileURL } from 'node:url'
import { setTimeout as pause } from 'node:timers/promises'

const RECIPES_URL = new URL('../public/recipes.json', import.meta.url)
const OUTPUT_URL = new URL('../public/photo-candidates.json', import.meta.url)
const API_URL = 'https://www.thecocktaildb.com/api/json/v1/1/search.php'
const LICENSE_NOTE =
   'TheCocktailDB free API image; check attribution/TOS before shipping as product photos'

// Search hints help with spelling and variants without changing catalogue names.
// A hint never upgrades a different API name to an exact match.
const SEARCH_HINTS = {
   'mezcal old fashioned': ['Old Fashioned'],
   manathan: ['Manhattan'],
   caipirinia: ['Caipirinha'],
   penicilin: ['Penicillin'],
   'old fashionned classique': ['Old Fashioned'],
   'bloody ceasar': ['Bloody Caesar'],
   paperplane: ['Paper Plane'],
   'kir royal': ['Kir Royale'],
   'corpse reviver 2': ['Corpse Reviver'],
   'last word': ['The Last Word'],
   'gibson martini': ['Gibson', 'Martini'],
   'dirty martini': ['Martini'],
   'extra dry martini': ['Dry Martini', 'Martini'],
   'burnt martini': ['Martini'],
   'bone dry martini': ['Dry Martini', 'Martini'],
   'perfect martini': ['Martini'],
   '50 50 martini': ['Martini'],
   'dry martini': ['Martini'],
   'sweet martini': ['Martini'],
}

export function normalizeName(value) {
   return String(value ?? '')
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .toLowerCase()
      .replace(/[’'`]/g, '')
      .replace(/&/g, ' and ')
      .replace(/[^a-z0-9]+/g, ' ')
      .trim()
}

function primaryName(value) {
   return String(value).split(/\n|\(/, 1)[0].trim()
}

function editDistance(left, right) {
   let previous = Array.from({ length: right.length + 1 }, (_, index) => index)
   for (let i = 1; i <= left.length; i += 1) {
      const next = [i]
      for (let j = 1; j <= right.length; j += 1) {
         next[j] = Math.min(
            next[j - 1] + 1,
            previous[j] + 1,
            previous[j - 1] + (left[i - 1] === right[j - 1] ? 0 : 1)
         )
      }
      previous = next
   }
   return previous[right.length]
}

function similarity(recipeName, matchedName) {
   const full = normalizeName(recipeName)
   const target = normalizeName(matchedName)
   if (full === target) return 1
   const primary = normalizeName(primaryName(recipeName))
   const compact = primary.replace(/ /g, '')
   const candidate = target.replace(/ /g, '')
   const spelling =
      1 -
      editDistance(compact, candidate) /
         Math.max(compact.length, candidate.length, 1)
   const leftTokens = primary.split(' ').filter(Boolean)
   const rightTokens = target.split(' ').filter(Boolean)
   const shorter =
      leftTokens.length <= rightTokens.length ? leftTokens : rightTokens
   const longer =
      leftTokens.length <= rightTokens.length ? rightTokens : leftTokens
   const contained =
      shorter.join(' ').length >= 5 &&
      shorter.every((token) => longer.includes(token))
   const hinted = (SEARCH_HINTS[primary] ?? []).some(
      (hint) => normalizeName(hint) === target
   )
   // Base-drink / variant matches are suggestions only (e.g. Dry Martini → Martini).
   return Math.min(
      0.99,
      Math.max(spelling, contained ? 0.8 : 0, hinted ? 0.85 : 0)
   )
}

function cocktailDbImage(value) {
   try {
      const url = new URL(value)
      return url.protocol === 'https:' &&
         ['www.thecocktaildb.com', 'thecocktaildb.com'].includes(
            url.hostname
         ) &&
         url.pathname.startsWith('/images/media/drink/')
         ? url.href
         : null
   } catch {
      return null
   }
}

export function matchCandidate(recipe, drinks) {
   const matches = drinks
      .map((drink) => ({
         matchedName: String(drink.strDrink ?? '').trim(),
         imageUrl: cocktailDbImage(drink.strDrinkThumb),
         score: similarity(recipe.name, drink.strDrink),
      }))
      .filter(
         (drink) => drink.imageUrl && drink.matchedName && drink.score >= 0.78
      )
      .sort(
         (left, right) =>
            right.score - left.score ||
            left.matchedName.localeCompare(right.matchedName, 'en') ||
            left.imageUrl.localeCompare(right.imageUrl, 'en')
      )
   const match = matches[0]
   return {
      id: recipe.id,
      name: recipe.name,
      matchedName: match?.matchedName ?? null,
      imageUrl: match?.imageUrl ?? null,
      status: match
         ? normalizeName(recipe.name) === normalizeName(match.matchedName)
            ? 'exact'
            : 'fuzzy'
         : 'none',
      licenseNote: LICENSE_NOTE,
   }
}

export function searchQueries(recipe) {
   const name = String(recipe.name).trim()
   const primary = primaryName(name)
   return [
      ...new Set([
         name,
         primary,
         normalizeName(primary),
         ...(SEARCH_HINTS[normalizeName(primary)] ?? []),
      ]),
   ].filter(Boolean)
}

async function searchDrinks(query) {
   const url = new URL(API_URL)
   url.searchParams.set('s', query)
   for (let attempt = 0; attempt < 4; attempt += 1) {
      // Keep discovery gentle on the public development API.
      await pause(1100)
      const response = await fetch(url, { signal: AbortSignal.timeout(20000) })
      if ((response.status === 429 || response.status >= 500) && attempt < 3) {
         const retryAfter = response.headers.get('retry-after')
         const seconds = retryAfter === null ? NaN : Number(retryAfter)
         const requested = Number.isFinite(seconds)
            ? seconds * 1000
            : Date.parse(retryAfter ?? '') - Date.now()
         const delay = Number.isFinite(requested)
            ? Math.min(60000, Math.max(1000, requested))
            : 20000 * (attempt + 1)
         console.warn(
            `TheCocktailDB HTTP ${
               response.status
            } : nouvelle tentative dans ${Math.ceil(delay / 1000)} s.`
         )
         await response.body?.cancel()
         await pause(delay)
         continue
      }
      if (!response.ok)
         throw new Error(`TheCocktailDB HTTP ${response.status}: ${query}`)
      const payload = await response.json()
      if (payload.drinks !== null && !Array.isArray(payload.drinks)) {
         throw new Error(`Réponse TheCocktailDB invalide : ${query}`)
      }
      return payload.drinks ?? []
   }
}

export async function generateCandidates() {
   const data = JSON.parse(await readFile(RECIPES_URL, 'utf8'))
   const recipes = (Array.isArray(data) ? data : data.recipes).filter(
      (recipe) => recipe.source === 'maison'
   )
   const cache = new Map()
   const candidates = []
   for (const recipe of recipes) {
      const drinks = new Map()
      for (const query of searchQueries(recipe)) {
         const cacheKey = query.toLowerCase()
         if (!cache.has(cacheKey)) {
            cache.set(cacheKey, await searchDrinks(query))
         }
         for (const drink of cache.get(cacheKey))
            drinks.set(drink.idDrink, drink)
         if (matchCandidate(recipe, [...drinks.values()]).status === 'exact')
            break
      }
      candidates.push(matchCandidate(recipe, [...drinks.values()]))
   }
   // Write only after every request succeeds: network errors are not "none" matches.
   await writeFile(OUTPUT_URL, `${JSON.stringify(candidates, null, 2)}\n`)
   const counts = candidates.reduce(
      (result, candidate) => {
         result[candidate.status] += 1
         return result
      },
      { exact: 0, fuzzy: 0, none: 0 }
   )
   console.log(
      `${candidates.length} candidats photo : ${JSON.stringify(counts)} (${
         cache.size
      } recherches API).`
   )
   return candidates
}

if (
   process.argv[1] &&
   import.meta.url === pathToFileURL(process.argv[1]).href
) {
   generateCandidates().catch((error) => {
      console.error(`Génération des candidats interrompue : ${error.message}`)
      process.exitCode = 1
   })
}
