import React, { useState, useEffect } from 'react';

export function CocktailSearch() {
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
         {cocktailData.length > 0 ? (
            <div className='cocktail-cards'>
               {cocktailData.map((cocktail) => (
                  <div key={cocktail.name} className='cocktail-card'>
                     <h3 className='cocktail-card__name'> {cocktail.name.charAt(0).toUpperCase()+cocktail.name.slice(1).toLowerCase()}</h3>
                     <p className='cocktail-card__method'> {cocktail.instructions}</p>
                     <div className='cocktail-card__ingredients'>
                        {cocktail.ingredients.map((ingredient) => (
                           <span className='cocktail-card__ingredients__item' key={ingredient}>{ingredient}</span>
                        ))}
                     </div>
                  </div>
               ))}
            </div>
         ) : (<div className='cocktail-empty'>
         <h1>  <br /> Cocktail <br /> Search<br />  App </h1>
      </div> )}
         <form className="form" onSubmit={getCocktails}>
            <label className='form__label' >Search For A Cocktail  :
            </label>
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