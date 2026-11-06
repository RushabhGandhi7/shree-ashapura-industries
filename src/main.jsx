import { StrictMode, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/index.css'
import App from './App.jsx'

// /lab is an internal inspection page for the 3D part library (lazy, not linked).
const Lab = lazy(() => import('./lab/Lab.jsx'))
const isLab = window.location.pathname.replace(/\/+$/, '') === '/lab'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {isLab ? (
      <Suspense fallback={null}>
        <Lab />
      </Suspense>
    ) : (
      <App />
    )}
  </StrictMode>,
)
