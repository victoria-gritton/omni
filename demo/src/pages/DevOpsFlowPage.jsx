import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import devopsFlowHtml from '../assets/devops-flow.html?raw'

export default function DevOpsFlowPage() {
  const navigate = useNavigate()

  useEffect(() => {
    const handler = (e) => {
      if (e.data === 'navigate-devops-console') {
        navigate('/devops-console')
      }
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [navigate])

  return (
    <div className="min-h-screen flex flex-col">
      <div className="gradient-bg-dark" />
      <div className="content-layer flex flex-col flex-1">
        <div className="flex items-center justify-between px-6 py-3">
          <span className="text-[11px] text-foreground-muted">2AM Flow: DevOps</span>
          <a href="#/" className="text-[11px] text-link">Demos</a>
        </div>
        <p className="text-body-m text-foreground text-center mb-2">
          Click the watch notification to continue to the console
        </p>
        <iframe
          srcDoc={devopsFlowHtml}
          className="flex-1 w-full border-0"
          style={{ minHeight: 'calc(100vh - 40px)' }}
          title="2AM DevOps Flow"
        />
      </div>
    </div>
  )
}
