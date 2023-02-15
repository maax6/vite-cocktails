import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { FaGlassCheers } from 'react-icons/fa';

export default function Header() {
   return (
      <header className="header">
         <div className="header__icon" >
            <span><FaGlassCheers /></span>
         </div>
      </header>
   )
}
