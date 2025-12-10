import { useEffect, useState, useRef } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'
import './ForumSection.css'
import { getForums, createForum, updateForum, deleteForum } from '../../services/forumService'

/**
 * Halaman utama forum diskusi.
 *
 * Menampilkan daftar thread forum dengan pagination, form untuk membuat thread baru,
 * serta fitur edit dan hapus untuk pemilik thread atau admin. Komponen ini membaca
 * konteks autentikasi dari `useOutletContext` (isAuthenticated, supabaseUserId, userRole)
 * dan memanggil service `forumService` untuk berinteraksi dengan backend.
 *
 * Jika user belum login, komponen menampilkan state terkunci dengan ajakan untuk login.
 *
 * @component
 * @returns {JSX.Element} Section forum beserta daftar thread dan form input.
 */
function ForumSection() {
  const navigate = useNavigate()
  const context = useOutletContext()
  const { isAuthenticated, onOpenLogin, supabaseUserId, userRole } = context || {}
  const [forums, setForums] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [editingForumId, setEditingForumId] = useState(null)
  const [showEditForum, setShowEditForum] = useState(false)
  const [editTitle, setEditTitle] = useState('')
  const [editContent, setEditContent] = useState('')
  const [currentPage, setCurrentPage] = useState(0)
  const itemsPerPage = 3
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [forumToDelete, setForumToDelete] = useState(null)

  // Load awal daftar forum ketika user sudah terautentikasi.
  // Mengambil semua forum dan mereset halaman ke awal.
  useEffect(() => {
    if (!isAuthenticated) return

    const loadForums = async () => {
      setLoading(true)
      setError('')
      try {
        const data = await getForums()
        setForums(data)
        setCurrentPage(0)
      } catch (err) {
        setError(err.message || 'Gagal memuat forum')
      } finally {
        setLoading(false)
      }
    }

    loadForums()
  }, [isAuthenticated])

  // Polling ringan untuk memastikan daftar forum selalu ter-update tanpa refresh.
  // Setiap 5 detik, memanggil `getForums()` selama user masih terautentikasi
  // dan menyesuaikan currentPage jika jumlah halaman berubah.
  useEffect(() => {
    if (!isAuthenticated) return

    let isCancelled = false

    const refreshForums = async () => {
      try {
        const data = await getForums()
        if (!isCancelled) {
          setForums(data)

          // Sesuaikan currentPage jika jumlah halaman berubah
          const total = Math.max(1, Math.ceil(data.length / itemsPerPage))
          setCurrentPage((prev) => {
            if (prev >= total) return total - 1
            return prev
          })
        }
      } catch (err) {
        console.error('Gagal memuat forum terbaru:', err)
      }
    }

    const intervalId = setInterval(refreshForums, 5000) // setiap 5 detik

    return () => {
      isCancelled = true
      clearInterval(intervalId)
    }
  }, [isAuthenticated, itemsPerPage])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) return

    try {
      setLoading(true)
      setError('')
      const payload = {
        title: title.trim(),
        content: content.trim(),
      }

      const created = await createForum(payload)
      setForums((prev) => [created, ...prev])
      setTitle('')
      setContent('')
      setEditingForumId(null)
      setCurrentPage(0)
    } catch (err) {
      setError(err.message || 'Gagal membuat forum baru')
    } finally {
      setLoading(false)
    }
  }

  const totalPages = Math.max(1, Math.ceil(forums.length / itemsPerPage))
  const startIndex = currentPage * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentForums = forums.slice(startIndex, endIndex)
  const showPagination = forums.length > itemsPerPage

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage((prev) => prev + 1)
    }
  }

  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage((prev) => prev - 1)
    }
  }

  const formatDateTime = (value) => {
    if (!value) return ''
    try {
      return new Date(value).toLocaleString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return ''
    }
  }

  const handleEdit = (forum) => {
    if (!forum) return
    setEditingForumId(forum.id)
    setEditTitle(forum.title || '')
    setEditContent(forum.content || '')
    setShowEditForum(true)
  }

  const handleEditCancel = () => {
    setShowEditForum(false)
    setEditingForumId(null)
    setEditTitle('')
    setEditContent('')
  }

  const handleEditSave = async (e) => {
    e.preventDefault()
    if (!editingForumId) return
    if (!editTitle.trim() || !editContent.trim()) return

    try {
      setLoading(true)
      setError('')
      const payload = {
        title: editTitle.trim(),
        content: editContent.trim(),
      }
      const updated = await updateForum(editingForumId, payload)
      setForums((prev) => prev.map((f) => (f.id === editingForumId ? updated : f)))
      setShowEditForum(false)
      setEditingForumId(null)
    } catch (err) {
      setError(err.message || 'Gagal mengubah forum')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteClick = (forum) => {
    setForumToDelete(forum)
    setShowDeleteConfirm(true)
  }

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false)
    setForumToDelete(null)
  }

  const handleDeleteConfirm = async () => {
    if (!forumToDelete) return

    try {
      await deleteForum(forumToDelete.id)
      setForums((prev) => prev.filter((f) => f.id !== forumToDelete.id))
      setShowDeleteConfirm(false)
      setForumToDelete(null)
    } catch (err) {
      alert(err.message || 'Gagal menghapus forum')
    }
  }

  // Blok semua interaksi saat popup hapus forum aktif.
  // Mencegah scroll, navigasi keyboard, dan klik di luar modal ketika dialog konfirmasi hapus terbuka.
  useEffect(() => {
    if (!showDeleteConfirm) return

    const preventScroll = (e) => e.preventDefault()
    const handleKeyDown = (e) => {
      if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', ' '].includes(e.key)) {
        e.preventDefault()
      }
    }
    document.addEventListener('wheel', preventScroll, { passive: false })
    document.addEventListener('touchmove', preventScroll, { passive: false })
    document.addEventListener('keydown', handleKeyDown)

    const preventOutsideClick = (e) => {
      const modal = document.querySelector('.forum-delete-modal')
      const backdrop = document.querySelector('.forum-delete-modal-backdrop')
      if (backdrop && modal && e.target !== modal && !modal.contains(e.target)) {
        e.preventDefault()
        e.stopPropagation()
      }
    }
    document.addEventListener('click', preventOutsideClick, true)

    return () => {
      document.removeEventListener('wheel', preventScroll)
      document.removeEventListener('touchmove', preventScroll)
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('click', preventOutsideClick, true)
    }
  }, [showDeleteConfirm])

  return (
    <section className="forum-section">
      <div className="forum-container">
        {isAuthenticated ? (
          <div className="forum-main-card">
            <header className="forum-header-inside">
              <h2 className="forum-title">Forum Diskusi</h2>
              <p className="forum-subtitle">
                Tempat kamu berbagi pengalaman, tips, dan pertanyaan seputar pola makan sehat.
              </p>
            </header>

            <div className="forum-list">
              {forums.length === 0 && !loading && (
                <p className="forum-empty">Belum ada forum. Jadilah yang pertama membuat topik!</p>
              )}

              {loading && <p className="forum-loading">Memuat...</p>}

              {currentForums.map((forum) => (
                <article key={forum.id} className="forum-card forum-card-compact">
                  <div className="forum-card-header">
                    <h3
                      className="forum-card-title"
                      onClick={() => navigate(`/forum/${forum.id}`)}
                    >
                      {forum.title && forum.title.length > 30
                        ? `${forum.title.slice(0, 30)}...`
                        : forum.title}
                    </h3>
                    <div className="forum-card-meta-wrapper">
                      <span className="forum-card-meta">
                        oleh {forum.username || 'Pengguna'}
                      </span>
                      {forum.forum_created_at && (
                        <span className="forum-card-meta forum-card-meta-date">
                          {formatDateTime(forum.forum_created_at)}
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="forum-card-content">
                    {forum.content?.slice(0, 120)}
                    {forum.content && forum.content.length > 120 ? '...' : ''}
                  </p>
                  <div className="forum-card-footer">
                    <button
                      type="button"
                      className="forum-link-btn"
                      onClick={() => navigate(`/forum/${forum.id}`)}
                    >
                      Lihat diskusi ({forum.comment_count ?? 0} komentar)
                    </button>
                    {forum.is_locked && <span className="forum-badge">Terkunci</span>}
                    {(forum.user_id === supabaseUserId || userRole === 'admin') && (
                      <div className="forum-footer-actions">
                        <button
                          type="button"
                          className="forum-edit-btn"
                          onClick={() => handleEdit(forum)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="forum-delete-btn"
                          onClick={() => handleDeleteClick(forum)}
                        >
                          Hapus
                        </button>
                      </div>
                    )}
                  </div>
                </article>
              ))}

              {showPagination && (
                <div className="forum-pagination">
                  <button
                    type="button"
                    className="forum-page-btn"
                    onClick={handlePrevPage}
                    disabled={currentPage === 0}
                  >
                    ←
                  </button>
                  <span className="forum-page-indicator">
                    {currentPage + 1} / {totalPages}
                  </span>
                  <button
                    type="button"
                    className="forum-page-btn"
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages - 1}
                  >
                    →
                  </button>
                </div>
              )}
            </div>

            <div className="forum-divider" />

            <div className="forum-form-wrapper">
              <h3 className="forum-form-title">Buat Topik Baru</h3>
              <form onSubmit={handleSubmit} className="forum-form">
                <input
                  type="text"
                  placeholder="Judul forum"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="forum-input"
                />
                <textarea
                  placeholder="Tulis isi forum di sini..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="forum-textarea"
                  rows={4}
                />
                {error && <div className="forum-alert forum-alert-error">{error}</div>}
                <button type="submit" className="forum-submit-btn" disabled={loading}>
                  {loading ? 'Mengirim...' : 'Kirim Forum'}
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div className="hitung-container">
            <header className="forum-header-inside">
              <h2 className="forum-title">Forum Diskusi</h2>
              <p className="forum-subtitle">
                Tempat kamu berbagi pengalaman, tips, dan pertanyaan seputar pola makan sehat.
              </p>
            </header>

            <div className="locked-state">
              <div className="lock-icon">🔒</div>
              <h3 className="locked-title">Masuk untuk Mengakses Forum</h3>
              <p className="locked-description">
                Kamu perlu login terlebih dahulu untuk membuat topik dan melihat diskusi di forum.
              </p>
              <button
                type="button"
                className="btn-login-prompt"
                onClick={onOpenLogin}
              >
                Login Sekarang
              </button>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="forum-delete-modal-backdrop" onClick={(e) => e.preventDefault()} onWheel={(e) => e.preventDefault()} onTouchMove={(e) => e.preventDefault()} onPointerDown={(e) => e.preventDefault()}>
            <div className="forum-delete-modal" onClick={(e) => e.stopPropagation()} onPointerDown={(e) => e.stopPropagation()}>
              <h3 className="forum-delete-modal-title">Hapus Forum?</h3>
              <p className="forum-delete-modal-text">
                Kamu yakin ingin menghapus forum "{forumToDelete?.title}"? Tindakan ini tidak dapat dibatalkan.
              </p>
              <div className="forum-delete-modal-actions">
                <button
                  type="button"
                  className="forum-delete-cancel-btn"
                  onClick={handleDeleteCancel}
                  onMouseDown={(e) => e.preventDefault()}
                >
                  Tidak
                </button>
                <button
                  type="button"
                  className="forum-delete-confirm-btn"
                  onClick={handleDeleteConfirm}
                  onMouseDown={(e) => e.preventDefault()}
                >
                  Ya, Hapus
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Forum Modal - sama seperti di halaman detail forum */}
        {showEditForum && (
          <div className="logout-modal-backdrop">
            <div className="logout-modal">
              <h3 className="logout-modal-title">Edit Forum</h3>
              <form onSubmit={handleEditSave} className="forum-form">
                <input
                  type="text"
                  className="forum-input"
                  placeholder="Judul forum"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                />
                <textarea
                  className="forum-textarea"
                  rows={5}
                  placeholder="Isi forum"
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                />
                <div className="logout-modal-actions">
                  <button
                    type="button"
                    className="logout-cancel-btn"
                    onClick={handleEditCancel}
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="logout-confirm-btn"
                    disabled={loading}
                  >
                    {loading ? 'Menyimpan...' : 'Simpan'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

export default ForumSection
