import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

const isSensitivePasswordInput = (input) => {
  if (!(input instanceof HTMLInputElement)) return false

  const id = String(input.id || '').toLowerCase()
  const name = String(input.name || '').toLowerCase()
  const autocomplete = String(input.autocomplete || '').toLowerCase()

  return (
    input.type === 'password' ||
    id.includes('password') ||
    name.includes('password') ||
    autocomplete.includes('password')
  )
}

const resolveSensitiveInput = (event) => {
  const directTarget = event.target instanceof HTMLInputElement ? event.target : null
  const activeElement = document.activeElement instanceof HTMLInputElement ? document.activeElement : null

  if (isSensitivePasswordInput(directTarget)) return directTarget
  if (isSensitivePasswordInput(activeElement)) return activeElement
  return null
}

const blockPasswordClipboard = (event) => {
  const input = resolveSensitiveInput(event)
  if (!input) return

  event.preventDefault()

  const start = typeof input.selectionStart === 'number' ? input.selectionStart : 0
  const end = typeof input.selectionEnd === 'number' ? input.selectionEnd : input.value.length
  const rawValue = input.value.slice(start, end) || input.value
  const encodedValue = `enc:${btoa(unescape(encodeURIComponent(rawValue)))}`

  if (event.clipboardData) {
    event.clipboardData.setData('text/plain', encodedValue)
  }
}

document.addEventListener('copy', blockPasswordClipboard, true)
document.addEventListener('cut', blockPasswordClipboard, true)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
