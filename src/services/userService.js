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
 * Helper untuk request dengan parsing JSON.
 * @param {string} path Path endpoint.
 * @param {RequestInit} [options={}] Opsi fetch.
 * @returns {Promise<any>} Body response JSON atau null.
 */
async function request(path, options = {}) {
  const authHeaders = await getAuthHeaders()
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
      ...(options.headers || {}),
    },
    ...options,
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
 * Sinkronisasi user Firebase ke tabel users di Supabase via backend.
 * Jika user belum ada, backend akan membuat entri baru.
 *
 * @param {import('firebase/auth').User} firebaseUser Objek user Firebase.
 * @returns {Promise<string>} ID user di Supabase.
 *
 * Fungsi ini mengirimkan data minimal (firebase_uid, email, username) ke endpoint
 * backend yang bertanggung jawab menyimpan/menyinkronkan ke Supabase dan mengembalikan id.
 */
export async function syncFirebaseUserToSupabase(firebaseUser) {
  if (!firebaseUser) throw new Error('firebaseUser is required')

  const firebase_uid = firebaseUser.uid
  const email = firebaseUser.email
  const username = firebaseUser.displayName || (email ? email.split('@')[0] : null)

  const body = await request('/api/auth/sync-user', {
    method: 'POST',
    body: JSON.stringify({ firebase_uid, email, username }),
  })

  return body.id
}

/**
 * Ambil profil user yang sedang login.
 * @returns {Promise<Object>} Profil user.
 */
export async function getCurrentUserProfile() {
  const body = await request('/api/users/me')
  return body
}

// Ambil target kalori harian user (dalam kkal)
/**
 * Ambil target kalori harian pengguna dari backend.
 * @param {string} userId ID user di Supabase.
 * @returns {Promise<number|null>} Target kalori (number) atau null jika tidak diset.
 */
export async function getUserDailyCalorieTarget(userId) {
  if (!userId) throw new Error('userId is required')

  const body = await request(`/api/users/${encodeURIComponent(userId)}/daily-target`)
  return body.target ?? null
}

// Update target kalori harian user (dalam kkal)
/**
 * Update target kalori harian pengguna.
 * @param {string} userId ID user di Supabase.
 * @param {number|null} target Nilai target baru (atau null untuk menghapus).
 * @returns {Promise<number|null>} Target yang disimpan pada response.
 */
export async function updateUserDailyCalorieTarget(userId, target) {
  if (!userId) throw new Error('userId is required')

  const body = await request(`/api/users/${encodeURIComponent(userId)}/daily-target`, {
    method: 'PUT',
    body: JSON.stringify({ target }),
  })

  return body.target
}