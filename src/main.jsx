import { StrictMode, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/index.css'
import App from './App.jsx'

// /lab is an internal inspection page for the 3D part library (lazy, not linked).
const Lab = lazy(() => import('./lab/Lab.jsx'))
const isLab = window.location.pathname.replace(/\/+$/, '') === '/lab'
// The static shell (if present) already painted the hero text; Hero skips its fade-in then.
window.__saShell = !!document.getElementById('sa-shell')

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
