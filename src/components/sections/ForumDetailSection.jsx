import { useEffect, useState } from 'react'
import { useNavigate, useOutletContext, useParams } from 'react-router-dom'
import './ForumSection.css'
import { getForumById, getComments, createComment, updateComment, deleteComment, updateForum } from '../../services/forumService'

/**
 * Halaman detail satu thread forum beserta daftar komentarnya.
 *
 * Komponen ini memuat data thread (`getForumById`) dan komentar (`getComments`),
 * menampilkan form untuk menambah komentar baru, serta fitur edit/hapus komentar
 * dan edit forum untuk pemilik atau admin. Terdapat polling ringan setiap 5 detik
 * untuk menyegarkan komentar dari backend selama user terautentikasi.
 *
 * Informasi autentikasi (isAuthenticated, supabaseUserId, userRole, onOpenLogin)
 * dibaca dari `useOutletContext` yang disediakan oleh layout utama.
 *
 * @component
 * @returns {JSX.Element|null} Section detail forum atau null jika `id` tidak tersedia.
 */
function ForumDetailSection() {
  const { id } = useParams()
  const navigate = useNavigate()
  const context = useOutletContext()
  const { isAuthenticated, onOpenLogin, supabaseUserId, userRole } = context || {}

  const [forum, setForum] = useState(null)
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [content, setContent] = useState('') // form komentar baru
  const [editingCommentId, setEditingCommentId] = useState(null)
  const [editCommentContent, setEditCommentContent] = useState('')
  const [expandedComments, setExpandedComments] = useState({})
  const [showEditForum, setShowEditForum] = useState(false)
  const [editTitle, setEditTitle] = useState('')
  const [editContent, setEditContent] = useState('')
  const [showDeleteCommentConfirm, setShowDeleteCommentConfirm] = useState(false)
  const [commentToDelete, setCommentToDelete] = useState(null)

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

  /**
   * Load awal data forum dan komentar ketika id berubah dan user sudah login.
   * Mengambil detail forum dan daftar komentar secara paralel.
   */
  useEffect(() => {
    const loadData = async () => {
      if (!id) return
      setLoading(true)
      setError('')
      try {
        const [forumData, commentData] = await Promise.all([
          getForumById(id),
          getComments(id),
        ])
        setForum(forumData)
        setComments(commentData)
      } catch (err) {
        setError(err.message || 'Gagal memuat forum')
      } finally {
        setLoading(false)
      }
    }

    if (isAuthenticated) {
      loadData()
    }
  }, [id, isAuthenticated])

  /**
   * Polling ringan untuk meng-update komentar secara otomatis tanpa refresh.
   * Setiap 5 detik akan memanggil `getComments(id)` selama user masih terautentikasi.
   */
  useEffect(() => {
    if (!id || !isAuthenticated) return

    let isCancelled = false

    const refreshComments = async () => {
      try {
        const latest = await getComments(id)
        if (!isCancelled) {
          setComments(latest)
        }
      } catch (err) {
        // diamkan saja; error utama sudah ditangani di loadData
        console.error('Gagal memuat komentar terbaru:', err)
      }
    }

    const intervalId = setInterval(refreshComments, 5000) // setiap 5 detik

    return () => {
      isCancelled = true
      clearInterval(intervalId)
    }
  }, [id, isAuthenticated])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!isAuthenticated) {
      if (onOpenLogin) onOpenLogin()
      return
    }

    if (!content.trim()) return

    try {
      setLoading(true)
      setError('')
      const created = await createComment(id, { content: content.trim() })
      setComments((prev) => [...prev, created])
      setContent('')
      setEditingCommentId(null)
    } catch (err) {
      setError(err.message || 'Gagal menambahkan komentar')
    } finally {
      setLoading(false)
    }
  }

  const toggleExpandComment = (commentId) => {
    setExpandedComments((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }))
  }

  const handleEditComment = (comment) => {
    setEditingCommentId(comment.id)
    setEditCommentContent(comment.content || '')
  }

  const handleDeleteCommentClick = (comment) => {
    setCommentToDelete(comment)
    setShowDeleteCommentConfirm(true)
  }

  const handleDeleteCommentCancel = () => {
    setShowDeleteCommentConfirm(false)
    setCommentToDelete(null)
  }

  const handleDeleteCommentConfirm = async () => {
    if (!commentToDelete) return

    try {
      await deleteComment(commentToDelete.id)
      setComments((prev) => prev.filter((c) => c.id !== commentToDelete.id))
      setShowDeleteCommentConfirm(false)
      setCommentToDelete(null)
    } catch (err) {
      alert(err.message || 'Gagal menghapus komentar')
    }
  }

  // Hanya pembuat forum atau admin yang boleh mengedit forum
  const canEditForum = forum && (forum.user_id === supabaseUserId || userRole === 'admin')

  const openEditForum = () => {
    if (!forum) return
    setEditTitle(forum.title || '')
    setEditContent(forum.content || '')
    setShowEditForum(true)
  }

  const closeEditForum = () => {
    setShowEditForum(false)
  }

  const handleSaveForum = async (e) => {
    e.preventDefault()
    if (!forum) return
    if (!editTitle.trim() || !editContent.trim()) return

    try {
      setLoading(true)
      setError('')
      const updated = await updateForum(forum.id, {
        title: editTitle.trim(),
        content: editContent.trim(),
      })
      setForum(updated)
      setShowEditForum(false)
    } catch (err) {
      setError(err.message || 'Gagal mengubah forum')
    } finally {
      setLoading(false)
    }
  }

  const handleEditCommentCancel = () => {
    setEditingCommentId(null)
    setEditCommentContent('')
  }

  const handleEditCommentSave = async (e) => {
    e.preventDefault()
    if (!editingCommentId) return
    if (!editCommentContent.trim()) return

    try {
      setLoading(true)
      setError('')
      const updated = await updateComment(editingCommentId, { content: editCommentContent.trim() })
      setComments((prev) => prev.map((c) => (c.id === editingCommentId ? updated : c)))
      setEditingCommentId(null)
      setEditCommentContent('')
    } catch (err) {
      setError(err.message || 'Gagal mengubah komentar')
    } finally {
      setLoading(false)
    }
  }

  /**
   * Blok interaksi saat modal hapus komentar aktif.
   * Mencegah scroll, navigasi keyboard, dan klik di luar modal ketika dialog konfirmasi hapus terbuka.
   */
  useEffect(() => {
    if (!showDeleteCommentConfirm) return

    const preventScroll = (e) => e.preventDefault()
    document.addEventListener('wheel', preventScroll, { passive: false })
    document.addEventListener('touchmove', preventScroll, { passive: false })
    const handleKeyDown = (e) => {
      if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', ' '].includes(e.key)) {
        e.preventDefault()
      }
    }
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
  }, [showDeleteCommentConfirm])

  if (!id) {
    return null
  }

  return (
    <section className="forum-section">
      <div className="forum-container">
        {loading && <p className="forum-loading">Memuat...</p>}
        {error && <p className="forum-alert forum-alert-error">{error}</p>}

        {forum && (
          <article className="forum-card forum-detail-card">
            <div className="forum-back-card">
              <button
                type="button"
                className="forum-link-btn"
                onClick={() => navigate('/forum')}
              >
                Kembali ke forum
              </button>
            </div>

            <div className="forum-topic-card">
              <div className="forum-card-header">
                <div>
                  <h2 className="forum-card-title">{forum.title}</h2>
                  <span className="forum-card-meta">
                    oleh {forum.username || 'Pengguna'}
                    {forum.forum_created_at && (
                      <>
                        {' '}
                        <span>{formatDateTime(forum.forum_created_at)}</span>
                      </>
                    )}
                  </span>
                </div>
                {canEditForum && (
                  <button
                    type="button"
                    className="forum-edit-btn"
                    onClick={openEditForum}
                  >
                    Edit Forum
                  </button>
                )}
              </div>
              <p className="forum-card-content forum-detail-content" style={{ whiteSpace: 'pre-wrap' }}>
                {forum.content}
              </p>
            </div>

            <div className="forum-comments">
              <h3 className="forum-comments-title">Diskusi</h3>
              {comments.length === 0 && !loading && (
                <p className="forum-empty">Belum ada komentar. Jadilah yang pertama berdiskusi.</p>
              )}

              {comments.map((comment) => (
                <div key={comment.id} className="forum-comment-item">
                  <div className="forum-comment-header">
                    <div className="forum-comment-author-wrapper">
                      <span className="forum-comment-author">{comment.username || 'Pengguna'}</span>
                    </div>
                    <div className="forum-comment-meta-right">
                      {comment.comment_created_at && (
                        <span className="forum-comment-time">
                          {formatDateTime(comment.comment_created_at)}
                        </span>
                      )}
                      {isAuthenticated && (comment.user_id === supabaseUserId || userRole === 'admin') && (
                        <div className="forum-comment-actions">
                          <button
                            type="button"
                            className="forum-comment-edit"
                            onClick={() => handleEditComment(comment)}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="forum-comment-delete"
                            onClick={() => handleDeleteCommentClick(comment)}
                          >
                            Hapus
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="forum-comment-body">
                    <span className="forum-comment-content-inline">
                      {expandedComments[comment.id]
                        ? comment.content
                        : (comment.content || '').length > 150
                          ? `${comment.content.slice(0, 150)}...`
                          : comment.content}
                    </span>
                  </div>
                  {(comment.content || '').length > 150 && (
                    <button
                      type="button"
                      className="forum-readmore-btn"
                      onClick={() => toggleExpandComment(comment.id)}
                    >
                      {expandedComments[comment.id] ? 'Sembunyikan' : 'Baca selengkapnya'}
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="forum-comments-form">
              <h3 className="forum-form-title">Tambahkan Komentar</h3>
              {!isAuthenticated && (
                <p className="forum-login-hint">
                  Kamu perlu login terlebih dahulu untuk berkomentar.
                </p>
              )}
              <form onSubmit={handleSubmit} className="forum-form">
                <textarea
                  placeholder="Tulis komentar kamu di sini..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="forum-textarea"
                  rows={3}
                />
                <button type="submit" className="forum-submit-btn" disabled={loading}>
                  {loading ? 'Mengirim...' : 'Kirim Komentar'}
                </button>
              </form>
            </div>
          </article>
        )}

        {showEditForum && (
          <div className="logout-modal-backdrop">
            <div className="logout-modal">
              <h3 className="logout-modal-title">Edit Forum</h3>
              <form onSubmit={handleSaveForum} className="forum-form">
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
                    onClick={closeEditForum}
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

        {/* Edit Comment Modal - sama gaya dengan edit forum */}
        {editingCommentId && (
          <div className="logout-modal-backdrop">
            <div className="logout-modal">
              <h3 className="logout-modal-title">Edit Komentar</h3>
              <form onSubmit={handleEditCommentSave} className="forum-form">
                <textarea
                  className="forum-textarea"
                  rows={4}
                  placeholder="Ubah komentar kamu"
                  value={editCommentContent}
                  onChange={(e) => setEditCommentContent(e.target.value)}
                />
                <div className="logout-modal-actions">
                  <button
                    type="button"
                    className="logout-cancel-btn"
                    onClick={handleEditCommentCancel}
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

        {/* Delete Comment Modal - reuse styling seperti hapus forum */}
        {showDeleteCommentConfirm && (
          <div
            className="forum-delete-modal-backdrop"
            onClick={(e) => e.preventDefault()}
            onWheel={(e) => e.preventDefault()}
            onTouchMove={(e) => e.preventDefault()}
            onPointerDown={(e) => e.preventDefault()}
          >
            <div
              className="forum-delete-modal"
              onClick={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
            >
              <h3 className="forum-delete-modal-title">Hapus Komentar?</h3>
              <p className="forum-delete-modal-text">
                Kamu yakin ingin menghapus komentar ini? Tindakan ini tidak dapat dibatalkan.
              </p>
              <div className="forum-delete-modal-actions">
                <button
                  type="button"
                  className="forum-delete-cancel-btn"
                  onClick={handleDeleteCommentCancel}
                  onMouseDown={(e) => e.preventDefault()}
                >
                  Tidak
                </button>
                <button
                  type="button"
                  className="forum-delete-confirm-btn"
                  onClick={handleDeleteCommentConfirm}
                  onMouseDown={(e) => e.preventDefault()}
                >
                  Ya, Hapus
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

export default ForumDetailSection
