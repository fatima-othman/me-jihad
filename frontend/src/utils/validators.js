const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateEmail = (value) => {
  if (!value?.trim()) {
    return 'Email is required.';
  }

  if (!emailPattern.test(value.trim())) {
    return 'Please enter a valid email address.';
  }

  return '';
};

export const validatePassword = (value, { required = true, minLength = 8 } = {}) => {
  if (required && !value) {
    return 'Password is required.';
  }

  if (!value) {
    return '';
  }

  if (value.length < minLength) {
    return `Password must be at least ${minLength} characters.`;
  }

  if (!/[a-z]/.test(value)) {
    return 'Password must include at least one lowercase letter.';
  }

  if (!/[A-Z]/.test(value)) {
    return 'Password must include at least one uppercase letter.';
  }

  if (!/[^\w\s]/.test(value)) {
    return 'Password must include at least one symbol.';
  }

  return '';
};

export const validateConfirmPassword = (password, confirmPassword) => {
  if (!confirmPassword) {
    return 'Please confirm your password.';
  }

  if (password !== confirmPassword) {
    return 'Passwords do not match.';
  }

  return '';
};

export const validateLoginField = (name, value) => {
  if (name === 'email') {
    return validateEmail(value);
  }

  if (name === 'password') {
    if (!value) {
      return 'Password is required.';
    }
    return '';
  }

  return '';
};

export const validateRegisterField = (name, value, formData) => {
  if (name === 'name') {
    if (!value?.trim()) {
      return 'Full name is required.';
    }
    return '';
  }

  if (name === 'email') {
    return validateEmail(value);
  }

  if (name === 'password') {
    return validatePassword(value);
  }

  if (name === 'password_confirmation') {
    return validateConfirmPassword(formData.password, value);
  }

  return '';
};

export const validateLoginForm = (formData) => {
  const errors = {};

  const emailError = validateEmail(formData.email);
  if (emailError) {
    errors.email = emailError;
  }

  if (!formData.password) {
    errors.password = 'Password is required.';
  }

  return errors;
};

export const validateRegisterForm = (formData) => {
  const errors = {};

  if (!formData.name?.trim()) {
    errors.name = 'Full name is required.';
  }

  const emailError = validateEmail(formData.email);
  if (emailError) {
    errors.email = emailError;
  }

  const passwordError = validatePassword(formData.password);
  if (passwordError) {
    errors.password = passwordError;
  }

  const confirmError = validateConfirmPassword(formData.password, formData.password_confirmation);
  if (confirmError) {
    errors.password_confirmation = confirmError;
  }

  return errors;
};
