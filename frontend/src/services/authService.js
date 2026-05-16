import api, { API_BASE_URL } from './api';

const normalizeError = (error) => {
  const responseData = error?.response?.data;
  const status = error?.response?.status;
  const isNetworkError = !error?.response;

  if (isNetworkError) {
    return {
      status: null,
      message: `Cannot reach API server at ${API_BASE_URL}. Make sure Laravel is running and CORS is configured.`,
      fieldErrors: {},
    };
  }

  const fieldErrors = responseData?.errors && typeof responseData.errors === 'object'
    ? Object.entries(responseData.errors).reduce((acc, [field, messages]) => {
        acc[field] = Array.isArray(messages) ? messages[0] : String(messages);
        return acc;
      }, {})
    : {};

  const backendMessage = responseData?.message || '';
  const missingRoute = status === 404 && backendMessage.toLowerCase().includes('route');

  return {
    status,
    message: missingRoute
      ? 'Auth endpoint is not configured in Laravel yet. Please add /api/register and /api/login routes.'
      : (responseData?.message || 'Something went wrong. Please try again.'),
    fieldErrors,
  };
};

const extractAuthPayload = (data) => {
  const token = data?.token || data?.access_token || data?.data?.token || data?.data?.access_token || null;
  const user = data?.user || data?.data?.user || null;

  return { token, user, raw: data };
};

export const registerUser = async (payload) => {
  try {
    const response = await api.post('/register', payload, { skipAuthRedirect: true });
    return extractAuthPayload(response.data);
  } catch (error) {
    throw normalizeError(error);
  }
};

export const loginUser = async (payload) => {
  try {
    const response = await api.post('/login', payload, { skipAuthRedirect: true });
    return extractAuthPayload(response.data);
  } catch (error) {
    throw normalizeError(error);
  }
};

export const logoutUser = async () => {
  try {
    const response = await api.post('/logout');
    return response.data;
  } catch (error) {
    throw normalizeError(error);
  }
};

export const getCurrentUser = async () => {
  try {
    const response = await api.get('/me');
    return response.data?.user || response.data?.data?.user || response.data || null;
  } catch (error) {
    throw normalizeError(error);
  }
};
