import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Activity,
  AlertCircle,
  Bell,
  CheckCircle2,
  CreditCard,
  Download,
  Eye,
  FileText,
  Flag,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Send,
  Star,
  TrendingUp,
  User,
  Users,
  X,
} from 'lucide-react'
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import api from '../api/axios'
import { getAdminUser } from '../lib/adminAuth'

const emptyOverview = {
  stats: {
    total_users: 0,
    total_projects: 0,
    total_reports: 0,
    credits_sold: 0,
    filtered_reports: 0,
    today_reports: 0,
    this_week_reports: 0,
  },
  daily_report_counts: [],
  weekly_report_counts: [],
  weekly_activity: [],
  language_counts: {},
  business_type_counts: [],
  top_projects: [],
  top_users: [],
  projects: [],
  reports: [],
}

function formatNumber(value) {
  return Number(value || 0).toLocaleString()
}

function formatDate(dateString) {
  if (!dateString) return 'N/A'

  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function getInitials(name = 'Admin User') {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function normalizeStatus(status = 'completed') {
  return status.charAt(0).toUpperCase() + status.slice(1)
}

export default function Dashboard() {
  const navigate = useNavigate()
  const adminUser = getAdminUser() || {}

  const [overview, setOverview] = useState(emptyOverview)
  const [filters, setFilters] = useState({
    search: '',
    type: 'All Types',
    language: 'All Languages',
    from: '',
    to: '',
  })
  const [filterOptions, setFilterOptions] = useState({
    types: ['All Types'],
    languages: ['All Languages'],
  })
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [error, setError] = useState('')
  const [chartMode, setChartMode] = useState('growth')
  const [selectedReport, setSelectedReport] = useState(null)
  const [flaggedReportIds, setFlaggedReportIds] = useState([])
  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [showUserModal, setShowUserModal] = useState(false)
  const [showProjectModal, setShowProjectModal] = useState(false)
  const [showNoticeModal, setShowNoticeModal] = useState(false)
  const [noticeMessage, setNoticeMessage] = useState('')
  const [localActivities, setLocalActivities] = useState([])
  const [actionLoading, setActionLoading] = useState(false)
  const [actionError, setActionError] = useState('')
  const [usersForProject, setUsersForProject] = useState([])
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    password: '',
    credits: 0,
    role: 'user',
    is_active: true,
  })
  const [projectForm, setProjectForm] = useState({
    user_id: '',
    name: '',
    business_name: '',
    industry: '',
  })

  const fetchOverview = useCallback(async ({ silent = false } = {}) => {
    if (silent) {
      setRefreshing(true)
    } else {
      setLoading(true)
    }

    setError('')

    try {
      const { data } = await api.get('/admin/reports-overview', {
        params: filters,
      })

      setOverview({
        ...emptyOverview,
        ...data,
        stats: {
          ...emptyOverview.stats,
          ...data.stats,
        },
      })
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          'Unable to load dashboard data right now. Please make sure the backend is running.',
      )
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [filters])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      fetchOverview()
    }, 250)

    return () => window.clearTimeout(timeoutId)
  }, [fetchOverview])

  useEffect(() => {
    let ignore = false

    api.get('/admin/reports-overview/filter-options')
      .then(({ data }) => {
        if (!ignore) {
          setFilterOptions({
            types: data.types?.length ? data.types : ['All Types'],
            languages: data.languages?.length ? data.languages : ['All Languages'],
          })
        }
      })
      .catch(() => {
        if (!ignore) {
          setFilterOptions({
            types: ['All Types'],
            languages: ['All Languages'],
          })
        }
      })

    return () => {
      ignore = true
    }
  }, [])

  const stats = useMemo(
    () => [
      {
        title: 'Total Users',
        value: formatNumber(overview.stats.total_users),
        icon: Users,
        change: `${formatNumber(overview.stats.today_reports)} today`,
      },
      {
        title: 'Total Reports',
        value: formatNumber(overview.stats.total_reports),
        icon: FileText,
        change: `${formatNumber(overview.stats.this_week_reports)} this week`,
      },
      {
        title: 'Credits Sold',
        value: formatNumber(overview.stats.credits_sold),
        icon: CreditCard,
        change: 'Live total',
      },
      {
        title: 'Active Projects',
        value: formatNumber(overview.stats.total_projects),
        icon: TrendingUp,
        change: `${formatNumber(overview.stats.filtered_reports)} matched`,
      },
    ],
    [overview.stats],
  )

  const reportTypes = useMemo(
    () => filterOptions.types,
    [filterOptions.types],
  )

  const languages = useMemo(
    () => filterOptions.languages,
    [filterOptions.languages],
  )

  const chartData = useMemo(() => {
    if (chartMode === 'weekly') {
      return overview.weekly_activity.map((item) => ({
        label: item.label,
        Reports: item.total,
        Arabic: item.Arabic,
        English: item.English,
      }))
    }

    return overview.daily_report_counts.map((item) => ({
      label: item.label,
      Reports: item.count,
    }))
  }, [chartMode, overview.daily_report_counts, overview.weekly_activity])

  const recentReports = useMemo(() => overview.reports.slice(0, 6), [overview.reports])
  const topProjects = useMemo(() => overview.top_projects.slice(0, 6), [overview.top_projects])

  const activities = useMemo(() => {
    const reportActivities = overview.reports.slice(0, 5).map((report, index) => ({
      id: `report-${report.id}`,
      title: `Report generated - ${report.title || report.report_code}`,
      detail: report.submitted_by || 'Unknown user',
      time: index === 0 ? 'Just now' : `${index + 2} min ago`,
    }))

    const projectActivities = overview.top_projects.slice(0, 2).map((project, index) => ({
      id: `project-${project.id}`,
      title: `Project active - ${project.name}`,
      detail: `${formatNumber(project.reports_count)} reports`,
      time: `${index + 8} min ago`,
    }))

    return [...localActivities, ...reportActivities, ...projectActivities].slice(0, 7)
  }, [localActivities, overview.reports, overview.top_projects])

  const platformStatus = useMemo(() => {
    const completedReports = overview.reports.filter((report) => report.status === 'completed').length
    const completionRate = overview.reports.length
      ? Math.round((completedReports / overview.reports.length) * 100)
      : 100
    const languageCount = Object.keys(overview.language_counts || {}).length

    return [
      { label: 'API Response', value: error ? 'Issue' : 'Online', width: error ? 28 : 92 },
      { label: 'Report Completion', value: `${completionRate}%`, width: completionRate },
      {
        label: 'Project Coverage',
        value: `${formatNumber(overview.projects.length)} projects`,
        width: Math.min(100, Math.max(18, overview.projects.length * 8)),
      },
      {
        label: 'Languages',
        value: `${formatNumber(languageCount)} active`,
        width: Math.min(100, Math.max(22, languageCount * 24)),
      },
    ]
  }, [error, overview.language_counts, overview.projects.length, overview.reports])

  const handleExport = async () => {
    setExporting(true)
    setError('')

    try {
      const response = await api.get('/admin/reports-overview/export', {
        params: filters,
        responseType: 'blob',
      })

      const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      const contentDisposition = response.headers['content-disposition']
      const fileNameMatch = contentDisposition?.match(/filename="?([^"]+)"?/)

      link.href = url
      link.setAttribute('download', fileNameMatch?.[1] || 'dashboard-reports.csv')
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          'Unable to export dashboard data right now.',
      )
    } finally {
      setExporting(false)
    }
  }

  const handleSendNotice = () => {
    const message = noticeMessage.trim()

    if (!message) return

    setLocalActivities((current) => [
      {
        id: `notice-${Date.now()}`,
        title: 'Admin notice prepared',
        detail: message,
        time: 'Just now',
      },
      ...current,
    ])
    setNoticeMessage('')
    setShowNoticeModal(false)
    setShowNotifications(true)
  }

  const openProjectModal = async () => {
    setActionError('')
    setShowProjectModal(true)

    if (usersForProject.length > 0) return

    try {
      const { data } = await api.get('/admin/users')
      setUsersForProject(data.users || [])
      setProjectForm((current) => ({
        ...current,
        user_id: current.user_id || data.users?.[0]?.id || '',
      }))
    } catch (requestError) {
      setActionError(
        requestError.response?.data?.message ||
          'Unable to load users for project creation.',
      )
    }
  }

  const handleCreateUser = async (event) => {
    event.preventDefault()
    setActionLoading(true)
    setActionError('')

    try {
      const { data } = await api.post('/admin/users', {
        ...userForm,
        credits: Number(userForm.credits) || 0,
      })

      setLocalActivities((current) => [
        {
          id: `user-${data.user.id}`,
          title: `User created - ${data.user.name}`,
          detail: data.user.email,
          time: 'Just now',
        },
        ...current,
      ])
      setUserForm({
        name: '',
        email: '',
        password: '',
        credits: 0,
        role: 'user',
        is_active: true,
      })
      setShowUserModal(false)
      await fetchOverview({ silent: true })
    } catch (requestError) {
      const validationErrors = requestError.response?.data?.errors
      const firstValidationMessage = validationErrors
        ? Object.values(validationErrors).flat()[0]
        : null

      setActionError(
        firstValidationMessage ||
          requestError.response?.data?.message ||
          'Unable to create the user right now.',
      )
    } finally {
      setActionLoading(false)
    }
  }

  const handleCreateProject = async (event) => {
    event.preventDefault()
    setActionLoading(true)
    setActionError('')

    try {
      const { data } = await api.post('/admin/projects', {
        ...projectForm,
        user_id: Number(projectForm.user_id),
      })

      setLocalActivities((current) => [
        {
          id: `project-created-${data.project.id}`,
          title: `Project created - ${data.project.name}`,
          detail: data.project.business_name,
          time: 'Just now',
        },
        ...current,
      ])
      setProjectForm({
        user_id: usersForProject[0]?.id || '',
        name: '',
        business_name: '',
        industry: '',
      })
      setShowProjectModal(false)
      await fetchOverview({ silent: true })
    } catch (requestError) {
      const validationErrors = requestError.response?.data?.errors
      const firstValidationMessage = validationErrors
        ? Object.values(validationErrors).flat()[0]
        : null

      setActionError(
        firstValidationMessage ||
          requestError.response?.data?.message ||
          'Unable to create the project right now.',
      )
    } finally {
      setActionLoading(false)
    }
  }

  const handleFlagReport = (reportId) => {
    setFlaggedReportIds((current) =>
      current.includes(reportId)
        ? current.filter((id) => id !== reportId)
        : [...current, reportId],
    )
  }

  const currentDateLabel = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <div className="min-h-screen bg-[#F7F8F0] p-6">
      <div className="flex min-h-[84px] flex-col gap-4 border-b border-[#9CD5FF] bg-[#F7F8F0] px-6 py-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-[28px] font-bold leading-none text-[#355872]">Dashboard</h1>
          <p className="mt-2 text-[13px] text-[#7AAACE]">{currentDateLabel}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex h-11 w-full items-center gap-2 rounded-2xl border border-[#9CD5FF] bg-[#F7F8F0] px-4 md:w-[300px]">
            <Search size={16} className="text-[#7AAACE]" />
            <input
              type="text"
              value={filters.search}
              onChange={(event) =>
                setFilters((current) => ({ ...current, search: event.target.value }))
              }
              placeholder="Search users, reports..."
              className="w-full bg-transparent text-sm text-[#355872] outline-none placeholder:text-[#7AAACE]"
            />
          </div>

          <button
            onClick={() => fetchOverview({ silent: true })}
            disabled={refreshing}
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#9CD5FF] bg-[#F7F8F0] text-[#355872] disabled:opacity-60"
            title="Refresh dashboard"
          >
            <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
          </button>

          <div className="relative">
            <button
              onClick={() => setShowNotifications((current) => !current)}
              className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-[#9CD5FF] bg-[#F7F8F0] text-[#355872]"
              title="Notifications"
            >
              <Bell size={18} />
              {activities.length > 0 && (
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#355872]" />
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 z-20 mt-3 w-[320px] rounded-2xl border border-[#9CD5FF] bg-[#F7F8F0] p-4 shadow-[0_18px_38px_rgba(53,88,114,0.18)]">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="font-bold text-[#355872]">Notifications</h3>
                  <button onClick={() => setShowNotifications(false)} className="text-[#7AAACE]">
                    <X size={16} />
                  </button>
                </div>
                <div className="max-h-[320px] space-y-3 overflow-y-auto">
                  {activities.map((item) => (
                    <div key={item.id} className="rounded-xl bg-[#F7F8F0] p-3">
                      <p className="text-sm font-medium text-[#355872]">{item.title}</p>
                      <p className="mt-1 text-xs text-[#7AAACE]">{item.detail}</p>
                      <p className="mt-1 text-[11px] text-[#7AAACE]">{item.time}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => setShowProfile((current) => !current)}
              className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#355872] text-white"
              title="Admin profile"
            >
              <User size={18} />
            </button>

            {showProfile && (
              <div className="absolute right-0 z-20 mt-3 w-[260px] rounded-2xl border border-[#9CD5FF] bg-[#F7F8F0] p-4 shadow-[0_18px_38px_rgba(53,88,114,0.18)]">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#355872] text-sm font-semibold text-white">
                    {getInitials(adminUser.name || 'Admin')}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-[#355872]">
                      {adminUser.name || 'Super Admin'}
                    </p>
                    <p className="truncate text-xs text-[#7AAACE]">
                      {adminUser.email || 'admin@strategai.com'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/admin/users')}
                  className="mt-4 h-10 w-full rounded-xl border border-[#9CD5FF] bg-[#F7F8F0] text-sm font-medium text-[#355872]"
                >
                  Manage Users
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="p-6">
        <p className="mb-6 text-[15px] text-[#7AAACE]">
          Welcome back,{' '}
          <span className="font-semibold text-[#355872]">
            {adminUser.name || 'Super Admin'}
          </span>{' '}
          - here is what is happening on StrategAI today.
        </p>

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-[#9CD5FF] bg-[#F7F8F0] px-5 py-4">
            <AlertCircle size={18} className="mt-0.5 shrink-0 text-[#355872]" />
            <div>
              <h4 className="font-medium text-[#355872]">Dashboard Data Error</h4>
              <p className="mt-1 text-sm text-[#355872]">{error}</p>
            </div>
          </div>
        )}

        <div className="mb-6 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <button
              key={stat.title}
              onClick={() => navigate(stat.title === 'Total Users' ? '/admin/users' : '/admin/reports')}
              className="rounded-[22px] border border-[#9CD5FF] bg-[#F7F8F0] px-6 py-5 text-left shadow-[0_8px_24px_rgba(53,88,114,0.08)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(53,88,114,0.12)]"
            >
              <div className="mb-6 flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F7F8F0] text-[#7AAACE]">
                  <stat.icon size={20} />
                </div>
                <span className="rounded-full bg-[#F7F8F0] px-3 py-1 text-xs font-medium text-[#355872]">
                  {stat.change}
                </span>
              </div>

              <h3 className="mb-3 text-[42px] font-bold leading-none text-[#355872]">
                {loading ? <Loader2 className="animate-spin" size={30} /> : stat.value}
              </h3>
              <p className="text-[15px] text-[#355872]">{stat.title}</p>
              <p className="mt-1 text-[13px] text-[#7AAACE]">Open details</p>
            </button>
          ))}
        </div>

        <div className="mb-6 grid grid-cols-1 gap-5 xl:grid-cols-[1.9fr_0.8fr]">
          <div className="rounded-[22px] border border-[#9CD5FF] bg-[#F7F8F0] p-5 shadow-[0_8px_24px_rgba(53,88,114,0.08)]">
            <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <h2 className="text-[28px] font-bold text-[#355872]">Platform Analytics</h2>
                <p className="mt-1 text-[14px] text-[#7AAACE]">
                  {chartMode === 'growth' ? '7-day report growth' : 'Weekly activity overview'}
                </p>
              </div>

              <div className="flex items-center rounded-xl bg-[#F7F8F0] p-1 text-sm">
                {[
                  ['growth', 'Growth'],
                  ['weekly', 'Weekly'],
                ].map(([value, label]) => (
                  <button
                    key={value}
                    onClick={() => setChartMode(value)}
                    className={`rounded-lg px-4 py-2 ${
                      chartMode === value
                        ? 'bg-white text-[#355872] shadow-sm'
                        : 'text-[#7AAACE]'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-[320px] rounded-[18px] border border-[#9CD5FF] bg-gradient-to-b from-[#F7F8F0] to-[#F7F8F0] p-4">
              {loading ? (
                <div className="flex h-full items-center justify-center text-[#355872]">
                  <Loader2 className="mr-2 animate-spin" size={18} />
                  Loading analytics...
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#9CD5FF" vertical={false} />
                    <XAxis dataKey="label" tick={{ fill: '#7AAACE', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#7AAACE', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#F7F8F0', border: '1px solid #9CD5FF', borderRadius: '8px' }} />
                    {chartMode === 'weekly' && <Legend wrapperStyle={{ fontSize: 12 }} />}
                    <Line type="monotone" dataKey="Reports" stroke="#355872" strokeWidth={3} dot={{ r: 4, fill: '#355872' }} />
                    {chartMode === 'weekly' && (
                      <>
                        <Line type="monotone" dataKey="Arabic" stroke="#7AAACE" strokeWidth={3} dot={{ r: 3, fill: '#7AAACE' }} />
                        <Line type="monotone" dataKey="English" stroke="#9CD5FF" strokeWidth={3} dot={{ r: 3, fill: '#9CD5FF' }} />
                      </>
                    )}
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="rounded-[22px] border border-[#9CD5FF] bg-[#F7F8F0] p-5 shadow-[0_8px_24px_rgba(53,88,114,0.08)]">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-[28px] font-bold text-[#355872]">Recent Activity</h2>
                <p className="mt-1 text-[14px] text-[#7AAACE]">Latest platform events</p>
              </div>
              <button onClick={() => navigate('/admin/reports')} className="text-sm text-[#355872]">
                View all
              </button>
            </div>

            <div className="space-y-4">
              {activities.map((item) => (
                <div key={item.id} className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F7F8F0] text-[#7AAACE]">
                    <Activity size={16} />
                  </div>
                  <div>
                    <p className="text-[14px] leading-5 text-[#355872]">{item.title}</p>
                    <p className="mt-1 text-[12px] text-[#7AAACE]">
                      {item.detail} - {item.time}
                    </p>
                  </div>
                </div>
              ))}
              {!loading && activities.length === 0 && (
                <p className="rounded-2xl bg-[#F7F8F0] p-4 text-sm text-[#355872]">
                  No recent activity found.
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-5 xl:grid-cols-[1.9fr_0.8fr]">
          <div className="rounded-[22px] border border-[#9CD5FF] bg-[#F7F8F0] p-5 shadow-[0_8px_24px_rgba(53,88,114,0.08)]">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-[28px] font-bold text-[#355872]">Top Projects</h2>
                <p className="mt-1 text-[14px] text-[#7AAACE]">
                  Highest performing projects this month
                </p>
              </div>
              <button onClick={() => navigate('/admin/reports')} className="text-sm text-[#355872]">
                View all
              </button>
            </div>

            <div className="space-y-1">
              {topProjects.map((project, index) => (
                <button
                  key={project.id}
                  onClick={() => setFilters((current) => ({ ...current, search: project.name }))}
                  className="grid w-full grid-cols-[56px_1.6fr_0.8fr_100px] items-center gap-4 border-b border-[#9CD5FF] py-4 text-left last:border-b-0"
                >
                  <span className="inline-flex rounded-xl bg-[#F7F8F0] px-3 py-1 text-sm font-semibold text-[#355872]">
                    #{index + 1}
                  </span>

                  <div>
                    <p className="font-semibold text-[#355872]">{project.name}</p>
                    <p className="text-sm text-[#7AAACE]">
                      {project.industry || 'Unspecified industry'}
                    </p>
                  </div>

                  <div className="text-right">
                    <div className="flex items-center justify-end gap-1 text-sm text-[#7AAACE]">
                      <Star size={14} className="fill-[#7AAACE] stroke-[#7AAACE]" />
                      <span>{Math.min(5, 4 + project.reports_count / 100).toFixed(1)}</span>
                    </div>
                    <p className="text-sm text-[#7AAACE]">
                      {formatNumber(project.reports_count)} reports
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="rounded-full bg-[#9CD5FF] px-3 py-1 text-xs text-[#355872]">
                      Active
                    </span>
                  </div>
                </button>
              ))}
              {!loading && topProjects.length === 0 && (
                <p className="rounded-2xl bg-[#F7F8F0] p-4 text-sm text-[#355872]">
                  No projects found.
                </p>
              )}
            </div>
          </div>

          <div className="space-y-5">
            <div className="rounded-[22px] border border-[#9CD5FF] bg-[#F7F8F0] p-5 shadow-[0_8px_24px_rgba(53,88,114,0.08)]">
              <h2 className="mb-2 text-[26px] font-bold text-[#355872]">Platform Status</h2>
              <p className="mb-5 text-sm text-[#355872]">
                {error ? 'Attention needed' : 'All systems operational'}
              </p>

              <div className="space-y-5">
                {platformStatus.map((item) => (
                  <div key={item.label}>
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="text-[#355872]">{item.label}</span>
                      <span className="font-medium text-[#7AAACE]">{item.value}</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-[#9CD5FF]">
                      <div
                        className="h-full rounded-full bg-[#7AAACE]"
                        style={{ width: `${item.width}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[22px] border border-[#9CD5FF] bg-[#F7F8F0] p-5 shadow-[0_8px_24px_rgba(53,88,114,0.08)]">
              <h2 className="mb-5 text-[26px] font-bold text-[#355872]">Quick Actions</h2>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => {
                    setActionError('')
                    setShowUserModal(true)
                  }}
                  className="rounded-2xl border border-[#9CD5FF] bg-[#F7F8F0] p-5 text-[#355872] transition hover:bg-[#9CD5FF]"
                >
                  <Plus size={18} className="mx-auto mb-3" />
                  <span className="text-sm">Add User</span>
                </button>

                <button
                  onClick={openProjectModal}
                  className="rounded-2xl border border-[#9CD5FF] bg-[#F7F8F0] p-5 text-[#355872] transition hover:bg-[#9CD5FF]"
                >
                  <TrendingUp size={18} className="mx-auto mb-3" />
                  <span className="text-sm">Add Project</span>
                </button>

                <button
                  onClick={handleExport}
                  disabled={exporting || loading}
                  className="rounded-2xl border border-[#9CD5FF] bg-[#F7F8F0] p-5 text-[#355872] transition hover:bg-[#9CD5FF] disabled:opacity-60"
                >
                  {exporting ? (
                    <Loader2 size={18} className="mx-auto mb-3 animate-spin" />
                  ) : (
                    <Download size={18} className="mx-auto mb-3" />
                  )}
                  <span className="text-sm">Export Data</span>
                </button>

                <button
                  onClick={() => setShowNoticeModal(true)}
                  className="rounded-2xl border border-[#9CD5FF] bg-[#F7F8F0] p-5 text-[#355872] transition hover:bg-[#9CD5FF]"
                >
                  <Bell size={18} className="mx-auto mb-3" />
                  <span className="text-sm">Send Notice</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[22px] border border-[#9CD5FF] bg-[#F7F8F0] p-5 shadow-[0_8px_24px_rgba(53,88,114,0.08)]">
          <div className="mb-5 flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h2 className="text-[28px] font-bold text-[#355872]">Recent Reports</h2>
              <p className="mt-1 text-[14px] text-[#7AAACE]">
                Latest generated reports on the platform
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <select
                value={filters.type}
                onChange={(event) =>
                  setFilters((current) => ({ ...current, type: event.target.value }))
                }
                className="h-10 rounded-xl border border-[#9CD5FF] bg-[#F7F8F0] px-3 text-sm text-[#355872]"
              >
                {reportTypes.map((type) => (
                  <option key={type}>{type}</option>
                ))}
              </select>
              <select
                value={filters.language}
                onChange={(event) =>
                  setFilters((current) => ({ ...current, language: event.target.value }))
                }
                className="h-10 rounded-xl border border-[#9CD5FF] bg-[#F7F8F0] px-3 text-sm text-[#355872]"
              >
                {languages.map((language) => (
                  <option key={language}>{language}</option>
                ))}
              </select>
              <button
                onClick={handleExport}
                disabled={exporting || loading}
                className="h-10 rounded-xl border border-[#9CD5FF] bg-[#F7F8F0] px-4 text-sm text-[#355872] disabled:opacity-60"
              >
                {exporting ? 'Exporting...' : 'Export'}
              </button>
              <button
                onClick={() => navigate('/admin/reports')}
                className="h-10 rounded-xl bg-[#355872] px-4 text-sm font-medium text-white"
              >
                View Reports
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="border-b border-[#9CD5FF] text-left text-[12px] uppercase tracking-[0.08em] text-[#355872]">
                  <th className="px-3 py-4">User</th>
                  <th className="px-3 py-4">Business</th>
                  <th className="px-3 py-4">Date</th>
                  <th className="px-3 py-4">Type</th>
                  <th className="px-3 py-4">Status</th>
                  <th className="px-3 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="px-3 py-12 text-center text-sm text-[#355872]">
                      Loading recent reports...
                    </td>
                  </tr>
                ) : recentReports.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-3 py-12 text-center text-sm text-[#355872]">
                      No reports matched your current filters.
                    </td>
                  </tr>
                ) : (
                  recentReports.map((report, index) => (
                    <tr
                      key={report.id}
                      className={`border-b border-[#9CD5FF] last:border-b-0 ${
                        index % 2 === 0 ? 'bg-transparent' : 'bg-[#F7F8F0]/50'
                      }`}
                    >
                      <td className="px-3 py-5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#355872] text-xs font-semibold text-white">
                            {getInitials(report.submitted_by || 'User')}
                          </div>
                          <div>
                            <span className="font-medium text-[#355872]">
                              {report.submitted_by || 'Unknown user'}
                            </span>
                            <p className="text-xs text-[#7AAACE]">{report.submitted_by_email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-3 py-5 text-[#7AAACE]">{report.business_name || 'N/A'}</td>
                      <td className="px-3 py-5 text-[#7AAACE]">{formatDate(report.generated_at)}</td>
                      <td className="px-3 py-5">
                        <span className="rounded-full bg-[#F7F8F0] px-3 py-1 text-xs text-[#7AAACE]">
                          {report.type || 'Report'}
                        </span>
                      </td>
                      <td className="px-3 py-5">
                        <span
                          className={`rounded-full px-3 py-1 text-xs ${
                            report.status === 'failed'
                              ? 'bg-[#F7F8F0] text-[#355872]'
                              : report.status === 'pending'
                                ? 'bg-[#F7F8F0] text-[#7AAACE]'
                                : 'bg-[#9CD5FF] text-[#355872]'
                          }`}
                        >
                          {normalizeStatus(report.status)}
                        </span>
                      </td>

                      <td className="px-3 py-5">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => setSelectedReport(report)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#9CD5FF] bg-[#F7F8F0] text-[#355872]"
                            title="View report details"
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            onClick={() => navigate('/admin/reports', { state: { search: report.report_code } })}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#9CD5FF] bg-[#F7F8F0] text-[#355872]"
                            title="Open in reports page"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={() => handleFlagReport(report.id)}
                            className={`flex h-8 w-8 items-center justify-center rounded-lg border border-[#9CD5FF] bg-[#F7F8F0] ${
                              flaggedReportIds.includes(report.id)
                                ? 'text-[#355872]'
                                : 'text-[#355872]'
                            }`}
                            title={flaggedReportIds.includes(report.id) ? 'Unflag report' : 'Flag report'}
                          >
                            <Flag size={15} fill={flaggedReportIds.includes(report.id) ? 'currentColor' : 'none'} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4 backdrop-blur-[2px]">
          <div className="w-full max-w-lg rounded-[24px] border border-[#9CD5FF] bg-[#F7F8F0] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.15)]">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-[24px] font-bold text-[#355872]">{selectedReport.title}</h2>
                <p className="mt-1 text-sm text-[#7AAACE]">{selectedReport.report_code}</p>
              </div>
              <button onClick={() => setSelectedReport(null)} className="text-[#7AAACE]">
                <X size={18} />
              </button>
            </div>

            <div className="grid gap-3 text-sm sm:grid-cols-2">
              {[
                ['Project', selectedReport.project_name],
                ['Business', selectedReport.business_name],
                ['Submitted By', selectedReport.submitted_by],
                ['Email', selectedReport.submitted_by_email],
                ['Type', selectedReport.type],
                ['Language', selectedReport.language],
                ['Pages', selectedReport.pages],
                ['Date', formatDate(selectedReport.generated_at)],
                ['Status', normalizeStatus(selectedReport.status)],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl bg-[#F7F8F0] p-3">
                  <p className="text-xs uppercase tracking-[0.08em] text-[#355872]">{label}</p>
                  <p className="mt-1 font-medium text-[#355872]">{value || 'N/A'}</p>
                </div>
              ))}
            </div>

            <div className="mt-5 flex gap-3">
              <button
                onClick={() => {
                  setSelectedReport(null)
                  navigate('/admin/reports')
                }}
                className="h-11 flex-1 rounded-xl bg-[#355872] font-medium text-white"
              >
                Open Reports
              </button>
              <button
                onClick={() => {
                  handleFlagReport(selectedReport.id)
                  setSelectedReport(null)
                }}
                className="h-11 flex-1 rounded-xl border border-[#9CD5FF] bg-[#F7F8F0] font-medium text-[#355872]"
              >
                {flaggedReportIds.includes(selectedReport.id) ? 'Unflag' : 'Flag'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4 backdrop-blur-[2px]">
          <form
            onSubmit={handleCreateUser}
            className="w-full max-w-md rounded-[24px] border border-[#9CD5FF] bg-[#F7F8F0] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.15)]"
          >
            <div className="mb-5 flex items-start justify-between">
              <div>
                <h2 className="text-[24px] font-bold text-[#355872]">Add User</h2>
                <p className="mt-1 text-sm text-[#7AAACE]">Create a new admin-managed account.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowUserModal(false)}
                className="text-[#7AAACE]"
              >
                <X size={18} />
              </button>
            </div>

            {actionError && (
              <div className="mb-4 rounded-2xl border border-[#9CD5FF] bg-[#F7F8F0] px-4 py-3 text-sm text-[#355872]">
                {actionError}
              </div>
            )}

            <div className="space-y-3">
              <input
                required
                value={userForm.name}
                onChange={(event) => setUserForm((current) => ({ ...current, name: event.target.value }))}
                placeholder="Full name"
                className="h-11 w-full rounded-2xl border border-[#9CD5FF] bg-[#F7F8F0] px-4 text-sm text-[#355872] outline-none placeholder:text-[#7AAACE]"
              />
              <input
                required
                type="email"
                value={userForm.email}
                onChange={(event) => setUserForm((current) => ({ ...current, email: event.target.value }))}
                placeholder="Email address"
                className="h-11 w-full rounded-2xl border border-[#9CD5FF] bg-[#F7F8F0] px-4 text-sm text-[#355872] outline-none placeholder:text-[#7AAACE]"
              />
              <input
                required
                type="password"
                minLength={8}
                value={userForm.password}
                onChange={(event) => setUserForm((current) => ({ ...current, password: event.target.value }))}
                placeholder="Temporary password"
                className="h-11 w-full rounded-2xl border border-[#9CD5FF] bg-[#F7F8F0] px-4 text-sm text-[#355872] outline-none placeholder:text-[#7AAACE]"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  min="0"
                  value={userForm.credits}
                  onChange={(event) => setUserForm((current) => ({ ...current, credits: event.target.value }))}
                  placeholder="Credits"
                  className="h-11 rounded-2xl border border-[#9CD5FF] bg-[#F7F8F0] px-4 text-sm text-[#355872] outline-none placeholder:text-[#7AAACE]"
                />
                <select
                  value={userForm.role}
                  onChange={(event) => setUserForm((current) => ({ ...current, role: event.target.value }))}
                  className="h-11 rounded-2xl border border-[#9CD5FF] bg-[#F7F8F0] px-4 text-sm text-[#355872] outline-none"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <label className="flex items-center gap-3 rounded-2xl border border-[#9CD5FF] bg-[#F7F8F0] px-4 py-3 text-sm text-[#355872]">
                <input
                  type="checkbox"
                  checked={userForm.is_active}
                  onChange={(event) => setUserForm((current) => ({ ...current, is_active: event.target.checked }))}
                  className="h-4 w-4 accent-[#355872]"
                />
                Active account
              </label>
            </div>

            <button
              type="submit"
              disabled={actionLoading}
              className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#355872] font-medium text-white disabled:opacity-60"
            >
              {actionLoading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
              Create User
            </button>
          </form>
        </div>
      )}

      {showProjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4 backdrop-blur-[2px]">
          <form
            onSubmit={handleCreateProject}
            className="w-full max-w-md rounded-[24px] border border-[#9CD5FF] bg-[#F7F8F0] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.15)]"
          >
            <div className="mb-5 flex items-start justify-between">
              <div>
                <h2 className="text-[24px] font-bold text-[#355872]">Add Project</h2>
                <p className="mt-1 text-sm text-[#7AAACE]">Create a project and assign it to a user.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowProjectModal(false)}
                className="text-[#7AAACE]"
              >
                <X size={18} />
              </button>
            </div>

            {actionError && (
              <div className="mb-4 rounded-2xl border border-[#9CD5FF] bg-[#F7F8F0] px-4 py-3 text-sm text-[#355872]">
                {actionError}
              </div>
            )}

            <div className="space-y-3">
              <select
                required
                value={projectForm.user_id}
                onChange={(event) => setProjectForm((current) => ({ ...current, user_id: event.target.value }))}
                className="h-11 w-full rounded-2xl border border-[#9CD5FF] bg-[#F7F8F0] px-4 text-sm text-[#355872] outline-none"
              >
                {usersForProject.length === 0 ? (
                  <option value="">No users loaded</option>
                ) : (
                  usersForProject.map((userItem) => (
                    <option key={userItem.id} value={userItem.id}>
                      {userItem.name} - {userItem.email}
                    </option>
                  ))
                )}
              </select>
              <input
                required
                value={projectForm.name}
                onChange={(event) => setProjectForm((current) => ({ ...current, name: event.target.value }))}
                placeholder="Project name"
                className="h-11 w-full rounded-2xl border border-[#9CD5FF] bg-[#F7F8F0] px-4 text-sm text-[#355872] outline-none placeholder:text-[#7AAACE]"
              />
              <input
                required
                value={projectForm.business_name}
                onChange={(event) => setProjectForm((current) => ({ ...current, business_name: event.target.value }))}
                placeholder="Business name"
                className="h-11 w-full rounded-2xl border border-[#9CD5FF] bg-[#F7F8F0] px-4 text-sm text-[#355872] outline-none placeholder:text-[#7AAACE]"
              />
              <input
                required
                value={projectForm.industry}
                onChange={(event) => setProjectForm((current) => ({ ...current, industry: event.target.value }))}
                placeholder="Industry"
                className="h-11 w-full rounded-2xl border border-[#9CD5FF] bg-[#F7F8F0] px-4 text-sm text-[#355872] outline-none placeholder:text-[#7AAACE]"
              />
            </div>

            <button
              type="submit"
              disabled={actionLoading || usersForProject.length === 0}
              className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#355872] font-medium text-white disabled:opacity-60"
            >
              {actionLoading ? <Loader2 size={16} className="animate-spin" /> : <TrendingUp size={16} />}
              Create Project
            </button>
          </form>
        </div>
      )}

      {showNoticeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4 backdrop-blur-[2px]">
          <div className="w-full max-w-md rounded-[24px] border border-[#9CD5FF] bg-[#F7F8F0] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.15)]">
            <div className="mb-5 flex items-start justify-between">
              <div>
                <h2 className="text-[24px] font-bold text-[#355872]">Send Notice</h2>
                <p className="mt-1 text-sm text-[#7AAACE]">Prepare an internal dashboard notice.</p>
              </div>
              <button onClick={() => setShowNoticeModal(false)} className="text-[#7AAACE]">
                <X size={18} />
              </button>
            </div>

            <textarea
              value={noticeMessage}
              onChange={(event) => setNoticeMessage(event.target.value)}
              placeholder="Write a short notice..."
              className="mb-5 min-h-[130px] w-full resize-none rounded-2xl border border-[#9CD5FF] bg-[#F7F8F0] p-4 text-sm text-[#355872] outline-none placeholder:text-[#7AAACE]"
            />

            <button
              onClick={handleSendNotice}
              disabled={!noticeMessage.trim()}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#355872] font-medium text-white disabled:opacity-50"
            >
              <Send size={16} />
              Send Notice
            </button>
          </div>
        </div>
      )}

      {refreshing && (
        <div className="fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-2xl border border-[#9CD5FF] bg-[#F7F8F0] px-4 py-3 text-sm text-[#355872] shadow-[0_14px_34px_rgba(53,88,114,0.16)]">
          <CheckCircle2 size={16} />
          Refreshing dashboard...
        </div>
      )}
    </div>
  )
}
