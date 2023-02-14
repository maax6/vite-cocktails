import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

export default function Header() {
   const location = useLocation()
   const [activePage, setActivePage] = useState(location.pathname)
   useEffect(() => {
      setActivePage(location.pathname)
   }, [location])

   const navigate = useNavigate()
   const goToHome = () => {
      navigate('/')
   }
   return (
      <header className="header">
         <div className="logo__container">
            <img src="" alt="logo" className="logo" />
         </div>
         <nav className="nav">
            <ul className="nav__bar">
               <li
                  className={
                     activePage === '/'
                        ? 'nav__link nav__link--active'
                        : 'nav__link'
                  }
               >
                  <a href="/">Acceuil</a>
               </li>
               <li
                  className={
                     activePage === '/About'
                        ? 'nav__link nav__link--active'
                        : 'nav__link'
                  }
               >
                  <a href="/About">À Propos</a>
               </li>
            </ul>
         </nav>
      </header>
   )
}
