import { BrowserRouter, Routes, Route } from 'react-router-dom'

import Home from '../pages/Home/Home'
import LayoutBlank from '../layouts/Blank'
import LayoutDefault from '../layouts/Default'
// import Error from '../pages/Error/Error'
// import About from '../pages/About/About'

export default function Router() {
   return (
      <BrowserRouter>
         <Routes>
            <Route element={<LayoutDefault />}>
               <Route exact path="/" element={<Home />} />
               {/* <Route path="/about" element={<About />} /> */}
            </Route>

            <Route element={<LayoutBlank />}>
               {/* <Route path="*" element={<Error />} /> */}
			   {/* <Route path="/404" element={<Error />} /> */}
            </Route>
         </Routes>
      </BrowserRouter>
   )
}
