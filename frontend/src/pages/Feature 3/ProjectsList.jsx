import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'

const STAGE_COLORS = {
  Idea:      { bg: 'rgba(156,213,255,0.15)', text: '#355872', dot: '#9CD5FF' },
  Launch:    { bg: 'rgba(122,170,206,0.15)', text: '#355872', dot: '#7AAACE' },
  Growth:    { bg: 'rgba(53,88,114,0.1)',    text: '#355872', dot: '#355872' },
  Expansion: { bg: 'rgba(53,88,114,0.15)',   text: '#355872', dot: '#355872' },
}

const TYPE_ICONS = {
  'Restaurant / Café':     '🍽',
  'SaaS / App':            '⚡',
  'E-commerce':            '🛍',
  'Retail Store':          '🏪',
  'Professional Services': '💼',
  'Other':                 '📁',
}

function StageChip({ stage }) {
  const color = STAGE_COLORS[stage] || STAGE_COLORS['Idea']
  return (
    <span
      style={{ background: color.bg, color: color.text }}
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
    >
      <span style={{ background: color.dot }} className="w-1.5 h-1.5 rounded-full inline-block" />
      {stage}
    </span>
  )
}

function EmptyState({ onNew }) {
  return (
    <div className="text-center py-24">
      <div
        style={{ background: 'rgba(156,213,255,0.15)', border: '2px dashed rgba(122,170,206,0.4)' }}
        className="inline-flex w-20 h-20 rounded-2xl items-center justify-center text-4xl mb-5"
      >
        📁
      </div>
      <h3 className="text-lg font-semibold text-gray-800 mb-1">No projects yet</h3>
      <p className="text-gray-400 text-sm mb-6">Create your first project and generate a strategy report</p>
      <button
        onClick={onNew}
        style={{ background: '#355872' }}
        className="text-white font-semibold px-6 py-2.5 rounded-xl hover:opacity-90 transition text-sm"
      >
        + Create First Project
      </button>
    </div>
  )
}

export default function ProjectsList() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const displayName = user?.name?.split(' ')[0] || user?.email || 'there'
  const [projects, setProjects] = useState([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    api.get('/projects')
      .then((response) => {
        setProjects(response?.data || [])
        setLoading(false)
      })
      .catch((err) => {
        console.error(err)
        setLoading(false)
      })
  }, [])

  return (
    <div
      style={{ fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif", minHeight: '100vh', background: '#F7F8F0' }}
      className="px-6 py-10 max-w-5xl mx-auto"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
        <div>
          <p style={{ color: '#7AAACE' }} className="text-sm font-semibold uppercase tracking-widest mb-1">Dashboard</p>
          <h1 className="text-4xl font-black text-gray-900 leading-tight">
            Welcome back, <span style={{ color: '#355872' }}>{displayName}</span>
          </h1>
          <p className="text-gray-500 mt-1.5 text-sm">Manage and grow your business strategies</p>
        </div>
        <button
          onClick={() => navigate('/projects/new')}
          style={{ background: '#355872' }}
          className="flex items-center gap-2 text-white font-semibold px-5 py-3 rounded-xl hover:opacity-90 transition text-sm whitespace-nowrap shadow-md"
        >
          <span className="text-lg leading-none">+</span> New Project
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Projects', value: projects.length },
          { label: 'Reports',  value: '—' },
          { label: 'Credits',  value: 65 },
        ].map(stat => (
          <div key={stat.label} style={{ background: 'white', border: '1px solid rgba(122,170,206,0.2)' }} className="rounded-2xl p-4 shadow-sm">
            <p className="text-gray-400 text-xs font-medium mb-1">{stat.label}</p>
            <p style={{ color: '#355872' }} className="text-2xl font-black">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Hero CTA */}
      <div
        style={{ background: 'linear-gradient(135deg, #355872 0%, #7AAACE 100%)', boxShadow: '0 8px 32px rgba(53,88,114,0.25)' }}
        className="rounded-2xl p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8"
      >
        <div>
          <p className="text-white font-black text-xl leading-tight">Generate a Strategy Report</p>
          <p style={{ color: '#9CD5FF' }} className="text-sm mt-1">AI-powered analysis in minutes — SWOT, pricing, growth & more</p>
        </div>
        <button
          onClick={() => navigate('/projects/new')}
          style={{ background: '#F7F8F0', color: '#355872' }}
          className="font-bold px-5 py-2.5 rounded-xl hover:bg-white transition text-sm whitespace-nowrap shadow-sm"
        >
          Start Now →
        </button>
      </div>

      {/* Projects */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} style={{ background: 'white', border: '1px solid rgba(122,170,206,0.15)' }} className="h-24 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <EmptyState onNew={() => navigate('/projects/new')} />
      ) : (
        <div>
          <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Your Projects</h2>
          <div className="space-y-3">
            {projects.map(project => (
              <div
                key={project.id}
                style={{ background: 'white', border: '1px solid rgba(122,170,206,0.2)' }}
                className="rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm hover:shadow-md hover:border-[#7AAACE] transition-all group"
              >
                {/* Info */}
                <div className="flex items-center gap-4">
                  <div
                    style={{ background: 'rgba(156,213,255,0.15)', border: '1px solid rgba(122,170,206,0.2)' }}
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0"
                  >
                    {TYPE_ICONS[project.business_type] || '📁'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="font-bold text-gray-900 text-base group-hover:text-[#355872] transition">{project.name}</h2>
                      {project.stage && <StageChip stage={project.stage} />}
                    </div>
                    <p className="text-gray-400 text-sm line-clamp-1">{project.description || project.business_type || 'No description'}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 sm:shrink-0">

                  {/* Edit */}
                  <button
                    onClick={() => navigate(`/projects/${project.id}/edit`)}
                    style={{ border: '1px solid rgba(122,170,206,0.3)', color: '#7AAACE' }}
                    className="px-3 py-2 rounded-xl text-sm font-semibold hover:bg-[rgba(156,213,255,0.1)] transition"
                  >
                    Edit
                  </button>

                  {/* Generate → SectionSelection */}
                  <button
                    onClick={() => navigate(`/projects/${project.id}/select`)}
                    style={{ border: '2px solid #355872', color: '#355872' }}
                    className="px-3 py-2 rounded-xl text-sm font-bold hover:bg-[rgba(53,88,114,0.06)] transition flex items-center gap-1.5"
                  >
                    <span style={{ fontSize: '0.7rem' }}>✦</span>
                    Generate
                  </button>

                  {/* Open → Reports page */}
                  <button
                    onClick={() => navigate(`/projects/${project.id}/reports`)}
                    style={{ background: '#355872' }}
                    className="px-4 py-2 rounded-xl text-sm font-bold text-white hover:opacity-90 transition"
                  >
                    Open →
                  </button>

                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
