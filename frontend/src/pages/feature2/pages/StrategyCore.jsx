import { Link } from 'react-router-dom';
import { ROUTES } from '../../config/routes';
import '../styles/feature2.css';

const StrategyCore = () => {
  return (
    <main className="page-section">
      <div className="container feature2-narrow">
        <section className="card feature2-hero">
          <h1>Strategy Core</h1>
          <p>Generate, review, and track AI strategy reports.</p>
        </section>

        <section className="feature2-grid feature2-single-group">
          <article className="card feature2-card">
            <h2>Create Strategy</h2>
            <p>Generate a new strategy document from business inputs.</p>
            <Link className="btn-secondary" to={ROUTES.feature2StrategyNew}>Open</Link>
          </article>

          <article className="card feature2-card">
            <h2>History</h2>
            <p>View previous reports and reopen strategy outcomes.</p>
            <Link className="btn-secondary" to={ROUTES.feature2History}>Open</Link>
          </article>
        </section>
      </div>
    </main>
  );
};

export default StrategyCore;
