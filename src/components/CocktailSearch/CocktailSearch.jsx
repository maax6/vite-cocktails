import React, { useState } from 'react'

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

   const getCocktails = async (e) => {
      e.preventDefault()
      const query = cocktail.trim()
      if (!query) return

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
            alert(
               "Aucun cocktail trouvé pour ces termes de recherche. Veuillez réessayer avec d'autres termes."
            )
            setCocktailData([])
         } else {
            setCocktailData(drinks.map(mapDrink))
         }
      } catch (error) {
         console.error(error)
      }
   }

   return (
      <>
         {cocktailData.length > 0 ? (
            <div className="cocktail-cards">
               {cocktailData.map((item) => (
                  <div key={item.id} className="cocktail-card">
                     {item.image ? (
                        <img
                           className="cocktail-card__image"
                           src={item.image}
                           alt={item.name}
                           loading="lazy"
                        />
                     ) : null}
                     <h3 className="cocktail-card__name">
                        {item.name.charAt(0).toUpperCase() +
                           item.name.slice(1).toLowerCase()}
                     </h3>
                     <p className="cocktail-card__method">{item.instructions}</p>
                     <div className="cocktail-card__ingredients">
                        {item.ingredients.map((ingredient) => (
                           <span
                              className="cocktail-card__ingredients__item"
                              key={ingredient}
                           >
                              {ingredient}
                           </span>
                        ))}
                     </div>
                  </div>
               ))}
            </div>
         ) : (
            <div className="cocktail-empty">
               <h1>
                  {' '}
                  <br /> Cocktail <br /> Search
                  <br /> App{' '}
               </h1>
            </div>
         )}
         <form className="form" onSubmit={getCocktails}>
            <label className="form__label">Search For A Cocktail :</label>
            <input
               className="form__searchBar"
               type="search"
               value={cocktail}
               onChange={(e) => setCocktail(e.target.value)}
            />
            <input className="form__btn" type="submit" value="Find" />
         </form>
      </>
   )
}
