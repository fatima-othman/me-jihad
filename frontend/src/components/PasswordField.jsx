import { useState } from 'react';

const PasswordField = ({
  id,
  name,
  label,
  value,
  onChange,
  onBlur,
  error,
  autoComplete,
  placeholder,
  hint,
}) => {
  const [visible, setVisible] = useState(false);

  const EyeIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {visible ? (
        <>
          <path d="M3 3 21 21" />
          <path d="M10.6 10.6a2 2 0 1 0 2.8 2.8" />
          <path d="M9.9 4.2A10.8 10.8 0 0 1 12 4c5.1 0 9.3 3.2 11 8-1 2.8-2.9 5-5.4 6.4" />
          <path d="M6.7 6.7C4.3 8.1 2.5 10.2 1.5 12c.6 1.7 1.5 3.3 2.8 4.6" />
        </>
      ) : (
        <>
          <path d="M2 12s3.5-8 10-8 10 8 10 8-3.5 8-10 8S2 12 2 12z" />
          <circle cx="12" cy="12" r="3" />
        </>
      )}
    </svg>
  );

  return (
    <div className="password-field-wrap">
      <label htmlFor={id} className="form-label">{label}</label>
      <div className={`password-input-wrap${error ? ' has-error' : ''}`}>
        <input
          id={id}
          name={name}
          type={visible ? 'text' : 'password'}
          className="input password-input"
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          autoComplete={autoComplete}
          placeholder={placeholder}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
        />
        <button
          type="button"
          className="password-toggle"
          onClick={() => setVisible((prev) => !prev)}
          aria-label={visible ? 'Hide password' : 'Show password'}
        >
          <span className="password-toggle-icon"><EyeIcon /></span>
        </button>
      </div>
      {hint ? <p className="form-hint">{hint}</p> : null}
      {error ? <p id={`${id}-error`} className="form-error">{error}</p> : null}
    </div>
  );
};

export default PasswordField;
