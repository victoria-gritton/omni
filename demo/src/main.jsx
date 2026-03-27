import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter, Routes, Route } from 'react-router-dom'
import WatchView from './pages/WatchView'
import PhoneView from './pages/PhoneView'
import ConsoleView from './pages/ConsoleView'
import HomePage from './pages/HomePage'
import LandingPage from './pages/LandingPage'
import CoffeeView from './pages/CoffeeView'
import ConsoleLayout from './components/ConsoleLayout'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HashRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/watch" element={<WatchView />} />
        <Route path="/phone" element={<PhoneView />} />
        <Route path="/home" element={<ConsoleLayout><HomePage /></ConsoleLayout>} />
        <Route path="/console" element={<ConsoleLayout><ConsoleView /></ConsoleLayout>} />
        <Route path="/coffee" element={<ConsoleLayout><CoffeeView /></ConsoleLayout>} />
      </Routes>
    </HashRouter>
  </React.StrictMode>
)
