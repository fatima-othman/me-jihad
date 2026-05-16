import { AnimatePresence } from 'framer-motion';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import AdminGuestRoute from '../components/auth/AdminGuestRoute';
import AdminRoute from '../components/auth/AdminRoute';
import { ROUTES } from '../config/routes';
import { useAuth } from '../context/AuthContext';
import {
  DashboardPage,
  HomePage,
  LoginPage,
  NotFoundPage,
  RegisterPage,
} from '../features/feature1';
import {
  AuthPlus,
  BusinessPages,
  Contact,
  CreditsPage,
  Feature2Home,
  HistoryPage,
  Pricing,
  PricingPage,
  Privacy,
  ProfileSettings,
  StrategyCore,
  StrategyCreate,
  StrategyHistory,
  StrategyResult,
  Terms,
} from '../features/feature2';
import MainLayout from '../layouts/MainLayout';
import AdminLayout from '../components/Layout/AdminLayout';
import AdminAnalytics from '../pages/Analytics';
import AdminDashboard from '../pages/Dashboard';
import AdminLogin from '../pages/Login';
import AdminNotifications from '../pages/Notifications';
import AdminReports from '../pages/Reports';
import AdminReviews from '../pages/Reviews';
import AdminSettings from '../pages/Settings';
import AdminUsers from '../pages/Users';
import ForgotPassword from '../pages/ForgotPassword';
import ResetPassword from '../pages/ResetPassword';
import DashboardProjects from '../pages/DashboardProjects';
import CreateProject from '../pages/Feature 3/CreateProject';
import EditProject from '../pages/Feature 3/EditProject';
import ProjectsList from '../pages/Feature 3/ProjectsList';
import SectionSelection from '../pages/Feature 3/SectionSelection';
import ReportPage from '../pages/Feature4/ReportPage';
import Feature5Root from '../pages/Feature5Root';

const AppRouter = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        <Route
          path="/admin/login"
          element={(
            <AdminGuestRoute>
              <AdminLogin />
            </AdminGuestRoute>
          )}
        />
        <Route
          path="/admin"
          element={(
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          )}
        >
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="reports" element={<AdminReports />} />
          <Route path="reviews" element={<AdminReviews />} />
          <Route path="notifications" element={<AdminNotifications />} />
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
        <Route element={<MainLayout />}>
          <Route path={ROUTES.home} element={<HomePage />} />
          <Route
            path={ROUTES.register}
            element={isAuthenticated ? <Navigate to={ROUTES.dashboard} replace /> : <RegisterPage />}
          />
          <Route
            path={ROUTES.login}
            element={isAuthenticated ? <Navigate to={ROUTES.dashboard} replace /> : <LoginPage />}
          />
          <Route
            path={ROUTES.forgotPassword}
            element={<ForgotPassword />}
          />
          <Route
            path={ROUTES.resetPassword}
            element={<ResetPassword />}
          />
          <Route
            path={ROUTES.dashboard}
            element={(
              <ProtectedRoute>
                <Navigate to="/feature5/dashboard" replace />
              </ProtectedRoute>
            )}
          />
          <Route
            path={ROUTES.dashboardProjects}
            element={(
              <ProtectedRoute>
                <DashboardProjects />
              </ProtectedRoute>
            )}
          />
          <Route
            path={ROUTES.dashboardCredits}
            element={(
              <ProtectedRoute>
                <CreditsPage />
              </ProtectedRoute>
            )}
          />
          <Route
            path={ROUTES.dashboardPricing}
            element={(
              <ProtectedRoute>
                <PricingPage />
              </ProtectedRoute>
            )}
          />
          <Route
            path={ROUTES.dashboardHistory}
            element={(
              <ProtectedRoute>
                <HistoryPage />
              </ProtectedRoute>
            )}
          />
          <Route
            path={ROUTES.reportView}
            element={(
              <ProtectedRoute>
                <ReportPage />
              </ProtectedRoute>
            )}
          />
          <Route
            path={ROUTES.projects}
            element={(
              <ProtectedRoute>
                <ProjectsList />
              </ProtectedRoute>
            )}
          />
          <Route
            path={ROUTES.projectNew}
            element={(
              <ProtectedRoute>
                <CreateProject />
              </ProtectedRoute>
            )}
          />
          <Route
            path={ROUTES.projectEdit}
            element={(
              <ProtectedRoute>
                <EditProject />
              </ProtectedRoute>
            )}
          />
          <Route
            path={ROUTES.projectSections}
            element={(
              <ProtectedRoute>
                <SectionSelection />
              </ProtectedRoute>
            )}
          />
          <Route
            path={ROUTES.feature2Home}
            element={(
              <ProtectedRoute>
                <Feature2Home />
              </ProtectedRoute>
            )}
          />
          <Route
            path={ROUTES.feature5Home}
            element={(
              <ProtectedRoute>
                <Feature5Root />
              </ProtectedRoute>
            )}
          />
          <Route
            path={ROUTES.feature2AuthPlus}
            element={(
              <ProtectedRoute>
                <AuthPlus />
              </ProtectedRoute>
            )}
          />
          <Route
            path={ROUTES.feature2StrategyCore}
            element={(
              <ProtectedRoute>
                <StrategyCore />
              </ProtectedRoute>
            )}
          />
          <Route
            path={ROUTES.feature2StrategyNew}
            element={(
              <ProtectedRoute>
                <StrategyCreate />
              </ProtectedRoute>
            )}
          />
          <Route
            path={ROUTES.feature2History}
            element={(
              <ProtectedRoute>
                <StrategyHistory />
              </ProtectedRoute>
            )}
          />
          <Route
            path={ROUTES.feature2StrategyDetails}
            element={(
              <ProtectedRoute>
                <StrategyResult />
              </ProtectedRoute>
            )}
          />
          <Route
            path={ROUTES.feature2BusinessPages}
            element={(
              <ProtectedRoute>
                <BusinessPages />
              </ProtectedRoute>
            )}
          />
          <Route
            path={ROUTES.feature2Pricing}
            element={(
              <ProtectedRoute>
                <Pricing />
              </ProtectedRoute>
            )}
          />
          <Route
            path={ROUTES.feature2Contact}
            element={(
              <ProtectedRoute>
                <Contact />
              </ProtectedRoute>
            )}
          />
          <Route
            path={ROUTES.feature2Privacy}
            element={(
              <ProtectedRoute>
                <Privacy />
              </ProtectedRoute>
            )}
          />
          <Route
            path={ROUTES.feature2Terms}
            element={(
              <ProtectedRoute>
                <Terms />
              </ProtectedRoute>
            )}
          />
          <Route
            path={ROUTES.feature2Profile}
            element={(
              <ProtectedRoute>
                <ProfileSettings />
              </ProtectedRoute>
            )}
          />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </AnimatePresence>
  );
};

export default AppRouter;
