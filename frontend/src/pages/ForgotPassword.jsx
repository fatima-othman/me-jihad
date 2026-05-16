import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../config/routes';
import { requestPasswordReset } from '../services/feature2Service';
import '../styles/feature2.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');

    if (!email.trim()) {
      setError('Email is required.');
      return;
    }

    setLoading(true);
    try {
      const result = await requestPasswordReset({ email });
      setMessage(result?.message || 'If this email exists, a password reset link will be sent shortly.');
    } catch (err) {
      setError(err.message || 'Could not send reset request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="page-section auth-page">
      <div className="container auth-container">
        <section className="card auth-card" aria-labelledby="forgot-heading">
          <h1 id="forgot-heading">Forgot Password</h1>
          <p className="auth-subtitle">Enter your email and we will send a password reset link.</p>
          {error ? <p className="form-alert">{error}</p> : null}
          {message ? <p className="feature2-success">{message}</p> : null}
          <form onSubmit={handleSubmit} noValidate>
            <label htmlFor="forgot-email" className="form-label">Email</label>
            <input
              id="forgot-email"
              type="email"
              className="input"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
            />
            <button type="submit" className="btn-primary auth-btn" disabled={loading}>
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
          <p className="auth-footnote">Remembered your password? <Link to={ROUTES.login}>Back to login</Link></p>
        </section>
      </div>
    </main>
  );
};

export default ForgotPassword;
