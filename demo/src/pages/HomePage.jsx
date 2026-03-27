import { useState } from 'react'
import { PaperPlaneRight, Lightning, ChartBar, Bell, Globe } from '@phosphor-icons/react'

const prompts = [
  { icon: Lightning, text: 'Why is checkout-service slow right now?' },
  { icon: Bell, text: 'Show me all critical alarms from the last hour' },
  { icon: ChartBar, text: 'What changed in payment-service since yesterday?' },
  { icon: Globe, text: 'Which services have the highest error rate?' },
]

export default function HomePage() {
  const [input, setInput] = useState('')

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="text-heading-xl font-normal tracking-tighter text-foreground text-center">
        CloudWatch Omni
      </h1>
      <p className="text-body-m text-foreground-muted text-center mt-1 mb-8">
        Ask anything about your systems
      </p>

      {/* Chat input */}
      <div className="relative mb-6">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about your services, metrics, or alarms..."
          className="w-full h-12 rounded-xl bg-background-surface-1 border border-border-muted px-4 pr-12 text-body-m text-foreground placeholder:text-foreground-disabled focus:outline-none focus:border-primary/40 transition-colors"
        />
        <button className="absolute right-2 top-2 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary hover:bg-primary/20 transition-colors">
          <PaperPlaneRight size={16} />
        </button>
      </div>

      {/* Prompt suggestions */}
      <div className="grid grid-cols-2 gap-2">
        {prompts.map(({ icon: Icon, text }) => (
          <button
            key={text}
            onClick={() => setInput(text)}
            className="flex items-start gap-3 p-3 rounded-xl border border-border-muted hover:border-primary/30 hover:bg-primary/5 text-left transition-all"
          >
            <Icon size={16} className="text-foreground-muted mt-0.5 flex-shrink-0" />
            <span className="text-body-s text-foreground-secondary">{text}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
