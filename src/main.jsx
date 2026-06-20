// Entry point: mount <App /> into #root. StrictMode is on, so effects
// intentionally run twice in dev — the rAF/interval loops are written to be
// idempotent because of it.
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
