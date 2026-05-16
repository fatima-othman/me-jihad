import { Link } from 'react-router-dom';
import { ROUTES } from '../../config/routes';
import '../styles/feature2.css';

const Feature2Home = () => {
  return (
    <main className="page-section">
      <div className="container">
        <section className="card feature2-hero">
          <h1>Feature 2 Workspace</h1>
          <p>
            This module extends StrategAI with account tools, strategy workflow pages, and business-facing company
            pages.
          </p>
        </section>

        <section className="feature2-grid">
          <article className="card feature2-card">
            <h2>Auth Plus</h2>
            <p>Forgot password, reset password, and profile settings in one dedicated section.</p>
            <div className="feature2-actions">
              <Link className="btn-secondary" to={ROUTES.feature2AuthPlus}>Open Auth Plus</Link>
            </div>
          </article>

          <article className="card feature2-card">
            <h2>Strategy Core</h2>
            <p>Create strategy reports, review outcomes, and manage report history in one page group.</p>
            <div className="feature2-actions">
              <Link className="btn-secondary" to={ROUTES.feature2StrategyCore}>Open Strategy Core</Link>
            </div>
          </article>

          <article className="card feature2-card">
            <h2>Business Pages</h2>
            <p>Pricing, contact, and legal pages grouped under one business section.</p>
            <div className="feature2-actions">
              <Link className="btn-secondary" to={ROUTES.feature2BusinessPages}>Open Business Pages</Link>
            </div>
          </article>
        </section>
      </div>
    </main>
  );
};

export default Feature2Home;
