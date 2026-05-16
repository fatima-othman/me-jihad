import { Navigate } from 'react-router-dom'
import { hasAdminSession } from '../../lib/adminAuth'

export default function AdminGuestRoute({ children }) {
  return hasAdminSession() ? <Navigate to="/admin" replace /> : children
}
