import { useEffect, useMemo, useState } from 'react'
import {
  Bell,
  CheckCircle2,
  Database,
  Globe2,
  KeyRound,
  Loader2,
  Lock,
  Mail,
  RefreshCw,
  Save,
  Server,
  ShieldCheck,
  UserRound,
} from 'lucide-react'
import api from '../api/axios'
import { clearAdminSession, getAdminToken, storeAdminSession } from '../lib/adminAuth'

const emptySettings = {
  profile: {
    name: '',
    email: '',
    role: 'admin',
    last_login_at: null,
  },
  settings: {
    platform: {
      default_credits: 0,
      registration_enabled: true,
      default_language: 'English',
      report_generation_limit: 25,
    },
    security: {
      require_strong_passwords: true,
    },
    notifications: {
      email_new_users: true,
      email_failed_reports: true,
      weekly_analytics_summary: false,
    },
  },
  system: {
    backend_status: 'checking',
    api_url: '',
    app_version: '',
    database_status: 'checking',
  },
}

function formatDateTime(value) {
  if (!value) return 'Not recorded yet'

  return new Date(value).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function Toggle({ checked, onChange, label, description }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-4 rounded-2xl border border-[#9CD5FF] bg-white/55 px-4 py-3 text-left transition hover:border-[#7AAACE]"
    >
      <span>
        <span className="block text-sm font-semibold text-[#355872]">{label}</span>
        <span className="mt-1 block text-xs text-[#7AAACE]">{description}</span>
      </span>
      <span
        className={`flex h-7 w-12 shrink-0 items-center rounded-full p-1 transition ${
          checked ? 'bg-[#355872]' : 'bg-[#DCEAF3]'
        }`}
      >
        <span
          className={`h-5 w-5 rounded-full bg-white shadow-sm transition ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </span>
    </button>
  )
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-[#7AAACE]">
        {label}
      </span>
      {children}
    </label>
  )
}

function inputClass() {
  return 'h-11 w-full rounded-xl border border-[#9CD5FF] bg-white/70 px-4 text-sm text-[#355872] outline-none transition placeholder:text-[#7AAACE] focus:border-[#355872] focus:ring-2 focus:ring-[#9CD5FF]/40'
}

export default function Settings() {
  const [profile, setProfile] = useState(emptySettings.profile)
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    password: '',
    password_confirmation: '',
  })
  const [platform, setPlatform] = useState(emptySettings.settings.platform)
  const [security, setSecurity] = useState(emptySettings.settings.security)
  const [notifications, setNotifications] = useState(emptySettings.settings.notifications)
  const [system, setSystem] = useState(emptySettings.system)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const systemCards = useMemo(
    () => [
      {
        title: 'Backend Status',
        value: system.backend_status,
        icon: Server,
      },
      {
        title: 'API URL',
        value: system.api_url || 'Not configured',
        icon: Globe2,
      },
      {
        title: 'App Version',
        value: system.app_version || '1.0.0',
        icon: ShieldCheck,
      },
      {
        title: 'Database Status',
        value: system.database_status,
        icon: Database,
      },
    ],
    [system],
  )

  const loadSettings = async () => {
    setLoading(true)
    setError('')

    try {
      const { data } = await api.get('/admin/settings')
      setProfile(data.profile || emptySettings.profile)
      setPlatform(data.settings?.platform || emptySettings.settings.platform)
      setSecurity(data.settings?.security || emptySettings.settings.security)
      setNotifications(data.settings?.notifications || emptySettings.settings.notifications)
      setSystem(data.system || emptySettings.system)
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to load settings right now.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSettings()
  }, [])

  const saveSettings = async (section, payload) => {
    setSaving(section)
    setError('')
    setMessage('')

    try {
      const { data } = await api.put('/admin/settings', payload)
      setProfile(data.profile || profile)
      setPlatform(data.settings?.platform || platform)
      setSecurity(data.settings?.security || security)
      setNotifications(data.settings?.notifications || notifications)
      setSystem(data.system || system)

      if (data.token) {
        storeAdminSession({ token: data.token, user: data.profile })
      } else {
        storeAdminSession({ token: getAdminToken(), user: data.profile })
      }

      setMessage(data.message || 'Settings saved successfully.')
      setPasswordForm({
        current_password: '',
        password: '',
        password_confirmation: '',
      })
    } catch (requestError) {
      const errors = requestError.response?.data?.errors
      const firstError = errors ? Object.values(errors).flat()[0] : null
      setError(firstError || requestError.response?.data?.message || 'Unable to save settings right now.')
    } finally {
      setSaving('')
    }
  }

  const handleLogoutAll = async () => {
    await saveSettings('logout_all', { security_action: 'logout_all' })
    clearAdminSession()
    window.location.href = '/admin/login'
  }

  return (
    <div className="min-h-screen bg-[#F7F8F0]">
      <div className="flex h-[82px] items-center justify-between border-b border-[#9CD5FF] bg-[#F7F8F0] px-6">
        <div>
          <h1 className="text-[30px] font-bold leading-none text-[#355872]">Settings</h1>
          <p className="mt-2 text-[13px] text-[#7AAACE]">
            Manage profile, platform rules, security, notifications, and system health
          </p>
        </div>

        <button
          onClick={loadSettings}
          className="flex h-11 items-center gap-2 rounded-xl bg-[#355872] px-5 text-sm font-medium text-white shadow-[0_6px_16px_rgba(53,88,114,0.22)]"
        >
          <RefreshCw size={15} />
          Refresh
        </button>
      </div>

      <div className="p-6">
        {message && (
          <div className="mb-5 flex items-center gap-2 rounded-2xl border border-[#9CD5FF] bg-white/70 px-4 py-3 text-sm text-[#355872]">
            <CheckCircle2 size={17} className="text-[#7AAACE]" />
            {message}
          </div>
        )}

        {error && (
          <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex h-[420px] items-center justify-center text-[#7AAACE]">
            <Loader2 className="mr-2 animate-spin" size={18} />
            Loading settings...
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)]">
            <section className="rounded-[22px] border border-[#9CD5FF] bg-[#F7F8F0] p-5 shadow-[0_8px_24px_rgba(53,88,114,0.08)]">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/70 text-[#355872]">
                  <UserRound size={18} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#355872]">Profile Settings</h2>
                  <p className="text-xs text-[#7AAACE]">Update the active admin account.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field label="Admin Name">
                  <input
                    className={inputClass()}
                    value={profile.name}
                    onChange={(event) => setProfile((current) => ({ ...current, name: event.target.value }))}
                  />
                </Field>
                <Field label="Admin Email">
                  <input
                    className={inputClass()}
                    type="email"
                    value={profile.email}
                    onChange={(event) => setProfile((current) => ({ ...current, email: event.target.value }))}
                  />
                </Field>
              </div>

              <button
                onClick={() => saveSettings('profile', { profile: { name: profile.name, email: profile.email } })}
                disabled={saving === 'profile'}
                className="mt-4 flex h-11 items-center gap-2 rounded-xl bg-[#355872] px-5 text-sm font-semibold text-white disabled:opacity-60"
              >
                {saving === 'profile' ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                Save Profile
              </button>

              <div className="mt-7 border-t border-[#9CD5FF] pt-5">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/70 text-[#355872]">
                    <Lock size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#355872]">Change Password</h3>
                    <p className="text-xs text-[#7AAACE]">
                      Last login: {formatDateTime(profile.last_login_at)}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <Field label="Current Password">
                    <input
                      className={inputClass()}
                      type="password"
                      value={passwordForm.current_password}
                      onChange={(event) =>
                        setPasswordForm((current) => ({ ...current, current_password: event.target.value }))
                      }
                    />
                  </Field>
                  <Field label="New Password">
                    <input
                      className={inputClass()}
                      type="password"
                      value={passwordForm.password}
                      onChange={(event) =>
                        setPasswordForm((current) => ({ ...current, password: event.target.value }))
                      }
                    />
                  </Field>
                  <Field label="Confirm Password">
                    <input
                      className={inputClass()}
                      type="password"
                      value={passwordForm.password_confirmation}
                      onChange={(event) =>
                        setPasswordForm((current) => ({ ...current, password_confirmation: event.target.value }))
                      }
                    />
                  </Field>
                </div>

                <button
                  onClick={() =>
                    saveSettings('password', {
                      profile: passwordForm,
                    })
                  }
                  disabled={saving === 'password'}
                  className="mt-4 flex h-11 items-center gap-2 rounded-xl bg-[#355872] px-5 text-sm font-semibold text-white disabled:opacity-60"
                >
                  {saving === 'password' ? <Loader2 className="animate-spin" size={16} /> : <KeyRound size={16} />}
                  Change Password
                </button>
              </div>
            </section>

            <section className="rounded-[22px] border border-[#9CD5FF] bg-[#F7F8F0] p-5 shadow-[0_8px_24px_rgba(53,88,114,0.08)]">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/70 text-[#355872]">
                  <Globe2 size={18} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#355872]">Platform Settings</h2>
                  <p className="text-xs text-[#7AAACE]">Defaults used by admin-managed accounts.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Default Credits">
                  <input
                    className={inputClass()}
                    type="number"
                    min="0"
                    value={platform.default_credits}
                    onChange={(event) =>
                      setPlatform((current) => ({ ...current, default_credits: Number(event.target.value) }))
                    }
                  />
                </Field>
                <Field label="Default Language">
                  <select
                    className={inputClass()}
                    value={platform.default_language}
                    onChange={(event) =>
                      setPlatform((current) => ({ ...current, default_language: event.target.value }))
                    }
                  >
                    <option value="English">English</option>
                    <option value="Arabic">Arabic</option>
                  </select>
                </Field>
                <Field label="Report Limit">
                  <input
                    className={inputClass()}
                    type="number"
                    min="1"
                    value={platform.report_generation_limit}
                    onChange={(event) =>
                      setPlatform((current) => ({ ...current, report_generation_limit: Number(event.target.value) }))
                    }
                  />
                </Field>
                <div className="sm:pt-7">
                  <Toggle
                    checked={platform.registration_enabled}
                    onChange={(value) => setPlatform((current) => ({ ...current, registration_enabled: value }))}
                    label="New User Registration"
                    description="Allow public signup when registration exists."
                  />
                </div>
              </div>

              <button
                onClick={() => saveSettings('platform', { platform })}
                disabled={saving === 'platform'}
                className="mt-4 flex h-11 items-center gap-2 rounded-xl bg-[#355872] px-5 text-sm font-semibold text-white disabled:opacity-60"
              >
                {saving === 'platform' ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                Save Platform
              </button>
            </section>

            <section className="rounded-[22px] border border-[#9CD5FF] bg-[#F7F8F0] p-5 shadow-[0_8px_24px_rgba(53,88,114,0.08)]">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/70 text-[#355872]">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#355872]">Security Settings</h2>
                  <p className="text-xs text-[#7AAACE]">Control sessions and password rules.</p>
                </div>
              </div>

              <div className="space-y-3">
                <Toggle
                  checked={security.require_strong_passwords}
                  onChange={(value) => setSecurity((current) => ({ ...current, require_strong_passwords: value }))}
                  label="Require Strong Passwords"
                  description="Use mixed-case and number requirements for new passwords."
                />
                <div className="rounded-2xl border border-[#9CD5FF] bg-white/55 px-4 py-3">
                  <p className="text-sm font-semibold text-[#355872]">Last Login Time</p>
                  <p className="mt-1 text-xs text-[#7AAACE]">{formatDateTime(profile.last_login_at)}</p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  onClick={() => saveSettings('security', { security })}
                  disabled={saving === 'security'}
                  className="flex h-11 items-center gap-2 rounded-xl bg-[#355872] px-5 text-sm font-semibold text-white disabled:opacity-60"
                >
                  {saving === 'security' ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                  Save Security
                </button>
                <button
                  onClick={() => saveSettings('regenerate_token', { security_action: 'regenerate_token' })}
                  disabled={saving === 'regenerate_token'}
                  className="flex h-11 items-center gap-2 rounded-xl border border-[#355872] px-5 text-sm font-semibold text-[#355872] disabled:opacity-60"
                >
                  <KeyRound size={16} />
                  Regenerate Token
                </button>
                <button
                  onClick={handleLogoutAll}
                  disabled={saving === 'logout_all'}
                  className="flex h-11 items-center gap-2 rounded-xl border border-red-200 px-5 text-sm font-semibold text-red-700 disabled:opacity-60"
                >
                  <Lock size={16} />
                  Logout All Devices
                </button>
              </div>
            </section>

            <section className="rounded-[22px] border border-[#9CD5FF] bg-[#F7F8F0] p-5 shadow-[0_8px_24px_rgba(53,88,114,0.08)]">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/70 text-[#355872]">
                  <Bell size={18} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#355872]">Notification Settings</h2>
                  <p className="text-xs text-[#7AAACE]">Choose which email summaries admins receive.</p>
                </div>
              </div>

              <div className="space-y-3">
                <Toggle
                  checked={notifications.email_new_users}
                  onChange={(value) => setNotifications((current) => ({ ...current, email_new_users: value }))}
                  label="New User Alerts"
                  description="Email admins when a new user is created."
                />
                <Toggle
                  checked={notifications.email_failed_reports}
                  onChange={(value) => setNotifications((current) => ({ ...current, email_failed_reports: value }))}
                  label="Failed Report Alerts"
                  description="Email admins when report generation fails."
                />
                <Toggle
                  checked={notifications.weekly_analytics_summary}
                  onChange={(value) =>
                    setNotifications((current) => ({ ...current, weekly_analytics_summary: value }))
                  }
                  label="Weekly Analytics Summary"
                  description="Receive a weekly performance summary."
                />
              </div>

              <button
                onClick={() => saveSettings('notifications', { notifications })}
                disabled={saving === 'notifications'}
                className="mt-4 flex h-11 items-center gap-2 rounded-xl bg-[#355872] px-5 text-sm font-semibold text-white disabled:opacity-60"
              >
                {saving === 'notifications' ? <Loader2 className="animate-spin" size={16} /> : <Mail size={16} />}
                Save Notifications
              </button>
            </section>

            <section className="xl:col-span-2 rounded-[22px] border border-[#9CD5FF] bg-[#F7F8F0] p-5 shadow-[0_8px_24px_rgba(53,88,114,0.08)]">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/70 text-[#355872]">
                  <Server size={18} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#355872]">System Info</h2>
                  <p className="text-xs text-[#7AAACE]">Current backend and database status.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                {systemCards.map((card) => (
                  <div key={card.title} className="rounded-2xl border border-[#9CD5FF] bg-white/55 p-4">
                    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-[#F7F8F0] text-[#355872]">
                      <card.icon size={18} />
                    </div>
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#7AAACE]">
                      {card.title}
                    </p>
                    <p className="mt-2 break-words text-sm font-bold capitalize text-[#355872]">
                      {card.value}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  )
}
