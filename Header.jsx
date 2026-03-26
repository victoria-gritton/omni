export default function Header({ isDark, toggleTheme }) {
  return (
    <header className="mx-3 mt-2 p-4">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className={`text-heading-xl font-normal tracking-tighter ${isDark ? 'text-foreground' : 'text-gray-900'}`}>
            pet-clinic-frontend-java
          </h1>
          <p className={`text-body-m ${isDark ? 'text-foreground-muted' : 'text-gray-600'} mt-0.5`}>
            Application monitoring dashboard
          </p>
        </div>
      </div>
      
      <nav className={`flex gap-0.5 border-b ${isDark ? 'border-white/20' : 'border-gray-300'}`}>
        <button className={`px-3 py-1.5 text-body-m font-medium ${isDark ? 'text-foreground border-primary' : 'text-gray-900 border-slate-950'} border-b-2`}>
          Overview
        </button>
        <button className={`px-3 py-1.5 text-body-m font-medium ${isDark ? 'text-foreground-muted hover:text-foreground' : 'text-gray-600 hover:text-gray-900'}`}>
          Service operations
        </button>
        <button className={`px-3 py-1.5 text-body-m font-medium ${isDark ? 'text-foreground-muted hover:text-foreground' : 'text-gray-600 hover:text-gray-900'}`}>
          Dependencies
        </button>
        <button className={`px-3 py-1.5 text-body-m font-medium ${isDark ? 'text-foreground-muted hover:text-foreground' : 'text-gray-600 hover:text-gray-900'}`}>
          Synthetics Canaries
        </button>
        <button className={`px-3 py-1.5 text-body-m font-medium ${isDark ? 'text-foreground-muted hover:text-foreground' : 'text-gray-600 hover:text-gray-900'}`}>
          User experience
        </button>
        <button className={`px-3 py-1.5 text-body-m font-medium ${isDark ? 'text-foreground-muted hover:text-foreground' : 'text-gray-600 hover:text-gray-900'}`}>
          Related metrics
        </button>
      </nav>
    </header>
  )
}
