import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App'
import CalendarPage from './CalendarPage'
import AnalyticsPage from './AnalyticsPage'
import EmailSchedulePage from './EmailSchedulePage'




createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/email" element={<EmailSchedulePage />} />
        
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
