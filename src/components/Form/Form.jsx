import { useState } from 'react'

const Form = () => {
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
            <label className='form__label' >search for a cocktail
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
            <ul>
               {cocktailData.map((cocktail) => (
                  <li key={cocktail.name}>
                     <h3>{cocktail.name}</h3>
                     <p>{cocktail.instructions}</p>
                     <ul>
                        {cocktail.ingredients.map((ingredient) => (
                           <li key={ingredient}>{ingredient}</li>
                        ))}
                     </ul>
                  </li>
               ))}
            </ul>
         ) : null}
      </>
   )
}

export default Form
