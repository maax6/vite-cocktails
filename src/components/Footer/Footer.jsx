
export default function Footer() {
   const effectiveYear = new Date().getFullYear()
   return (
      <footer className="footer">
         <img src="" alt="logo" className="footer__logo"></img>
         <p className="footer__text">
            ©{effectiveYear} Maxime S. All rights reserved
         </p>
      </footer>
   )
}
