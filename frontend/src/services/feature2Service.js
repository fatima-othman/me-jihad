import api from './api';

const STRATEGY_KEY = 'strategai_feature2_reports';
const TRANSACTIONS_KEY = 'strategai_feature2_transactions';

const defaultPackages = [
  { id: 1, name: 'Starter', credits: 70, price: 50, is_active: true, billing_cycle: 'one_time' },
  { id: 2, name: 'Growth', credits: 200, price: 120, is_active: true, billing_cycle: 'one_time' },
  { id: 3, name: 'Business', credits: 500, price: 260, is_active: true, billing_cycle: 'one_time' },
  { id: 4, name: 'Enterprise', credits: 1200, price: 550, is_active: true, billing_cycle: 'one_time' },
];

const normalizeApiError = (error, fallbackMessage) => {
  const responseData = error?.response?.data;
  if (responseData?.errors && typeof responseData.errors === 'object') {
    const firstField = Object.keys(responseData.errors)[0];
    const firstMessage = responseData.errors[firstField]?.[0];
    return new Error(firstMessage || fallbackMessage);
  }

  return new Error(responseData?.message || fallbackMessage);
};

const readJson = (key, fallback = []) => {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) {
      return fallback;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
};

const writeJson = (key, value) => {
  window.localStorage.setItem(key, JSON.stringify(value));
};

const nowIso = () => new Date().toISOString();

const createLocalStrategy = (payload) => {
  const item = {
    id: Date.now(),
    company_name: payload.company_name,
    industry: payload.industry,
    target_market: payload.target_market,
    objective: payload.objective,
    timeline: payload.timeline,
    budget_range: payload.budget_range,
    challenges: payload.challenges,
    summary: `Strategy draft for ${payload.company_name} focused on ${payload.objective}.`,
    priorities: ['Define quarterly goals', 'Launch pilot campaign', 'Track weekly KPI performance'],
    risks: ['Budget overrun risk', 'Acquisition channel volatility', 'Execution bandwidth constraints'],
    kpis: ['Monthly recurring revenue', 'Customer acquisition cost', 'Lead-to-sale conversion rate'],
    created_at: nowIso(),
  };

  const current = readJson(STRATEGY_KEY);
  writeJson(STRATEGY_KEY, [item, ...current]);
  return item;
};

const createLocalCreditUsage = () => {
  const items = readJson(TRANSACTIONS_KEY);
  if (items.length > 0) {
    return items;
  }

  const seed = [
    { id: 1, type: 'signup_bonus', description: 'Welcome credits', credits: 20, amount: 0, status: 'completed', created_at: nowIso() },
  ];
  writeJson(TRANSACTIONS_KEY, seed);
  return seed;
};

export const requestPasswordReset = async (payload) => {
  try {
    const response = await api.post('/forgot-password', payload, { skipAuthRedirect: true });
    return response.data;
  } catch (error) {
    throw normalizeApiError(error, 'Could not send reset request.');
  }
};

export const submitPasswordReset = async (payload) => {
  try {
    const response = await api.post('/reset-password', payload, { skipAuthRedirect: true });
    return response.data;
  } catch (error) {
    throw normalizeApiError(error, 'Could not reset password.');
  }
};

export const createStrategyReport = async (payload) => {
  try {
    const response = await api.post('/strategy-reports', payload);
    return response.data?.data || response.data;
  } catch {
    return createLocalStrategy(payload);
  }
};

export const getStrategyHistory = async () => {
  try {
    const response = await api.get('/strategy-reports');
    return response.data?.data || response.data || [];
  } catch {
    return readJson(STRATEGY_KEY);
  }
};

export const getStrategyReportById = async (id) => {
  try {
    const response = await api.get(`/strategy-reports/${id}`);
    return response.data?.data || response.data;
  } catch {
    const report = readJson(STRATEGY_KEY).find((item) => String(item.id) === String(id));
    if (!report) {
      throw new Error('Strategy report not found.');
    }
    return report;
  }
};

export const getCreditPackages = async () => {
  try {
    const response = await api.get('/credit-packages');
    return response.data?.data || response.data || [];
  } catch {
    return defaultPackages;
  }
};

export const getTransactions = async () => {
  try {
    const response = await api.get('/credit-transactions');
    return response.data?.data || response.data || [];
  } catch {
    return createLocalCreditUsage();
  }
};

export const getCreditsOverview = async () => {
  try {
    const response = await api.get('/credits-overview');
    return response.data?.data || response.data;
  } catch {
    return {
      user: {
        credit_balance: 20,
        auto_recharge_enabled: false,
        auto_recharge_package_id: null,
        stripe_payment_method_id: '',
      },
      transactions: createLocalCreditUsage(),
    };
  }
};

export const updateAutoRechargeSettings = async (payload) => {
  try {
    const response = await api.post('/credits/auto-recharge', payload);
    return response.data?.data || response.data;
  } catch {
    return { success: true };
  }
};

export const createSetupIntent = async () => {
  try {
    const response = await api.post('/stripe/setup-intent');
    return response.data?.data || response.data;
  } catch {
    return { client_secret: '' };
  }
};

export const savePaymentMethod = async (payload) => {
  try {
    const response = await api.post('/stripe/payment-method', payload);
    return response.data?.data || response.data;
  } catch {
    return { success: true };
  }
};

export const createCheckoutSession = async (payload) => {
  try {
    const response = await api.post('/stripe/checkout-session', payload);
    return response.data?.data || response.data;
  } catch (error) {
    throw normalizeApiError(error, 'Failed to create checkout session.');
  }
};

export const confirmCheckoutSession = async (payload) => {
  try {
    const response = await api.post('/stripe/checkout-session/confirm', payload);
    return response.data?.data || response.data;
  } catch (error) {
    throw normalizeApiError(error, 'Failed to confirm checkout session.');
  }
};

export const updateProfile = async (payload) => {
  try {
    const response = await api.put('/profile', payload);
    return response.data?.user || response.data?.data?.user || response.data;
  } catch {
    return payload;
  }
};
