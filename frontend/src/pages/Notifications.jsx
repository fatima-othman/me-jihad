import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  AlertCircle,
  AlertTriangle,
  Bell,
  CheckCheck,
  CheckCircle2,
  Clock3,
  Loader2,
  MailOpen,
  Search,
  Trash2,
  UserPlus,
} from 'lucide-react'
import api from '../api/axios'

const emptyStats = {
  total: 0,
  unread: 0,
  alerts: 0,
  system: 0,
}

function formatDateTime(value) {
  return new Date(value).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function typeIcon(type) {
  if (type === 'User') return UserPlus
  if (type === 'Alert') return AlertTriangle
  if (type === 'Report') return CheckCircle2
  return Bell
}

function typeClass(type) {
  if (type === 'User') return 'text-[#355872]'
  if (type === 'Alert') return 'text-red-700'
  if (type === 'Report') return 'text-emerald-700'
  return 'text-[#7AAACE]'
}

export default function Notifications() {
  const [notifications, setNotifications] = useState([])
  const [stats, setStats] = useState(emptyStats)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchNotifications = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const response = await api.get('/admin/notifications')
      setNotifications(response.data.notifications || [])
      setStats({ ...emptyStats, ...(response.data.stats || {}) })
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to load notifications from the database.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  const filteredNotifications = useMemo(
    () =>
      notifications.filter((notification) => {
        const matchesFilter =
          filter === 'All' || notification.status === filter || notification.type === filter
        const haystack = `${notification.title} ${notification.message} ${notification.type}`.toLowerCase()
        return matchesFilter && haystack.includes(search.toLowerCase())
      }),
    [notifications, search, filter],
  )

  const markRead = async (id) => {
    setError('')

    try {
      await api.patch(`/admin/notifications/${id}`, { is_read: true })
      await fetchNotifications()
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to mark notification as read.')
    }
  }

  const markAllRead = async () => {
    setError('')

    try {
      await api.put('/admin/notifications/read-all')
      await fetchNotifications()
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to mark notifications as read.')
    }
  }

  const removeNotification = async (id) => {
    setError('')

    try {
      await api.delete(`/admin/notifications/${id}`)
      await fetchNotifications()
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to delete notification.')
    }
  }

  return (
    <div className="min-h-screen bg-[#F7F8F0]">
      <div className="flex h-[82px] items-center justify-between border-b border-[#9CD5FF] bg-[#F7F8F0] px-6">
        <div>
          <h1 className="text-[30px] font-bold leading-none text-[#355872]">Notifications</h1>
          <p className="mt-2 text-[13px] text-[#7AAACE]">
            Track admin alerts, report events, user activity, and system summaries
          </p>
        </div>

        <button
          onClick={markAllRead}
          className="flex h-11 items-center gap-2 rounded-xl bg-[#355872] px-5 text-sm font-medium text-white shadow-[0_6px_16px_rgba(53,88,114,0.22)]"
        >
          <CheckCheck size={15} />
          Mark All Read
        </button>
      </div>

      <div className="p-6">
        {error && (
          <div className="mb-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-red-700">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { title: 'Total', value: stats.total, icon: Bell },
            { title: 'Unread', value: stats.unread, icon: Clock3 },
            { title: 'Alerts', value: stats.alerts, icon: AlertTriangle },
            { title: 'System', value: stats.system, icon: MailOpen },
          ].map((card) => (
            <div
              key={card.title}
              className="rounded-[20px] border border-[#9CD5FF] bg-[#F7F8F0] p-5 shadow-[0_8px_24px_rgba(53,88,114,0.08)]"
            >
              <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-xl bg-white/70 text-[#355872]">
                <card.icon size={18} />
              </div>
              <h3 className="text-[22px] font-bold leading-none text-[#355872]">{card.value}</h3>
              <p className="mt-3 text-[14px] text-[#355872]">{card.title}</p>
            </div>
          ))}
        </div>

        <div className="mb-5 flex flex-col gap-3 rounded-[22px] border border-[#9CD5FF] bg-[#F7F8F0] p-4 shadow-[0_8px_24px_rgba(53,88,114,0.08)] lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full max-w-[460px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7AAACE]" size={17} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search notifications..."
              className="h-11 w-full rounded-xl border border-[#9CD5FF] bg-white/70 pl-11 pr-4 text-sm text-[#355872] outline-none focus:border-[#355872]"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {['All', 'Unread', 'Read', 'User', 'Report', 'Alert', 'System'].map((item) => (
              <button
                key={item}
                onClick={() => setFilter(item)}
                className={`h-10 rounded-xl px-4 text-sm font-semibold transition ${
                  filter === item
                    ? 'bg-[#355872] text-white'
                    : 'border border-[#9CD5FF] text-[#355872] hover:border-[#355872]'
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-[22px] border border-[#9CD5FF] bg-[#F7F8F0] shadow-[0_8px_24px_rgba(53,88,114,0.08)]">
          {loading ? (
            <div className="flex items-center justify-center gap-2 px-5 py-12 text-sm text-[#7AAACE]">
              <Loader2 size={16} className="animate-spin" />
              Loading notifications from database...
            </div>
          ) : filteredNotifications.map((notification) => {
            const Icon = typeIcon(notification.type)

            return (
              <div
                key={notification.id}
                className="flex flex-col gap-4 border-b border-[#9CD5FF]/70 px-5 py-5 last:border-b-0 lg:flex-row lg:items-center"
              >
                <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/70 ${typeClass(notification.type)}`}>
                  <Icon size={18} />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-base font-bold text-[#355872]">{notification.title}</h2>
                    <span className="rounded-full border border-[#9CD5FF] px-3 py-1 text-xs font-semibold text-[#7AAACE]">
                      {notification.type}
                    </span>
                    {notification.status === 'Unread' && (
                      <span className="rounded-full bg-[#355872] px-3 py-1 text-xs font-semibold text-white">
                        Unread
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-sm leading-6 text-[#355872]">{notification.message}</p>
                  <p className="mt-2 text-xs text-[#7AAACE]">{formatDateTime(notification.time)}</p>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <button
                    onClick={() => markRead(notification.id)}
                    className="flex h-9 items-center gap-2 rounded-lg border border-[#9CD5FF] px-3 text-sm font-semibold text-[#355872]"
                  >
                    <CheckCircle2 size={15} />
                    Read
                  </button>
                  <button
                    onClick={() => removeNotification(notification.id)}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 text-red-700"
                    title="Delete"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            )
          })}

          {!loading && filteredNotifications.length === 0 && (
            <div className="px-5 py-12 text-center text-sm text-[#7AAACE]">
              No notifications matched your filters.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
