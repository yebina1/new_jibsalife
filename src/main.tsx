import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './reset.css'
import './index.css'
import App from './App.tsx'
import { HashRouter } from 'react-router'

document.getElementById('html-splash')?.remove()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter><App /></HashRouter>
  </StrictMode>,
)
