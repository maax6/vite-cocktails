import { useEffect, useId, useState } from 'react'
import { FiBookOpen, FiShoppingBag } from 'react-icons/fi'
import { Button } from '../ui/Button'

function validateGuide(guide) {
   const hasText = (value) => typeof value === 'string' && value.trim()
   const hasParagraph = (value) => hasText(value?.title) && hasText(value?.text)
   if (
      !hasText(guide?.title) ||
      !hasText(guide.introduction) ||
      !Array.isArray(guide.shopping) ||
      !guide.shopping.length ||
      !guide.shopping.every(
         (category) =>
            hasText(category?.title) &&
            Array.isArray(category.items) &&
            category.items.every(hasText)
      ) ||
      !hasParagraph(guide.advancePurchases) ||
      !hasText(guide.advancePurchases.ice) ||
      !hasText(guide.beginnerGuide?.introduction) ||
      !hasParagraph(guide.beginnerGuide.freshProducts) ||
      !hasParagraph(guide.beginnerGuide.ice) ||
      !Array.isArray(guide.beginnerGuide.methods) ||
      !guide.beginnerGuide.methods.every(
         (method) =>
            hasText(method?.name) &&
            hasText(method.description) &&
            (method.cocktails === undefined || hasText(method.cocktails))
      )
   ) {
      throw new Error('Guide incomplet')
   }
   return guide
}

export function SkiGuide() {
   const headingId = useId()
   const [guide, setGuide] = useState(null)
   const [loading, setLoading] = useState(true)
   const [error, setError] = useState('')
   const [reload, setReload] = useState(0)

   useEffect(() => {
      const controller = new AbortController()
      setLoading(true)
      setError('')
      fetch(`${import.meta.env.BASE_URL}ski-guide.json`, {
         signal: controller.signal,
      })
         .then((response) => {
            if (!response.ok) throw new Error('Guide indisponible')
            return response.json()
         })
         .then(validateGuide)
         .then((data) => {
            if (!controller.signal.aborted) setGuide(data)
         })
         .catch(() => {
            if (!controller.signal.aborted)
               setError(
                  'Les courses et le guide ski sont indisponibles. Réessayez pour ouvrir le carnet du chalet.'
               )
         })
         .finally(() => {
            if (!controller.signal.aborted) setLoading(false)
         })
      return () => controller.abort()
   }, [reload])

   if (loading)
      return (
         <div className="glass-panel p-6 text-ink-muted" role="status">
            Ouverture du carnet du chalet…
         </div>
      )

   if (error)
      return (
         <div className="glass-panel space-y-4 p-6">
            <p className="text-ink-muted" role="alert">
               {error}
            </p>
            <Button
               variant="outline"
               onClick={() => setReload((value) => value + 1)}
            >
               Réessayer le guide ski
            </Button>
         </div>
      )

   if (!guide) return null

   return (
      <section
         className="glass-panel space-y-8 p-5 sm:p-8"
         aria-labelledby={headingId}
      >
         <header className="max-w-3xl">
            <p className="text-xs uppercase tracking-[0.25em] text-accent-soft">
               Semaine ski · Six recettes à partager
            </p>
            <h2
               id={headingId}
               className="mt-3 font-display text-3xl font-semibold text-ink sm:text-4xl"
            >
               {guide.title}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-ink-muted sm:text-base">
               {guide.introduction}
            </p>
         </header>

         <section aria-labelledby={`${headingId}-shopping`}>
            <h3
               id={`${headingId}-shopping`}
               className="flex items-center gap-3 font-display text-2xl text-accent-soft"
            >
               <FiShoppingBag className="shrink-0 text-xl" aria-hidden />
               Courses
            </h3>
            <div className="mt-5 grid gap-5 md:grid-cols-3">
               {guide.shopping.map((category) => (
                  <div
                     key={category.title}
                     className="rounded-xl border border-accent/15 bg-canvas/30 p-4"
                  >
                     <h4 className="font-semibold text-ink">
                        {category.title}
                     </h4>
                     <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-ink-muted marker:text-accent">
                        {category.items.map((item) => (
                           <li key={item}>{item}</li>
                        ))}
                     </ul>
                  </div>
               ))}
            </div>
            <aside className="mt-5 rounded-xl border border-accent/30 bg-wood/60 p-4 sm:p-5">
               <h4 className="font-semibold text-accent-soft">
                  {guide.advancePurchases.title}
               </h4>
               <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                  {guide.advancePurchases.text}
               </p>
               <p className="mt-2 text-sm text-ink">
                  {guide.advancePurchases.ice}
               </p>
            </aside>
         </section>

         <section
            className="border-t border-accent/15 pt-8"
            aria-labelledby={`${headingId}-beginners`}
         >
            <h3
               id={`${headingId}-beginners`}
               className="flex items-center gap-3 font-display text-2xl text-accent-soft"
            >
               <FiBookOpen className="shrink-0 text-xl" aria-hidden />
               Guide débutants
            </h3>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-ink-muted">
               {guide.beginnerGuide.introduction}
            </p>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
               {[
                  guide.beginnerGuide.freshProducts,
                  guide.beginnerGuide.ice,
               ].map((tip) => (
                  <div key={tip.title}>
                     <h4 className="font-semibold text-ink">{tip.title}</h4>
                     <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                        {tip.text}
                     </p>
                  </div>
               ))}
            </div>
            <h4 className="mt-6 font-semibold text-ink">
               Les gestes pour ces six cocktails
            </h4>
            <dl className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
               {guide.beginnerGuide.methods.map((method) => (
                  <div
                     key={method.name}
                     className="rounded-xl border border-accent/15 bg-canvas/30 p-4"
                  >
                     <dt className="font-semibold text-accent-soft">
                        {method.name}
                     </dt>
                     <dd className="mt-2 text-sm leading-relaxed text-ink-muted">
                        {method.description}
                        {method.cocktails && (
                           <span className="mt-2 block text-xs text-ink">
                              Pour : {method.cocktails}.
                           </span>
                        )}
                     </dd>
                  </div>
               ))}
            </dl>
         </section>
      </section>
   )
}
