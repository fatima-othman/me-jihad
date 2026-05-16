import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import api from '../../api/axios'
import { clearAdminSession } from '../../lib/adminAuth'
import Header from './Header'
import Sidebar from './Sidebar'

export default function AdminLayout() {
  useEffect(() => {
    let active = true

    const verifySession = async () => {
      try {
        await api.get('/admin/me')
      } catch {
        if (active) {
          clearAdminSession()
          window.location.href = '/admin/login'
        }
      }
    }

    verifySession()
    const intervalId = window.setInterval(verifySession, 5000)

    return () => {
      active = false
      window.clearInterval(intervalId)
    }
  }, [])

  return (
    <div className="flex bg-[#F7F8F0] h-screen overflow-hidden">
      <div className="w-[230px] h-full shrink-0">
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
