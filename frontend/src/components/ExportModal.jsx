function ExportModal({ isOpen, companyName, date, onDownload, onClose }) {
  if (!isOpen) {
    return null
  }

  return (
    <div className="modal-overlay">
      <div className="modal-card" role="dialog" aria-modal="true" aria-labelledby="export-modal-title">
        <h2 id="export-modal-title">Business Strategy Report</h2>
        <p>
          <strong>Company name:</strong> {companyName}
        </p>
        <p>
          <strong>Date:</strong> {date}
        </p>

        <div className="modal-preview">
          <strong>Preview</strong>
          <p className="table-note">
            The exported PDF will include the current dashboard report with all main strategy sections.
          </p>
          <ul>
            <li>Overview</li>
            <li>SWOT Analysis</li>
            <li>Marketing Plan</li>
            <li>Social Media Plan</li>
            <li>Pricing Strategy</li>
            <li>Growth Roadmap</li>
            <li>Risk Analysis</li>
          </ul>
        </div>

        <div className="modal-actions">
          <button type="button" className="primary-button" onClick={onDownload}>
            Download PDF
          </button>
          <button type="button" className="secondary-button" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

export default ExportModal
