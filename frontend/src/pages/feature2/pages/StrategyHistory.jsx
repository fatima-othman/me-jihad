import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { buildStrategyDetailsPath, ROUTES } from '../../config/routes';
import { getStrategyHistory } from '../services/feature2Service';
import '../styles/feature2.css';

const StrategyHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const data = await getStrategyHistory();
        setHistory(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message || 'Could not load history.');
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, []);

  return (
    <main className="page-section">
      <div className="container">
        <section className="card feature2-history-header">
          <h1>Strategy History</h1>
          <p>Review previously generated strategy reports.</p>
        </section>

        {loading ? <div className="card">Loading history...</div> : null}
        {error ? <div className="form-alert">{error}</div> : null}

        {!loading && !error && history.length === 0 ? (
          <div className="card feature2-empty">
            <p>No strategy reports yet.</p>
            <Link className="btn-primary" to={ROUTES.feature2StrategyNew}>Create your first report</Link>
          </div>
        ) : null}

        <div className="feature2-list">
          {history.map((item) => (
            <article className="card feature2-list-item" key={item.id}>
              <div>
                <h2>{item.company_name}</h2>
                <p>{item.objective}</p>
                <p className="feature2-muted">{new Date(item.created_at || Date.now()).toLocaleString()}</p>
              </div>
              <Link className="btn-secondary" to={buildStrategyDetailsPath(item.id)}>Open</Link>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
};

export default StrategyHistory;
