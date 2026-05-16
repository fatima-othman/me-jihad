import { Navigate } from 'react-router-dom'
import { hasAdminSession } from '../../lib/adminAuth'

export default function AdminRoute({ children }) {
  return hasAdminSession() ? children : <Navigate to="/admin/login" replace />
}
