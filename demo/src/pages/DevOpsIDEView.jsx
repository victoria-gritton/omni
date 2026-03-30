import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle, X, ArrowLeft } from '@phosphor-icons/react'

const OLD_CODE = `const processPayment = async (event) => {
  const params = {
    TableName: 'PaymentsTable-v2',
    Item: {
      paymentId: event.paymentId,
      amount: event.amount,
      status: 'processing'
    }
  };
  await dynamodb.put(params).promise();
};`

const NEW_CODE = `const processPayment = async (event) => {
  const params = {
    TableName: 'PaymentsTable',
    Item: {
      paymentId: event.paymentId,
      amount: event.amount,
      status: 'processing'
    }
  };
  await dynamodb.put(params).promise();
};`

export default function DevOpsIDEView() {
  const navigate = useNavigate()
  const [accepted, setAccepted] = useState(false)

  return (
    <div className="h-screen flex flex-col bg-[#1e1e1e] text-white overflow-hidden">
      {/* IDE Title Bar */}
      <div className="h-9 bg-[#323233] flex items-center px-3 gap-2 flex-shrink-0 border-b border-[#1e1e1e]">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
          <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
          <div className="w-3 h-3 rounded-full bg-[#28c840]" />
        </div>
        <span className="text-[11px] text-[#999] ml-2">payment-processor.ts - CloudWatch Omni Fix</span>
        <div className="ml-auto flex items-center gap-2">
          <button onClick={() => navigate('/devops-console')} className="text-[11px] text-[#999] hover:text-white flex items-center gap-1 transition-colors">
            <ArrowLeft size={12} /> Back to Console
          </button>
        </div>
      </div>

      {/* AI suggestion banner */}
      <div className="flex items-center gap-3 px-4 py-2 bg-[#1a3a5c] border-b border-[#264a6e] flex-shrink-0">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4fc3f7" strokeWidth="2"><rect x="4" y="4" width="16" height="16" rx="3"/><circle cx="9" cy="10" r="1.5" fill="#4fc3f7" stroke="none"/><circle cx="15" cy="10" r="1.5" fill="#4fc3f7" stroke="none"/><path d="M9 15h6"/></svg>
        <div className="flex-1">
          <span className="text-[12px] text-[#4fc3f7] font-semibold">CloudWatch AI suggested a fix</span>
          <span className="text-[11px] text-[#8bb8d0] ml-2">Revert table reference from PaymentsTable-v2 back to PaymentsTable</span>
        </div>
        {!accepted ? (
          <div className="flex gap-2">
            <button
              onClick={() => setAccepted(true)}
              className="inline-flex items-center gap-1.5 h-7 px-4 rounded-md bg-[#2ea043] text-white text-[11px] font-semibold hover:bg-[#3fb950] transition-colors"
            >
              <CheckCircle size={14} weight="bold" /> Accept Fix
            </button>
            <button className="inline-flex items-center gap-1.5 h-7 px-3 rounded-md bg-transparent border border-[#444] text-[#999] text-[11px] hover:text-white hover:border-[#666] transition-colors">
              <X size={12} /> Dismiss
            </button>
          </div>
        ) : (
          <div className="inline-flex items-center gap-1.5 h-7 px-4 rounded-md bg-[#2ea043]/20 border border-[#2ea043]/30">
            <CheckCircle size={14} className="text-[#2ea043]" weight="fill" />
            <span className="text-[11px] text-[#2ea043] font-semibold">Fix applied</span>
          </div>
        )}
      </div>

      {/* Editor area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - file tree */}
        <div className="w-[200px] bg-[#252526] border-r border-[#1e1e1e] flex-shrink-0 overflow-y-auto">
          <div className="px-3 py-2 text-[10px] text-[#888] uppercase tracking-wider font-semibold">Explorer</div>
          <div className="px-1">
            <div className="px-2 py-1 text-[11px] text-[#ccc]">src/</div>
            <div className="px-4 py-1 text-[11px] text-[#ccc]">services/</div>
            <div className="px-6 py-1 text-[11px] text-white bg-[#37373d] rounded flex items-center gap-1.5">
              <span className="text-[#e06c75]">M</span> payment-processor.ts
            </div>
            <div className="px-6 py-1 text-[11px] text-[#888]">order-service.ts</div>
            <div className="px-6 py-1 text-[11px] text-[#888]">checkout-handler.ts</div>
            <div className="px-4 py-1 text-[11px] text-[#ccc]">infra/</div>
            <div className="px-6 py-1 text-[11px] text-[#888]">dynamodb.tf</div>
            <div className="px-6 py-1 text-[11px] text-[#888]">ecs-tasks.tf</div>
          </div>
        </div>

        {/* Diff view */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Tab bar */}
          <div className="h-8 bg-[#252526] flex items-center border-b border-[#1e1e1e] flex-shrink-0">
            <div className="flex items-center gap-1.5 px-3 h-full bg-[#1e1e1e] border-r border-[#1e1e1e] text-[11px] text-white">
              <span className="text-[#e06c75]">M</span> payment-processor.ts
            </div>
          </div>

          {/* Split diff */}
          <div className="flex-1 flex overflow-hidden">
            {/* Left: current (bad) */}
            <div className="flex-1 border-r border-[#333] overflow-auto">
              <div className="px-3 py-1.5 bg-[#2d1515] border-b border-[#3d2020] text-[10px] text-[#f48771] font-semibold flex items-center gap-1.5">
                Current (deploy #847)
              </div>
              <pre className="p-0 m-0 text-[12px] leading-[20px] font-mono">
                {OLD_CODE.split('\n').map((line, i) => {
                  const isChanged = i === 2
                  return (
                    <div key={i} className={`flex ${isChanged ? 'bg-[#3d1515]' : ''}`}>
                      <span className="w-10 text-right pr-3 text-[#555] select-none flex-shrink-0">{45 + i}</span>
                      <span className={isChanged ? 'text-[#f48771]' : 'text-[#d4d4d4]'}>{line}</span>
                    </div>
                  )
                })}
              </pre>
            </div>

            {/* Right: suggested fix */}
            <div className="flex-1 overflow-auto">
              <div className="px-3 py-1.5 bg-[#1a2e1a] border-b border-[#2a3e2a] text-[10px] text-[#2ea043] font-semibold flex items-center gap-1.5">
                {accepted ? 'Applied fix' : 'Suggested fix (CloudWatch AI)'}
              </div>
              <pre className="p-0 m-0 text-[12px] leading-[20px] font-mono">
                {NEW_CODE.split('\n').map((line, i) => {
                  const isChanged = i === 2
                  return (
                    <div key={i} className={`flex ${isChanged ? 'bg-[#1a3d1a]' : ''}`}>
                      <span className="w-10 text-right pr-3 text-[#555] select-none flex-shrink-0">{45 + i}</span>
                      <span className={isChanged ? 'text-[#2ea043]' : 'text-[#d4d4d4]'}>{line}</span>
                    </div>
                  )
                })}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
