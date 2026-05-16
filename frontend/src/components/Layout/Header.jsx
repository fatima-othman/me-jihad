import { Bell, User } from 'lucide-react'
import { getAdminUser } from '../../lib/adminAuth'

export default function Header() {
  const adminUser = getAdminUser() || {}

  return (
    <header className="flex items-center justify-between border-b border-[#9CD5FF] bg-white/85 px-6 py-4 backdrop-blur-sm">
      <div>
        <p className="text-[11px] uppercase tracking-[0.24em] text-[#7AAACE]">Control Room</p>
        <h2 className="text-xl font-semibold text-[#355872]">
          Welcome back, {adminUser.name || 'Admin'}
        </h2>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative rounded-full border border-[#9CD5FF] bg-white p-2">
          <Bell size={18} className="text-[#355872]" />
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#7AAACE] text-xs text-white">
            3
          </span>
        </button>

        <div className="flex items-center gap-3 rounded-full border border-[#9CD5FF] bg-[#F7F8F0] px-3 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#7AAACE]">
            <User size={18} className="text-white" />
          </div>
          <div className="leading-tight">
            <p className="text-sm font-medium text-[#355872]">{adminUser.email || 'admin@strategai.com'}</p>
            <p className="text-[11px] uppercase tracking-[0.18em] text-[#7AAACE]">{adminUser.role || 'admin'}</p>
          </div>
        </div>
      </div>
    </header>
  )
}
