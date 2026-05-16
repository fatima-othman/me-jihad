import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import Breadcrumbs from '../components/Breadcrumbs';
import ComparisonCard from '../components/ComparisonCard';
import SectionTitle from '../components/SectionTitle';
import StatusBadge from '../components/StatusBadge';
import Toast from '../components/Toast';
import TopActionBar from '../components/TopActionBar';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import DashboardLayout from '../layouts/DashboardLayout';
import DashboardPage from './Feature 5/DashboardPage';
import ReportHistoryPage from './Feature 5/ReportHistoryPage';
import SettingsPage from './Feature 5/SettingsPage';
import { initialProjects } from '../data/projects';
import fallbackReports from '../data/reports';

const RECENTLY_VIEWED_KEY_PREFIX = 'strategai_recently_viewed_';

const toFeature5Path = (path) => {
  if (!path || path === '/') return '/feature5/dashboard';
  if (path.startsWith('/feature5')) return path;
  return `/feature5${path}`;
};

const normalizeProject = (project) => ({
  ...project,
  type: project.type || project.business_type || 'Business',
  country: project.country || project.market || 'Local market',
  reports: project.reports ?? project.reports_count ?? 0,
  lastDate: project.lastDate || project.updated_at?.slice(0, 10) || project.created_at?.slice(0, 10) || 'No date',
});

const normalizeReport = (report) => {
  const project = report.project || {};
  const selectedSections = Array.isArray(report.selected_sections)
    ? report.selected_sections
    : Object.keys(report.section_content || report.sections || {});
  const sectionContent = report.section_content || (typeof report.sections === 'object' && !Array.isArray(report.sections) ? report.sections : {});

  return {
    ...report,
    name: report.name || report.title || `${project.name || 'Strategy'} Report`,
    projectId: report.projectId || report.project_id,
    project: report.project || project.name || 'Project',
    selected_sections: selectedSections,
    section_content: sectionContent,
    type: report.type || selectedSections[0] || 'Strategy',
    date: report.date || report.created_at?.slice(0, 10) || 'No date',
    sections: report.sections_count || selectedSections.length || 1,
    score: typeof report.score === 'number' ? report.score : null,
    swot: report.swot || {
      strengths: 'Strong business direction',
      weaknesses: 'Needs more detailed validation',
      opportunities: 'Room for growth in the target market',
      threats: 'Competitive pressure',
    },
    kpis: report.kpis || { revenue: 82, marketing: 88, retention: 79 },
    recommendations: report.recommendations || ['Review market fit', 'Improve acquisition channels', 'Track weekly KPIs'],
  };
};

function Feature5Root() {
  const { user } = useAuth();
  const location = useLocation();
  const navigateBase = useNavigate();
  const navigate = (path, options) => navigateBase(toFeature5Path(path), options);

  const [selectedReports, setSelectedReports] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectFilter, setProjectFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [projectSearch, setProjectSearch] = useState('');
  const [reportSearch, setReportSearch] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [projectSort, setProjectSort] = useState('name-asc');
  const [reportSort, setReportSort] = useState('date-desc');
  const [toast, setToast] = useState(null);
  const [favoriteProjects, setFavoriteProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [totalDownloads, setTotalDownloads] = useState(0);
  const [projects, setProjects] = useState(initialProjects.map(normalizeProject));
  const [reports, setReports] = useState(fallbackReports.map(normalizeReport));
  const [newProject, setNewProject] = useState({ name: '', type: '', country: '' });
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Report generated', message: 'Q1 Growth Strategy was generated.', time: '2 min ago', isRead: false },
    { id: 2, title: 'Project updated', message: 'Project details were updated.', time: '10 min ago', isRead: false },
  ]);

  const recentStorageKey = `${RECENTLY_VIEWED_KEY_PREFIX}${user?.id || user?.email || 'guest'}`;

  useEffect(() => {
    const load = async () => {
      try {
        const [projectResponse, reportResponse] = await Promise.all([
          api.get('/projects'),
          api.get('/reports'),
        ]);

        setProjects((projectResponse?.data || []).map(normalizeProject));
        setReports((reportResponse?.data || []).map(normalizeReport));
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, []);

  const showToast = (type, title, message = '') => {
    setToast({ type, title, message });
    setTimeout(() => setToast(null), 2500);
  };

  const addNotification = (title, message) => {
    setNotifications((prev) => [
      { id: Date.now(), title, message, time: 'Just now', isRead: false },
      ...prev,
    ]);
  };

  const addRecentItem = (item) => {
    setRecentlyViewed((prev) => {
      const filtered = prev.filter((entry) => !(entry.type === item.type && entry.title === item.title));
      return [item, ...filtered].slice(0, 5);
    });
  };

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(recentStorageKey);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        setRecentlyViewed(parsed.slice(0, 5));
      }
    } catch {
      setRecentlyViewed([]);
    }
  }, [recentStorageKey]);

  useEffect(() => {
    window.localStorage.setItem(recentStorageKey, JSON.stringify(recentlyViewed.slice(0, 5)));
  }, [recentStorageKey, recentlyViewed]);

  useEffect(() => {
    if (recentlyViewed.length > 0 || reports.length === 0) return;

    const historyBasedItems = [...reports]
      .sort((a, b) => {
        const aTime = new Date(a.created_at || a.date || 0).getTime();
        const bTime = new Date(b.created_at || b.date || 0).getTime();
        if (aTime !== bTime) return bTime - aTime;
        return (b.id || 0) - (a.id || 0);
      })
      .slice(0, 5)
      .map((report) => ({
        type: 'report',
        title: report.name || 'Report',
        subtitle: `${report.project?.name || report.project || 'Project'} • ${report.type || 'Strategy'}`,
      }));

    if (historyBasedItems.length > 0) {
      setRecentlyViewed(historyBasedItems);
    }
  }, [reports, recentlyViewed.length]);

  useEffect(() => {
    const path = location.pathname;
    if (!path.startsWith('/feature5/')) return;
    if (path.endsWith('/dashboard')) return;

    const fallbackEntry = {
      type: 'page',
      title: 'Feature Page',
      subtitle: path.replace('/feature5/', '').replace('-', ' '),
    };

    const byPath = {
      '/feature5/projects': {
        type: 'page',
        title: 'Projects',
        subtitle: 'Projects management',
      },
      '/feature5/history': {
        type: 'page',
        title: 'Report History',
        subtitle: 'Generated reports list',
      },
      '/feature5/settings': {
        type: 'page',
        title: 'Settings',
        subtitle: 'Profile and security settings',
      },
      '/feature5/comparison': {
        type: 'page',
        title: 'Comparison',
        subtitle: 'Compare two reports',
      },
      '/feature5/report-details': selectedReport
        ? {
            type: 'report',
            title: selectedReport.name,
            subtitle: `${selectedReport.project?.name || selectedReport.project} • ${selectedReport.type}`,
          }
        : null,
      '/feature5/project-details': selectedProject
        ? {
            type: 'project',
            title: selectedProject.name,
            subtitle: `${selectedProject.type} • ${selectedProject.country}`,
          }
        : null,
    };

    const entry = byPath[path] || fallbackEntry;
    if (entry) {
      addRecentItem(entry);
    }
  }, [location.pathname, selectedProject, selectedReport]);

  const unreadNotifications = notifications.filter((item) => !item.isRead).length;
  const markAllNotificationsRead = () => setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })));
  const selectedReportObjects = reports.filter((report) => selectedReports.includes(report.id));
  const canCompare = selectedReportObjects.length === 2 && selectedReportObjects[0].projectId === selectedReportObjects[1].projectId;

  const topProject = useMemo(() => projects[0], [projects]);
  const weakestReport = useMemo(() => [...reports].sort((a, b) => a.score - b.score)[0], [reports]);
  const totalActiveProjects = projects.filter((project) => project.reports > 0).length;
  const averageScore = useMemo(() => {
    const validScores = reports
      .map((report) => Number(report.score))
      .filter((score) => Number.isFinite(score) && score > 0);

    if (validScores.length === 0) {
      return null;
    }

    const avg = validScores.reduce((sum, score) => sum + score, 0) / validScores.length;
    return Math.round(avg);
  }, [reports]);
  useEffect(() => {
    const userKey = user?.id || user?.email || 'guest';
    const key = `strategai_download_count_${userKey}`;
    setTotalDownloads(Number(window.localStorage.getItem(key) || 0));
  }, [user?.id, user?.email, location.pathname]);

  const filteredProjects = useMemo(() => {
    const filtered = projects.filter((project) => project.name.toLowerCase().includes(projectSearch.toLowerCase()));
    return [...filtered].sort((a, b) => (projectSort === 'name-desc' ? b.name.localeCompare(a.name) : a.name.localeCompare(b.name)));
  }, [projects, projectSearch, projectSort]);

  const clearProjectFilters = () => {
    setProjectSearch('');
    setProjectSort('name-asc');
  };

  const clearReportFilters = () => {
    setReportSearch('');
    setProjectFilter('all');
    setTypeFilter('all');
    setDateFilter('');
    setReportSort('date-desc');
  };

  const toggleReportSelection = (reportId, projectId) => {
    setSelectedReports((prev) => {
      if (prev.includes(reportId)) {
        const next = prev.filter((id) => id !== reportId);
        window.localStorage.setItem('compareReportIds', JSON.stringify(next));
        return next;
      }
      if (prev.length === 0) {
        const next = [reportId];
        window.localStorage.setItem('compareReportIds', JSON.stringify(next));
        return next;
      }
      const firstReport = reports.find((report) => report.id === prev[0]);
      if (prev.length === 1 && firstReport?.projectId === projectId) {
        const next = [...prev, reportId];
        window.localStorage.setItem('compareReportIds', JSON.stringify(next));
        return next;
      }
      showToast('error', 'Invalid comparison', 'You can compare only 2 reports from the same project.');
      return prev;
    });
  };

  const getReportStatus = (score) => {
    if (score >= 90) return { label: 'Excellent', variant: 'default' };
    if (score >= 80) return { label: 'Good', variant: 'warning' };
    return { label: 'Needs Review', variant: 'danger' };
  };

  const panelBg = darkMode ? 'bg-[#111827] border-gray-700' : 'bg-white border-gray-200';
  const mutedText = darkMode ? 'text-gray-300' : 'text-gray-500';
  const pageBg = darkMode ? 'bg-[#0B1220]' : 'bg-[#F7F8F0]';
  const pageText = darkMode ? 'text-gray-100' : 'text-gray-800';

  const NavButton = ({ to, label }) => {
    const target = toFeature5Path(to);
    const isActive = location.pathname === target;

    return (
      <Link
        to={target}
        className={`block w-full rounded-xl px-4 py-3 text-left transition ${
          isActive ? 'bg-[#9CD5FF] text-[#355872] font-semibold' : darkMode ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-600 hover:bg-gray-100'
        }`}
      >
        {label}
      </Link>
    );
  };

  const ProjectDetailsPage = () => (
    <>
      <Breadcrumbs items={['Dashboard', 'Projects', selectedProject?.name || 'Project']} darkMode={darkMode} />
      <SectionTitle title={selectedProject?.name || 'Project Details'} subtitle="Reports under this project" darkMode={darkMode} />
      <div className={`border rounded-2xl p-6 shadow-sm ${panelBg}`}>
        {(reports.filter((report) => report.projectId === selectedProject?.id)).map((report) => (
          <button
            key={report.id}
            onClick={() => {
              setSelectedReport(report);
              navigate(`/reports/${report.id}/view`);
            }}
            className="w-full text-left border-b last:border-b-0 py-4"
          >
            <span className="font-semibold">{report.name}</span>
            <span className={`ml-3 ${mutedText}`}>{report.score ?? '-'}{report.score == null ? '' : '%'}</span>
          </button>
        ))}
      </div>
    </>
  );

  const ReportDetailsPage = () => {
    const reportIdFromQuery = new URLSearchParams(location.search).get('id');
    const reportFromQuery = reportIdFromQuery
      ? reports.find((report) => String(report.id) === String(reportIdFromQuery))
      : null;
    const activeReport = selectedReport || reportFromQuery || null;

    useEffect(() => {
      if (!selectedReport && reportFromQuery) {
        setSelectedReport(reportFromQuery);
      }
    }, [selectedReport, reportFromQuery]);

    if (!activeReport) return <div className={`border rounded-2xl p-10 text-center ${panelBg} ${mutedText}`}>No report selected yet.</div>;
    const writtenSections = Object.entries(activeReport.section_content || {});

    return (
      <>
        <Breadcrumbs items={['Dashboard', 'Report History', activeReport.name]} darkMode={darkMode} />
        <SectionTitle title={activeReport.name} subtitle={`${activeReport.project?.name || activeReport.project} • ${activeReport.date}`} darkMode={darkMode} />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          <ComparisonCard title="Revenue KPI" value={activeReport.kpis.revenue} darkMode={darkMode} />
          <ComparisonCard title="Marketing KPI" value={activeReport.kpis.marketing} darkMode={darkMode} />
          <ComparisonCard title="Retention KPI" value={activeReport.kpis.retention} darkMode={darkMode} />
        </div>
        <div className={`border rounded-2xl p-6 shadow-sm ${panelBg}`}>
          <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Full Written Report</h3>
          {writtenSections.length === 0 ? (
            <p className={mutedText}>No written sections found for this report.</p>
          ) : (
            <div className="space-y-5">
              {writtenSections.map(([key, value]) => (
                <div key={key} className={`rounded-xl border p-4 ${darkMode ? 'border-gray-700 bg-[#0F172A]' : 'border-gray-200 bg-[#F7F8F0]'}`}>
                  <h4 className={`font-semibold mb-2 capitalize ${darkMode ? 'text-white' : 'text-gray-900'}`}>{key.replace(/_/g, ' ')}</h4>
                  <p className={`whitespace-pre-wrap leading-7 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>{String(value || '').trim()}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </>
    );
  };

  const ComparisonPage = () => {
    const ids = JSON.parse(localStorage.getItem('compareReportIds') || '[]').map(Number);

    const comparedReports =
      selectedReportObjects.length === 2
        ? selectedReportObjects
        : reports.filter((report) => ids.includes(Number(report.id)));

    const ProgressBar = ({ value }) => (
      <div className="w-full bg-gray-200 rounded-full h-3 mt-2">
        <div
          className="bg-[#355872] h-3 rounded-full"
          style={{ width: `${Math.min(value || 0, 100)}%` }}
        />
      </div>
    );

    if (comparedReports.length < 2) {
      return (
        <>
          <Breadcrumbs items={['Dashboard', 'Comparison']} darkMode={darkMode} />
          <SectionTitle
            title="AI Report Comparison"
            subtitle="Compare two reports side by side with scores, KPIs, and AI insights"
            darkMode={darkMode}
          />
          <div className={`border rounded-2xl p-10 text-center ${panelBg} ${mutedText}`}>
            No valid comparison selected yet.
          </div>
        </>
      );
    }

    const [firstReport, secondReport] = comparedReports;

    const parseEmployees = (value) => {
      if (typeof value === 'number') return value;
      if (!value) return null;
      const text = String(value).trim();
      const rangeMatch = text.match(/(\d+)\s*-\s*(\d+)/);
      if (rangeMatch) {
        const min = Number(rangeMatch[1]);
        const max = Number(rangeMatch[2]);
        return Math.round((min + max) / 2);
      }
      const singleMatch = text.match(/(\d+)/);
      return singleMatch ? Number(singleMatch[1]) : null;
    };

    const getAverageQuality = (report) => {
      const values = [
        report.score ?? 0,
        report.kpis?.revenue ?? 0,
        report.kpis?.marketing ?? 0,
        report.kpis?.retention ?? 0,
      ];
      return values.reduce((sum, item) => sum + item, 0) / values.length;
    };

    const firstEmployees = parseEmployees(firstReport.project?.employees);
    const secondEmployees = parseEmployees(secondReport.project?.employees);

    const firstQuality = getAverageQuality(firstReport);
    const secondQuality = getAverageQuality(secondReport);

    const firstEfficiency = firstEmployees ? firstQuality / Math.sqrt(firstEmployees) : firstQuality;
    const secondEfficiency = secondEmployees ? secondQuality / Math.sqrt(secondEmployees) : secondQuality;

    const maxEfficiency = Math.max(firstEfficiency, secondEfficiency, 1);
    const firstEfficiencyNormalized = (firstEfficiency / maxEfficiency) * 100;
    const secondEfficiencyNormalized = (secondEfficiency / maxEfficiency) * 100;

    const firstFinalScore = (firstQuality * 0.7) + (firstEfficiencyNormalized * 0.3);
    const secondFinalScore = (secondQuality * 0.7) + (secondEfficiencyNormalized * 0.3);

    const metrics = [
      { label: 'Overall Score', key: 'score', first: firstReport.score ?? 0, second: secondReport.score ?? 0 },
      { label: 'Revenue', key: 'revenue', first: firstReport.kpis?.revenue || 0, second: secondReport.kpis?.revenue || 0 },
      { label: 'Marketing', key: 'marketing', first: firstReport.kpis?.marketing || 0, second: secondReport.kpis?.marketing || 0 },
      { label: 'Retention', key: 'retention', first: firstReport.kpis?.retention || 0, second: secondReport.kpis?.retention || 0 },
      { label: 'Team Size (employees)', key: 'employees', first: firstEmployees ?? 0, second: secondEmployees ?? 0 },
      { label: 'Efficiency', key: 'efficiency', first: Number(firstEfficiencyNormalized.toFixed(1)), second: Number(secondEfficiencyNormalized.toFixed(1)) },
      { label: 'Final Comparison Score', key: 'final', first: Number(firstFinalScore.toFixed(1)), second: Number(secondFinalScore.toFixed(1)) },
    ];

    const isTie = Math.abs(firstFinalScore - secondFinalScore) < 0.01;
    const winner = isTie ? null : (firstFinalScore > secondFinalScore ? firstReport : secondReport);

    const WinnerBadge = ({ isWinner }) =>
      isWinner ? (
        <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
          Best Performance
        </span>
      ) : (
        <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-500">
          Compared
        </span>
      );

    const MetricValue = ({ value, isBest }) => (
      <span
        className={`font-bold ${
          isBest ? 'text-green-600' : darkMode ? 'text-gray-300' : 'text-gray-700'
        }`}
      >
        {value}%
      </span>
    );

    return (
      <>
        <Breadcrumbs items={['Dashboard', 'Comparison']} darkMode={darkMode} />

        <SectionTitle
          title="AI Strategy Battle"
          subtitle="A smarter side-by-side comparison with winner detection and KPI insights"
          darkMode={darkMode}
        />

        <div className="border rounded-2xl p-6 mb-6 shadow-sm bg-gradient-to-r from-[#355872] to-[#7AAACE] text-white">
          <p className="text-sm opacity-90 mb-2">{isTie ? 'Comparison Result' : 'Best Overall Strategy'}</p>
          <h3 className="text-2xl font-bold">{isTie ? 'Tie' : winner.name}</h3>
          <p className="mt-2 text-white/90">
            {isTie
              ? 'Both reports are equal based on the selected strategy indicators.'
              : 'This report performs stronger across the selected strategy indicators.'}
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
          {comparedReports.map((report, index) => {
            const isWinner = !isTie && winner?.id === report.id;

            return (
              <div
                key={report.id}
                className={`border rounded-2xl p-6 shadow-sm ${panelBg} ${
                  isWinner ? 'ring-2 ring-green-400' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <p className={`text-sm mb-1 ${mutedText}`}>Report {index + 1}</p>
                    <h3 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {report.name}
                    </h3>
                  </div>

                  <WinnerBadge isWinner={isWinner} />
                </div>

                <div className={`space-y-2 mb-5 ${mutedText}`}>
                  <p><strong>Project:</strong> {report.project?.name || report.project || 'Project'}</p>
                  <p><strong>Type:</strong> {report.type}</p>
                  <p><strong>Date:</strong> {report.date}</p>
                </div>

                <div>
                  <div className="flex justify-between items-center">
                    <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                      Overall Score
                    </span>
                    <span className="font-bold">{report.score == null ? '-' : `${report.score}%`}</span>
                  </div>
                  <ProgressBar value={report.score} />
                </div>
              </div>
            );
          })}
        </div>

        <div className={`border rounded-2xl p-6 shadow-sm mb-6 ${panelBg}`}>
          <h3 className={`text-xl font-bold mb-5 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Metric Face-Off
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                  <th className="py-3 border-b">Metric</th>
                  <th className="py-3 border-b">{firstReport.name}</th>
                  <th className="py-3 border-b">{secondReport.name}</th>
                  <th className="py-3 border-b">Winner</th>
                </tr>
              </thead>

              <tbody>
                {metrics.map((metric) => {
                  const lowerIsBetter = metric.key === 'employees';
                  const firstBest = lowerIsBetter ? metric.first < metric.second : metric.first > metric.second;
                  const secondBest = lowerIsBetter ? metric.second < metric.first : metric.second > metric.first;
                  const metricWinner = firstBest ? firstReport : secondBest ? secondReport : null;

                  return (
                    <tr key={metric.key} className="border-b last:border-b-0">
                      <td className="py-4 font-semibold">{metric.label}</td>
                      <td className="py-4">
                        <MetricValue value={metric.first} isBest={firstBest} />
                      </td>
                      <td className="py-4">
                        <MetricValue value={metric.second} isBest={secondBest} />
                      </td>
                      <td className="py-4">
                        {metricWinner ? (
                          <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                            {metricWinner.name}
                          </span>
                        ) : (
                          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-500">
                            Tie
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className={`border rounded-2xl p-6 shadow-sm ${panelBg}`}>
          <h3 className={`text-xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            AI Recommendation
          </h3>
          <p className={mutedText}>
            {isTie
              ? 'Both reports are equally strong. Combine insights from both for the final strategy.'
              : (
                <>
                  Based on the current comparison, use <strong>{winner.name}</strong> as the stronger base
                  strategy, then improve the weaker areas using insights from the second report.
                </>
              )}
          </p>
        </div>
      </>
    );
  };

  return (
    <div className={`min-h-screen ${pageBg} ${pageText} transition-colors duration-300`}>
      <Toast toast={toast} onClose={() => setToast(null)} darkMode={darkMode} />
      <DashboardLayout darkMode={darkMode} mutedText={mutedText} showProfileMenu={showProfileMenu} setShowProfileMenu={setShowProfileMenu} setShowToast={setToast} navigate={navigate} NavButton={NavButton}>
        <Routes>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage userName={user?.name || user?.email || 'there'} darkMode={darkMode} showNotifications={showNotifications} setShowNotifications={setShowNotifications} unreadNotifications={unreadNotifications} notifications={notifications} mutedText={mutedText} markAllNotificationsRead={markAllNotificationsRead} navigate={navigate} stats={[{ title: 'CREDIT BALANCE', value: Number(user?.credit_balance ?? 0), sub: 'Current balance', icon: 'CR', subColor: 'text-green-600' }, { title: 'TOTAL REPORTS', value: reports.length, sub: '+3 this week', icon: 'RP', subColor: 'text-green-600' }, { title: 'AVERAGE SCORE', value: averageScore == null ? '-' : `${averageScore}%`, sub: averageScore == null ? 'No scored reports yet' : `Based on ${reports.filter((r) => Number.isFinite(Number(r.score)) && Number(r.score) > 0).length} reports`, icon: 'SC', subColor: 'text-green-600' }, { title: 'TOTAL DOWNLOADS', value: totalDownloads, sub: 'PDF exports', icon: 'DL', subColor: 'text-gray-500' }]} panelBg={panelBg} topProject={topProject} weakestReport={weakestReport} totalActiveProjects={totalActiveProjects} dashboardChartData={[{ label: 'Jan', value: 68 }, { label: 'Feb', value: 74 }, { label: 'Mar', value: 81 }, { label: 'Apr', value: 89 }]} reportTypeChart={[{ label: 'Growth', value: 89 }, { label: 'Pricing', value: 84 }, { label: 'Marketing', value: 91 }]} recentlyViewed={recentlyViewed} reports={reports} setSelectedReport={setSelectedReport} addRecentItem={addRecentItem} activities={[]} />} />
          <Route path="projects" element={<Navigate to="/dashboard/projects" replace />} />
          <Route path="project-details" element={<ProjectDetailsPage />} />
          <Route path="report-details" element={<ReportDetailsPage />} />
          <Route path="history" element={<ReportHistoryPage darkMode={darkMode} showNotifications={showNotifications} setShowNotifications={setShowNotifications} unreadNotifications={unreadNotifications} notifications={notifications} mutedText={mutedText} markAllNotificationsRead={markAllNotificationsRead} panelBg={panelBg} projects={projects} reportSearch={reportSearch} setReportSearch={setReportSearch} reportSort={reportSort} setReportSort={setReportSort} projectFilter={projectFilter} setProjectFilter={setProjectFilter} typeFilter={typeFilter} setTypeFilter={setTypeFilter} dateFilter={dateFilter} setDateFilter={setDateFilter} clearReportFilters={clearReportFilters} selectedReports={selectedReports} toggleReportSelection={toggleReportSelection} canCompare={canCompare} addNotification={addNotification} navigate={navigate} setSelectedReport={setSelectedReport} addRecentItem={addRecentItem} getReportStatus={getReportStatus} />} />
          <Route path="comparison" element={<ComparisonPage />} />
          <Route path="settings" element={<SettingsPage TopActionBar={TopActionBar} darkMode={darkMode} setDarkMode={setDarkMode} panelBg={panelBg} mutedText={mutedText} showToast={showToast} addNotification={addNotification} fakeDownload={(title) => showToast('success', 'Export started', `${title} export is ready.`)} />} />
        </Routes>
      </DashboardLayout>
    </div>
  );
}

export default Feature5Root;
