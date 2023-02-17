import { useState } from 'react'

export function CocktailsNinja() {
   const [cocktail, setCocktail] = useState('')
   const [cocktailData, setCocktailData] = useState([])
   const headers = {
      'X-Api-Key': import.meta.env.VITE_NINJA_KEY,
   }

   const getCocktails = async (e) => {
      e.preventDefault()
      try {
         const response = await fetch(
            `https://api.api-ninjas.com/v1/cocktail?name=${cocktail}`,
            {
               headers,
            }
         )
         
         if (!response.ok) {
            throw new Error(
               `Request failed with status code: ${response.status}`
            )
         }
         const data = await response.json() // parse response body as JSON
         if (data.length === 0) {
            alert('Aucun cocktail trouvé pour ces termes de recherche. Veuillez réessayer avec d\'autres termes.')
         } else {
            setCocktailData(data)
         }
      } catch (error) {
         console.error(error)
      }
   }

   return (
      <>
         <form className="form" onSubmit={getCocktails}>
            <label className='form__label' >Mot clé :
            </label>
            <input
               className="form__searchBar"
               type="search"
               value={cocktail}
               onChange={(e) => setCocktail(e.target.value)}
            />
            <input className="form__btn" type="submit" value="Chercher" />
         </form>
         {cocktailData.length > 0 ? (
            <ul className='cocktails'>
               {cocktailData.map((cocktail) => (
                  <li key={cocktail.name} className='cocktail'>
                     <h3 className='cocktail__name'>Name: {cocktail.name.charAt(0).toUpperCase()+cocktail.name.slice(1).toLowerCase()}</h3>
                     <p className='cocktail__method'>Method: {cocktail.instructions}</p>
                     <ul className='cocktail__ingredients'>Ingredients
                        {cocktail.ingredients.map((ingredient) => (
                           <li className='cocktail__ingredients__item' key={ingredient}>{ingredient}</li>
                        ))}
                     </ul>
                  </li>
               ))}
            </ul>
         ) : null}
      </>
   )
}