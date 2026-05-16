import { useEffect, useState } from "react";
import api from "../../services/api";

import TopActionBar from "../../components/TopActionBar";
import Breadcrumbs from "../../components/Breadcrumbs";
import SectionTitle from "../../components/SectionTitle";
import SearchHighlight from "../../components/SearchHighlight";
import StatusBadge from "../../components/StatusBadge";

function ReportHistoryPage({
  darkMode,
  showNotifications,
  setShowNotifications,
  unreadNotifications,
  notifications,
  mutedText,
  markAllNotificationsRead,
  canCompare,
  addNotification,
  navigate,
  panelBg,
  reportSearch,
  setReportSearch,
  reportSort,
  setReportSort,
  clearReportFilters,
  projectFilter,
  setProjectFilter,
  projects,
  typeFilter,
  setTypeFilter,
  dateFilter,
  setDateFilter,
  getReportStatus,
  setSelectedReport,
  addRecentItem,
  selectedReports,
  toggleReportSelection,
}) {

  const [reports, setReports] = useState([]);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await api.get('/reports');

      setReports(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  const sortedFilteredReports = reports
    .filter((report) => {
      const matchesSearch =
        report.name
          .toLowerCase()
          .includes(reportSearch.toLowerCase()) ||
        report.project?.name
          ?.toLowerCase()
          .includes(reportSearch.toLowerCase());

      const matchesProject =
        projectFilter === "all" ||
        report.project_id == projectFilter;

      const matchesType =
        typeFilter === "all" ||
        report.type === typeFilter;

      const matchesDate =
        dateFilter === "" ||
        report.date === dateFilter;

      return (
        matchesSearch &&
        matchesProject &&
        matchesType &&
        matchesDate
      );
    })
    .sort((a, b) => {
      switch (reportSort) {
        case "score-desc":
          return b.score - a.score;

        case "score-asc":
          return a.score - b.score;

        case "name-asc":
          return a.name.localeCompare(b.name);

        case "name-desc":
          return b.name.localeCompare(a.name);

        default:
          return b.id - a.id;
      }
    });

  return (
    <>
      <TopActionBar
        darkMode={darkMode}
        showNotifications={showNotifications}
        setShowNotifications={setShowNotifications}
        unreadNotifications={unreadNotifications}
        notifications={notifications}
        mutedText={mutedText}
        markAllNotificationsRead={markAllNotificationsRead}
      />

      <Breadcrumbs
        items={["Dashboard", "Report History"]}
        darkMode={darkMode}
      />

      <SectionTitle
        title="Report History"
        subtitle="Browse reports, apply filters, open reports, or compare two reports from the same project"
        darkMode={darkMode}
        action={
          <button
            disabled={!canCompare}
            onClick={() => {
              if (canCompare) {
                addNotification(
                  "Comparison completed",
                  "Two reports are ready in the comparison view."
                );

                navigate("/comparison");
              }
            }}
            className={`px-5 py-3 rounded-xl text-white transition ${
              canCompare
                ? "bg-[#355872] hover:bg-[#7AAACE]"
                : "bg-gray-300 cursor-not-allowed"
            }`}
          >
            Compare Selected
          </button>
        }
      />

      <div className={`border rounded-2xl p-4 mb-6 shadow-sm ${panelBg}`}>
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">

          <div className="xl:col-span-2 relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">
              🔍
            </span>

            <input
              type="text"
              placeholder="Search reports by name or project..."
              value={reportSearch}
              onChange={(e) =>
                setReportSearch(e.target.value)
              }
              className={`w-full rounded-xl border pl-12 pr-4 py-3 outline-none transition focus:border-[#355872] focus:ring-2 focus:ring-[#355872] ${
                darkMode
                  ? "bg-[#0F172A] border-gray-700 text-white placeholder:text-gray-400"
                  : "bg-white border-gray-200 text-gray-900"
              }`}
            />
          </div>

          <select
            value={reportSort}
            onChange={(e) =>
              setReportSort(e.target.value)
            }
            className={`w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-[#355872] ${
              darkMode
                ? "bg-[#0F172A] border-gray-700 text-white"
                : "bg-white border-gray-200 text-gray-900"
            }`}
          >
            <option value="date-desc">Sort: Newest</option>
            <option value="score-desc">
              Sort: Score High-Low
            </option>
            <option value="score-asc">
              Sort: Score Low-High
            </option>
          </select>

          <button
            onClick={clearReportFilters}
            className={`rounded-xl border px-4 py-3 transition ${
              darkMode
                ? "border-gray-600 text-gray-100 hover:bg-gray-800"
                : "border-gray-200 text-gray-700 hover:bg-gray-50"
            }`}
          >
            Reset Filters
          </button>

          <div
            className={`rounded-xl px-4 py-3 text-sm flex items-center justify-center ${
              darkMode
                ? "bg-[#0F172A] text-gray-200"
                : "bg-gray-50 text-gray-600"
            }`}
          >
            {sortedFilteredReports.length} reports found
          </div>
        </div>
      </div>

      <div
        className={`border rounded-2xl shadow-sm overflow-hidden ${panelBg}`}
      >

        <div
          className={`grid grid-cols-9 gap-4 px-6 py-4 border-b text-sm font-semibold ${
            darkMode
              ? "border-gray-700 text-gray-300 bg-[#0F172A]"
              : "border-gray-200 text-gray-500 bg-[#F7F8F0]"
          }`}
        >
          <div className="col-span-2">
            Report Name
          </div>

          <div>Project</div>
          <div>Type</div>
          <div>Date</div>
          <div>Sections</div>
          <div>Status</div>
          <div>Open</div>
          <div className="text-center">
            Compare
          </div>
        </div>

        {sortedFilteredReports.map((report) => {

          const status = getReportStatus(
            report.score
          );

          return (
            <div
              key={report.id}
              className={`grid grid-cols-9 gap-4 px-6 py-4 border-b last:border-b-0 items-center text-sm ${
                darkMode
                  ? "border-gray-700"
                  : "border-gray-100"
              }`}
            >

              <div
                className={`col-span-2 font-medium ${
                  darkMode
                    ? "text-white"
                    : "text-gray-800"
                }`}
              >
                <SearchHighlight
                  text={report.name}
                  query={reportSearch}
                  darkMode={darkMode}
                />
              </div>

              <div className={mutedText}>
                {report.project?.name}
              </div>

              <div className={mutedText}>
                {report.type}
              </div>

              <div className={mutedText}>
                {report.date}
              </div>

              <div className={mutedText}>
                {report.sections}
              </div>

              <div>
                <StatusBadge
                  label={status.label}
                  darkMode={darkMode}
                  variant={status.variant}
                />
              </div>

              <div>
                <button
                  onClick={() => {
                    setSelectedReport(report);

                    addRecentItem({
                      type: "report",
                      title: report.name,
                      subtitle: `${report.project?.name} • ${report.type}`,
                    });

                    navigate(`/reports/${report.id}/view`);
                  }}
                  className={`px-3 py-2 rounded-lg border text-sm transition ${
                    darkMode
                      ? "border-gray-600 text-gray-100 hover:bg-gray-800"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  Open
                </button>
              </div>

              <div className="text-center">
                <input
                  type="checkbox"
                  checked={selectedReports.includes(
                    report.id
                  )}
                  onChange={() =>
                    toggleReportSelection(
                      report.id,
                      report.project_id
                    )
                  }
                  className="h-4 w-4 accent-[#355872]"
                />
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

export default ReportHistoryPage;
