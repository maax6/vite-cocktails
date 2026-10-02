import test from 'node:test'
import assert from 'node:assert/strict'
import {
   matchCandidate,
   normalizeName,
   searchQueries,
} from '../scripts/match-cocktail-photos.mjs'

const recipe = (name) => ({ id: 'stable-recipe-id', name })
const drink = (
   name,
   image = 'https://www.thecocktaildb.com/images/media/drink/example.jpg'
) => ({
   strDrink: name,
   strDrinkThumb: image,
})

test('exact tolère accents/casse/ponctuation mais conserve le nom complet', () => {
   assert.equal(normalizeName('Bee’s Knees'), normalizeName("Bee's Knees"))
   assert.equal(
      matchCandidate(recipe('Bee’s Knees'), [drink("Bee's Knees")]).status,
      'exact'
   )
   assert.equal(
      matchCandidate(recipe('El Présidente'), [drink('El Presidente')]).status,
      'exact'
   )
   assert.equal(
      matchCandidate(recipe('Martini (variant)'), [drink('Martini')]).status,
      'fuzzy'
   )
   assert.equal(
      matchCandidate(recipe('Martini\nNotes locales'), [drink('Martini')])
         .status,
      'fuzzy'
   )
   assert.equal(
      matchCandidate(recipe('Paperplane'), [drink('Paper Plane')]).status,
      'fuzzy'
   )
   const preferred = matchCandidate(recipe('Paperplane'), [
      drink('Paper Plane'),
      drink('Paperplane'),
   ])
   assert.equal(preferred.status, 'exact')
   assert.equal(preferred.matchedName, 'Paperplane')
})

test('une orthographe proche ou un cocktail de base reste fuzzy ; un autre cocktail est none', () => {
   assert.equal(
      matchCandidate(recipe('Manathan'), [drink('Manhattan')]).status,
      'fuzzy'
   )
   assert.equal(
      matchCandidate(recipe('Mezcal Old Fashioned'), [drink('Old Fashioned')])
         .status,
      'fuzzy'
   )
   assert.equal(
      matchCandidate(recipe('Dry Martini'), [drink('Martini')]).status,
      'fuzzy'
   )
   assert.equal(
      matchCandidate(recipe('Margarita'), [drink('Banana Daiquiri')]).status,
      'none'
   )
   assert.equal(
      matchCandidate(recipe('Margarita'), [
         drink('Blue Margarita'),
         drink('Margarita'),
      ]).status,
      'exact'
   )
})

test('seules les images HTTPS du CDN cocktails sont retenues, sans activation', () => {
   for (const url of [
      'https://unrelated.example/image.jpg',
      'http://www.thecocktaildb.com/images/media/drink/example.jpg',
      'https://www.thecocktaildb.com/images/ingredients/gin.png',
      'https://www.thecocktaildb.com.attacker.example/images/media/drink/example.jpg',
      '',
   ]) {
      const candidate = matchCandidate(recipe('Margarita'), [
         drink('Margarita', url),
      ])
      assert.equal(candidate.status, 'none')
      assert.equal(candidate.imageUrl, null)
      assert.equal(candidate.matchedName, null)
   }
   const candidate = matchCandidate(recipe('Margarita'), [drink('Margarita')])
   assert.equal(candidate.id, 'stable-recipe-id')
   assert.equal(candidate.name, 'Margarita')
   assert.equal(
      candidate.licenseNote,
      'TheCocktailDB free API image; check attribution/TOS before shipping as product photos'
   )
   assert.equal('useCocktailDbThumb' in candidate, false)
})

test('les pistes de recherche préservent le nom du catalogue et proposent les corrections', () => {
   const input = recipe('Kir royal (et Kir)')
   const queries = searchQueries(input)
   assert.equal(queries[0], input.name)
   assert.ok(queries.includes('Kir Royale'))
   assert.ok(searchQueries(recipe('Manathan')).includes('Manhattan'))
   assert.equal(new Set(queries).size, queries.length)
   assert.equal(input.name, 'Kir royal (et Kir)')
})
