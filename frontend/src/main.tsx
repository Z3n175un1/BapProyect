import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import HomePageBAP from './pages/HomePageBAP'
import './styles/style.css'

const container = document.getElementById('root')

if (!container) {
  throw new Error('No se encontró el elemento #root en index.html')
}

createRoot(container).render(
  <StrictMode>
    <HomePageBAP />
  </StrictMode>,
)