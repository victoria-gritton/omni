import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Warning, CheckCircle, ArrowSquareOut, Hash, CaretDown } from '@phosphor-icons/react'

const THREAD_MESSAGES = [
  {
    id: 1,
    sender: 'CloudWatch+ AI',
    avatar: 'CW',
    avatarBg: 'bg-sky-600',
    isBot: true,
    time: '2:03 AM',
    delay: 0,
    content: null,
    blocks: [
      { type: 'alert', severity: 'Critical', id: 'INC-2847' },
      { type: 'text', value: 'order-service is timing out' },
      { type: 'brief', lines: [
        { label: 'Root cause', value: 'ECS memory exhaustion — tasks OOM-killed 6× since 1:52am' },
        { label: 'Impact', value: '~2,400 failed checkouts in 10 min' },
        { label: 'Blast radius', value: '3 downstream services degraded' },
        { label: 'Confidence', value: 'High', color: 'text-green-400' },
      ]},
      { type: 'action', label: 'View in CloudWatch+', path: '/console' },
    ],
  },
  {
    id: 2,
    sender: 'You',
    avatar: 'MK',
    avatarBg: 'bg-emerald-700',
    isBot: false,
    time: '2:04 AM',
    delay: 1500,
    content: 'Acknowledged from watch. Looking at it now.',
  },
  {
    id: 3,
    sender: 'Alex K.',
    avatar: 'AK',
    avatarBg: 'bg-purple-700',
    isBot: false,
    time: '2:04 AM',
    delay: 3000,
    content: 'I see it too — checkout errors spiking on my dashboard. Want me to check the task definitions?',
  },
  {
    id: 4,
    sender: 'CloudWatch+ AI',
    avatar: 'CW',
    avatarBg: 'bg-sky-600',
    isBot: true,
    time: '2:05 AM',
    delay: 4500,
    content: null,
    blocks: [
      { type: 'update', status: 'progress', value: 'Remediation in progress — restarting ECS tasks with 1GB memory (up from 512MB). Task 2/4 complete.' },
    ],
  },
  {
    id: 5,
    sender: 'CloudWatch+ AI',
    avatar: 'CW',
    avatarBg: 'bg-sky-600',
    isBot: true,
    time: '2:08 AM',
    delay: 6500,
    content: null,
    blocks: [
      { type: 'resolved', value: 'All 4 tasks healthy. Memory at 34%, p99 back to 210ms. 3/3 downstream services recovered.' },
    ],
  },
]

function MessageBlock({ block, navigate }) {
  if (block.type === 'alert') {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-red-500/10 border-l-[3px] border-red-500 mb-1">
        <Warning size={14} weight="fill" className="text-red-400" />
        <span className="text-[13px] font-semibold text-red-300">{block.severity}</span>
        <span className="text-[12px] text-white/40 font-mono">{block.id}</span>
      </div>
    )
  }
  if (block.type === 'text') {
    return <p className="text-[15px] font-semibold text-white mb-1">{block.value}</p>
  }
  if (block.type === 'brief') {
    return (
      <div className="rounded bg-white/5 border border-white/10 p-2.5 mb-2 space-y-1">
        {block.lines.map((line, i) => (
          <div key={i} className="flex gap-2 text-[12px]">
            <span className="text-white/40 w-24 flex-shrink-0">{line.label}</span>
            <span className={line.color || 'text-white/80'}>{line.value}</span>
          </div>
        ))}
      </div>
    )
  }
  if (block.type === 'action') {
    return (
      <button
        onClick={() => navigate(block.path)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#007a5a] text-[13px] font-semibold text-white hover:bg-[#148567] transition-colors"
      >
        <ArrowSquareOut size={14} />
        {block.label}
      </button>
    )
  }
  if (block.type === 'update') {
    return (
      <div className="rounded bg-sky-500/10 border-l-[3px] border-sky-500 px-3 py-2">
        <span className="text-[12px] text-sky-300">{block.value}</span>
      </div>
    )
  }
  if (block.type === 'resolved') {
    return (
      <div className="rounded bg-green-500/10 border-l-[3px] border-green-500 px-3 py-2 flex items-start gap-2">
        <CheckCircle size={14} weight="fill" className="text-green-400 mt-0.5 flex-shrink-0" />
        <span className="text-[12px] text-green-300">{block.value}</span>
      </div>
    )
  }
  return null
}

function Message({ msg, visible, navigate }) {
  return (
    <div className={`flex gap-2.5 px-4 py-1.5 transition-all duration-500 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'} ${msg.isBot ? 'hover:bg-white/[0.02]' : 'hover:bg-white/[0.02]'}`}>
      <div className={`w-8 h-8 rounded-md ${msg.avatarBg} flex items-center justify-center flex-shrink-0 text-[11px] font-bold text-white`}>
        {msg.avatar}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="text-[14px] font-bold text-white">{msg.sender}</span>
          {msg.isBot && <span className="text-[10px] px-1 py-0.5 rounded bg-white/10 text-white/40 font-medium">APP</span>}
          <span className="text-[11px] text-white/30">{msg.time}</span>
        </div>
        {msg.content && <p className="text-[14px] text-white/80 mt-0.5 leading-relaxed">{msg.content}</p>}
        {msg.blocks && (
          <div className="mt-1.5">
            {msg.blocks.map((block, i) => <MessageBlock key={i} block={block} navigate={navigate} />)}
          </div>
        )}
      </div>
    </div>
  )
}

export default function SlackView() {
  const navigate = useNavigate()
  const [visibleCount, setVisibleCount] = useState(1)

  useEffect(() => {
    if (visibleCount >= THREAD_MESSAGES.length) return
    const nextMsg = THREAD_MESSAGES[visibleCount]
    const timer = setTimeout(() => setVisibleCount(c => c + 1), nextMsg.delay)
    return () => clearTimeout(timer)
  }, [visibleCount])

  return (
    <div className="min-h-screen flex items-center justify-center py-8">
      <div className="gradient-bg-dark" />
      <div className="content-layer flex flex-col items-center gap-6 w-full max-w-[560px] px-4">
        {/* Label */}
        <div className="w-full flex items-center justify-between">
          <span className="text-[11px] text-foreground-muted">Slack · Incident Thread</span>
          <a href="#/" className="text-[11px] text-link">← Demos</a>
        </div>

        {/* Slack window chrome */}
        <div className="w-full rounded-xl border border-[#3f3244]/40 bg-[#1a1d21] overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
          {/* Title bar */}
          <div className="h-10 bg-[#1a1d21] border-b border-white/5 flex items-center px-4 gap-3">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
              <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
              <div className="w-3 h-3 rounded-full bg-[#28c840]" />
            </div>
            <div className="flex-1" />
            <span className="text-[12px] text-white/30">Acme Corp</span>
          </div>

          {/* Sidebar + main split */}
          <div className="flex h-[520px]">
            {/* Mini sidebar */}
            <div className="w-[180px] border-r border-white/5 bg-[#19171d] py-3 flex-shrink-0">
              <div className="px-3 mb-3">
                <span className="text-[11px] font-bold text-white/40 uppercase tracking-wider">Channels</span>
              </div>
              <div className="space-y-0.5 px-2">
                <div className="flex items-center gap-1.5 px-2 py-1 rounded text-[13px] text-white/40">
                  <Hash size={12} /> <span>general</span>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-1 rounded text-[13px] text-white/40">
                  <Hash size={12} /> <span>engineering</span>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-[#1164a3]/30 text-[13px] text-white font-medium">
                  <Hash size={12} /> <span>incidents</span>
                  <div className="ml-auto w-4 h-4 rounded-full bg-red-500 flex items-center justify-center text-[10px] text-white font-bold">1</div>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-1 rounded text-[13px] text-white/40">
                  <Hash size={12} /> <span>deploys</span>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-1 rounded text-[13px] text-white/40">
                  <Hash size={12} /> <span>oncall</span>
                </div>
              </div>
            </div>

            {/* Main thread area */}
            <div className="flex-1 flex flex-col">
              {/* Channel header */}
              <div className="h-11 border-b border-white/5 px-4 flex items-center gap-2">
                <Hash size={14} className="text-white/40" />
                <span className="text-[14px] font-bold text-white">incidents</span>
                <CaretDown size={12} className="text-white/30" />
                <div className="flex-1" />
                <span className="text-[11px] text-white/30">{visibleCount} {visibleCount === 1 ? 'message' : 'messages'}</span>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto py-3 space-y-1">
                {THREAD_MESSAGES.map((msg, i) => (
                  <Message key={msg.id} msg={msg} visible={i < visibleCount} navigate={navigate} />
                ))}
              </div>

              {/* Input bar */}
              <div className="h-12 border-t border-white/5 px-4 flex items-center">
                <div className="flex-1 h-8 rounded-md bg-white/5 border border-white/10 px-3 flex items-center">
                  <span className="text-[13px] text-white/20">Message #incidents</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <p className="text-body-s text-foreground-muted text-center max-w-[400px]">
          AI auto-creates an incident thread with full context. Team coordinates here, then clicks through to the CloudWatch+ console to investigate.
        </p>
      </div>
    </div>
  )
}
