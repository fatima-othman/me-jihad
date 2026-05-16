import { ChevronUp, ChevronDown } from 'lucide-react'

/**
 * DataTable Component
 * Reusable table with sorting, pagination, and professional styling
 */
export function DataTable({
  title,
  subtitle,
  columns,
  data,
  loading = false,
  sortConfig = null,
  onSort = null,
  currentPage = 1,
  totalPages = 1,
  onPageChange = null,
  renderRow = null,
}) {
  return (
    <div className="rounded-[20px] border border-[#9CD5FF] bg-[#F7F8F0] shadow-[0_8px_24px_rgba(53,88,114,0.08)] overflow-hidden">
      {/* Header */}
      {(title || subtitle) && (
        <div className="border-b border-[#9CD5FF] px-6 py-5 bg-[#F7F8F0]">
          <div className="flex items-center justify-between">
            <div>
              {title && (
                <h2 className="text-[22px] font-bold leading-none text-[#355872]">{title}</h2>
              )}
              {subtitle && (
                <p className="mt-2 text-[13px] text-[#7AAACE]">{subtitle}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[#F7F8F0]">
            <tr className="border-b border-[#9CD5FF] text-left text-[11px] uppercase tracking-[0.1em] text-[#355872]">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-6 py-4 font-semibold ${column.sortable ? 'cursor-pointer hover:text-[#355872]' : ''}`}
                  onClick={() => column.sortable && onSort?.(column.key)}
                >
                  <div className="flex items-center gap-1">
                    {column.label}
                    {column.sortable && sortConfig?.key === column.key && (
                      sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center">
                  <div className="flex justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#9CD5FF] border-t-[#355872]"></div>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center text-sm text-[#355872]">
                  No data found
                </td>
              </tr>
            ) : (
              data.map((row, idx) => (
                <tr
                  key={row.id}
                  className={`border-b border-[#9CD5FF] hover:bg-[#F7F8F0] transition-colors ${idx % 2 === 0 ? 'bg-[#F7F8F0]' : 'bg-[#F7F8F0]'}`}
                >
                  {renderRow ? renderRow(row, idx) : (
                    columns.map((column) => (
                      <td key={column.key} className="px-6 py-4">
                        {column.render ? column.render(row[column.key], row) : row[column.key]}
                      </td>
                    ))
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="border-t border-[#9CD5FF] px-6 py-4 flex items-center justify-between bg-[#F7F8F0]">
          <p className="text-[12px] text-[#355872]">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange?.(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-[#9CD5FF] hover:bg-[#F7F8F0] disabled:opacity-40 transition-colors"
            >
              <ChevronUp size={16} className="text-[#355872]" />
            </button>
            <button
              onClick={() => onPageChange?.(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-[#9CD5FF] hover:bg-[#F7F8F0] disabled:opacity-40 transition-colors"
            >
              <ChevronDown size={16} className="text-[#355872]" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default DataTable
