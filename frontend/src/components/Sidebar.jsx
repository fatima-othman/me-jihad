function Sidebar({ activeSection, onSelect }) {
  return (
    <aside className="report-app-sidebar">
      <div className="sidebar-brand">
        <h1>StrategAI</h1>
      </div>

      <nav className="sidebar-nav" aria-label="Report sections">
        <button
          type="button"
          className={`sidebar-item ${activeSection === 'overview' ? 'active' : ''}`}
          onClick={() => onSelect('overview')}
        >
          Overview
        </button>

        <button
          type="button"
          className={`sidebar-item ${activeSection === 'swot' ? 'active' : ''}`}
          onClick={() => onSelect('swot')}
        >
          SWOT Analysis
        </button>

        <button
          type="button"
          className={`sidebar-item ${activeSection === 'marketing' ? 'active' : ''}`}
          onClick={() => onSelect('marketing')}
        >
          Marketing Plan
        </button>

        <button
          type="button"
          className={`sidebar-item ${activeSection === 'socialMedia' ? 'active' : ''}`}
          onClick={() => onSelect('socialMedia')}
        >
          Social Media Plan
        </button>

        <button
          type="button"
          className={`sidebar-item ${activeSection === 'pricing' ? 'active' : ''}`}
          onClick={() => onSelect('pricing')}
        >
          Pricing Strategy
        </button>

        <button
          type="button"
          className={`sidebar-item ${activeSection === 'growth' ? 'active' : ''}`}
          onClick={() => onSelect('growth')}
        >
          Growth Roadmap
        </button>

        <button
          type="button"
          className={`sidebar-item ${activeSection === 'risk' ? 'active' : ''}`}
          onClick={() => onSelect('risk')}
        >
          Risk Analysis
        </button>
      </nav>
    </aside>
  )
}

export default Sidebar
