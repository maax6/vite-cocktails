export const normalize = (value = '') =>
   String(value)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim()

// Keep the written quantity: never infer a unit or convert the source's doses.
const quantity =
   '(?:\\d+\\s+\\d+\\s*[/⁄]\\s*\\d+|\\d+\\s*[¼½¾⅐⅑⅒⅓⅔⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞]|\\d+\\s*[/⁄]\\s*\\d+|\\d+(?:[.,]\\d+)?|[¼½¾⅐⅑⅒⅓⅔⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞])'
const units =
   '(?:oz|ml|cl|dl|l|g|tsp|tbsp|dash(?:es)?|traits?|gouttes?|barspoons?|pouces?|cubes?|feuilles?|morceaux?|sachets?|cuill[eè]res?\\s+[àa]\\s+(?:caf[eé]|soupe))'
const dosePattern = new RegExp(
   `^(${quantity}(?:\\s*[-–]\\s*${quantity})?(?:\\s*${units}(?=\\s|\\(|$))?(?:\\s*\\([^)]*\\))?)\\s+(?:de\\s+)?(.+)$`,
   'i'
)

export function ingredientParts(item) {
   if (typeof item !== 'string') return item
   const text = item.trim()
   const dose = text.match(dosePattern)
   return dose ? { amount: dose[1], name: dose[2] } : { amount: '', name: text }
}
export const ingredientName = (item) => ingredientParts(item).name
export const recipeKey = (recipe) =>
   `${recipe.source === 'api' ? 'api' : 'local'}:${recipe.id}`

export function mapDrink(drink) {
   const ingredients = []
   for (let i = 1; i <= 15; i++) {
      const name = drink[`strIngredient${i}`]?.trim()
      if (name)
         ingredients.push({
            name,
            amount: drink[`strMeasure${i}`]?.trim() || '',
         })
   }
   return {
      id: drink.idDrink,
      name: drink.strDrink,
      source: 'api',
      ingredients,
      method: drink.strInstructionsFR || drink.strInstructions || '',
      glass: drink.strGlass || '',
      garnish: '',
      spirit: ingredients[0]?.name || '',
      image: drink.strDrinkThumb || null,
   }
}

export function localPool(recipes, tab) {
   return recipes.filter(
      (recipe) =>
         recipe.source !== 'api' &&
         (tab === 'ski' ? recipe.season === 'ski' : recipe.season !== 'ski')
   )
}

export function filterRecipes(
   recipes,
   { query = '', spirit = '', glass = '', available = [] }
) {
   return recipes.filter(
      (recipe) =>
         normalize(recipe.name).includes(normalize(query)) &&
         (!spirit || normalize(recipe.spirit) === normalize(spirit)) &&
         (!glass || normalize(recipe.glass) === normalize(glass)) &&
         available.every((selected) =>
            recipe.ingredients.some((item) =>
               normalize(ingredientName(item)).includes(normalize(selected))
            )
         )
   )
}

export function validateRecipes(payload) {
   const data = Array.isArray(payload) ? payload : payload?.recipes
   if (!Array.isArray(data))
      throw new Error('Le catalogue doit être un tableau.')
   const ids = new Set()
   for (const recipe of data) {
      if (
         !recipe ||
         !['string', 'number'].includes(typeof recipe.id) ||
         !String(recipe.id).trim() ||
         ids.has(String(recipe.id)) ||
         typeof recipe.name !== 'string' ||
         !recipe.name.trim() ||
         !['maison', 'martini', 'ski', 'api'].includes(recipe.source) ||
         !Array.isArray(recipe.ingredients) ||
         !recipe.ingredients.every(
            (item) =>
               (typeof item === 'string' && Boolean(item.trim())) ||
               (item &&
                  typeof item.name === 'string' &&
                  Boolean(item.name.trim()) &&
                  typeof item.amount === 'string')
         ) ||
         !['method', 'glass', 'garnish', 'spirit'].every(
            (key) => typeof recipe[key] === 'string'
         ) ||
         (recipe.season !== undefined && recipe.season !== 'ski') ||
         (recipe.tags !== undefined &&
            (!Array.isArray(recipe.tags) ||
               !recipe.tags.every((tag) => typeof tag === 'string'))) ||
         (recipe.source === 'ski' && recipe.season !== 'ski')
      ) {
         throw new Error(
            'Recette invalide ou identifiant dupliqué dans recipes.json.'
         )
      }
      ids.add(String(recipe.id))
   }
   return data
}
