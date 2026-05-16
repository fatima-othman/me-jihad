function Header({ title, date, onExport }) {
  return (
    <header className="report-app-header">
      <div>
        <h2>{title}</h2>
        <p>{date}</p>
      </div>

      <button type="button" className="primary-button" onClick={onExport}>
        Export PDF
      </button>
    </header>
  )
}

export default Header
