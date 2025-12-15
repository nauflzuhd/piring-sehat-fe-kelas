import { auth } from '../firebase'

const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'

/**
 * Ambil header Authorization dari Firebase currentUser (Bearer token).
 * Jika tidak ada user yang login, mengembalikan objek kosong.
 * @returns {Promise<Object>} Header Authorization atau objek kosong.
 */
async function getAuthHeaders() {
  const user = auth.currentUser
  if (!user) return {}
  const token = await user.getIdToken()
  return { Authorization: `Bearer ${token}` }
}

/**
 * Helper sederhana untuk melakukan request ke endpoint makanan.
 * Melakukan parsing JSON dan melempar Error jika response tidak OK.
 * @param {string} path Path endpoint (mis. '/api/foods/search').
 * @param {RequestInit} [options] Opsi tambahan fetch (method, body, dll.).
 * @returns {Promise<any>} Body response yang ter-parse.
 */
async function request(path, options = {}) {
  const authHeaders = await getAuthHeaders()
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'GET',
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
      ...(options.headers || {}),
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

/**
 * Mencari daftar makanan berdasarkan nama dari backend.
 *
 * Jika `query` kosong, akan memanggil endpoint untuk mengambil daftar makanan dengan batas `limit`.
 * Jika `query` terisi, akan mengirim parameter `query` dan `limit` ke endpoint pencarian.
 *
 * @param {string} query - Kata kunci nama makanan.
 * @param {number} [limit=300] - Batas maksimal hasil yang dikembalikan.
 * @returns {Promise<any[]>} Array objek makanan (bisa kosong).
 */
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

/**
 * Mengambil satu data makanan pertama yang cocok dengan nama yang dicari.
 *
 * @param {string} query - Kata kunci nama makanan.
 * @returns {Promise<any|null>} Objek makanan pertama atau null jika tidak ada hasil.
 */
export async function getFirstFoodByName(query) {
  const normalized = (query || '').trim()
  if (!normalized) return null

  const body = await request(`/api/foods/first?query=${encodeURIComponent(normalized)}`)
  return body.data || null
}

/**
 * Membuat makanan baru di backend.
 * Hanya boleh dipakai oleh admin (backend sebaiknya memverifikasi role).
 *
 * @param {Object} payload
 * @param {string} payload.name
 * @param {number|string} payload.calories
 * @param {number|string} [payload.proteins]
 * @param {number|string} [payload.carbohydrate]
 * @param {number|string} [payload.fat]
 * @param {string} [payload.image_url]
 * @returns {Promise<any>} Objek makanan yang baru dibuat.
 */
export async function createFood(payload) {
  const normalizedPayload = {
    ...payload,
    calories: payload.calories !== '' ? Number(payload.calories) : null,
    proteins: payload.proteins !== '' ? Number(payload.proteins) : null,
    carbohydrate: payload.carbohydrate !== '' ? Number(payload.carbohydrate) : null,
    fat: payload.fat !== '' ? Number(payload.fat) : null,
  }

  const body = await request('/api/foods', {
    method: 'POST',
    body: JSON.stringify(normalizedPayload),
  })

  return body.data
}