import { Link } from 'react-router-dom';
import { ROUTES } from '../../config/routes';
import '../styles/feature2.css';

const BusinessPages = () => {
  return (
    <main className="page-section">
      <div className="container feature2-narrow">
        <section className="card feature2-hero">
          <h1>Business Pages</h1>
          <p>Company-facing content for product and compliance presentation.</p>
        </section>

        <section className="feature2-grid feature2-single-group">
          <article className="card feature2-card">
            <h2>Pricing</h2>
            <p>Plans, value tiers, and account growth options.</p>
            <Link className="btn-secondary" to={ROUTES.feature2Pricing}>Open</Link>
          </article>

          <article className="card feature2-card">
            <h2>Contact</h2>
            <p>Sales and support communication page.</p>
            <Link className="btn-secondary" to={ROUTES.feature2Contact}>Open</Link>
          </article>

          <article className="card feature2-card">
            <h2>Privacy</h2>
            <p>Data usage and user protection policy details.</p>
            <Link className="btn-secondary" to={ROUTES.feature2Privacy}>Open</Link>
          </article>

          <article className="card feature2-card">
            <h2>Terms</h2>
            <p>Usage agreement and platform responsibilities.</p>
            <Link className="btn-secondary" to={ROUTES.feature2Terms}>Open</Link>
          </article>
        </section>
      </div>
    </main>
  );
};

export default BusinessPages;
