const ComparisonCard = ({ title, value, darkMode = false, highlight = false }) => (
  <div
    className={`rounded-2xl border p-5 shadow-sm transition ${
      highlight ? "ring-2 ring-[#355872] scale-[1.01]" : ""
    } ${darkMode ? "bg-[#111827] border-gray-700" : "bg-white border-gray-200"}`}
  >
    <p className={`text-sm mb-2 ${darkMode ? "text-gray-300" : "text-gray-500"}`}>
      {title}
    </p>

    <p className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
      {value}%
    </p>

    <div className={`mt-3 h-3 w-full rounded-full overflow-hidden ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}>
      <div className="h-full bg-[#355872] rounded-full" style={{ width: `${value}%` }} />
    </div>

    {highlight && <p className="text-xs mt-3 text-[#355872] font-semibold">Top result</p>}
  </div>
);

export default ComparisonCard;