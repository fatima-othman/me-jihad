import { Filter, ChevronDown, X, Search } from 'lucide-react'
import { useState } from 'react'

/**
 * FilterPanel Component
 * Reusable collapsible filter panel for reports and data
 */
export function FilterPanel({
  filters = {},
  onFiltersChange = null,
  onResetFilters = null,
  hasActiveFilters = false,
  filterOptions = {
    types: [],
    languages: [],
  },
}) {
  const [showPanel, setShowPanel] = useState(false)

  const activeFilterCount = Object.values(filters).filter(
    (v) => v && v !== 'All Types' && v !== 'All Languages' && v !== ''
  ).length

  return (
    <div className="rounded-[20px] border border-[#9CD5FF] bg-[#F7F8F0] p-5 shadow-[0_8px_24px_rgba(53,88,114,0.08)]">
      <button
        onClick={() => setShowPanel(!showPanel)}
        className="flex w-full items-center justify-between text-left"
      >
        <div className="flex items-center gap-3">
          <Filter size={18} className="text-[#355872]" />
          <div>
            <h3 className="text-[16px] font-bold text-[#355872]">Filters</h3>
            <p className="text-[12px] text-[#7AAACE]">
              {activeFilterCount > 0 ? `${activeFilterCount} active filters` : 'No active filters'}
            </p>
          </div>
        </div>
        <div className={`transition-transform ${showPanel ? 'rotate-180' : ''}`}>
          <ChevronDown size={20} className="text-[#355872]" />
        </div>
      </button>

      {showPanel && (
        <div className="mt-5 space-y-4 border-t border-[#9CD5FF] pt-5">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7AAACE]" size={16} />
            <input
              type="text"
              placeholder="Search by project, business, report, or user..."
              value={filters.search || ''}
              onChange={(e) => onFiltersChange?.({ ...filters, search: e.target.value })}
              className="w-full h-11 rounded-2xl border border-[#9CD5FF] bg-[#F7F8F0] pl-11 pr-4 text-sm text-[#355872] outline-none placeholder:text-[#7AAACE] focus:border-[#7AAACE] transition-colors"
            />
          </div>

          {/* Filter Controls */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {/* Type Filter */}
            <select
              value={filters.type || 'All Types'}
              onChange={(e) => onFiltersChange?.({ ...filters, type: e.target.value })}
              className="h-11 rounded-xl border border-[#9CD5FF] bg-[#F7F8F0] px-4 text-sm text-[#355872] outline-none focus:border-[#7AAACE] transition-colors"
            >
              {filterOptions.types?.map((type) => (
                <option key={type}>{type}</option>
              ))}
            </select>

            {/* Language Filter */}
            <select
              value={filters.language || 'All Languages'}
              onChange={(e) => onFiltersChange?.({ ...filters, language: e.target.value })}
              className="h-11 rounded-xl border border-[#9CD5FF] bg-[#F7F8F0] px-4 text-sm text-[#355872] outline-none focus:border-[#7AAACE] transition-colors"
            >
              {filterOptions.languages?.map((lang) => (
                <option key={lang}>{lang}</option>
              ))}
            </select>

            {/* Date From */}
            <input
              type="date"
              value={filters.from || ''}
              onChange={(e) => onFiltersChange?.({ ...filters, from: e.target.value })}
              className="h-11 rounded-xl border border-[#9CD5FF] bg-[#F7F8F0] px-4 text-sm text-[#355872] outline-none focus:border-[#7AAACE] transition-colors"
              placeholder="From date"
            />

            {/* Date To */}
            <input
              type="date"
              value={filters.to || ''}
              onChange={(e) => onFiltersChange?.({ ...filters, to: e.target.value })}
              className="h-11 rounded-xl border border-[#9CD5FF] bg-[#F7F8F0] px-4 text-sm text-[#355872] outline-none focus:border-[#7AAACE] transition-colors"
              placeholder="To date"
            />

            {/* Clear Button */}
            <button
              onClick={onResetFilters}
              disabled={!hasActiveFilters}
              className="h-11 rounded-xl border border-[#9CD5FF] bg-[#F7F8F0] px-4 text-sm font-medium text-[#355872] hover:bg-[#F7F8F0] disabled:opacity-40 transition-colors flex items-center justify-center gap-2"
            >
              <X size={16} />
              Clear All
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default FilterPanel
