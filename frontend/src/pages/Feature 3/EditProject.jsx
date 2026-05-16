import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../../services/api'

const businessTypes = [
  { label: 'Restaurant / Café', icon: '🍽' },
  { label: 'SaaS / App',        icon: '⚡' },
  { label: 'E-commerce',        icon: '🛍' },
  { label: 'Retail Store',      icon: '🏪' },
  { label: 'Professional Services', icon: '💼' },
  { label: 'Other',             icon: '📦' },
]

const stages         = ['Idea', 'Launch', 'Growth', 'Expansion']
const employeeOpts   = ['1', '2–5', '6–20', '21–50', '50+']
const budgetOpts     = ['Under $500', '$500–$2,000', '$2,000–$10,000', 'Over $10,000']
const languageOpts   = ['العربية', 'English']

function ChipSet({ options, value, onChange, renderLabel }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(opt => {
        const isStr   = typeof opt === 'string'
        const key     = isStr ? opt : opt.label
        const display = renderLabel ? renderLabel(opt) : key
        const active  = value === key
        return (
          <button
            key={key}
            onClick={() => onChange(key)}
            style={
              active
                ? { background: '#355872', color: 'white', border: '2px solid #355872' }
                : { background: '#F7F8F0', color: '#355872', border: '2px solid rgba(122,170,206,0.25)' }
            }
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:border-[#355872]"
          >
            {display}
          </button>
        )
      })}
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div
      style={{ background: 'white', border: '1px solid rgba(122,170,206,0.2)' }}
      className="rounded-2xl p-6 shadow-sm"
    >
      <h2 className="font-black text-gray-900 text-base mb-5 pb-4"
        style={{ borderBottom: '1px solid rgba(122,170,206,0.15)' }}
      >
        {title}
      </h2>
      <div className="flex flex-col gap-5">
        {children}
      </div>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-sm font-bold text-gray-700 mb-2">{label}</label>
      {children}
    </div>
  )
}

export default function EditProject() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [name, setName]             = useState('')
  const [businessType, setBusiness] = useState('')
  const [description, setDesc]      = useState('')
  const [stage, setStage]           = useState('')
  const [employees, setEmployees]   = useState('')
  const [budget, setBudget]         = useState('')
  const [market, setMarket]         = useState('')
  const [competitors, setComp]      = useState('')
  const [language, setLanguage]     = useState('')
  const [saving, setSaving]         = useState(false)
  const [loading, setLoading]       = useState(true)

  useEffect(() => {
    api.get(`/projects/${id}`)
      .then((response) => {
        const d = response?.data || {}
        setName(d.name || '')
        setBusiness(d.business_type || '')
        setDesc(d.description || '')
        setStage(d.stage || '')
        setEmployees(d.employees || '')
        setBudget(d.budget || '')
        setMarket(d.market || '')
        setComp(d.competitors || '')
        setLanguage(d.language || '')
        setLoading(false)
      })
      .catch(err => { console.error(err); setLoading(false) })
  }, [id])

  async function handleSave() {
    setSaving(true)
    try {
      await api.put(`/projects/${id}`, {
        name, business_type: businessType, description,
        stage, employees, budget, market, competitors, language,
      })
      navigate('/projects')
    } catch (e) {
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  const inputStyle = {
    border: '2px solid rgba(122,170,206,0.3)',
    background: '#F7F8F0',
  }
  const inputClass = "w-full rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#355872] transition text-sm font-medium"

  if (loading) {
    return (
      <div style={{ fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif", background: '#F7F8F0', minHeight: '100vh' }}
        className="px-6 py-10 max-w-2xl mx-auto"
      >
        <div className="animate-pulse space-y-4">
          <div style={{ background: 'rgba(122,170,206,0.2)' }} className="h-10 w-48 rounded-xl" />
          <div style={{ background: 'rgba(122,170,206,0.15)' }} className="h-64 rounded-2xl" />
          <div style={{ background: 'rgba(122,170,206,0.15)' }} className="h-80 rounded-2xl" />
        </div>
      </div>
    )
  }

  return (
    <div
      style={{ fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif", background: '#F7F8F0', minHeight: '100vh' }}
      className="px-6 py-10"
    >
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <button
          onClick={() => navigate('/projects')}
          style={{ color: '#7AAACE' }}
          className="text-sm font-semibold mb-6 flex items-center gap-1 hover:opacity-70 transition"
        >
          ← Back to Projects
        </button>

        <div className="flex items-start justify-between mb-8">
          <div>
            <p style={{ color: '#7AAACE' }} className="text-xs font-bold uppercase tracking-widest mb-1">
              Editing
            </p>
            <h1 className="text-3xl font-black text-gray-900">{name || 'Project'}</h1>
          </div>
        </div>

        <div className="flex flex-col gap-5">

          {/* Basic Info */}
          <Section title="Basic Information">

            <Field label="Project Name">
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                style={{ ...inputStyle, border: '2px solid ' + (name ? '#355872' : 'rgba(122,170,206,0.3)') }}
                className={inputClass}
              />
            </Field>

            <Field label="Business Type">
              <ChipSet
                options={businessTypes}
                value={businessType}
                onChange={setBusiness}
                renderLabel={opt => (
                  <span className="flex items-center gap-2">
                    <span className="text-base leading-none">{opt.icon}</span>
                    <span>{opt.label}</span>
                  </span>
                )}
              />
            </Field>

            <Field label="Description">
              <textarea
                value={description}
                onChange={e => setDesc(e.target.value)}
                rows={3}
                style={inputStyle}
                className={inputClass + ' resize-none'}
                placeholder="Briefly describe your business..."
              />
            </Field>

          </Section>

          {/* Business Details */}
          <Section title="Business Details">

            <Field label="Company Stage">
              <ChipSet options={stages} value={stage} onChange={setStage} />
            </Field>

            <Field label="Team Size">
              <ChipSet options={employeeOpts} value={employees} onChange={setEmployees} />
            </Field>

            <Field label="Monthly Budget">
              <ChipSet options={budgetOpts} value={budget} onChange={setBudget} />
            </Field>

            <Field label="Target Market">
              <input
                value={market}
                onChange={e => setMarket(e.target.value)}
                placeholder="e.g. Young adults 18–30 in Palestine"
                style={inputStyle}
                className={inputClass}
              />
            </Field>

            <Field label="Main Competitors">
              <input
                value={competitors}
                onChange={e => setComp(e.target.value)}
                placeholder="e.g. Careem, Uber"
                style={inputStyle}
                className={inputClass}
              />
            </Field>

            <Field label="Report Language">
              <ChipSet options={languageOpts} value={language} onChange={setLanguage} />
            </Field>

          </Section>

          {/* Save button */}
          <button
            onClick={handleSave}
            disabled={!name || !businessType || saving}
            style={{ background: '#355872' }}
            className="w-full disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl transition hover:opacity-90 text-sm tracking-wide shadow-md"
          >
            {saving ? 'Saving…' : 'Save Changes'}
          </button>

        </div>
      </div>
    </div>
  )
}
