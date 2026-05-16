/**
 * StatCard Component
 * Reusable card for displaying statistics with icon, title, value, and subtitle
 */
export function StatCard({ title, value, subtitle, icon: Icon, color = '#355872', bgColor = '#F7F8F0', trend = null }) {
  return (
    <div className="group rounded-[20px] border border-[#9CD5FF] bg-[#F7F8F0] p-5 shadow-[0_8px_24px_rgba(53,88,114,0.08)] hover:shadow-[0_12px_32px_rgba(53,88,114,0.12)] transition-all hover:border-[#9CD5FF]">
      <div className="mb-4 flex items-start justify-between">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F7F8F0] text-[#7AAACE] group-hover:bg-[#9CD5FF] transition-colors" style={{ backgroundColor: bgColor, color }}>
          <Icon size={18} />
        </div>
        {trend && (
          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
            trend > 0 ? 'bg-[#9CD5FF] text-[#355872]' : 'bg-[#9CD5FF] text-[#355872]'
          }`}>
            {trend > 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>

      <h3 className="text-[26px] font-bold leading-none text-[#355872]">
        {value}
      </h3>
      <p className="mt-3 text-[14px] font-medium text-[#355872]">{title}</p>
      <p className="mt-1 text-[12px] text-[#7AAACE]">{subtitle}</p>
    </div>
  )
}

export default StatCard
