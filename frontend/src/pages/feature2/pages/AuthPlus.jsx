import { Link } from 'react-router-dom';
import { ROUTES } from '../../../config/routes';
import '../styles/feature2.css';

const AuthPlus = () => {
  return (
    <main className="page-section">
      <div className="container feature2-narrow">
        <section className="card feature2-hero">
          <h1>Auth Plus</h1>
          <p>Account access and security management pages.</p>
        </section>

        <section className="feature2-grid feature2-single-group">
          <article className="card feature2-card">
            <h2>Forgot Password</h2>
            <p>Request a secure reset link by email.</p>
            <Link className="btn-secondary" to={ROUTES.forgotPassword}>Open</Link>
          </article>

          <article className="card feature2-card">
            <h2>Reset Password</h2>
            <p>Set a new password from the recovery flow.</p>
            <Link className="btn-secondary" to={ROUTES.resetPassword}>Open</Link>
          </article>

          <article className="card feature2-card">
            <h2>Profile Settings</h2>
            <p>Update account details and workspace identity.</p>
            <Link className="btn-secondary" to={ROUTES.dashboard}>Open</Link>
          </article>
        </section>
      </div>
    </main>
  );
};

export default AuthPlus;
