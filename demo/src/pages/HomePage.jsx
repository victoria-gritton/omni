export default function HomePage() {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        {/* Omni logo — the ring becomes a rounded square, "squaring" CloudWatch */}
        <div className="relative">
          {/* Glow */}
          <div className="absolute inset-0 blur-3xl opacity-20 bg-sky-500 rounded-full" />
          <svg width="120" height="140" viewBox="0 0 120 140" fill="none" className="relative z-10">
            {/* The CloudWatch circle morphing into a rounded square = "Omni" */}
            <rect x="12" y="8" width="96" height="96" rx="24" stroke="#475569" strokeWidth="8" fill="none">
              <animate attributeName="rx" values="48;24;48" dur="6s" repeatCount="indefinite" />
            </rect>
            {/* Blue bar underneath */}
            <rect x="20" y="116" width="80" height="10" rx="5" fill="#0ea5e9">
              <animate attributeName="width" values="80;60;80" dur="6s" repeatCount="indefinite" />
              <animate attributeName="x" values="20;30;20" dur="6s" repeatCount="indefinite" />
            </rect>
          </svg>
        </div>
        <div className="text-center">
          <h1 className="text-heading-xl font-normal tracking-tighter text-foreground">
            CloudWatch <span className="text-primary">Omni</span>
          </h1>
          <p className="text-body-m text-foreground-muted mt-1">
            See everything. Fix anything.
          </p>
        </div>
      </div>
    </div>
  )
}
