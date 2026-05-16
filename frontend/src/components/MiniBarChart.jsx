const COLORS = ['#355872', '#7AAACE', '#9CD5FF', '#B7C7D7'];

const MiniBarChart = ({ title, data = [], darkMode = false }) => {
  const cardBg = darkMode
    ? 'bg-[#111827] border-gray-700'
    : 'bg-white border-gray-200';

  const textMain = darkMode ? 'text-white' : 'text-gray-900';
  const textSub = darkMode ? 'text-gray-300' : 'text-gray-500';
  const total = data.reduce((sum, item) => sum + Number(item.value || 0), 0);

  return (
    <div className={`rounded-2xl border p-6 shadow-sm ${cardBg}`}>
      <div className="flex items-start justify-between mb-5">
        <div>
          <h3 className={`text-lg font-semibold ${textMain}`}>{title}</h3>
          <p className={`text-sm mt-1 ${textSub}`}>
            Visual performance overview
          </p>
        </div>

        <span className="px-3 py-1 rounded-full bg-[#9CD5FF] text-[#355872] text-xs font-semibold">
          Chart
        </span>
      </div>

      <div className="h-[190px] mb-6 flex items-end gap-3 border-b border-gray-200 pb-3">
        {data.map((item, index) => (
          <div key={item.label || index} className="flex-1 flex flex-col items-center gap-2">
            <div className="w-full h-[150px] flex items-end">
              <div
                className="w-full rounded-t-xl transition-all"
                style={{
                  height: `${Math.max(8, Math.min(100, Number(item.value || 0)))}%`,
                  backgroundColor: COLORS[index % COLORS.length],
                }}
                title={`${item.label}: ${item.value}%`}
              />
            </div>
            <span className={`text-xs ${textSub}`}>{item.label}</span>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        {data.map((item, index) => (
          <div key={item.label || index} className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span className={`text-sm ${textSub}`}>{item.label}</span>
            </div>

            <span className={`text-sm font-semibold ${textMain}`}>
              {item.value}%
            </span>
          </div>
        ))}

        <div
          className={`pt-3 border-t text-sm ${
            darkMode ? 'border-gray-700 text-gray-300' : 'border-gray-100 text-gray-500'
          }`}
        >
          Total indicators: <span className={textMain}>{total}</span>
        </div>
      </div>
    </div>
  );
};

export default MiniBarChart;
