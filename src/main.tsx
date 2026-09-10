import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import './sq-surgical.css'
import AppRoot from './App.tsx'
import SlideManager from './SlideManager'

const rootView = window.location.pathname === '/admin/slides' 
  ? <BrowserRouter><SlideManager /></BrowserRouter> 
  : <AppRoot />

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {rootView}
  </StrictMode>,
)
