export default function Footer() {
   const effectiveYear = new Date().getFullYear()
   return (
      <footer className="footer">
         <p className="footer__text">
            ©{effectiveYear} Maxime S. All rights reserved
         </p>
      </footer>
   )
}
