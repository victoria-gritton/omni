import { useEffect, useState } from 'react'
import devopsHtml from './devops-flow-html.html?raw'

export default function DevOpsFlowPage() {
  const [blobUrl, setBlobUrl] = useState(null)

  useEffect(() => {
    const blob = new Blob([devopsHtml], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    setBlobUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [])

  return (
    <div className="min-h-screen flex flex-col">
      <div className="gradient-bg-dark" />
      <div className="content-layer flex flex-col flex-1">
        <div className="flex items-center justify-between px-6 py-3">
          <span className="text-[11px] text-foreground-muted">2AM Flow: DevOps</span>
          <a href="#/" className="text-[11px] text-link">Demos</a>
        </div>
        {blobUrl && (
          <iframe
            src={blobUrl}
            className="flex-1 w-full border-0"
            style={{ minHeight: 'calc(100vh - 40px)' }}
            title="2AM DevOps Flow"
          />
        )}
      </div>
    </div>
  )
}
