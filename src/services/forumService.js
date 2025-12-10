import { auth } from '../firebase'

const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'

async function getAuthHeaders() {
  const user = auth.currentUser
  if (!user) return {}
  const token = await user.getIdToken()
  return { Authorization: `Bearer ${token}` }
}

/**
 * Helper umum untuk melakukan HTTP request ke backend forum dengan header auth Firebase.
 *
 * @param {string} path - Path endpoint backend (mis. `/api/forums`).
 * @param {RequestInit} [options={}] - Opsi tambahan untuk `fetch` (method, body, headers).
 * @returns {Promise<any>} Body response yang sudah di-parse (jika JSON) atau `null`.
 * @throws {Error} Melempar error jika status HTTP tidak OK.
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
 * Ambil daftar semua forum dari backend.
 *
 * @returns {Promise<any[]>} Array forum (bisa kosong).
 */
export async function getForums() {
  const body = await request('/api/forums')
  return body.data || []
}

/**
 * Ambil detail satu forum berdasarkan ID.
 *
 * @param {string|number} id - ID forum.
 * @returns {Promise<any>} Objek forum.
 */
export async function getForumById(id) {
  if (!id) throw new Error('id is required')
  const body = await request(`/api/forums/${encodeURIComponent(id)}`)
  return body.data
}

/**
 * Membuat forum baru.
 *
 * @param {{title:string, content:string}} params - Judul dan konten forum.
 * @returns {Promise<any>} Forum yang baru dibuat.
 */
export async function createForum({ title, content }) {
  if (!title) throw new Error('title is required')
  if (!content) throw new Error('content is required')

  const body = await request('/api/forums', {
    method: 'POST',
    body: JSON.stringify({ title, content }),
  })

  return body.data
}

/**
 * Mengupdate forum existing.
 *
 * @param {string|number} id - ID forum.
 * @param {{title?:string, content?:string}} params - Field yang akan diupdate.
 * @returns {Promise<any>} Forum yang sudah diperbarui.
 */
export async function updateForum(id, { title, content }) {
  if (!id) throw new Error('id is required')

  const body = await request(`/api/forums/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify({ title, content }),
  })

  return body.data
}

/**
 * Menghapus forum berdasarkan ID.
 *
 * @param {string|number} id - ID forum.
 * @returns {Promise<void>} Promise yang selesai jika backend sukses.
 */
export async function deleteForum(id) {
  if (!id) throw new Error('id is required')

  await request(`/api/forums/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  })
}

/**
 * Mengambil daftar komentar untuk sebuah forum.
 *
 * @param {string|number} forumId - ID forum.
 * @returns {Promise<any[]>} Array komentar (bisa kosong).
 */
export async function getComments(forumId) {
  if (!forumId) throw new Error('forumId is required')
  const body = await request(`/api/forums/${encodeURIComponent(forumId)}/comments`)
  return body.data || []
}

/**
 * Membuat komentar baru pada forum tertentu.
 *
 * @param {string|number} forumId - ID forum.
 * @param {{content:string, parentCommentId?:number|null}} params - Isi komentar dan optional ID komentar induk.
 * @returns {Promise<any>} Komentar yang baru dibuat.
 */
export async function createComment(forumId, { content, parentCommentId = null }) {
  if (!forumId) throw new Error('forumId is required')
  if (!content) throw new Error('content is required')

  const body = await request(`/api/forums/${encodeURIComponent(forumId)}/comments`, {
    method: 'POST',
    body: JSON.stringify({ content, parentCommentId }),
  })

  return body.data
}

/**
 * Mengupdate isi komentar.
 *
 * @param {string|number} id - ID komentar.
 * @param {{content:string}} params - Isi komentar baru.
 * @returns {Promise<any>} Komentar yang sudah diperbarui.
 */
export async function updateComment(id, { content }) {
  if (!id) throw new Error('id is required')
  if (!content) throw new Error('content is required')

  const body = await request(`/api/forums/comments/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify({ content }),
  })

  return body.data
}

/**
 * Menghapus komentar berdasarkan ID.
 *
 * @param {string|number} id - ID komentar.
 * @returns {Promise<void>} Promise yang selesai jika backend sukses.
 */
export async function deleteComment(id) {
  if (!id) throw new Error('id is required')

  await request(`/api/forums/comments/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  })
}
