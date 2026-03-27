import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import WatchView from './pages/WatchView'
import PhoneView from './pages/PhoneView'
import ConsoleView from './pages/ConsoleView'
import HomePage from './pages/HomePage'
import LandingPage from './pages/LandingPage'
import ConsoleLayout from './components/ConsoleLayout'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/watch" element={<WatchView />} />
        <Route path="/phone" element={<PhoneView />} />
        <Route path="/home" element={<ConsoleLayout><HomePage /></ConsoleLayout>} />
        <Route path="/console" element={<ConsoleLayout><ConsoleView /></ConsoleLayout>} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
)
