import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import WatchView from './pages/WatchView'
import PhoneView from './pages/PhoneView'
import ConsoleView from './pages/ConsoleView'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/watch" replace />} />
        <Route path="/watch" element={<WatchView />} />
        <Route path="/phone" element={<PhoneView />} />
        <Route path="/console" element={<ConsoleView />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
)
