import { auth } from '../firebase'

const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'

async function getAuthHeaders() {
  const user = auth.currentUser
  if (!user) return {}
  const token = await user.getIdToken()
  return { Authorization: `Bearer ${token}` }
}

async function request(path) {
  const authHeaders = await getAuthHeaders()
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      ...authHeaders,
    },
  })

  const contentType = res.headers.get('content-type') || ''
  const isJson = contentType.includes('application/json')
  const body = isJson ? await res.json() : null

  if (!res.ok) {
    const message = body?.error || res.statusText || 'Request failed'
    throw new Error(message)
  }

  return body
}

export async function searchFoodsByName(query, limit = 300) {
  const normalized = (query || '').trim()

  if (!normalized) {
    const body = await request(`/api/foods/search?limit=${encodeURIComponent(limit)}`)
    return body.data || []
  }

  const body = await request(
    `/api/foods/search?query=${encodeURIComponent(normalized)}&limit=${encodeURIComponent(limit)}`
  )

  return body.data || []
}

export async function getFirstFoodByName(query) {
  const normalized = (query || '').trim()
  if (!normalized) return null

  const body = await request(`/api/foods/first?query=${encodeURIComponent(normalized)}`)
  return body.data || null
}
