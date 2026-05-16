import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { ROUTES } from '../../config/routes';
import { getStrategyReportById } from '../services/feature2Service';
import '../styles/feature2.css';

const StrategyResult = () => {
  const { id } = useParams();
  const location = useLocation();
  const [report, setReport] = useState(location.state?.report || null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(!location.state?.report);

  useEffect(() => {
    if (report) {
      return;
    }

    const loadReport = async () => {
      setLoading(true);
      try {
        const response = await getStrategyReportById(id);
        setReport(response);
      } catch (err) {
        setError(err.message || 'Could not load strategy report.');
      } finally {
        setLoading(false);
      }
    };

    loadReport();
  }, [id, report]);

  if (loading) {
    return <main className="page-section"><div className="container"><div className="card">Loading report...</div></div></main>;
  }

  if (error || !report) {
    return (
      <main className="page-section">
        <div className="container feature2-narrow">
          <div className="form-alert">{error || 'Report not found.'}</div>
        </div>
      </main>
    );
  }

  return (
    <main className="page-section">
      <div className="container">
        <section className="card feature2-report-header">
          <h1>{report.company_name} Strategy Report</h1>
          <p>{report.summary}</p>
          <p className="feature2-muted">Generated on {new Date(report.created_at || Date.now()).toLocaleString()}</p>
        </section>

        <section className="feature2-grid">
          <article className="card feature2-card">
            <h2>Execution Priorities</h2>
            <ul>{(report.priorities || []).map((item) => <li key={item}>{item}</li>)}</ul>
          </article>

          <article className="card feature2-card">
            <h2>Risk Watchlist</h2>
            <ul>{(report.risks || []).map((item) => <li key={item}>{item}</li>)}</ul>
          </article>

          <article className="card feature2-card">
            <h2>KPIs</h2>
            <ul>{(report.kpis || []).map((item) => <li key={item}>{item}</li>)}</ul>
          </article>
        </section>

        <div className="feature2-actions-row">
          <Link className="btn-secondary" to={ROUTES.feature2History}>View History</Link>
          <Link className="btn-primary" to={ROUTES.feature2StrategyNew}>Create Another</Link>
        </div>
      </div>
    </main>
  );
};

export default StrategyResult;
