import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import WatchView from './pages/WatchView'
import PhoneView from './pages/PhoneView'
import ConsoleView from './pages/ConsoleView'
import Day0Page from './pages/Day0Page'
import GapAnalysisPage from './pages/GapAnalysisPage'
import GettingStartedPage from './pages/GettingStartedPage'
import LandingPage from './pages/LandingPage'
import DevOpsFlowPage from './pages/DevOpsFlowPage'
import DevOpsConsoleView from './pages/DevOpsConsoleView'
import DevOpsIDEView from './pages/DevOpsIDEView'
import CoffeeView from './pages/CoffeeView'
import TileHomePage from './pages/TileHomePage'
import SlackView from './pages/SlackView'
import ExplorePage from './pages/ExplorePage'
import InvestigatePage from './pages/InvestigatePage'
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
          <Route path="/devops" element={<DevOpsFlowPage />} />
          <Route path="/devops-console" element={<ConsoleLayout><DevOpsConsoleView /></ConsoleLayout>} />
          <Route path="/devops-ide" element={<DevOpsIDEView />} />
          <Route path="/watch" element={<WatchView />} />
          <Route path="/phone" element={<PhoneView />} />
          <Route path="/slack" element={<SlackView />} />
          <Route path="/home" element={<ConsoleLayout><CoffeeView /></ConsoleLayout>} />
          <Route path="/tiles" element={<ConsoleLayout><TileHomePage /></ConsoleLayout>} />
          <Route path="/console" element={<ConsoleLayout><ConsoleView /></ConsoleLayout>} />
          <Route path="/monitor" element={<ConsoleLayout><MonitorPage /></ConsoleLayout>} />
          <Route path="/day0" element={<ConsoleLayout><Day0Page /></ConsoleLayout>} />
          <Route path="/gaps" element={<ConsoleLayout><GapAnalysisPage /></ConsoleLayout>} />
          <Route path="/getting-started" element={<ConsoleLayout><GettingStartedPage /></ConsoleLayout>} />
          <Route path="/explore" element={<ConsoleLayout><ExplorePage /></ConsoleLayout>} />
          <Route path="/investigate" element={<ConsoleLayout><InvestigatePage /></ConsoleLayout>} />
          <Route path="/query" element={<Navigate to="/explore" replace />} />
          <Route path="/configure" element={<ConsoleLayout><ConfigurePage /></ConsoleLayout>} />
        </Routes>
      </HashRouter>
    </PersonaProvider>
  </React.StrictMode>
)
