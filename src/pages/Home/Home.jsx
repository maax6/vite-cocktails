import { CocktailSearch } from '../../components/CocktailSearch/CocktailSearch'

export function Home() {
   return (
      <div className="home relative mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
         <CocktailSearch />
         <footer className="mt-auto pt-16 text-center text-xs tracking-wide text-ink-faint">
            Carnet Maison · API TheCocktailDB · Speakeasy edition
         </footer>
      </div>
   )
}
