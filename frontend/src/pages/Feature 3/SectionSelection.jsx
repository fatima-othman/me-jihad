import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { buildReportViewPath } from '../../config/routes'
import api from '../../services/api'
import { storage } from '../../utils/storage'

const sections = [
  { id: 'swot', name: 'SWOT Analysis', description: 'Strengths, weaknesses, opportunities & threats', cost: 5, icon: '?', tag: 'Foundation' },
  { id: 'pricing', name: 'Pricing Strategy', description: 'Best pricing model for your business', cost: 5, icon: '?', tag: 'Revenue' },
  { id: 'risk', name: 'Risk Analysis', description: 'Potential risks and mitigation plans', cost: 5, icon: '?', tag: 'Safety' },
  { id: 'kpi', name: 'KPI Recommendations', description: 'Key metrics to measure your success', cost: 10, icon: '?', tag: 'Metrics' },
  { id: 'marketing', name: 'Marketing Plan', description: 'A complete go-to-market strategy', cost: 20, icon: '?', tag: 'Growth' },
  { id: 'growth', name: 'Growth Roadmap', description: 'Clear expansion plan for the future', cost: 20, icon: '?', tag: 'Scale' },
]

const BUNDLE_COST = 50
const FULL_PRICE = sections.reduce((sum, section) => sum + section.cost, 0)

const TAG_COLORS = {
  Foundation: { bg: 'rgba(156,213,255,0.2)', text: '#355872' },
  Revenue: { bg: 'rgba(156,213,255,0.2)', text: '#355872' },
  Safety: { bg: 'rgba(122,170,206,0.15)', text: '#355872' },
  Metrics: { bg: 'rgba(53,88,114,0.12)', text: '#355872' },
  Growth: { bg: 'rgba(53,88,114,0.15)', text: '#355872' },
  Scale: { bg: 'rgba(53,88,114,0.2)', text: '#355872' },
}

export default function SectionSelection() {
  const { id } = useParams()
  const navigate = useNavigate()
  const projectId = Number(id)
  const [selected, setSelected] = useState([])
  const [isBundle, setIsBundle] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [creditBalance, setCreditBalance] = useState(Number(storage.getUser()?.credit_balance || 0))

  function toggleSection(sectionId) {
    if (isBundle) return

    setSelected((prev) =>
      prev.includes(sectionId)
        ? prev.filter((value) => value !== sectionId)
        : [...prev, sectionId],
    )
  }

  function toggleBundle() {
    setIsBundle((prev) => !prev)
    setSelected([])
  }

  const total = isBundle
    ? BUNDLE_COST
    : selected.reduce((sum, sectionId) => sum + (sections.find((section) => section.id === sectionId)?.cost || 0), 0)

  const canGenerate = (isBundle || selected.length > 0) && total <= creditBalance
  const remaining = creditBalance - total

  async function handleGenerate() {
    try {
      setLoading(true)
      setError('')

      if (!Number.isInteger(projectId)) {
        throw new Error('Invalid project id. Please go back and choose the project again.')
      }

      const { data } = await api.post('/reports/generate', {
        project_id: projectId,
        selected_sections: isBundle ? ['bundle'] : selected,
      })

      const report = data?.report || data

      if (!report?.id) {
        throw new Error('Report response did not include an id')
      }

      if (typeof data?.credit_balance !== 'undefined') {
        const newBalance = Number(data.credit_balance)
        setCreditBalance(newBalance)

        const existingUser = storage.getUser()
        if (existingUser) {
          storage.setUser({ ...existingUser, credit_balance: newBalance })
        }
      }

      navigate(buildReportViewPath(report.id))
    } catch (requestError) {
      setError(requestError?.response?.data?.message || requestError.message || 'Report was not generated')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif", background: '#F7F8F0', minHeight: '100vh' }} className="px-6 py-10">
      <div className="max-w-3xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <p style={{ color: '#7AAACE' }} className="text-xs font-bold uppercase tracking-widest mb-2">Report Builder</p>
            <h1 className="text-3xl font-black text-gray-900">Choose Report Sections</h1>
            <p className="text-gray-500 text-sm mt-1">Select what you want in your strategy report</p>
          </div>

          <div style={{ background: 'white', border: '1px solid rgba(122,170,206,0.3)' }} className="flex items-center gap-3 px-4 py-2.5 rounded-xl shadow-sm self-start sm:self-auto">
            <div style={{ background: 'rgba(156,213,255,0.3)' }} className="w-8 h-8 rounded-lg flex items-center justify-center">
              <span style={{ color: '#355872' }} className="text-xs font-black">CR</span>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium leading-none mb-0.5">Balance</p>
              <p style={{ color: '#355872' }} className="font-black text-lg leading-none">{creditBalance}</p>
            </div>
          </div>
        </div>

        <div onClick={toggleBundle} style={isBundle ? { background: 'linear-gradient(135deg, #355872, #7AAACE)', border: '2px solid #355872', cursor: 'pointer' } : { background: 'white', border: '2px solid rgba(122,170,206,0.3)', cursor: 'pointer' }} className="mb-5 p-5 rounded-2xl transition-all shadow-sm hover:shadow-md">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div style={isBundle ? { background: 'rgba(255,255,255,0.25)', border: '2px solid rgba(255,255,255,0.5)' } : { background: '#F7F8F0', border: '2px solid rgba(122,170,206,0.4)' }} className="w-10 h-10 rounded-full flex items-center justify-center text-lg">
                {isBundle ? '?' : '?'}
              </div>
              <div>
                <p className={`font-black text-base ${isBundle ? 'text-white' : 'text-gray-900'}`}>Complete Bundle</p>
                <p className={`text-sm mt-0.5 ${isBundle ? 'text-white/70' : 'text-gray-500'}`}>All 6 sections - save {FULL_PRICE - BUNDLE_COST} credits</p>
              </div>
            </div>
            <div className="text-right">
              <p className={`font-black text-2xl ${isBundle ? 'text-white' : 'text-[#355872]'}`}>{BUNDLE_COST} cr</p>
              <p className={`text-xs line-through ${isBundle ? 'text-white/50' : 'text-gray-400'}`}>{FULL_PRICE} cr</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 mb-5">
          <div style={{ background: 'rgba(122,170,206,0.25)' }} className="flex-1 h-px" />
          <span className="text-xs text-gray-400 font-semibold">or choose individually</span>
          <div style={{ background: 'rgba(122,170,206,0.25)' }} className="flex-1 h-px" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
          {sections.map((section) => {
            const isSelected = isBundle || selected.includes(section.id)
            const tagColor = TAG_COLORS[section.tag] || TAG_COLORS.Foundation

            return (
              <div key={section.id} onClick={() => toggleSection(section.id)} style={isBundle ? { background: 'rgba(53,88,114,0.06)', border: '2px solid rgba(53,88,114,0.2)', cursor: 'default', opacity: 0.75 } : isSelected ? { background: 'white', border: '2px solid #355872', cursor: 'pointer', boxShadow: '0 4px 16px rgba(53,88,114,0.12)' } : { background: 'white', border: '2px solid rgba(122,170,206,0.2)', cursor: 'pointer' }} className="p-5 rounded-2xl transition-all hover:shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <span style={{ fontSize: '1.25rem', color: isSelected ? '#355872' : '#9CD5FF', transition: 'color 0.15s' }}>{section.icon}</span>
                  <div className="flex items-center gap-2">
                    <span style={tagColor} className="text-xs font-bold px-2 py-0.5 rounded-full">{section.tag}</span>
                    <span style={{ color: isSelected ? '#355872' : '#7AAACE' }} className="text-sm font-black">{section.cost} cr</span>
                  </div>
                </div>

                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{section.name}</p>
                    <p className="text-gray-500 text-xs mt-1 leading-relaxed">{section.description}</p>
                  </div>
                  {isSelected && !isBundle ? (
                    <div style={{ background: '#355872' }} className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                        <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  ) : null}
                </div>
              </div>
            )
          })}
        </div>

        {error ? (
          <div style={{ background: '#fff5f5', border: '1px solid #fecaca', color: '#b91c1c' }} className="rounded-2xl p-4 mb-4 text-sm font-semibold">
            {error}
          </div>
        ) : null}

        <div style={{ background: 'white', border: '1px solid rgba(122,170,206,0.25)' }} className="rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-wide mb-1">Total Cost</p>
            <div className="flex items-baseline gap-2">
              <span style={{ color: '#355872' }} className="text-4xl font-black">{total}</span>
              <span className="text-gray-400 text-sm font-semibold">credits</span>
            </div>

            {total > creditBalance ? <p className="text-red-500 text-xs font-semibold mt-1">Insufficient balance</p> : null}
            {total > 0 && total <= creditBalance ? <p className="text-gray-400 text-xs mt-1 font-medium">{remaining} credits remaining after generation</p> : null}
            {total === 0 ? <p className="text-gray-400 text-xs mt-1">Select at least one section</p> : null}
          </div>

          <div className="flex flex-col items-stretch sm:items-end gap-2 w-full sm:w-auto">
            <button onClick={handleGenerate} disabled={!canGenerate || loading} style={canGenerate ? { background: 'linear-gradient(135deg, #355872, #7AAACE)' } : {}} className="disabled:opacity-40 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold px-8 py-3.5 rounded-xl transition text-sm shadow-md hover:opacity-90">
              {loading ? 'Generating...' : 'Generate Report ->'}
            </button>

            {selected.length > 0 && !isBundle ? <p style={{ color: '#7AAACE' }} className="text-xs font-semibold text-center sm:text-right">{selected.length} section{selected.length !== 1 ? 's' : ''} selected</p> : null}
          </div>
        </div>
      </div>
    </div>
  )
}
