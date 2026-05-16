const TOKEN_KEY = 'adminToken'
const USER_KEY = 'adminUser'

export function getAdminToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function getAdminUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) || 'null')
  } catch {
    return null
  }
}

export function hasAdminSession() {
  const token = getAdminToken()
  const user = getAdminUser()

  return Boolean(token && user?.role === 'admin')
}

export function storeAdminSession({ token, user }) {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function clearAdminSession() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}
