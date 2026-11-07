// Route tree. Each page is its own lazy chunk; three / R3F only load through the lazy
// scenes used on Home, Products, Category and Custom.
import { createBrowserRouter } from 'react-router'
import RootLayout from './layout/RootLayout.jsx'

const page = (load) => () => load().then((m) => ({ Component: m.default }))

export const router = createBrowserRouter([
  { path: '/lab', lazy: page(() => import('./lab/Lab.jsx')) },
  {
    Component: RootLayout,
    children: [
      { index: true, lazy: page(() => import('./pages/Home.jsx')) },
      { path: 'products', lazy: page(() => import('./pages/Products.jsx')) },
      { path: 'products/:slug', lazy: page(() => import('./pages/Category.jsx')) },
      { path: 'custom', lazy: page(() => import('./pages/Custom.jsx')) },
      { path: 'manufacturing', lazy: page(() => import('./pages/Manufacturing.jsx')) },
      { path: 'quality', lazy: page(() => import('./pages/Quality.jsx')) },
      { path: 'about', lazy: page(() => import('./pages/About.jsx')) },
      { path: 'gallery', lazy: page(() => import('./pages/Gallery.jsx')) },
      { path: 'contact', lazy: page(() => import('./pages/Contact.jsx')) },
      { path: '*', lazy: page(() => import('./pages/NotFound.jsx')) },
    ],
  },
])
