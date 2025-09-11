import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Home from './pages/home.jsx'
import SplinePage from './pages/Spline.jsx'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />,
  },
  {
    path: '/spline',
    element: <SplinePage />,
  },
])

function AppRoot() {
  useEffect(() => {
    // Ensure page starts at top on refresh
    window.scrollTo(0, 0)
    
    if (window.AOS) {
      window.AOS.init({ duration: 700, easing: 'ease-out-quart', once: true })
      const refresh = () => {
        if (window.ScrollTrigger) {
          try { window.ScrollTrigger.refresh() } catch (_) {}
        }
      }
      document.addEventListener('aos:in', refresh)
      const t = setTimeout(refresh, 800)
      return () => {
        document.removeEventListener('aos:in', refresh)
        clearTimeout(t)
      }
    }
  }, [])

  return <RouterProvider router={router} />
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppRoot />
  </StrictMode>,
)
