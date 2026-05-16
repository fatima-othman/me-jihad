import { Link } from 'react-router-dom';
import { ROUTES } from '../../config/routes';
import '../styles/feature2.css';

const Pricing = () => {
  return (
    <main className="page-section">
      <div className="container">
        <section className="card feature2-hero">
          <h1>Pricing Plans</h1>
          <p>Transparent pricing built for founders, teams, and growing companies.</p>
        </section>

        <section className="feature2-grid">
          <article className="card feature2-card">
            <h2>Starter</h2>
            <p className="feature2-price">$19 / month</p>
            <ul>
              <li>10 strategy generations</li>
              <li>Basic report history</li>
              <li>Email support</li>
            </ul>
          </article>

          <article className="card feature2-card feature2-card-highlight">
            <h2>Growth</h2>
            <p className="feature2-price">$79 / month</p>
            <ul>
              <li>100 strategy generations</li>
              <li>Advanced analytics</li>
              <li>Priority support</li>
            </ul>
          </article>

          <article className="card feature2-card">
            <h2>Enterprise</h2>
            <p className="feature2-price">Custom</p>
            <ul>
              <li>Unlimited usage</li>
              <li>Dedicated workspace</li>
              <li>Account manager</li>
            </ul>
          </article>
        </section>

        <div className="feature2-actions-row">
          <Link className="btn-primary" to={ROUTES.feature2Contact}>Contact Sales</Link>
        </div>
      </div>
    </main>
  );
};

export default Pricing;
