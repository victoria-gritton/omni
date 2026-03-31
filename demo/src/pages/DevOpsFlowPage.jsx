import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import rawHtml from '../assets/devops-flow.html?raw'

// Replace window.top.location.hash navigations with postMessage calls
const devopsFlowHtml = rawHtml.replace(
  /window\.top\.location\.hash='([^']*)'/g,
  (_, hash) => `parent.postMessage({type:'navigate',hash:'${hash}'},'*')`
)

export default function DevOpsFlowPage() {
  const navigate = useNavigate()

  useEffect(() => {
    const handler = (e) => {
      if (e.data?.type === 'navigate' && e.data.hash) {
        navigate(e.data.hash.replace('#', ''))
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
