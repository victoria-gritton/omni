import { useState } from 'react'
import { SlidersHorizontal, Cpu, Globe, CaretDown } from '@phosphor-icons/react'
import Select from './ui/select'
import Input from './ui/input'
import Button from './ui/button'
import SegmentedControl from './ui/segmented-control'
import { Popover, PopoverTrigger, PopoverContent } from './ui/popover'

const defaultScope = {
  timeRange: 'Last 6h',
  cloudLocation: 'AWS us-west-2',
  account: '123456789012',
  environment: 'prod',
}

const timeRangeOptions = [
  { value: 'Last 1h', label: 'Last 1h' },
  { value: 'Last 6h', label: 'Last 6h' },
  { value: 'Last 24h', label: 'Last 24h' },
  { value: 'Last 7d', label: 'Last 7d' },
  { value: 'Last 30d', label: 'Last 30d' },
]

const cloudLocationOptions = [
  { value: 'AWS us-west-2', label: 'AWS us-west-2' },
  { value: 'AWS us-east-1', label: 'AWS us-east-1' },
  { value: 'AWS eu-west-1', label: 'AWS eu-west-1' },
  { value: 'Azure East US', label: 'Azure East US' },
  { value: 'GCP us-central1', label: 'GCP us-central1' },
]

const environmentOptions = [
  { value: 'prod', label: 'prod' },
  { value: 'staging', label: 'staging' },
  { value: 'dev', label: 'dev' },
]

export default function CanvasScope({ isDark, mode, onModeChange }) {
  const [scope, setScope] = useState(defaultScope)
  const [open, setOpen] = useState(false)

  const summary = `${scope.timeRange}, ${scope.cloudLocation.split(' ').pop()}, ${scope.environment}`

  return (
    <Popover isDark={isDark} open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className={`flex items-center gap-1 px-1.5 py-0.5 rounded-md text-xs font-medium transition-colors ${
            isDark
              ? 'text-foreground-secondary hover:text-foreground hover:bg-white/[0.06]'
              : 'text-gray-600 hover:text-gray-900 hover:bg-black/[0.04]'
          }`}
        >
          <span className="truncate">{summary}</span>
          <CaretDown size={12} className="shrink-0" />
        </button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-80">
        <div className="p-3 space-y-3">
          {/* Mode switch — agents / apps */}
          {onModeChange && (
            <Field label="View mode">
              <SegmentedControl
                options={[
                  { id: 'agents', label: 'Agents', Icon: Cpu },
                  { id: 'applications', label: 'Apps', Icon: Globe },
                ]}
                value={mode}
                onChange={(id) => onModeChange(id)}
                isDark={isDark}
                fullWidth
              />
            </Field>
          )}

          <Field label="Time range">
            <Select
              isDark={isDark}
              value={scope.timeRange}
              onChange={(v) => setScope(s => ({ ...s, timeRange: v }))}
              options={timeRangeOptions}
              placeholder="Select time range"
            />
          </Field>
          <Field label="Cloud location">
            <Select
              isDark={isDark}
              value={scope.cloudLocation}
              onChange={(v) => setScope(s => ({ ...s, cloudLocation: v }))}
              options={cloudLocationOptions}
              placeholder="Select location"
            />
          </Field>
          <Field label="Account">
            <Input
              isDark={isDark}
              value={scope.account}
              onChange={(e) => setScope(s => ({ ...s, account: e.target.value }))}
              placeholder="Account ID"
            />
          </Field>
          <Field label="Environment">
            <Select
              isDark={isDark}
              value={scope.environment}
              onChange={(v) => setScope(s => ({ ...s, environment: v }))}
              options={environmentOptions}
              placeholder="Select environment"
            />
          </Field>

          <Button
            variant="secondary"
            size="sm"
            isDark={isDark}
            onClick={() => setOpen(false)}
          >
            Sync all surfaces
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

function Field({ label, children }) {
  return (
    <div>
      <div className="text-body-s font-medium mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>{label}</div>
      {children}
    </div>
  )
}
