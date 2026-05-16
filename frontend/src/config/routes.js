export const ROUTES = {
  home: '/',
  register: '/register',
  login: '/login',
  forgotPassword: '/forgot-password',
  resetPassword: '/reset-password',
  dashboard: '/dashboard',
  dashboardProjects: '/dashboard/projects',
  dashboardCredits: '/dashboard/credits',
  dashboardPricing: '/dashboard/pricing',
  dashboardHistory: '/dashboard/history',
  reportView: '/reports/:id/view',
  projects: '/projects',
  projectNew: '/projects/new',
  projectEdit: '/projects/:id/edit',
  projectSections: '/projects/:id/select',
  feature2Home: '/feature2',
  feature2AuthPlus: '/feature2/auth-plus',
  feature2StrategyCore: '/feature2/strategy',
  feature2StrategyNew: '/feature2/strategy/new',
  feature2History: '/feature2/strategy/history',
  feature2StrategyDetails: '/feature2/strategy/:id',
  feature2BusinessPages: '/feature2/business',
  feature2Pricing: '/feature2/business/pricing',
  feature2Contact: '/feature2/business/contact',
  feature2Privacy: '/feature2/business/privacy',
  feature2Terms: '/feature2/business/terms',
  feature2Profile: '/feature2/profile',
  feature5Home: '/feature5/*',
};

export const buildStrategyDetailsPath = (id) => `/feature2/strategy/${id}`;
export const buildReportViewPath = (id) => `/reports/${id}/view`;

export const NAV_LINKS = {
  public: [
    { label: 'Log in', to: ROUTES.login },
  ],
  private: [
    { label: 'Dashboard', to: ROUTES.dashboard },
    { label: 'Projects', to: ROUTES.dashboardProjects },
    { label: 'Credits', to: ROUTES.dashboardCredits },
    { label: 'Feature 2', to: ROUTES.feature2Home },
    { label: 'Feature 5', to: '/feature5' },
  ],
};

export const QUICK_LINKS = [
  { label: 'Home', to: ROUTES.home, protected: false },
  { label: 'Register', to: ROUTES.register, protected: false },
  { label: 'Login', to: ROUTES.login, protected: false },
  { label: 'Dashboard', to: ROUTES.dashboard, protected: true },
  { label: 'Projects', to: ROUTES.dashboardProjects, protected: true },
  { label: 'Feature 2', to: ROUTES.feature2Home, protected: true },
  { label: 'Feature 5', to: '/feature5', protected: true },
];
