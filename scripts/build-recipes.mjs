#!/usr/bin/env node
import fs from 'fs'

const OUT = new URL('../public/recipes.json', import.meta.url)
const inputDirectory = process.argv[2] || '/tmp/codex-vite'

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
   return String(val)
      .split(/\n+/)
      .map((l) => l.replace(/^[-•*]\s*/, '').trim())
      .filter(Boolean)
}

function idFromUrl(url, fallback) {
   if (!url) return fallback
   const m = String(url).match(/([0-9a-f]{32}|[0-9a-f-]{36})/i)
   return m ? m[1].replace(/-/g, '') : fallback
}

function fromClassiques(rows) {
   return rows
      .map((row) => {
         const name =
            row.name ?? row['Cocktails Classiques '] ?? row.Name ?? null
         if (name == null || String(name).trim() === '') return null
         return {
            id: idFromUrl(row.url, 'maison'),
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
         const ingredients = []
         if (row['Gin (oz)'] != null && row['Gin (oz)'] !== '')
            ingredients.push(`${row['Gin (oz)']} oz Gin`)
         if (row['Vodka (oz)'] === 'Optional')
            ingredients.push('Vodka (optional, instead of gin)')
         else if (row['Vodka (oz)'])
            ingredients.push(`${row['Vodka (oz)']} oz Vodka`)
         if (
            row['Vermouth Sec (oz)'] != null &&
            row['Vermouth Sec (oz)'] !== ''
         )
            ingredients.push(`${row['Vermouth Sec (oz)']} oz Vermouth Sec`)
         if (
            row['Vermouth Doux (oz)'] != null &&
            Number(row['Vermouth Doux (oz)']) > 0
         )
            ingredients.push(`${row['Vermouth Doux (oz)']} oz Vermouth Doux`)
         if (row['Other Ingredients'])
            ingredients.push(...splitIng(row['Other Ingredients']))
         return {
            id: idFromUrl(row.url ?? row.id, 'martini'),
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
            spirit: 'Gin',
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
            id: idFromUrl(row.url ?? row.id, 'ski'),
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

const classiques = JSON.parse(
   fs.readFileSync(`${inputDirectory}/classiques-raw.json`, 'utf8')
)
const martini = JSON.parse(
   fs.readFileSync(`${inputDirectory}/martini-raw.json`, 'utf8')
)
const ski = JSON.parse(
   fs.readFileSync(`${inputDirectory}/ski-raw.json`, 'utf8')
)

const recipes = [
   ...fromClassiques(classiques),
   ...fromMartini(martini),
   ...fromSki(ski),
]
const payload = { recipes, exportedAt: new Date().toISOString() }
fs.writeFileSync(OUT, JSON.stringify(payload, null, 2) + '\n')
const counts = recipes.reduce(
   (a, r) => ((a[r.source] = (a[r.source] || 0) + 1), a),
   {}
)
console.log(
   JSON.stringify({ total: recipes.length, counts, out: OUT.pathname }, null, 2)
)
