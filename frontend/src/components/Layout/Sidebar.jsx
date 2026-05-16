import { NavLink } from 'react-router-dom'
import {
  BarChart3,
  Bell,
  ChevronRight,
  FileText,
  LayoutDashboard,
  LogOut,
  Settings,
  Shield,
  Star,
  Users,
} from 'lucide-react'
import api from '../../api/axios'
import { clearAdminSession, getAdminUser } from '../../lib/adminAuth'

export default function Sidebar() {
  const adminUser = getAdminUser() || {}

  const handleLogout = async () => {
    try {
      await api.post('/admin/logout')
    } catch {
      // Clear local state even when the backend token is already invalid.
    } finally {
      clearAdminSession()
      window.location.href = '/admin/login'
    }
  }

  const navItems = [
    { path: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
    { path: '/admin/users', icon: Users, label: 'Users' },
    { path: '/admin/reports', icon: FileText, label: 'Reports' },
  ]

  const systemItems = [
    { icon: Star, label: 'Reviews', path: '/admin/reviews' },
    { icon: Bell, label: 'Notifications', path: '/admin/notifications' },
    { icon: Settings, label: 'Settings', path: '/admin/settings' },
  ]

  return (
    <aside className="flex h-full min-h-screen w-[230px] flex-col border-r border-white/10 bg-gradient-to-b from-[#355872] to-[#7AAACE] text-white">
      <div className="border-b border-white/10 px-5 py-7">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/20 bg-white/10 shadow-sm">
            <Shield size={18} className="text-white" />
          </div>

          <div>
            <h1 className="text-[22px] font-bold leading-none">StrategAI</h1>
            <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-white/75">
              Admin Panel
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-5">
        <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/40">
          Main Menu
        </p>

        <nav className="space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/admin'}
              className={({ isActive }) =>
                `group flex items-center justify-between rounded-2xl px-4 py-3 transition-all ${
                  isActive
                    ? 'bg-white/14 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]'
                    : 'text-white/75 hover:bg-white/8 hover:text-white'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3">
                    <item.icon size={18} />
                    <span className="text-sm font-medium">{item.label}</span>
                  </div>

                  {isActive && <ChevronRight size={16} className="text-white/70" />}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <p className="mb-3 mt-8 px-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/40">
          System
        </p>

        <div className="space-y-1">
          {systemItems.map((item) =>
            item.path ? (
              <NavLink
                key={item.label}
                to={item.path}
                className={({ isActive }) =>
                  `group flex items-center justify-between rounded-2xl px-4 py-3 transition-all ${
                    isActive
                      ? 'bg-white/14 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]'
                      : 'text-white/75 hover:bg-white/8 hover:text-white'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-3">
                      <item.icon size={18} />
                      <span className="text-sm font-medium">{item.label}</span>
                    </div>

                    {isActive && <ChevronRight size={16} className="text-white/70" />}
                  </>
                )}
              </NavLink>
            ) : (
              <button
                key={item.label}
                type="button"
                className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-white/75 transition-all hover:bg-white/8 hover:text-white"
              >
                <item.icon size={18} />
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            ),
          )}
        </div>
      </div>

      <div className="mt-auto border-t border-white/10 bg-black/10 px-4 py-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#9CD5FF] font-semibold text-white">
            {(adminUser.name || 'Admin').charAt(0).toUpperCase()}
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white">
              {adminUser.name || 'Admin'}
            </p>
            <p className="truncate text-xs text-white/70">
              {adminUser.email || 'admin@strategai.com'}
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="shrink-0 text-white/70 transition hover:text-white"
            title="Logout"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </aside>
  )
}
