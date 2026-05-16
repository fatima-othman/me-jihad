import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  AlertCircle,
  BadgeCheck,
  Briefcase,
  CreditCard,
  Download,
  FileBadge2,
  FileText,
  FolderKanban,
  Loader2,
  Percent,
  RefreshCw,
  Users,
} from 'lucide-react'
import {
  Bar as RechartsBar,
  BarChart as RechartsBarChart,
  CartesianGrid as RechartsCartesianGrid,
  Cell as RechartsCell,
  Line as RechartsLine,
  LineChart as RechartsLineChart,
  Pie as RechartsPie,
  PieChart as RechartsPieChart,
  ResponsiveContainer as RechartsResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from 'recharts'
import api from '../api/axios'

const palette = ['#355872', '#7AAACE', '#9CD5FF', '#F7F8F0']
const gridColor = '#9CD5FF'
const axisColor = '#7AAACE'

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

const emptyAnalytics = {
  summary: {
    total_reports: 0,
    filtered_reports: 0,
    total_pages: 0,
    average_pages: 0,
    total_projects: 0,
  },
  distributions: {
    by_status: {},
    by_type: {},
    by_language: {},
  },
  trends: {
    today: 0,
    this_week: 0,
    this_month: 0,
  },
}

function formatNumber(value) {
  return Number(value || 0).toLocaleString()
}

function getInitials(name = 'User') {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function toDateInputValue(date) {
  return date.toISOString().slice(0, 10)
}

function getPeriodFilters(period) {
  const today = new Date()
  const start = new Date(today)

  if (period === '7D') start.setDate(today.getDate() - 6)
  if (period === '30D') start.setDate(today.getDate() - 29)
  if (period === '90D') start.setDate(today.getDate() - 89)
  if (period === '1Y') start.setFullYear(today.getFullYear() - 1)

  return {
    from: toDateInputValue(start),
    to: toDateInputValue(today),
  }
}

function formatPercent(value, total) {
  if (!total) return '0%'

  return `${Math.round((value / total) * 100)}%`
}

function distributionToPie(distribution, total, labelFallback = 'Unknown') {
  return Object.entries(distribution || {})
    .filter(([, value]) => Number(value) > 0)
    .map(([name, value], index) => ({
      name: name || labelFallback,
      value: Number(value),
      percent: formatPercent(Number(value), total),
      color: palette[index % palette.length],
    }))
}

export default function Analytics() {
  const [period, setPeriod] = useState('30D')
  const [overview, setOverview] = useState(emptyOverview)
  const [analytics, setAnalytics] = useState(emptyAnalytics)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [error, setError] = useState('')
  const [userMetric, setUserMetric] = useState('All')

  const filters = useMemo(() => getPeriodFilters(period), [period])

  const fetchAnalytics = useCallback(async ({ silent = false } = {}) => {
    if (silent) {
      setRefreshing(true)
    } else {
      setLoading(true)
    }

    setError('')

    try {
      const [overviewResponse, analyticsResponse] = await Promise.all([
        api.get('/admin/reports-overview', { params: filters }),
        api.get('/admin/reports-overview/analytics', { params: filters }),
      ])

      setOverview({
        ...emptyOverview,
        ...overviewResponse.data,
        stats: {
          ...emptyOverview.stats,
          ...overviewResponse.data.stats,
        },
      })
      setAnalytics({
        ...emptyAnalytics,
        ...analyticsResponse.data,
        summary: {
          ...emptyAnalytics.summary,
          ...analyticsResponse.data.summary,
        },
        distributions: {
          ...emptyAnalytics.distributions,
          ...analyticsResponse.data.distributions,
        },
        trends: {
          ...emptyAnalytics.trends,
          ...analyticsResponse.data.trends,
        },
      })
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          'Unable to load analytics data right now. Make sure the backend is running.',
      )
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [filters])

  useEffect(() => {
    fetchAnalytics()
  }, [fetchAnalytics])

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
      link.setAttribute('download', fileNameMatch?.[1] || `analytics-${period.toLowerCase()}.csv`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          'Unable to export analytics data right now.',
      )
    } finally {
      setExporting(false)
    }
  }

  const totalFilteredReports = analytics.summary.filtered_reports || overview.stats.filtered_reports
  const languageData = useMemo(
    () => distributionToPie(analytics.distributions.by_language, totalFilteredReports, 'Unknown language'),
    [analytics.distributions.by_language, totalFilteredReports],
  )

  const businessTypeData = useMemo(
    () =>
      overview.business_type_counts.map((item) => ({
        name: item.industry || 'Unknown',
        count: Number(item.count || 0),
      })),
    [overview.business_type_counts],
  )

  const growthTrend = useMemo(
    () =>
      overview.weekly_activity.map((item) => ({
        label: item.label,
        reports: item.total || 0,
        arabic: item.Arabic || 0,
        english: item.English || 0,
      })),
    [overview.weekly_activity],
  )

  const weeklyReportActivity = useMemo(
    () =>
      overview.daily_report_counts.map((item) => ({
        day: item.label,
        submitted: item.count || 0,
        completed: overview.reports.filter(
          (report) =>
            report.generated_at === item.date && String(report.status).toLowerCase() === 'completed',
        ).length,
      })),
    [overview.daily_report_counts, overview.reports],
  )

  const activeUsers = useMemo(() => {
    const usersByEmail = overview.reports.reduce((acc, report) => {
      const key = report.submitted_by_email || report.submitted_by || 'Unknown'
      const existingUser = acc[key] || {
        name: report.submitted_by || 'Unknown user',
        email: report.submitted_by_email || 'Unknown email',
        reports: 0,
        pages: 0,
      }

      acc[key] = {
        ...existingUser,
        reports: existingUser.reports + 1,
        pages: existingUser.pages + Number(report.pages || 0),
      }

      return acc
    }, {})

    return Object.values(usersByEmail)
      .map((user, index) => ({
        initials: getInitials(user.name),
        color: palette[index % palette.length],
        name: user.name,
        email: user.email,
        reports: user.reports,
        pages: user.pages,
        badge:
          index === 0
            ? 'Top Contributor'
            : Number(user.reports || 0) >= 10
              ? 'Power User'
              : 'Active',
      }))
      .sort((a, b) => {
        if (userMetric === 'Pages') return b.pages - a.pages
        if (userMetric === 'Reports') return b.reports - a.reports
        return b.reports + b.pages - (a.reports + a.pages)
      })
      .map((user, index) => ({ ...user, rank: index + 1 }))
  }, [overview.reports, userMetric])

  const activeProjects = useMemo(
    () =>
      overview.top_projects.map((project, index) => ({
        rank: index + 1,
        name: project.name,
        businessName: project.business_name,
        industry: project.industry || 'Unknown',
        reports: Number(project.reports_count || 0),
      })),
    [overview.top_projects],
  )

  const totalSubmitted = weeklyReportActivity.reduce((sum, item) => sum + item.submitted, 0)
  const totalCompleted = weeklyReportActivity.reduce((sum, item) => sum + item.completed, 0)
  const completionRate = totalSubmitted ? Math.round((totalCompleted / totalSubmitted) * 100) : 0
  const summaryCards = [
    {
      title: 'Total Users',
      value: formatNumber(overview.stats.total_users),
      badge: 'Registered',
      icon: Users,
    },
    {
      title: 'Total Projects',
      value: formatNumber(overview.stats.total_projects || analytics.summary.total_projects),
      badge: 'Active projects',
      icon: FolderKanban,
    },
    {
      title: 'Total Reports',
      value: formatNumber(analytics.summary.total_reports || overview.stats.total_reports),
      badge: `${formatNumber(totalFilteredReports)} filtered`,
      icon: FileText,
    },
    {
      title: 'Credits Sold',
      value: formatNumber(overview.stats.credits_sold),
      badge: 'Live total',
      icon: CreditCard,
    },
    {
      title: 'Business Types',
      value: formatNumber(businessTypeData.length),
      badge: 'Categories',
      icon: Briefcase,
    },
  ]

  return (
    <div className="min-h-screen bg-[#F7F8F0]">
      <div className="flex min-h-[82px] flex-col gap-4 border-b border-[#9CD5FF] bg-[#F7F8F0] px-6 py-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h1 className="text-[30px] font-bold leading-none text-[#355872]">Analytics</h1>
          <p className="mt-2 text-[13px] text-[#7AAACE]">
            Platform insights from {filters.from} to {filters.to}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center overflow-hidden rounded-xl border border-[#9CD5FF] bg-[#F7F8F0]">
            {['7D', '30D', '90D', '1Y'].map((item) => (
              <button
                key={item}
                onClick={() => setPeriod(item)}
                className={`h-10 border-r border-[#9CD5FF] px-4 text-xs font-semibold last:border-r-0 ${
                  period === item ? 'bg-[#9CD5FF] text-[#355872]' : 'text-[#7AAACE]'
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          <button
            onClick={handleExport}
            disabled={exporting || loading}
            className="flex h-10 items-center gap-2 rounded-xl border border-[#9CD5FF] bg-[#F7F8F0] px-4 text-sm font-medium text-[#355872] disabled:opacity-60"
          >
            {exporting ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
            {exporting ? 'Exporting...' : 'Export'}
          </button>

          <button
            onClick={() => fetchAnalytics({ silent: true })}
            disabled={refreshing}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#355872] text-white disabled:opacity-60"
            title="Refresh analytics"
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      <div className="p-6">
        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-[#9CD5FF] bg-[#F7F8F0] px-5 py-4 text-[#355872]">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <div>
              <h4 className="font-medium">Analytics Error</h4>
              <p className="mt-1 text-sm">{error}</p>
            </div>
          </div>
        )}

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {summaryCards.map((card) => (
            <div
              key={card.title}
              className="rounded-[20px] border border-[#9CD5FF] bg-[#F7F8F0] p-5 shadow-[0_8px_24px_rgba(53,88,114,0.08)]"
            >
              <div className="mb-5 flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#9CD5FF] text-[#355872]">
                  <card.icon size={17} />
                </div>
                <span className="rounded-full bg-[#F7F8F0] px-2.5 py-1 text-[11px] font-medium text-[#7AAACE]">
                  {card.badge}
                </span>
              </div>

              <h3 className="text-[24px] font-bold leading-none text-[#355872]">
                {loading ? <Loader2 size={22} className="animate-spin" /> : card.value}
              </h3>
              <p className="mt-2 text-[14px] text-[#355872]">{card.title}</p>
            </div>
          ))}
        </div>

        <div className="mb-6 rounded-[22px] border border-[#9CD5FF] bg-[#F7F8F0] p-5 shadow-[0_8px_24px_rgba(53,88,114,0.08)]">
          <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <h2 className="text-[31px] font-bold leading-none text-[#355872]">
                Platform Growth Trend
              </h2>
              <p className="mt-2 text-[14px] text-[#7AAACE]">
                Weekly reports with Arabic and English language trends
              </p>
            </div>

            <div className="mt-1 flex items-center gap-5 text-[12px] text-[#7AAACE]">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[#355872]" />
                <span>Reports</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[#7AAACE]" />
                <span>Arabic</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[#9CD5FF]" />
                <span>English</span>
              </div>
            </div>
          </div>

          <div className="h-[250px]">
            <RechartsResponsiveContainer width="100%" height="100%">
              <RechartsLineChart data={growthTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <RechartsCartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                <XAxis dataKey="label" tick={{ fill: axisColor, fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: axisColor, fontSize: 12 }} axisLine={false} tickLine={false} />
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: '#F7F8F0',
                    border: '1px solid #9CD5FF',
                    borderRadius: '12px',
                    color: '#355872',
                  }}
                />
                <RechartsLine type="monotone" dataKey="reports" stroke="#355872" strokeWidth={3} dot={{ r: 3, fill: '#355872' }} />
                <RechartsLine type="monotone" dataKey="arabic" stroke="#7AAACE" strokeWidth={3} dot={{ r: 3, fill: '#7AAACE' }} />
                <RechartsLine type="monotone" dataKey="english" stroke="#9CD5FF" strokeWidth={3} dot={{ r: 3, fill: '#9CD5FF' }} />
              </RechartsLineChart>
            </RechartsResponsiveContainer>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-5 xl:grid-cols-3">
          <div className="rounded-[22px] border border-[#9CD5FF] bg-[#F7F8F0] p-5 shadow-[0_8px_24px_rgba(53,88,114,0.08)]">
            <h2 className="text-[20px] font-bold text-[#355872]">Business Type Distribution</h2>
            <p className="mt-1 text-[13px] text-[#7AAACE]">Most common business types requesting reports</p>

            <div className="mt-4 h-[260px]">
              <RechartsResponsiveContainer width="100%" height="100%">
                <RechartsBarChart data={businessTypeData} margin={{ top: 10, right: 8, left: -18, bottom: 18 }}>
                  <RechartsCartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: axisColor, fontSize: 11 }} axisLine={false} tickLine={false} angle={-16} textAnchor="end" height={52} />
                  <YAxis tick={{ fill: axisColor, fontSize: 12 }} axisLine={false} tickLine={false} />
                  <RechartsTooltip contentStyle={{ backgroundColor: '#F7F8F0', border: '1px solid #9CD5FF', borderRadius: '12px' }} />
                  <RechartsBar dataKey="count" fill="#355872" radius={[10, 10, 0, 0]} />
                </RechartsBarChart>
              </RechartsResponsiveContainer>
            </div>

            <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2">
              {businessTypeData.map((item, index) => (
                <div key={item.name} className="flex items-center justify-between text-[12px]">
                  <div className="flex items-center gap-2 text-[#355872]">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: palette[index % palette.length] }} />
                    <span>{item.name}</span>
                  </div>
                  <span className="font-medium text-[#7AAACE]">{formatNumber(item.count)}</span>
                </div>
              ))}
              {!loading && businessTypeData.length === 0 && (
                <p className="col-span-2 text-sm text-[#7AAACE]">No business types found.</p>
              )}
            </div>
          </div>

          <div className="rounded-[22px] border border-[#9CD5FF] bg-[#F7F8F0] p-5 shadow-[0_8px_24px_rgba(53,88,114,0.08)]">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-[20px] font-bold text-[#355872]">Daily Report Activity</h2>
                <p className="mt-1 text-[13px] text-[#7AAACE]">Submitted and completed reports per day</p>
              </div>
            </div>

            <div className="mt-4 h-[230px]">
              <RechartsResponsiveContainer width="100%" height="100%">
                <RechartsBarChart data={weeklyReportActivity} barCategoryGap={18}>
                  <RechartsCartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                  <XAxis dataKey="day" tick={{ fill: axisColor, fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: axisColor, fontSize: 12 }} axisLine={false} tickLine={false} />
                  <RechartsTooltip contentStyle={{ backgroundColor: '#F7F8F0', border: '1px solid #9CD5FF', borderRadius: '12px' }} />
                  <RechartsBar dataKey="submitted" fill="#355872" radius={[10, 10, 0, 0]} />
                  <RechartsBar dataKey="completed" fill="#9CD5FF" radius={[10, 10, 0, 0]} />
                </RechartsBarChart>
              </RechartsResponsiveContainer>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-4 border-t border-[#9CD5FF] pt-4">
              <div className="text-center">
                <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-[#9CD5FF] text-[#355872]">
                  <FileBadge2 size={16} />
                </div>
                <p className="text-[28px] font-bold leading-none text-[#355872]">{formatNumber(totalSubmitted)}</p>
                <p className="mt-2 text-[12px] text-[#7AAACE]">Submitted</p>
              </div>
              <div className="text-center">
                <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-[#9CD5FF] text-[#355872]">
                  <BadgeCheck size={16} />
                </div>
                <p className="text-[28px] font-bold leading-none text-[#355872]">{formatNumber(totalCompleted)}</p>
                <p className="mt-2 text-[12px] text-[#7AAACE]">Completed</p>
              </div>
              <div className="text-center">
                <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-[#9CD5FF] text-[#355872]">
                  <Percent size={16} />
                </div>
                <p className="text-[28px] font-bold leading-none text-[#355872]">{completionRate}%</p>
                <p className="mt-2 text-[12px] text-[#7AAACE]">Rate</p>
              </div>
            </div>
          </div>

          <div className="rounded-[22px] border border-[#9CD5FF] bg-[#F7F8F0] p-5 shadow-[0_8px_24px_rgba(53,88,114,0.08)]">
            <h2 className="text-[20px] font-bold text-[#355872]">Language Breakdown</h2>
            <p className="mt-1 text-[13px] text-[#7AAACE]">Language distribution of submitted reports</p>

            <div className="mt-4 h-[220px]">
              <RechartsResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <RechartsTooltip contentStyle={{ backgroundColor: '#F7F8F0', border: '1px solid #9CD5FF', borderRadius: '12px' }} />
                  <RechartsPie
                    data={languageData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={88}
                    paddingAngle={2}
                    label={({ percent }) => `${Math.round(percent * 100)}%`}
                    labelLine={false}
                  >
                    {languageData.map((entry) => (
                      <RechartsCell key={entry.name} fill={entry.color} stroke="#F7F8F0" strokeWidth={3} />
                    ))}
                  </RechartsPie>
                </RechartsPieChart>
              </RechartsResponsiveContainer>
            </div>

            <div className="mt-2 space-y-3">
              {languageData.map((item) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between rounded-2xl border border-[#9CD5FF] bg-[#F7F8F0] px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-[13px] font-medium text-[#355872]">{item.name}</span>
                  </div>

                  <div className="flex items-center gap-4 text-[13px]">
                    <span className="font-semibold text-[#7AAACE]">{formatNumber(item.value)} reports</span>
                    <span className="text-[#7AAACE]">{item.percent}</span>
                  </div>
                </div>
              ))}
              {!loading && languageData.length === 0 && (
                <p className="rounded-2xl border border-[#9CD5FF] px-4 py-4 text-sm text-[#7AAACE]">
                  No language data found for this period.
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[0.8fr_1.2fr]">
          <div className="rounded-[22px] border border-[#9CD5FF] bg-[#F7F8F0] p-5 shadow-[0_8px_24px_rgba(53,88,114,0.08)]">
            <div className="mb-5">
              <h2 className="text-[28px] font-bold text-[#355872]">Most Active Projects</h2>
              <p className="mt-1 text-[14px] text-[#7AAACE]">
                Projects with the highest report volume
              </p>
            </div>

            <div className="space-y-3">
              {loading ? (
                <p className="rounded-2xl border border-[#9CD5FF] px-4 py-5 text-center text-sm text-[#7AAACE]">
                  Loading active projects...
                </p>
              ) : activeProjects.length === 0 ? (
                <p className="rounded-2xl border border-[#9CD5FF] px-4 py-5 text-center text-sm text-[#7AAACE]">
                  No active projects found.
                </p>
              ) : (
                activeProjects.map((project) => (
                  <div
                    key={project.name}
                    className="rounded-2xl border border-[#9CD5FF] bg-[#F7F8F0] px-4 py-3"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex min-w-0 items-start gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#9CD5FF] text-sm font-semibold text-[#355872]">
                          {project.rank}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-[#355872]">{project.name}</p>
                          <p className="mt-1 truncate text-xs text-[#7AAACE]">
                            {project.businessName || project.industry}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold leading-none text-[#355872]">
                          {formatNumber(project.reports)}
                        </p>
                        <p className="mt-1 text-xs text-[#7AAACE]">reports</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-[22px] border border-[#9CD5FF] bg-[#F7F8F0] p-5 shadow-[0_8px_24px_rgba(53,88,114,0.08)]">
            <div className="mb-5 flex flex-col justify-between gap-4 md:flex-row md:items-center">
              <div>
                <h2 className="text-[28px] font-bold text-[#355872]">Most Active Users</h2>
                <p className="mt-1 text-[14px] text-[#7AAACE]">
                  Ranked by reports and total generated report pages
                </p>
              </div>

              <div className="flex items-center gap-2">
                {['Reports', 'Pages', 'All'].map((item) => (
                  <button
                    key={item}
                    onClick={() => setUserMetric(item)}
                    className={`h-9 rounded-full border px-4 text-xs ${
                      userMetric === item
                        ? 'border-[#355872] bg-[#355872] text-white'
                        : 'border-[#9CD5FF] bg-[#F7F8F0] text-[#7AAACE]'
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px]">
                <thead>
                  <tr className="border-b border-[#9CD5FF] text-[12px] uppercase tracking-[0.08em] text-[#7AAACE]">
                    <th className="px-2 py-4 text-left">#</th>
                    <th className="px-2 py-4 text-left">User</th>
                    <th className="px-2 py-4 text-right">Reports</th>
                    <th className="px-2 py-4 text-right">Pages</th>
                    <th className="px-2 py-4 text-right">Badge</th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="5" className="px-2 py-10 text-center text-sm text-[#7AAACE]">
                        Loading active users...
                      </td>
                    </tr>
                  ) : activeUsers.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-2 py-10 text-center text-sm text-[#7AAACE]">
                        No active users found for this period.
                      </td>
                    </tr>
                  ) : (
                    activeUsers.map((user) => (
                      <tr key={user.email} className="border-b border-[#9CD5FF] last:border-b-0">
                        <td className="px-2 py-4">
                          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#9CD5FF] text-sm font-semibold text-[#355872]">
                            {user.rank}
                          </div>
                        </td>

                        <td className="px-2 py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold text-white"
                              style={{ backgroundColor: user.color }}
                            >
                              {user.initials}
                            </div>
                            <div>
                              <p className="font-medium text-[#355872]">{user.name}</p>
                              <p className="text-[12px] text-[#7AAACE]">{user.email}</p>
                            </div>
                          </div>
                        </td>

                        <td className="px-2 py-4 text-right font-semibold text-[#355872]">
                          {formatNumber(user.reports)}
                        </td>
                        <td className="px-2 py-4 text-right font-semibold text-[#7AAACE]">
                          {formatNumber(user.pages)}
                        </td>
                        <td className="px-2 py-4 text-right">
                          <span className="rounded-full border border-[#9CD5FF] bg-[#F7F8F0] px-4 py-2 text-xs text-[#7AAACE]">
                            {user.badge}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
