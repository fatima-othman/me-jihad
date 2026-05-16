import { Navigate, useLocation } from 'react-router-dom';
import DashboardSkeleton from './DashboardSkeleton';
import { ROUTES } from '../config/routes';
import { useAuth } from '../context/AuthContext';
import { storage } from '../utils/storage';

const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const { loading, isAuthenticated } = useAuth();

  if (loading) {
    return <DashboardSkeleton />;
  }

  const hasToken = isAuthenticated || Boolean(storage.getToken());

  if (!hasToken) {
    return <Navigate to={ROUTES.login} replace state={{ from: location }} />;
  }

  return children;
};

export default ProtectedRoute;
