import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import InlineAlert from '../../../components/InlineAlert';
import LoadingSpinner from '../../../components/LoadingSpinner';
import PageMotion from '../../../components/PageMotion';
import PasswordField from '../../../components/PasswordField';
import { ROUTES } from '../../../config/routes';
import { useAuth } from '../../../context/AuthContext';
import { validateRegisterField, validateRegisterForm } from '../../../utils/validators';
import '../styles/auth.css';

const MotionSection = motion.section;
const MotionButton = motion.button;

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
  });
  const [errors, setErrors] = useState({});
  const [serverMessage, setServerMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({});

  const confirmPasswordLiveState = useMemo(() => {
    if (!formData.password_confirmation) {
      return '';
    }

    return formData.password === formData.password_confirmation ? 'match' : 'mismatch';
  }, [formData.password, formData.password_confirmation]);

  const isFormValid = useMemo(() => {
    const nextErrors = validateRegisterForm(formData);
    return Object.keys(nextErrors).length === 0;
  }, [formData]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    const nextData = { ...formData, [name]: value };

    setFormData(nextData);

    if (touched[name] || errors[name]) {
      const fieldError = validateRegisterField(name, value, nextData);
      setErrors((prev) => ({ ...prev, [name]: fieldError }));
    }

    if (name === 'password' && (touched.password_confirmation || errors.password_confirmation)) {
      const confirmationError = validateRegisterField(
        'password_confirmation',
        nextData.password_confirmation,
        nextData,
      );
      setErrors((prev) => ({ ...prev, password_confirmation: confirmationError }));
    }

    if (serverMessage) {
      setServerMessage('');
    }
  };

  const handleBlur = (event) => {
    const { name, value } = event.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const fieldError = validateRegisterField(name, value, formData);
    setErrors((prev) => ({ ...prev, [name]: fieldError }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setServerMessage('');
    setSuccessMessage('');

    const validationErrors = validateRegisterForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setTouched({
        name: true,
        email: true,
        password: true,
        password_confirmation: true,
      });
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      await register(formData);
      setSuccessMessage('Account created successfully. Redirecting to your dashboard...');
      setTimeout(() => {
        navigate(ROUTES.dashboard);
      }, 450);
    } catch (error) {
      setErrors(error.fieldErrors || {});
      setServerMessage(error.message || 'Unable to create account.');
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
            aria-labelledby="register-heading"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            <h1 id="register-heading">Create your account</h1>
            <p className="auth-subtitle">Start generating AI-powered business strategies</p>

            <InlineAlert type="error" message={serverMessage} />
            <InlineAlert type="success" message={successMessage} />

            <form onSubmit={handleSubmit} noValidate>
              <label htmlFor="name" className="form-label">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                className={`input${errors.name ? ' input-error' : ''}`}
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
                onBlur={handleBlur}
                autoComplete="name"
                aria-invalid={Boolean(errors.name)}
              />
              {errors.name ? <p className="form-error">{errors.name}</p> : null}

              <label htmlFor="email" className="form-label">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                className={`input${errors.email ? ' input-error' : ''}`}
                placeholder="john@company.com"
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
                label="Password"
                value={formData.password}
                onChange={handleChange}
                onBlur={handleBlur}
                autoComplete="new-password"
                error={errors.password}
                hint="Use at least 8 characters with uppercase, lowercase, and a symbol."
              />

              <PasswordField
                id="password_confirmation"
                name="password_confirmation"
                label="Confirm Password"
                value={formData.password_confirmation}
                onChange={handleChange}
                onBlur={handleBlur}
                autoComplete="new-password"
                error={errors.password_confirmation}
                hint={
                  confirmPasswordLiveState === 'match'
                    ? 'Passwords match.'
                    : confirmPasswordLiveState === 'mismatch'
                      ? 'Passwords do not match yet.'
                      : ''
                }
              />

              <MotionButton
                type="submit"
                className="btn-primary auth-btn"
                disabled={loading || !isFormValid}
                whileHover={!loading && isFormValid ? { scale: 1.01 } : {}}
                whileTap={!loading && isFormValid ? { scale: 0.99 } : {}}
              >
                {loading ? <LoadingSpinner label="Creating" small /> : 'Create account'}
              </MotionButton>
            </form>

            <p className="auth-footnote">
              Already have an account? <Link to={ROUTES.login}>Log in</Link>
            </p>
            <p className="auth-legal-note">
              By creating an account, you agree to our <button type="button">Terms of Service</button> and{' '}
              <button type="button">Privacy Policy</button>.
            </p>
          </MotionSection>
        </div>
      </main>
    </PageMotion>
  );
};

export default Register;
