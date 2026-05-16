import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AlertCircle,
  ArrowRight,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
  Zap,
} from 'lucide-react'
import api from '../api/axios'
import { storeAdminSession } from '../lib/adminAuth'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('admin@strategai.com')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { data } = await api.post('/admin/login', {
        email,
        password,
        remember,
      })

      storeAdminSession({
        token: data.token,
        user: data.user,
      })

      navigate('/admin', { replace: true })
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          requestError.response?.data?.errors?.email?.[0] ||
          'Unable to reach the admin server. Make sure Laravel is running on http://127.0.0.1:8000.',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(156,213,255,0.38),_transparent_28%),linear-gradient(135deg,_#F7F8F0_0%,_#9CD5FF_38%,_#7AAACE_100%)] px-4 py-8">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:70px_70px] opacity-40" />
      <div className="absolute left-[-60px] top-14 h-56 w-56 rounded-full bg-[#F7F8F0]/70 blur-3xl" />
      <div className="absolute bottom-10 right-[-30px] h-64 w-64 rounded-full bg-[#9CD5FF]/20 blur-3xl" />

      <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-[32px] border border-white/40 bg-[#F7F8F0]/70 shadow-[0_30px_100px_rgba(53,88,114,0.18)] backdrop-blur-xl lg:grid-cols-[1.15fr_0.85fr]">
          <section className="relative hidden min-h-[680px] overflow-hidden px-10 py-12 lg:flex lg:flex-col lg:justify-between">
            <div>
              <div className="mb-8 inline-flex items-center gap-3 rounded-full border border-[#9CD5FF] bg-white/55 px-4 py-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#355872] text-white">
                  <ShieldCheck size={16} />
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-[0.26em] text-[#7AAACE]">StrategAI</p>
                  <p className="text-sm font-medium text-[#355872]">Admin Command Center</p>
                </div>
              </div>

              <h1 className="max-w-xl text-5xl font-semibold leading-[1.02] text-[#355872]">
                Run the platform from a room built for sharp decisions.
              </h1>
              <p className="mt-6 max-w-lg text-base leading-8 text-[#355872]">
                Review growth, manage users, and move through sensitive operations from a private
                admin workspace designed to feel calm, premium, and under control.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-[24px] border border-[#9CD5FF] bg-white/65 p-5">
                <Zap size={18} className="text-[#355872]" />
                <p className="mt-4 text-sm font-semibold text-[#355872]">Live oversight</p>
                <p className="mt-2 text-sm leading-6 text-[#7AAACE]">One place for admin-only actions and fast visibility.</p>
              </div>
              <div className="rounded-[24px] border border-[#9CD5FF] bg-white/65 p-5">
                <Sparkles size={18} className="text-[#355872]" />
                <p className="mt-4 text-sm font-semibold text-[#355872]">Trusted access</p>
                <p className="mt-2 text-sm leading-6 text-[#7AAACE]">Only verified admins can reach protected routes.</p>
              </div>
              <div className="rounded-[24px] border border-[#9CD5FF] bg-white/65 p-5">
                <ShieldCheck size={18} className="text-[#355872]" />
                <p className="mt-4 text-sm font-semibold text-[#355872]">Role aware</p>
                <p className="mt-2 text-sm leading-6 text-[#7AAACE]">Regular users are blocked from the admin API surface.</p>
              </div>
            </div>

            <div className="pointer-events-none absolute -bottom-16 -left-10 h-60 w-60 rounded-full border border-white/50 bg-white/20" />
            <div className="pointer-events-none absolute right-8 top-14 h-32 w-32 rounded-full border border-[#9CD5FF] bg-[#ffffff]/30" />
          </section>

          <section className="flex min-h-[680px] items-center justify-center px-6 py-10 sm:px-10">
            <div className="w-full max-w-[390px]">
              <p className="text-[11px] uppercase tracking-[0.26em] text-[#7AAACE]">Restricted Access</p>
              <h2 className="mt-3 text-3xl font-semibold text-[#355872]">Admin Login</h2>
              <p className="mt-3 text-sm leading-7 text-[#355872]">
                Sign in with an administrator account to access the StrategAI control room.
              </p>

              {error && (
                <div className="mt-6 flex items-start gap-3 rounded-2xl border border-[#9CD5FF] bg-[#F7F8F0] px-4 py-3 text-sm text-[#355872]">
                  <AlertCircle size={16} className="mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                <div>
                  <label className="mb-2 block text-[11px] font-semibold tracking-[0.08em] text-[#355872]">
                    Email Address
                  </label>
                  <div className="flex h-[52px] items-center rounded-2xl border border-[#9CD5FF] bg-white/70 px-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
                    <Mail size={16} className="text-[#7AAACE]" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="ml-3 w-full bg-transparent text-[15px] text-[#355872] placeholder:text-[#7AAACE] focus:outline-none"
                      placeholder="admin@strategai.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-[11px] font-semibold tracking-[0.08em] text-[#355872]">
                    Password
                  </label>
                  <div className="flex h-[52px] items-center rounded-2xl border border-[#9CD5FF] bg-white/70 px-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
                    <Lock size={16} className="text-[#7AAACE]" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="ml-3 w-full bg-transparent text-[15px] text-[#355872] placeholder:text-[#7AAACE] focus:outline-none"
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((current) => !current)}
                      className="text-[#7AAACE] transition hover:text-[#7AAACE]"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[12px] text-[#355872]">
                  <label className="flex cursor-pointer items-center gap-2 select-none">
                    <input
                      type="checkbox"
                      checked={remember}
                      onChange={() => setRemember(!remember)}
                      className="h-4 w-4 rounded border-[#9CD5FF] accent-[#355872]"
                    />
                    <span>Remember me</span>
                  </label>

                  <span className="font-medium text-[#7AAACE]">Admin access only</span>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="group flex h-[54px] w-full items-center justify-center gap-2 rounded-2xl bg-[#355872] text-[14px] font-semibold text-white shadow-[0_16px_30px_rgba(53,88,114,0.24)] transition hover:bg-[#7AAACE] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <span>{loading ? 'Signing in...' : 'Enter Admin Panel'}</span>
                  <ArrowRight size={16} className="transition group-hover:translate-x-0.5" />
                </button>
              </form>

              <div className="mt-8 rounded-[24px] border border-[#9CD5FF] bg-[#F7F8F0]/85 p-5">
                <div className="flex items-center gap-2 text-[#7AAACE]">
                  <ShieldCheck size={16} />
                  <p className="text-sm font-semibold text-[#355872]">Seeded first admin</p>
                </div>
                <p className="mt-3 text-sm leading-7 text-[#7AAACE]">
                  Default local credentials are loaded from the Laravel seeder and can be changed in
                  the backend `.env` file before deployment.
                </p>
              </div>

              <p className="mt-8 text-center text-[11px] uppercase tracking-[0.18em] text-[#7AAACE]">
                StrategAI admin experience
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
