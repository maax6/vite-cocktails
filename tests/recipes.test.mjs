import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
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
