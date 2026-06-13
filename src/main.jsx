import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ptBR } from 'date-fns/locale'
import { registerLocale } from 'react-datepicker'
import App from './App.jsx'
import './index.css'

registerLocale('pt-BR', ptBR)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
