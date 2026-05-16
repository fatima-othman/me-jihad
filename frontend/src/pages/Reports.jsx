import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  BarChart3,
  Calendar,
  ClipboardList,
  Download,
  FileText,
  FolderKanban,
  Search,
  AlertCircle,
  ChevronUp,
  ChevronDown,
  Filter,
  X,
  TrendingUp,
  Activity,
  Users,
  DollarSign,
  PieChart,
} from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart as RechartsPieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import api from '../api/axios'

function formatDate(dateString) {
  if (!dateString) return 'N/A'

  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatNumber(num) {
  return num.toLocaleString()
}

export default function Reports() {
  const [filters, setFilters] = useState({
    search: '',
    type: 'All Types',
    language: 'All Languages',
    from: '',
    to: '',
  })
  const [overview, setOverview] = useState({
    stats: {
      total_users: 0,
      total_projects: 0,
      total_reports: 0,
      credits_sold: 0,
      filtered_reports: 0,
      today_reports: 0,
      this_week_reports: 0,
      projects_total: 0,
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
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [exporting, setExporting] = useState(false)
  const [sortConfig, setSortConfig] = useState({ key: 'generated_at', direction: 'desc' })
  const [currentPage, setCurrentPage] = useState(1)
  const [projectsPage, setProjectsPage] = useState(1)
  const [showFilterPanel, setShowFilterPanel] = useState(false)
  const itemsPerPage = 10
  const projectsPerPage = 5

  const fetchOverview = useCallback(async () => {
    setLoading(true)
    setError('')
    setCurrentPage(1)
    setProjectsPage(1)

    try {
      const { data } = await api.get('/admin/reports-overview', {
        params: filters,
      })

      setOverview(data)
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          'Unable to load reports and projects overview right now.',
      )
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      fetchOverview()
    }, 250)

    return () => window.clearTimeout(timeoutId)
  }, [fetchOverview])

  const reportTypes = useMemo(
    () => ['All Types', ...new Set(overview.reports.map((report) => report.type))],
    [overview.reports],
  )

  const languages = useMemo(
    () => ['All Languages', ...new Set(overview.reports.map((report) => report.language))],
    [overview.reports],
  )

  // Sorting logic
  const sortedReports = useMemo(() => {
    const sorted = [...overview.reports].sort((a, b) => {
      let aVal = a[sortConfig.key]
      let bVal = b[sortConfig.key]

      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase()
        bVal = bVal.toLowerCase()
      }

      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1
      return 0
    })
    return sorted
  }, [overview.reports, sortConfig])

  // Pagination logic for reports
  const paginatedReports = useMemo(() => {
    const startIdx = (currentPage - 1) * itemsPerPage
    return sortedReports.slice(startIdx, startIdx + itemsPerPage)
  }, [sortedReports, currentPage])

  const totalReportPages = Math.ceil(sortedReports.length / itemsPerPage)

  // Pagination logic for projects
  const paginatedProjects = useMemo(() => {
    const startIdx = (projectsPage - 1) * projectsPerPage
    return overview.projects.slice(startIdx, startIdx + projectsPerPage)
  }, [overview.projects, projectsPage])

  const totalProjectPages = Math.ceil(overview.projects.length / projectsPerPage)

  const summaryCards = [
    {
      title: 'Total Users',
      value: formatNumber(overview.stats.total_users),
      subtitle: 'Registered platform users',
      icon: Users,
      color: '#355872',
      bgColor: '#F7F8F0',
    },
    {
      title: 'Total Projects',
      value: formatNumber(overview.stats.total_projects),
      subtitle: 'Projects tracked in the dashboard',
      icon: FolderKanban,
      color: '#355872',
      bgColor: '#F7F8F0',
    },
    {
      title: 'Total Reports',
      value: formatNumber(overview.stats.total_reports),
      subtitle: 'Reports generated across the platform',
      icon: ClipboardList,
      color: '#355872',
      bgColor: '#F7F8F0',
    },
    {
      title: 'Credits Sold',
      value: formatNumber(overview.stats.credits_sold),
      subtitle: 'Total credits purchased by users',
      icon: DollarSign,
      color: '#355872',
      bgColor: '#F7F8F0',
    },
    {
      title: 'Filtered Results',
      value: formatNumber(overview.stats.filtered_reports),
      subtitle: 'Reports matching the current filters',
      icon: BarChart3,
      color: '#7AAACE',
      bgColor: '#F7F8F0',
    },
    {
      title: 'This Week',
      value: formatNumber(overview.stats.this_week_reports),
      subtitle: 'Reports generated since week start',
      icon: Calendar,
      color: '#7AAACE',
      bgColor: '#F7F8F0',
    },
  ]

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
      const fallbackFileName = 'filtered-reports.csv'
      const fileNameMatch = contentDisposition?.match(/filename="?([^"]+)"?/)
      const fileName = fileNameMatch?.[1] || fallbackFileName

      link.href = url
      link.setAttribute('download', fileName)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          'Unable to export the filtered reports right now.',
      )
    } finally {
      setExporting(false)
    }
  }

  const handleSort = (key) => {
    setSortConfig((current) => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc',
    }))
  }

  const hasActiveFilters = () => {
    return (
      filters.search !== '' ||
      filters.type !== 'All Types' ||
      filters.language !== 'All Languages' ||
      filters.from !== '' ||
      filters.to !== ''
    )
  }

  const handleResetFilters = () => {
    setFilters({
      search: '',
      type: 'All Types',
      language: 'All Languages',
      from: '',
      to: '',
    })
  }

  return (
    <div className="min-h-screen bg-[#F7F8F0]">
      {/* Header */}
      <div className="flex h-[82px] items-center justify-between border-b border-[#9CD5FF] bg-[#F7F8F0] px-6">
        <div>
          <h1 className="text-[30px] font-bold leading-none text-[#355872]">
            Reports & Projects Overview
          </h1>
          <p className="mt-2 text-[13px] text-[#7AAACE]">
            Comprehensive platform analytics with real-time filtering and export capabilities
          </p>
        </div>

        <div className="flex items-center gap-3">
          {hasActiveFilters() && (
            <button
              onClick={handleResetFilters}
              className="flex h-11 items-center gap-2 rounded-xl border border-[#9CD5FF] bg-[#F7F8F0] px-5 text-sm font-medium text-[#355872] hover:bg-[#9CD5FF] transition-colors"
            >
              <X size={15} />
              Reset Filters
            </button>
          )}
          <button
            onClick={handleExport}
            disabled={exporting || loading}
            className="flex h-11 items-center gap-2 rounded-xl border border-[#9CD5FF] bg-[#F7F8F0] px-5 text-sm font-medium text-[#355872] disabled:opacity-60 hover:bg-[#9CD5FF] transition-colors"
          >
            <Download size={15} />
            {exporting ? 'Exporting...' : 'Export CSV'}
          </button>

          <button
            onClick={fetchOverview}
            disabled={loading}
            className="flex h-11 items-center gap-2 rounded-xl bg-[#355872] px-5 text-sm font-medium text-white shadow-[0_6px_16px_rgba(53,88,114,0.22)] hover:bg-[#7AAACE] transition-colors disabled:opacity-70"
          >
            <Activity size={15} />
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      <div className="p-6">
        {/* Summary Cards */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {summaryCards.map((card) => (
            <div
              key={card.title}
              className="group rounded-[20px] border border-[#9CD5FF] bg-[#F7F8F0] p-5 shadow-[0_8px_24px_rgba(53,88,114,0.08)] hover:shadow-[0_12px_32px_rgba(53,88,114,0.12)] transition-all hover:border-[#9CD5FF]"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[#F7F8F0] text-[#7AAACE] group-hover:bg-[#9CD5FF] transition-colors" style={{ backgroundColor: card.bgColor, color: card.color }}>
                <card.icon size={18} />
              </div>

              <h3 className="text-[26px] font-bold leading-none text-[#355872]">
                {card.value}
              </h3>
              <p className="mt-3 text-[14px] font-medium text-[#355872]">{card.title}</p>
              <p className="mt-1 text-[12px] text-[#7AAACE]">{card.subtitle}</p>
            </div>
          ))}
        </div>

        {/* Filter Panel */}
        <div className="mb-6 rounded-[20px] border border-[#9CD5FF] bg-[#F7F8F0] p-5 shadow-[0_8px_24px_rgba(53,88,114,0.08)]">
          <button
            onClick={() => setShowFilterPanel(!showFilterPanel)}
            className="flex w-full items-center justify-between text-left"
          >
            <div className="flex items-center gap-3">
              <Filter size={18} className="text-[#355872]" />
              <div>
                <h3 className="text-[16px] font-bold text-[#355872]">Filters</h3>
                <p className="text-[12px] text-[#7AAACE]">
                  {hasActiveFilters() ? `${Object.values(filters).filter(v => v && v !== 'All Types' && v !== 'All Languages').length} active filters` : 'No active filters'}
                </p>
              </div>
            </div>
            <div className={`transition-transform ${showFilterPanel ? 'rotate-180' : ''}`}>
              <ChevronDown size={20} className="text-[#355872]" />
            </div>
          </button>

          {showFilterPanel && (
            <div className="mt-5 space-y-4 border-t border-[#9CD5FF] pt-5">
              <div className="relative">
                <Search
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7AAACE]"
                  size={16}
                />
                <input
                  type="text"
                  placeholder="Search by project, business, report, or user..."
                  value={filters.search}
                  onChange={(e) => setFilters((current) => ({ ...current, search: e.target.value }))}
                  className="w-full h-11 rounded-2xl border border-[#9CD5FF] bg-[#F7F8F0] pl-11 pr-4 text-sm text-[#355872] outline-none placeholder:text-[#7AAACE] focus:border-[#7AAACE] transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                <select
                  value={filters.type}
                  onChange={(e) => setFilters((current) => ({ ...current, type: e.target.value }))}
                  className="h-11 rounded-xl border border-[#9CD5FF] bg-[#F7F8F0] px-4 text-sm text-[#355872] outline-none focus:border-[#7AAACE] transition-colors"
                >
                  {reportTypes.map((type) => (
                    <option key={type}>{type}</option>
                  ))}
                </select>

                <select
                  value={filters.language}
                  onChange={(e) => setFilters((current) => ({ ...current, language: e.target.value }))}
                  className="h-11 rounded-xl border border-[#9CD5FF] bg-[#F7F8F0] px-4 text-sm text-[#355872] outline-none focus:border-[#7AAACE] transition-colors"
                >
                  {languages.map((lang) => (
                    <option key={lang}>{lang}</option>
                  ))}
                </select>

                <input
                  type="date"
                  value={filters.from}
                  onChange={(e) => setFilters((current) => ({ ...current, from: e.target.value }))}
                  className="h-11 rounded-xl border border-[#9CD5FF] bg-[#F7F8F0] px-4 text-sm text-[#355872] outline-none focus:border-[#7AAACE] transition-colors"
                />

                <input
                  type="date"
                  value={filters.to}
                  onChange={(e) => setFilters((current) => ({ ...current, to: e.target.value }))}
                  className="h-11 rounded-xl border border-[#9CD5FF] bg-[#F7F8F0] px-4 text-sm text-[#355872] outline-none focus:border-[#7AAACE] transition-colors"
                />

                <button
                  onClick={handleResetFilters}
                  className="h-11 rounded-xl border border-[#9CD5FF] bg-[#F7F8F0] px-4 text-sm font-medium text-[#355872] hover:bg-[#F7F8F0] transition-colors"
                >
                  Clear All
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 rounded-2xl border border-[#9CD5FF] bg-[#F7F8F0] px-5 py-4 flex items-start gap-3">
            <AlertCircle size={18} className="text-[#355872] flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-[#355872]">Error Loading Data</h4>
              <p className="text-sm text-[#355872] mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Charts */}
        <div className="mb-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
          <div className="rounded-[20px] border border-[#9CD5FF] bg-[#F7F8F0] p-6 shadow-[0_8px_24px_rgba(53,88,114,0.08)]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-[18px] font-bold text-[#355872]">Daily Report Generation</h3>
                <p className="mt-1 text-[12px] text-[#7AAACE]">
                  Reports generated over the last 7 days
                </p>
              </div>
              <TrendingUp size={20} className="text-[#355872]" />
            </div>

            <div className="mt-4 h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={overview.daily_report_counts}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#9CD5FF" vertical={false} />
                  <XAxis dataKey="label" tick={{ fill: '#7AAACE', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#7AAACE', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#F7F8F0', border: '1px solid #9CD5FF', borderRadius: '8px' }} />
                  <Bar dataKey="count" fill="#355872" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-[20px] border border-[#9CD5FF] bg-[#F7F8F0] p-6 shadow-[0_8px_24px_rgba(53,88,114,0.08)]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-[18px] font-bold text-[#355872]">Weekly Report Generation</h3>
                <p className="mt-1 text-[12px] text-[#7AAACE]">
                  Report totals grouped by week
                </p>
              </div>
              <Activity size={20} className="text-[#355872]" />
            </div>

            <div className="mt-4 h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={overview.weekly_report_counts}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#9CD5FF" vertical={false} />
                  <XAxis dataKey="label" tick={{ fill: '#7AAACE', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#7AAACE', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#F7F8F0', border: '1px solid #9CD5FF', borderRadius: '8px' }} />
                  <Line type="monotone" dataKey="count" stroke="#355872" strokeWidth={3} dot={{ r: 4, fill: '#355872' }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="rounded-[20px] border border-[#9CD5FF] bg-[#F7F8F0] p-6 shadow-[0_8px_24px_rgba(53,88,114,0.08)]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-[18px] font-bold text-[#355872]">Top Business Types</h3>
                <p className="mt-1 text-[12px] text-[#7AAACE]">
                  Most common business industries requesting reports
                </p>
              </div>
              <TrendingUp size={20} className="text-[#355872]" />
            </div>

            <div className="mt-4 h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={overview.business_type_counts} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#9CD5FF" vertical={false} />
                  <XAxis dataKey="industry" tick={{ fill: '#7AAACE', fontSize: 12 }} axisLine={false} tickLine={false} interval={0} angle={-20} textAnchor="end" height={70} />
                  <YAxis tick={{ fill: '#7AAACE', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#F7F8F0', border: '1px solid #9CD5FF', borderRadius: '8px' }} />
                  <Bar dataKey="count" fill="#355872" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-[20px] border border-[#9CD5FF] bg-[#F7F8F0] p-6 shadow-[0_8px_24px_rgba(53,88,114,0.08)]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-[18px] font-bold text-[#355872]">Weekly Activity & Language</h3>
                <p className="mt-1 text-[12px] text-[#7AAACE]">
                  Weekly report volume with Arabic / English trends
                </p>
              </div>
              <Activity size={20} className="text-[#355872]" />
            </div>

            <div className="mt-4 h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={overview.weekly_activity} margin={{ top: 10, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#9CD5FF" vertical={false} />
                  <XAxis dataKey="label" tick={{ fill: '#7AAACE', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#7AAACE', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#F7F8F0', border: '1px solid #9CD5FF', borderRadius: '8px' }} />
                  <Legend wrapperStyle={{ fontSize: 12, color: '#355872' }} />
                  <Line type="monotone" dataKey="total" stroke="#355872" strokeWidth={3} dot={{ r: 3, fill: '#355872' }} />
                  <Line type="monotone" dataKey="Arabic" stroke="#7AAACE" strokeWidth={3} dot={{ r: 3, fill: '#7AAACE' }} />
                  <Line type="monotone" dataKey="English" stroke="#355872" strokeWidth={3} dot={{ r: 3, fill: '#355872' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-[20px] border border-[#9CD5FF] bg-[#F7F8F0] p-6 shadow-[0_8px_24px_rgba(53,88,114,0.08)]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-[18px] font-bold text-[#355872]">Language Breakdown</h3>
                <p className="mt-1 text-[12px] text-[#7AAACE]">
                  Platform report volume by language
                </p>
              </div>
              <PieChart size={20} className="text-[#355872]" />
            </div>

            <div className="mt-4 h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Tooltip contentStyle={{ backgroundColor: '#F7F8F0', border: '1px solid #9CD5FF', borderRadius: '8px' }} />
                  <Pie
                    data={Object.entries(overview.language_counts).map(([name, value]) => ({ name, value }))}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={90}
                    fill="#355872"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {Object.entries(overview.language_counts).map((entry, index) => (
                      <Cell key={entry[0]} fill={['#355872', '#7AAACE', '#355872', '#9CD5FF'][index % 4]} />
                    ))}
                  </Pie>
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
          <div className="rounded-[20px] border border-[#9CD5FF] bg-[#F7F8F0] p-6 shadow-[0_8px_24px_rgba(53,88,114,0.08)]">
            <h3 className="text-[18px] font-bold text-[#355872]">Most Active Projects</h3>
            <p className="mt-1 text-[12px] text-[#7AAACE]">Projects with the highest report production.</p>
            <div className="mt-5 space-y-3">
              {overview.top_projects.map((project) => (
                <div key={project.id} className="rounded-3xl border border-[#9CD5FF] bg-[#F7F8F0] p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold text-[#355872]">{project.name}</p>
                      <p className="text-[12px] text-[#7AAACE]">{project.industry || 'Unspecified industry'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[12px] text-[#355872]">Reports</p>
                      <p className="text-[20px] font-bold text-[#355872]">{project.reports_count}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[20px] border border-[#9CD5FF] bg-[#F7F8F0] p-6 shadow-[0_8px_24px_rgba(53,88,114,0.08)]">
            <h3 className="text-[18px] font-bold text-[#355872]">Most Active Users</h3>
            <p className="mt-1 text-[12px] text-[#7AAACE]">Users who have requested the most reports.</p>
            <div className="mt-5 space-y-3">
              {overview.top_users.map((user) => (
                <div key={user.id} className="rounded-3xl border border-[#9CD5FF] bg-[#F7F8F0] p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold text-[#355872]">{user.name}</p>
                      <p className="text-[12px] text-[#7AAACE]">{user.email}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[12px] text-[#355872]">Reports</p>
                      <p className="text-[20px] font-bold text-[#355872]">{user.reports_count}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Projects Table */}
        <div className="mb-6 rounded-[20px] border border-[#9CD5FF] bg-[#F7F8F0] shadow-[0_8px_24px_rgba(53,88,114,0.08)] overflow-hidden">
          <div className="border-b border-[#9CD5FF] px-6 py-5 bg-[#F7F8F0]">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-[22px] font-bold leading-none text-[#355872]">Projects Overview</h2>
                <p className="mt-2 text-[13px] text-[#7AAACE]">
                  {overview.projects.length} total projects | Showing {paginatedProjects.length} on this page
                </p>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#F7F8F0]">
                <tr className="border-b border-[#9CD5FF] text-left text-[11px] uppercase tracking-[0.1em] text-[#355872]">
                  <th className="px-6 py-4 font-semibold">Project Name</th>
                  <th className="px-6 py-4 font-semibold">Business Name</th>
                  <th className="px-6 py-4 font-semibold">Industry</th>
                  <th className="px-6 py-4 font-semibold">Owner</th>
                  <th className="px-6 py-4 font-semibold text-center">Reports Count</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center">
                      <div className="flex justify-center">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#9CD5FF] border-t-[#355872]"></div>
                      </div>
                    </td>
                  </tr>
                ) : paginatedProjects.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-sm text-[#355872]">
                      No projects found
                    </td>
                  </tr>
                ) : (
                  paginatedProjects.map((project, idx) => (
                    <tr key={project.id} className={`border-b border-[#9CD5FF] hover:bg-[#F7F8F0] transition-colors ${idx % 2 === 0 ? 'bg-[#F7F8F0]' : 'bg-[#F7F8F0]'}`}>
                      <td className="px-6 py-4 font-semibold text-[#355872]">{project.name}</td>
                      <td className="px-6 py-4 text-[13px] text-[#355872]">{project.business_name}</td>
                      <td className="px-6 py-4 text-[13px] text-[#355872]">{project.industry}</td>
                      <td className="px-6 py-4 text-[13px]">
                        <div className="font-medium text-[#355872]">{project.owner_name}</div>
                        <div className="text-[#7AAACE]">{project.owner_email}</div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-[#355872] text-white text-sm font-bold">
                          {project.reports_count}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Projects Pagination */}
          {totalProjectPages > 1 && (
            <div className="border-t border-[#9CD5FF] px-6 py-4 flex items-center justify-between bg-[#F7F8F0]">
              <p className="text-[12px] text-[#355872]">
                Page {projectsPage} of {totalProjectPages}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setProjectsPage(p => Math.max(1, p - 1))}
                  disabled={projectsPage === 1}
                  className="p-2 rounded-lg border border-[#9CD5FF] hover:bg-[#F7F8F0] disabled:opacity-40 transition-colors"
                >
                  <ChevronUp size={16} className="text-[#355872]" />
                </button>
                <button
                  onClick={() => setProjectsPage(p => Math.min(totalProjectPages, p + 1))}
                  disabled={projectsPage === totalProjectPages}
                  className="p-2 rounded-lg border border-[#9CD5FF] hover:bg-[#F7F8F0] disabled:opacity-40 transition-colors"
                >
                  <ChevronDown size={16} className="text-[#355872]" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Reports Table */}
        <div className="rounded-[20px] border border-[#9CD5FF] bg-[#F7F8F0] shadow-[0_8px_24px_rgba(53,88,114,0.08)] overflow-hidden">
          <div className="border-b border-[#9CD5FF] px-6 py-5 bg-[#F7F8F0]">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-[22px] font-bold leading-none text-[#355872]">Reports Overview</h2>
                <p className="mt-2 text-[13px] text-[#7AAACE]">
                  {sortedReports.length} total reports | Showing {paginatedReports.length} on this page
                </p>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#F7F8F0]">
                <tr className="border-b border-[#9CD5FF] text-left text-[11px] uppercase tracking-[0.1em] text-[#355872]">
                  <th className="px-6 py-4 font-semibold cursor-pointer hover:text-[#355872]" onClick={() => handleSort('report_code')}>
                    <div className="flex items-center gap-1">
                      Report ID
                      {sortConfig.key === 'report_code' && (
                        sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-4 font-semibold cursor-pointer hover:text-[#355872]" onClick={() => handleSort('title')}>
                    <div className="flex items-center gap-1">
                      Title
                      {sortConfig.key === 'title' && (
                        sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-4 font-semibold cursor-pointer hover:text-[#355872]" onClick={() => handleSort('project_name')}>
                    <div className="flex items-center gap-1">
                      Project
                      {sortConfig.key === 'project_name' && (
                        sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-4 font-semibold cursor-pointer hover:text-[#355872]" onClick={() => handleSort('type')}>
                    <div className="flex items-center gap-1">
                      Type
                      {sortConfig.key === 'type' && (
                        sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-4 font-semibold cursor-pointer hover:text-[#355872]" onClick={() => handleSort('language')}>
                    <div className="flex items-center gap-1">
                      Language
                      {sortConfig.key === 'language' && (
                        sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-4 font-semibold">Submitted By</th>
                  <th className="px-6 py-4 font-semibold cursor-pointer hover:text-[#355872]" onClick={() => handleSort('generated_at')}>
                    <div className="flex items-center gap-1">
                      Date
                      {sortConfig.key === 'generated_at' && (
                        sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-4 font-semibold text-center">Pages</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="9" className="px-6 py-12 text-center">
                      <div className="flex justify-center">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#9CD5FF] border-t-[#355872]"></div>
                      </div>
                    </td>
                  </tr>
                ) : paginatedReports.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="px-6 py-12 text-center text-sm text-[#355872]">
                      No reports found matching the current filters
                    </td>
                  </tr>
                ) : (
                  paginatedReports.map((report, idx) => (
                    <tr key={report.id} className={`border-b border-[#9CD5FF] hover:bg-[#F7F8F0] transition-colors ${idx % 2 === 0 ? 'bg-[#F7F8F0]' : 'bg-[#F7F8F0]'}`}>
                      <td className="px-6 py-4 font-semibold text-[#355872]">{report.report_code}</td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-[#355872] max-w-xs truncate">{report.title}</div>
                        <div className="text-[12px] text-[#7AAACE]">{report.business_name}</div>
                      </td>
                      <td className="px-6 py-4 text-[13px] text-[#355872]">{report.project_name}</td>
                      <td className="px-6 py-4 text-[13px]">
                        <span className="inline-block px-3 py-1 rounded-full bg-[#F7F8F0] text-[#355872] font-medium">
                          {report.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-[13px]">
                        <span className="inline-block px-3 py-1 rounded-full bg-[#F7F8F0] text-[#7AAACE] font-medium">
                          {report.language}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-[13px]">
                        <div className="font-medium text-[#355872]">{report.submitted_by}</div>
                        <div className="text-[#7AAACE]">{report.submitted_by_email}</div>
                      </td>
                      <td className="px-6 py-4 text-[13px] text-[#7AAACE]">{formatDate(report.generated_at)}</td>
                      <td className="px-6 py-4 text-center font-semibold text-[#355872]">{report.pages}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-3 py-1.5 rounded-full text-xs font-semibold ${
                          report.status === 'completed' ? 'bg-[#9CD5FF] text-[#355872]' :
                          report.status === 'pending' ? 'bg-[#F7F8F0] text-[#355872]' :
                          report.status === 'failed' ? 'bg-[#9CD5FF] text-[#355872]' :
                          'bg-[#9CD5FF] text-[#355872]'
                        }`}>
                          {report.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Reports Pagination */}
          {totalReportPages > 1 && (
            <div className="border-t border-[#9CD5FF] px-6 py-4 flex items-center justify-between bg-[#F7F8F0]">
              <p className="text-[12px] text-[#355872]">
                Page {currentPage} of {totalReportPages}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-[#9CD5FF] hover:bg-[#F7F8F0] disabled:opacity-40 transition-colors"
                >
                  <ChevronUp size={16} className="text-[#355872]" />
                </button>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalReportPages, p + 1))}
                  disabled={currentPage === totalReportPages}
                  className="p-2 rounded-lg border border-[#9CD5FF] hover:bg-[#F7F8F0] disabled:opacity-40 transition-colors"
                >
                  <ChevronDown size={16} className="text-[#355872]" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
