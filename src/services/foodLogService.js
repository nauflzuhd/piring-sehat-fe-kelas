import { auth } from '../firebase'

const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'

/**
 * Ambil header Authorization dari Firebase currentUser (Bearer token).
 * Jika tidak ada user yang login, mengembalikan objek kosong.
 *
 * @returns {Promise<Object>} Header Authorization atau objek kosong.
 */
async function getAuthHeaders() {
  const user = auth.currentUser
  if (!user) return {}
  const token = await user.getIdToken()
  return { Authorization: `Bearer ${token}` }
}

/**
 * Helper untuk melakukan HTTP request ke backend dengan header auth otomatis.
 * Melakukan parsing JSON dan melempar Error jika response tidak OK.
 *
 * @param {string} path Path endpoint (mis. '/api/food-logs').
 * @param {RequestInit} [options={}] Opsi fetch tambahan (method, body, headers, dll).
 * @returns {Promise<any>} Body response yang sudah diparse (JSON) atau null.
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

// Tambah satu catatan makanan ke tabel food_logs
/**
 * Tambah catatan makanan untuk pengguna.
 *
 * @param {{userId:string,date:string,foodName?:string,calories:number,portion?:number,foodId?:string|null}} params
 * @returns {Promise<any>} Objek data entri yang dibuat.
 *
 * Fungsi ini memanggil endpoint backend untuk menyimpan satu catatan makanan
 * lalu mengembalikan data yang dibuat. Validasi input dilakukan di sisi klien juga.
 */
export async function addFoodLog({ userId, date, foodName, calories, portion = 1, foodId = null }) {
  if (!userId) throw new Error('userId is required')
  if (!date) throw new Error('date is required')
  if (!foodName && !foodId) throw new Error('foodName or foodId is required')
  if (!calories) throw new Error('calories is required')

  const payload = {
    userId,
    date,
    calories,
    portion,
    foodName,
    foodId,
  }

  const body = await request('/api/food-logs', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

  return body.data
}

// Ambil semua catatan untuk 1 user pada 1 tanggal (YYYY-MM-DD)
/**
 * Ambil daftar catatan makanan untuk user pada tanggal tertentu.
 * @param {string} userId ID user di Supabase.
 * @param {string} date Tanggal dalam format YYYY-MM-DD.
 * @returns {Promise<Array>} Array entri food log.
 */
export async function getFoodLogsByDate(userId, date) {
  if (!userId) throw new Error('userId is required')
  if (!date) throw new Error('date is required')

  const body = await request(`/api/food-logs?userId=${encodeURIComponent(userId)}&date=${encodeURIComponent(date)}`)
  return body.data || []
}

// Hitung total kalori untuk 1 user dalam rentang tanggal tertentu (misal 1 bulan)
/**
 * Hitung total kalori dalam rentang tanggal.
 * @param {string} userId ID user.
 * @param {string} startDate Tanggal mulai (YYYY-MM-DD).
 * @param {string} endDate Tanggal akhir (YYYY-MM-DD).
 * @returns {Promise<number>} Total kalori pada rentang tersebut.
 */
export async function getTotalCaloriesInRange(userId, startDate, endDate) {
  if (!userId) throw new Error('userId is required')
  if (!startDate || !endDate) throw new Error('startDate and endDate are required')

  const body = await request(`/api/food-logs/summary/month?userId=${encodeURIComponent(userId)}&startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`)
  return Number(body.total || 0)
}

// Hapus satu catatan food_log berdasarkan id
/**
 * Hapus entri food log berdasarkan ID.
 * @param {string|number} id ID entri yang akan dihapus.
 * @returns {Promise<void>}
 */
export async function deleteFoodLog(id) {
  if (!id) throw new Error('id is required')

  await request(`/api/food-logs/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  })
}

// Ringkasan nutrisi (protein, karbo, lemak) per hari untuk 1 user
// Menggunakan data nutrisi dari tabel makanan melalui relasi food_id -> makanan.id
/**
 * Ambil ringkasan nutrisi harian (protein, carbs, fat) untuk user pada tanggal tertentu.
 * @param {string} userId ID user.
 * @param {string} date Tanggal (YYYY-MM-DD).
 * @returns {Promise<{protein:number,carbs:number,fat:number}>}
 */
export async function getDailyNutritionSummary(userId, date) {
  if (!userId) throw new Error('userId is required')
  if (!date) throw new Error('date is required')

  const body = await request(`/api/food-logs/summary/nutrition?userId=${encodeURIComponent(userId)}&date=${encodeURIComponent(date)}`)
  return body.data || { protein: 0, carbs: 0, fat: 0 }
}