import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter, Routes, Route } from 'react-router-dom'
import WatchView from './pages/WatchView'
import PhoneView from './pages/PhoneView'
import ConsoleView from './pages/ConsoleView'
import HomePage from './pages/HomePage'
import Day0Page from './pages/Day0Page'
import LandingPage from './pages/LandingPage'
import CoffeeView from './pages/CoffeeView'
import ExplorePage from './pages/ExplorePage'
import InvestigatePage from './pages/InvestigatePage'
import QueryStudioPage from './pages/QueryStudioPage'
import ConfigurePage from './pages/ConfigurePage'
import MonitorPage from './pages/MonitorPage'
import ConsoleLayout from './components/ConsoleLayout'
import { PersonaProvider } from './data/persona'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <PersonaProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/watch" element={<WatchView />} />
          <Route path="/phone" element={<PhoneView />} />
          <Route path="/home" element={<ConsoleLayout><HomePage /></ConsoleLayout>} />
          <Route path="/console" element={<ConsoleLayout><ConsoleView /></ConsoleLayout>} />
          <Route path="/monitor" element={<ConsoleLayout><MonitorPage /></ConsoleLayout>} />
          <Route path="/day0" element={<ConsoleLayout><Day0Page /></ConsoleLayout>} />
          <Route path="/coffee" element={<ConsoleLayout><CoffeeView /></ConsoleLayout>} />
          <Route path="/explore" element={<ConsoleLayout><ExplorePage /></ConsoleLayout>} />
          <Route path="/investigate" element={<ConsoleLayout><InvestigatePage /></ConsoleLayout>} />
          <Route path="/query" element={<ConsoleLayout><QueryStudioPage /></ConsoleLayout>} />
          <Route path="/configure" element={<ConsoleLayout><ConfigurePage /></ConsoleLayout>} />
        </Routes>
      </HashRouter>
    </PersonaProvider>
  </React.StrictMode>
)
