import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'

const questions = [
  {
    key: 'stage',
    text: 'What stage is your company at?',
    type: 'chips',
    options: ['Idea', 'Launch', 'Growth', 'Expansion']
  },
  {
    key: 'employees',
    text: 'How many employees do you have?',
    type: 'chips',
    options: ['1', '2–5', '6–20', '21–50', '50+']
  },
  {
    key: 'budget',
    text: 'What is your monthly budget?',
    type: 'chips',
    options: ['Under $500', '$500–$2,000', '$2,000–$10,000', 'Over $10,000']
  },
  {
    key: 'market',
    text: 'Who is your target market?',
    type: 'text',
    placeholder: 'e.g. Young adults 18–30 in Palestine and Jordan'
  },
  {
    key: 'competitors',
    text: 'Who are your main competitors?',
    type: 'text',
    placeholder: 'e.g. Careem, Uber, traditional taxis'
  },
  {
    key: 'language',
    text: 'In which language do you want the report?',
    type: 'chips',
    options: ['العربية', 'English']
  },
]

const businessTypes = [
  { label: 'Restaurant / Café', icon: '🍽' },
  { label: 'SaaS / App',        icon: '⚡' },
  { label: 'E-commerce',        icon: '🛍' },
  { label: 'Retail Store',      icon: '🏪' },
  { label: 'Professional Services', icon: '💼' },
  { label: 'Other',             icon: '📦' },
]

const STYLE = {
  font: "'DM Sans', 'Helvetica Neue', sans-serif",
  bg: '#F7F8F0',
  primary: '#355872',
  medium: '#7AAACE',
  light: '#9CD5FF',
}

function ChipButton({ selected, onClick, children }) {
  return (
    <button
      onClick={onClick}
      style={
        selected
          ? { background: '#355872', color: 'white', border: '2px solid #355872' }
          : { background: 'white', color: '#355872', border: '2px solid rgba(122,170,206,0.3)' }
      }
      className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 hover:border-[#355872]"
    >
      {children}
    </button>
  )
}

export default function CreateProject() {
  const navigate = useNavigate()
  const [phase, setPhase] = useState('info')
  const [name, setName] = useState('')
  const [businessType, setBusinessType] = useState('')
  const [description, setDescription] = useState('')
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState({})
  const [textValue, setTextValue] = useState('')

  const question = questions[currentStep]
  const progress = Math.round((currentStep / questions.length) * 100)

  function handleInfoSubmit() {
    if (!name || !businessType) return
    setPhase('questions')
  }

  function handleChipAnswer(option) {
    const newAnswers = { ...answers, [question.key]: option }
    setAnswers(newAnswers)
    setCurrentStep(currentStep + 1)
  }

  function handleTextAnswer() {
    if (!textValue.trim()) return
    const newAnswers = { ...answers, [question.key]: textValue }
    setAnswers(newAnswers)
    setTextValue('')
    setCurrentStep(currentStep + 1)
  }

  async function handleFinish() {
    try {
      const response = await api.post('/projects', {
        name,
        business_type: businessType,
        description,
        stage: answers.stage,
        employees: answers.employees,
        budget: answers.budget,
        market: answers.market,
        competitors: answers.competitors,
        language: answers.language,
      })
      const data = response?.data || {}

      const project = data.project || data
      if (!project?.id) {
        throw new Error('Project response did not include an id')
      }

      navigate(`/projects/${project.id}/select`)
    } catch (error) {
      console.error('Error:', error)
    }
  }

  /* ─── Phase: INFO ─── */
  if (phase === 'info') {
    return (
      <div style={{ fontFamily: STYLE.font, background: STYLE.bg, minHeight: '100vh' }} className="px-6 py-10">
        <div className="max-w-xl mx-auto">

          {/* Back */}
          <button
            onClick={() => navigate('/projects')}
            style={{ color: STYLE.medium }}
            className="text-sm font-semibold mb-6 flex items-center gap-1 hover:opacity-70 transition"
          >
            ← Back
          </button>

          {/* Header */}
          <div className="mb-8">
            <p style={{ color: STYLE.medium }} className="text-xs font-bold uppercase tracking-widest mb-2">
              New Project
            </p>
            <h1 className="text-3xl font-black text-gray-900">Tell us about your business</h1>
            <p className="text-gray-500 mt-1 text-sm">We'll use this to tailor your strategy report</p>
          </div>

          {/* Card */}
          <div
            style={{ background: 'white', border: '1px solid rgba(122,170,206,0.25)' }}
            className="rounded-2xl p-8 shadow-sm flex flex-col gap-6"
          >

            {/* Project Name */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Project Name <span style={{ color: STYLE.medium }}>*</span>
              </label>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Al-Sham Restaurant"
                style={{
                  border: '2px solid ' + (name ? '#355872' : 'rgba(122,170,206,0.3)'),
                  background: name ? 'rgba(156,213,255,0.05)' : '#F7F8F0',
                }}
                className="w-full rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none transition text-sm font-medium"
              />
            </div>

            {/* Business Type */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Business Type <span style={{ color: STYLE.medium }}>*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {businessTypes.map(({ label, icon }) => (
                  <button
                    key={label}
                    onClick={() => setBusinessType(label)}
                    style={
                      businessType === label
                        ? { background: '#355872', color: 'white', border: '2px solid #355872' }
                        : { background: '#F7F8F0', color: '#355872', border: '2px solid rgba(122,170,206,0.25)' }
                    }
                    className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all hover:border-[#355872] text-left"
                  >
                    <span className="text-lg leading-none">{icon}</span>
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Short Description
                <span className="text-gray-400 font-normal ml-1">(optional)</span>
              </label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Briefly describe what your business does..."
                rows={3}
                style={{ border: '2px solid rgba(122,170,206,0.3)', background: '#F7F8F0' }}
                className="w-full rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none transition resize-none text-sm"
              />
            </div>

            <button
              onClick={handleInfoSubmit}
              disabled={!name || !businessType}
              style={{ background: '#355872' }}
              className="w-full disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition hover:opacity-90 text-sm tracking-wide"
            >
              Continue →
            </button>

          </div>
        </div>
      </div>
    )
  }

  /* ─── Phase: QUESTIONS ─── */
  return (
    <div style={{ fontFamily: STYLE.font, background: STYLE.bg, minHeight: '100vh' }} className="px-6 py-10">
      <div className="max-w-2xl mx-auto">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-2 text-sm">
          <span className="text-gray-400">New Project</span>
          <span className="text-gray-300">/</span>
          <span style={{ color: STYLE.primary }} className="font-semibold">{name}</span>
        </div>

        <h1 className="text-2xl font-black text-gray-900 mb-1">Business Profile</h1>
        <p className="text-gray-500 text-sm mb-7">Help us understand your business to generate the best report</p>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between text-xs text-gray-400 mb-2">
            <span className="font-semibold">
              {currentStep < questions.length
                ? `Step ${currentStep + 1} of ${questions.length}`
                : 'Done!'}
            </span>
            <span style={{ color: STYLE.medium }} className="font-bold">{Math.min(progress + 17, 100)}%</span>
          </div>
          <div style={{ background: 'rgba(122,170,206,0.2)' }} className="w-full rounded-full h-2">
            <div
              style={{
                width: `${Math.min(progress + 17, 100)}%`,
                background: 'linear-gradient(90deg, #355872, #7AAACE)',
                transition: 'width 0.5s cubic-bezier(0.4,0,0.2,1)',
              }}
              className="h-2 rounded-full"
            />
          </div>
        </div>

        {currentStep < questions.length ? (
          <>
            <div
              style={{ background: 'white', border: '1px solid rgba(122,170,206,0.25)' }}
              className="rounded-2xl p-8 shadow-sm"
            >
              {/* Step badge */}
              <div className="flex items-center gap-3 mb-5">
                <span
                  style={{ background: '#355872', color: 'white' }}
                  className="w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center"
                >
                  {currentStep + 1}
                </span>
                <span className="text-xs font-bold uppercase tracking-widest text-gray-400">
                  {question.key.replace(/([A-Z])/g, ' $1')}
                </span>
              </div>

              <p className="text-xl font-black text-gray-900 mb-7 leading-snug">{question.text}</p>

              {question.type === 'chips' && (
                <div className="flex flex-wrap gap-2">
                  {question.options.map(option => (
                    <ChipButton
                      key={option}
                      selected={answers[question.key] === option}
                      onClick={() => handleChipAnswer(option)}
                    >
                      {option}
                    </ChipButton>
                  ))}
                </div>
              )}

              {question.type === 'text' && (
                <div className="flex gap-3">
                  <input
                    value={textValue}
                    onChange={e => setTextValue(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleTextAnswer()}
                    placeholder={question.placeholder}
                    style={{ border: '2px solid rgba(122,170,206,0.3)', background: '#F7F8F0' }}
                    className="flex-1 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#355872] transition text-sm font-medium"
                  />
                  <button
                    onClick={handleTextAnswer}
                    disabled={!textValue.trim()}
                    style={{ background: '#355872' }}
                    className="disabled:opacity-40 text-white px-5 py-3 rounded-xl transition font-bold text-sm hover:opacity-90"
                  >
                    Next →
                  </button>
                </div>
              )}
            </div>

            {/* Previous answers as tags */}
            {Object.keys(answers).length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2">
                {Object.entries(answers).map(([key, value]) => (
                  <span
                    key={key}
                    style={{
                      background: 'rgba(156,213,255,0.15)',
                      border: '1px solid rgba(122,170,206,0.3)',
                      color: '#355872',
                    }}
                    className="text-xs px-3 py-1.5 rounded-full font-semibold"
                  >
                    {value}
                  </span>
                ))}
              </div>
            )}
          </>
        ) : (
          /* Completion */
          <div
            style={{
              background: 'linear-gradient(135deg, #355872 0%, #7AAACE 100%)',
              boxShadow: '0 12px 40px rgba(53,88,114,0.3)',
            }}
            className="rounded-2xl p-10 text-center"
          >
            <div
              style={{ background: 'rgba(255,255,255,0.2)', border: '2px solid rgba(255,255,255,0.3)' }}
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5 text-3xl"
            >
              ✓
            </div>
            <p className="text-2xl font-black text-white mb-2">Business profile complete!</p>
            <p style={{ color: '#9CD5FF' }} className="mb-8 text-sm">
              Now choose which sections to include in your strategy report
            </p>
            <button
              onClick={handleFinish}
              style={{ background: '#F7F8F0', color: '#355872' }}
              className="font-bold px-8 py-3.5 rounded-xl hover:bg-white transition text-sm"
            >
              Choose Report Sections →
            </button>
          </div>
        )}

      </div>
    </div>
  )
}
