import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import ReactGA from 'react-ga4' 

ReactGA.initialize('GTM-P9GD6JRD') 

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
