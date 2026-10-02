#!/usr/bin/env node
import fs from 'fs'
import path from 'node:path'
import { createHash } from 'node:crypto'
import { pathToFileURL } from 'node:url'
import { validateRecipes } from '../src/lib/recipes.mjs'

const OUT = new URL('../public/recipes.json', import.meta.url)

function parseArr(val) {
   if (val == null || val === '') return ''
   if (Array.isArray(val)) return val.map(String).join('. ')
   const s = String(val).trim()
   if (s.startsWith('[')) {
      try {
         const p = JSON.parse(s)
         if (Array.isArray(p)) return p.map(String).join('. ')
      } catch {}
   }
   return s
}

function splitIng(val) {
   if (!val) return []
   return (Array.isArray(val) ? val : String(val).split(/\n+/))
      .map((l) =>
         String(l)
            .trim()
            .replace(/^[-•*]\s*/, '')
            .trim()
      )
      .filter(Boolean)
}

function recipeId(row, collection, name) {
   for (const candidate of [row.url, row.id]) {
      const match = String(candidate ?? '').match(
         /([0-9a-f]{32}|[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})(?![0-9a-f])/i
      )
      if (match) return match[1].replace(/-/g, '').toLowerCase()
   }
   if (row.id != null && String(row.id).trim()) return String(row.id).trim()
   // Deterministic IDs preserve favourites even if an export has no page URL.
   return createHash('sha256')
      .update(`${collection}:${String(name).trim()}`)
      .digest('hex')
      .slice(0, 32)
}

function measuredIngredient(value, name) {
   const amount = String(value ?? '').trim()
   if (!amount || Number(amount) === 0) return null
   const numericDose =
      /^(?:\d+(?:[.,]\d+)?(?:\s+\d+\/\d+)?|\d+\/\d+|[¼½¾⅓⅔⅛⅜⅝⅞])$/u.test(amount)
   return numericDose ? `${amount} oz ${name}` : { name, amount }
}

function fromClassiques(rows) {
   return rows
      .map((row) => {
         const name =
            row.name ?? row['Cocktails Classiques '] ?? row.Name ?? null
         if (name == null || String(name).trim() === '') return null
         return {
            id: recipeId(row, 'classiques', name),
            name: String(name).trim(),
            source: 'maison',
            ingredients: splitIng(row.ingredients ?? row['Ingrédients']),
            method: parseArr(row.method ?? row['Méthode']),
            glass: parseArr(row.glass ?? row['Verre']),
            garnish: parseArr(row.garnish ?? row['Garnish']),
            spirit: parseArr(row.spirit ?? row['Spiritueux Principal']),
         }
      })
      .filter(Boolean)
}

function fromMartini(rows) {
   return rows
      .map((row) => {
         const name = row.Name ?? row.name ?? null
         if (name == null || String(name).trim() === '') return null
         const gin = measuredIngredient(row['Gin (oz)'], 'Gin')
         const vodka = /^optional$/i.test(
            String(row['Vodka (oz)'] ?? '').trim()
         )
            ? 'Vodka (optional, instead of gin)'
            : measuredIngredient(row['Vodka (oz)'], 'Vodka')
         const ingredients = [
            gin,
            vodka,
            measuredIngredient(row['Vermouth Sec (oz)'], 'Vermouth Sec'),
            measuredIngredient(row['Vermouth Doux (oz)'], 'Vermouth Doux'),
         ].filter(Boolean)
         if (row['Other Ingredients'])
            ingredients.push(...splitIng(row['Other Ingredients']))
         return {
            id: recipeId(row, 'martini', name),
            name: String(name).trim(),
            source: 'maison',
            tags: ['martini'],
            ingredients,
            method: row.Notes ? `Stirred. ${row.Notes}` : 'Stirred',
            glass: 'Coupette',
            garnish:
               row['Other Ingredients'] &&
               /garnish/i.test(String(row['Other Ingredients']))
                  ? String(row['Other Ingredients']).trim()
                  : 'Olive or lemon zest',
            spirit: gin ? 'Gin' : vodka ? 'Vodka' : '',
         }
      })
      .filter(Boolean)
}

function fromSki(rows) {
   return rows
      .map((row) => {
         const name = row.Nom ?? row.name ?? row.Name ?? null
         if (name == null || String(name).trim() === '') return null
         return {
            id: recipeId(row, 'ski', name),
            name: String(name).trim(),
            source: 'maison',
            season: 'ski',
            ingredients: splitIng(row.ingredients),
            method: parseArr(row['Méthode'] ?? row.method),
            glass: parseArr(row['Glass Type'] ?? row.glass),
            garnish: parseArr(row.Garnish ?? row.garnish),
            spirit: parseArr(row.Spiritueux ?? row.spirit),
         }
      })
      .filter(Boolean)
}

export function buildRecipes({ classiques, martini, ski }) {
   for (const [collection, rows] of Object.entries({
      classiques,
      martini,
      ski,
   })) {
      if (!Array.isArray(rows))
         throw new Error(`L’export ${collection} doit être un tableau.`)
   }
   return validateRecipes([
      ...fromClassiques(classiques),
      ...fromMartini(martini),
      ...fromSki(ski),
   ])
}

if (
   process.argv[1] &&
   import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href
) {
   const inputDirectory = process.argv[2] || '/tmp/codex-vite'
   const output = process.argv[3] ? path.resolve(process.argv[3]) : OUT
   const readCollection = (collection) =>
      JSON.parse(
         fs.readFileSync(
            path.join(inputDirectory, `${collection}-raw.json`),
            'utf8'
         )
      )
   const recipes = buildRecipes({
      classiques: readCollection('classiques'),
      martini: readCollection('martini'),
      ski: readCollection('ski'),
   })
   const payload = { recipes, exportedAt: new Date().toISOString() }
   // Validate before writing so an invalid export preserves the last valid catalogue.
   fs.writeFileSync(output, JSON.stringify(payload, null, 2) + '\n')
   const counts = recipes.reduce((counts, recipe) => {
      const collection =
         recipe.season === 'ski'
            ? 'ski'
            : recipe.tags?.includes('martini')
            ? 'martini'
            : 'classiques'
      counts[collection] = (counts[collection] || 0) + 1
      return counts
   }, {})
   console.log(
      JSON.stringify(
         {
            total: recipes.length,
            counts,
            out: output instanceof URL ? output.pathname : output,
         },
         null,
         2
      )
   )
}
