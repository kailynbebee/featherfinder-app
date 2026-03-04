import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { LocationProvider } from '@/context/LocationContext'
import App from '@/app/App'
import '@/styles/index.css'
import 'leaflet/dist/leaflet.css'

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <LocationProvider>
      <App />
    </LocationProvider>
  </BrowserRouter>
)
