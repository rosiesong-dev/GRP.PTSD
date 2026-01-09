import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
// import App from './App.tsx' 
import ClientList from './ClientList.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ClientList />
  </StrictMode>,
)
