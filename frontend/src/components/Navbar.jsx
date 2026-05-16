import { useLocation, useNavigate } from 'react-router-dom';
import { ROUTES } from '../config/routes';
import { useAuth } from '../context/AuthContext';

const PRIVATE_LINKS = [
  { label: 'Dashboard', path: ROUTES.dashboard },
  { label: 'Projects', path: ROUTES.dashboardProjects },
  { label: 'Credits', path: ROUTES.dashboardCredits },
  { label: 'Pricing', path: ROUTES.dashboardPricing },
];

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, logout, user } = useAuth();

  async function handleLogout() {
    try {
      await logout();
    } finally {
      navigate(ROUTES.login, { replace: true });
    }
  }

  return (
    <nav
      style={{ background: '#355872', fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif" }}
      className="sticky top-0 z-50 w-full"
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <button
          onClick={() => navigate(isAuthenticated ? ROUTES.dashboard : ROUTES.home)}
          className="flex items-center gap-2.5 group"
        >
          <div
            style={{ background: '#9CD5FF' }}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#355872] font-black text-sm"
          >
            S
          </div>
          <span className="text-white font-bold text-lg tracking-tight">
            Strateg<span style={{ color: '#9CD5FF' }}>AI</span>
          </span>
        </button>

        <div className="hidden md:flex items-center gap-1">
          {isAuthenticated && PRIVATE_LINKS.map((link) => {
            const active = link.path === ROUTES.dashboard
              ? location.pathname === ROUTES.dashboard
              : location.pathname.startsWith(link.path);
            return (
              <button
                key={link.path}
                onClick={() => navigate(link.path)}
                style={active ? { background: 'rgba(156,213,255,0.15)', color: '#9CD5FF' } : {}}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                  active ? '' : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}
              >
                {link.label}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <div
                style={{ background: 'rgba(156,213,255,0.15)', border: '1px solid rgba(156,213,255,0.3)' }}
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full"
              >
                <div style={{ background: '#9CD5FF' }} className="w-2 h-2 rounded-full" />
                <span className="text-white/80 text-xs font-medium">{user?.credit_balance ?? 0} credits</span>
              </div>
              <button
                style={{ background: '#7AAACE', border: '2px solid rgba(156,213,255,0.4)' }}
                className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm"
                title={user?.name || user?.email || 'User'}
              >
                {(user?.name || user?.email || 'U').slice(0, 1).toUpperCase()}
              </button>
              <button
                onClick={handleLogout}
                className="px-3 py-2 rounded-lg text-sm font-semibold text-white/75 hover:text-white hover:bg-white/10 transition"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => navigate(ROUTES.login)}
                className="px-3 py-2 rounded-lg text-sm font-semibold text-white/75 hover:text-white hover:bg-white/10 transition"
              >
                Log in
              </button>
              <button
                onClick={() => navigate(ROUTES.register)}
                style={{ background: '#9CD5FF', color: '#355872' }}
                className="px-4 py-2 rounded-lg text-sm font-bold hover:opacity-90 transition"
              >
                Register
              </button>
            </>
          )}
        </div>
      </div>
      <div style={{ background: 'rgba(156,213,255,0.2)', height: '1px' }} />
    </nav>
  );
}
