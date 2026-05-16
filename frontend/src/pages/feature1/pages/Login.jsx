import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import InlineAlert from '../../../components/InlineAlert';
import LoadingSpinner from '../../../components/LoadingSpinner';
import PageMotion from '../../../components/PageMotion';
import PasswordField from '../../../components/PasswordField';
import { ROUTES } from '../../../config/routes';
import { useAuth } from '../../../context/AuthContext';
import { API_BASE_URL } from '../../../services/api';
import { storeAdminSession } from '../../../lib/adminAuth';
import { validateLoginField, validateLoginForm } from '../../../utils/validators';
import '../styles/auth.css';

const MotionSection = motion.section;
const MotionButton = motion.button;
const Icon = ({ name }) => {
  const icons = {
    email: (
      <>
        <rect x="3" y="6" width="18" height="12" rx="2" />
        <path d="m4 8 8 6 8-6" />
      </>
    ),
    lock: (
      <>
        <rect x="5" y="11" width="14" height="10" rx="2" />
        <path d="M8 11V8a4 4 0 1 1 8 0v3" />
      </>
    ),
    key: (
      <>
        <circle cx="8" cy="12" r="3" />
        <path d="M11 12h10" />
        <path d="M17 12v3" />
        <path d="M20 12v2" />
      </>
    ),
    login: (
      <>
        <path d="M10 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4" />
        <path d="M14 16l4-4-4-4" />
        <path d="M18 12H9" />
      </>
    ),
  };

  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {icons[name]}
    </svg>
  );
};

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [serverMessage, setServerMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [touched, setTouched] = useState({});

  const isFormValid = useMemo(() => {
    const nextErrors = validateLoginForm(formData);
    return Object.keys(nextErrors).length === 0;
  }, [formData]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({ ...prev, [name]: value }));

    if (touched[name] || errors[name]) {
      const fieldError = validateLoginField(name, value);
      setErrors((prev) => ({ ...prev, [name]: fieldError }));
    }

    if (serverMessage) {
      setServerMessage('');
    }
  };

  const handleBlur = (event) => {
    const { name, value } = event.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const fieldError = validateLoginField(name, value);
    setErrors((prev) => ({ ...prev, [name]: fieldError }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setServerMessage('');
    setSuccessMessage('');

    const validationErrors = validateLoginForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setTouched({ email: true, password: true });
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const adminEmail = import.meta.env.VITE_ADMIN_EMAIL || 'admin@strategai.com';

      if (formData.email.trim().toLowerCase() === adminEmail.toLowerCase()) {
        const adminResponse = await fetch(`${API_BASE_URL}/admin/login`, {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
            remember: rememberMe,
          }),
        });

        const adminPayload = await adminResponse.json();

        if (!adminResponse.ok) {
          throw {
            message: adminPayload?.message || adminPayload?.errors?.email?.[0] || 'Admin login failed.',
            fieldErrors: {},
          };
        }

        storeAdminSession({
          token: adminPayload.token,
          user: adminPayload.user,
        });

        navigate('/admin', { replace: true });
        return;
      }

      await login(formData);
      setSuccessMessage('Login successful. Redirecting to your dashboard...');
      const destination = location.state?.from?.pathname || ROUTES.dashboard;
      setTimeout(() => {
        navigate(destination, { replace: true });
      }, 420);
    } catch (error) {
      setErrors(error.fieldErrors || {});
      setServerMessage(error.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageMotion>
      <main className="page-section auth-page">
        <div className="container auth-container">
          <MotionSection
            className="card auth-card"
            aria-labelledby="login-heading"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            <h1 id="login-heading">Welcome back</h1>
            <p className="auth-subtitle">Log in to access your strategy dashboard</p>

            <InlineAlert type="error" message={serverMessage} />
            <InlineAlert type="success" message={successMessage} />

            <form onSubmit={handleSubmit} noValidate>
              <label htmlFor="email" className="form-label">
                <span className="auth-label-icon"><Icon name="email" /></span>
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                className={`input${errors.email ? ' input-error' : ''}`}
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                autoComplete="email"
                aria-invalid={Boolean(errors.email)}
              />
              {errors.email ? <p className="form-error">{errors.email}</p> : null}

              <PasswordField
                id="password"
                name="password"
                label={(
                  <>
                    <span className="auth-label-icon"><Icon name="lock" /></span>
                    Password
                  </>
                )}
                value={formData.password}
                onChange={handleChange}
                onBlur={handleBlur}
                autoComplete="current-password"
                error={errors.password}
              />

              <div className="auth-options-row">
                <label className="checkbox-label" htmlFor="remember">
                  <input
                    id="remember"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(event) => setRememberMe(event.target.checked)}
                  />
                  <span>Remember me</span>
                </label>
                <Link to={ROUTES.forgotPassword} className="auth-inline-link">
                  <span className="auth-link-icon"><Icon name="key" /></span>
                  Forgot password?
                </Link>
              </div>

              <MotionButton
                type="submit"
                className="btn-primary auth-btn"
                disabled={loading || !isFormValid}
                whileHover={!loading && isFormValid ? { scale: 1.01 } : {}}
                whileTap={!loading && isFormValid ? { scale: 0.99 } : {}}
              >
                {loading ? <LoadingSpinner label="Signing in" small /> : (
                  <>
                    <span className="auth-btn-icon"><Icon name="login" /></span>
                    Log In
                  </>
                )}
              </MotionButton>
            </form>
            <p className="auth-footnote">
              New to StrategAI? <Link to={ROUTES.register}>Create an account</Link>
            </p>
          </MotionSection>
        </div>
      </main>
    </PageMotion>
  );
};

export default Login;

