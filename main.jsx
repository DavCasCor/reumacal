import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import ReactGA from 'react-ga4' // ← AÑADIDO GA

ReactGA.initialize('GTM-P9GD6JRD') // ← AÑADIDO GA (sustituye G-XXXXXXXXXX por tu ID real)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
