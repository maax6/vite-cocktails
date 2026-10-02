import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { spawnSync } from 'node:child_process'
import { buildRecipes } from '../scripts/build-recipes.mjs'
import {
   ingredientParts,
   filterRecipes,
   localPool,
   mapDrink,
   recipeKey,
   validateRecipes,
} from '../src/lib/recipes.mjs'

const recipes = validateRecipes(
   JSON.parse(readFileSync(new URL('../public/recipes.json', import.meta.url)))
)

test('catalogue valide ; le ski est exclu de Maison et réservé au ski', () => {
   validateRecipes(recipes)
   assert.ok(recipes.length > 0)
   assert.ok(localPool(recipes, 'maison').length > 0)
   assert.ok(localPool(recipes, 'ski').length > 0)
   assert.ok(
      localPool(recipes, 'maison').some((recipe) =>
         recipe.tags?.includes('martini')
      )
   )
   assert.ok(
      localPool(recipes, 'maison').every((recipe) => recipe.season !== 'ski')
   )
   assert.ok(
      localPool(recipes, 'ski').every((recipe) => recipe.season === 'ski')
   )
   const legacy = [{ ...recipes[0], source: 'martini' }]
   assert.equal(localPool(legacy, 'maison').length, 1)
   assert.equal(
      localPool(recipes, 'api').length,
      localPool(recipes, 'maison').length
   )
   assert.throws(() => validateRecipes([...recipes, recipes[0]]))
   assert.throws(() => validateRecipes([{ ...recipes[0], source: 'ski' }]))
   assert.throws(() => validateRecipes([{ ...recipes[0], ingredients: [' '] }]))
   assert.throws(() =>
      validateRecipes([
         { ...recipes[0], ingredients: [{ name: '', amount: '1 oz' }] },
      ])
   )
   assert.throws(() => validateRecipes([{ ...recipes[0], tags: 'martini' }]))
})

test('filtres combinés, tous les ingrédients, sous-chaînes et accents', () => {
   const recipe = {
      ...recipes[0],
      name: 'Été',
      spirit: 'Gin',
      glass: 'Coupe',
      ingredients: [
         { name: 'London dry gin', amount: '2 oz' },
         'Jus de citron pressé',
      ],
   }
   assert.equal(
      filterRecipes([recipe], {
         query: 'ete',
         spirit: 'gin',
         glass: 'coupe',
         available: ['GIN', 'citron presse'],
      }).length,
      1
   )
   assert.equal(
      filterRecipes([recipe], { available: ['gin', 'rhum'] }).length,
      0
   )
   assert.equal(filterRecipes([recipe], { spirit: 'Whisky' }).length, 0)
   assert.equal(filterRecipes([recipe], { glass: 'Tasse' }).length, 0)
})

test('mapping TheCocktailDB garde 15 doses, verre, photo et instructions', () => {
   const input = {
      idDrink: '123',
      strDrink: 'Test',
      strInstructions: 'Shake.',
      strGlass: 'Coupe',
      strDrinkThumb: 'https://example.com/photo.jpg',
   }
   for (let i = 1; i <= 15; i++) {
      input[`strIngredient${i}`] = ` Ingredient ${i} `
      input[`strMeasure${i}`] = i === 15 ? null : ' 1 oz '
   }
   const mapped = mapDrink(input)
   assert.equal(mapped.ingredients.length, 15)
   assert.deepEqual(mapped.ingredients[0], {
      name: 'Ingredient 1',
      amount: '1 oz',
   })
   assert.equal(mapped.ingredients[14].amount, '')
   assert.equal(mapped.method, 'Shake.')
   assert.equal(mapped.glass, 'Coupe')
   assert.equal(mapped.image, input.strDrinkThumb)
   assert.equal(mapped.source, 'api')
   assert.notEqual(
      recipeKey(mapped),
      recipeKey({ ...mapped, source: 'maison' })
   )
   assert.equal(
      mapDrink({ ...input, strInstructionsFR: 'Secouer.' }).method,
      'Secouer.'
   )
})

test('doses exportées en chaînes séparées sans conversion', () => {
   assert.deepEqual(ingredientParts('2 oz Gin'), {
      name: 'Gin',
      amount: '2 oz',
   })
   assert.deepEqual(ingredientParts('0.5 oz (15 ml) de jus de citron'), {
      name: 'jus de citron',
      amount: '0.5 oz (15 ml)',
   })
   assert.deepEqual(ingredientParts('Top Soda'), {
      name: 'Top Soda',
      amount: '',
   })
})

test('fractions, doses mixtes, dash et quantités sans unité restent lisibles', () => {
   for (const [input, amount, name] of [
      ['1/2 oz Gin', '1/2 oz', 'Gin'],
      ['1 1/2 oz Gin', '1 1/2 oz', 'Gin'],
      ['1½ oz Gin', '1½ oz', 'Gin'],
      ['⅔ oz Gin', '⅔ oz', 'Gin'],
      ['1⁄2 oz Gin', '1⁄2 oz', 'Gin'],
      ['0,75 oz Gin', '0,75 oz', 'Gin'],
      ['6 dash tabasco', '6 dash', 'tabasco'],
      ['2 dashes Angostura', '2 dashes', 'Angostura'],
      ['4-5 traits Angostura', '4-5 traits', 'Angostura'],
      ['1 cuillère à café de grenadine', '1 cuillère à café', 'grenadine'],
      ['10 feuilles de menthe', '10 feuilles', 'menthe'],
      ['½ sachet sucre brun', '½ sachet', 'sucre brun'],
      ['1 blanc d’œuf', '1', 'blanc d’œuf'],
      ['0.75 jus de lime', '0.75', 'jus de lime'],
      ['2oz Rhum', '2oz', 'Rhum'],
   ]) {
      assert.deepEqual(ingredientParts(input), { amount, name }, input)
   }
   const structured = { name: 'Gin', amount: '1/2 oz' }
   assert.equal(ingredientParts(structured), structured)
})

test('export : catégories, IDs stables, fractions et mesures textuelles', () => {
   const input = {
      classiques: [
         { name: 'Classique A', ingredients: ['  -2 oz Gin', '1/2 oz citron'] },
         { name: 'Classique B', ingredients: '1 oz Rhum' },
      ],
      martini: [
         {
            Name: 'Vodka Martini',
            id: '181ce4c0-757d-810f-bfe4-fe0e31d50ac5',
            'Gin (oz)': 0,
            'Vodka (oz)': '1 1/2',
            'Vermouth Sec (oz)': 'Few drops',
            'Vermouth Doux (oz)': '1/4',
         },
      ],
      ski: [{ Nom: 'Chalet', ingredients: '-2 oz Rhum' }],
   }
   const exported = buildRecipes(input)
   assert.equal(exported.length, 4)
   assert.equal(new Set(exported.map((recipe) => recipe.id)).size, 4)
   assert.deepEqual(exported[0].ingredients, ['2 oz Gin', '1/2 oz citron'])
   assert.equal(exported[2].id, '181ce4c0757d810fbfe4fe0e31d50ac5')
   assert.equal(exported[2].source, 'maison')
   assert.deepEqual(exported[2].tags, ['martini'])
   assert.equal(exported[2].spirit, 'Vodka')
   assert.deepEqual(exported[2].ingredients, [
      '1 1/2 oz Vodka',
      { name: 'Vermouth Sec', amount: 'Few drops' },
      '1/4 oz Vermouth Doux',
   ])
   const vermouth = ingredientParts(exported[2].ingredients[1])
   assert.equal(vermouth.name, 'Vermouth Sec')
   assert.equal(vermouth.amount, 'Few drops')
   assert.ok(!vermouth.amount.includes('oz'))
   assert.equal(
      filterRecipes([exported[2]], { available: ['Vermouth Sec'] }).length,
      1
   )
   assert.equal(exported[3].season, 'ski')
   assert.equal(localPool(exported, 'maison').length, 3)
   assert.equal(localPool(exported, 'ski').length, 1)
   const reordered = buildRecipes({
      ...input,
      classiques: [...input.classiques].reverse(),
   })
   assert.equal(reordered[1].id, exported[0].id)
   assert.throws(
      () =>
         buildRecipes({
            ...input,
            classiques: [input.classiques[0], input.classiques[0]],
         }),
      /dupliqué/
   )
})

test('un export invalide préserve le catalogue précédent', () => {
   const directory = mkdtempSync(join(tmpdir(), 'cocktails-export-'))
   try {
      const duplicate = { name: 'Doublon', ingredients: '1 oz Gin' }
      writeFileSync(
         join(directory, 'classiques-raw.json'),
         JSON.stringify([duplicate, duplicate])
      )
      writeFileSync(join(directory, 'martini-raw.json'), '[]')
      writeFileSync(join(directory, 'ski-raw.json'), '[]')
      const output = join(directory, 'recipes.json')
      writeFileSync(output, 'Catalogue précédent')
      const result = spawnSync(
         process.execPath,
         [
            new URL('../scripts/build-recipes.mjs', import.meta.url).pathname,
            directory,
            output,
         ],
         { encoding: 'utf8' }
      )
      assert.notEqual(result.status, 0)
      assert.match(result.stderr, /dupliqué/)
      assert.equal(readFileSync(output, 'utf8'), 'Catalogue précédent')
   } finally {
      rmSync(directory, { recursive: true, force: true })
   }
})
