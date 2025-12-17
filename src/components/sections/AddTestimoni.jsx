import { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import { createTestimoni, fetchUserTestimonials } from '../../services/testimoniService'
import './AddTestimoni.css'

/**
 * Komponen form untuk menambahkan testimoni baru dari user yang sudah login.
 *
 * @component
 * @returns {JSX.Element} Form testimoni atau prompt login jika belum authenticated
 *
 * @description
 * Komponen ini menyediakan form untuk user menambahkan testimoni dengan:
 * - Username otomatis dari akun user (read-only)
 * - Input pekerjaan/profesi (max 50 karakter)
 * - Input pesan testimoni (min 10, max 500 karakter)
 * - Validasi form sebelum submit
 * - Feedback visual (loading, error, success)
 * - Event dispatch untuk refresh testimoni di halaman utama
 *
 * @example
 * // Di dalam route /testimoni
 * <AddTestimoni />
 */
function AddTestimoni() {
  const context = useOutletContext()
  const { username, supabaseUserId, isAuthenticated, onOpenLogin } = context || {}
  
  const [formData, setFormData] = useState({ job: '', message: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [alreadySubmitted, setAlreadySubmitted] = useState(false)

  useEffect(() => {
    const checkExistingTestimoni = async () => {
      if (!supabaseUserId) return

      try {
        const testimonials = await fetchUserTestimonials(supabaseUserId)
        if (testimonials && testimonials.length > 0) {
          setAlreadySubmitted(true)
        }
      } catch (err) {
        // Jika gagal cek, kita biarkan user tetap bisa mencoba isi form
        console.error('Gagal mengecek testimoni user:', err)
      }
    }

    checkExistingTestimoni()
  }, [supabaseUserId])

  /**
   * Handle perubahan input form
   * @param {React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement>} e - Event dari input
   */
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (error) setError('')
  }

  if (alreadySubmitted) {
    return (
      <section className="add-testimoni-section">
        <div className="add-testimoni-container">
          <div className="add-testimoni-header">
            <h2 className="add-testimoni-title">Terima Kasih atas Testimoni Anda</h2>
            <p className="add-testimoni-subtitle">
              Anda sudah pernah mengirim testimoni. Satu user hanya dapat mengirim satu testimoni.
            </p>
          </div>
        </div>
      </section>
    )
  }

  /**
   * Handle submit form testimoni
   * @async
   * @param {React.FormEvent<HTMLFormElement>} e - Event dari form submit
   */
  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validasi input
    if (!formData.job.trim()) {
      setError('Pekerjaan tidak boleh kosong')
      return
    }
    if (!formData.message.trim()) {
      setError('Pesan testimoni tidak boleh kosong')
      return
    }
    if (formData.message.trim().length < 10) {
      setError('Pesan testimoni minimal 10 karakter')
      return
    }

    setLoading(true)
    setError('')

    try {
      await createTestimoni({
        username,
        job: formData.job.trim(),
        message: formData.message.trim(),
      })

      setSuccess(true)
      setFormData({ job: '', message: '' })
      window.dispatchEvent(new Event('testimoniAdded'))

      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      const errorMsg = err.message || 'Terjadi kesalahan saat menambahkan testimoni'
      setError(errorMsg.includes('Failed to fetch') 
        ? 'Server tidak terhubung. Pastikan server backend sudah berjalan'
        : errorMsg
      )
    } finally {
      setLoading(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <section className="add-testimoni-section">
        <div className="add-testimoni-container">
          <div className="add-testimoni-header">
            <h2 className="add-testimoni-title">Bagikan Testimoni Anda</h2>
            <p className="add-testimoni-subtitle">
              Ceritakan pengalaman Anda menggunakan PiringSehat
            </p>
          </div>
          
          <div className="login-prompt">
            <p>Silakan login terlebih dahulu untuk menambahkan testimoni</p>
            <button 
              className="btn-login-prompt"
              onClick={onOpenLogin}
            >
              Login Sekarang
            </button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="add-testimoni-section">
      <div className="add-testimoni-container">
        <div className="add-testimoni-header">
          <h2 className="add-testimoni-title">Bagikan Testimoni Anda</h2>
          <p className="add-testimoni-subtitle">
            Ceritakan pengalaman Anda menggunakan PiringSehat
          </p>
        </div>

        <form onSubmit={handleSubmit} className="testimoni-form">
          {/* Username field - read only */}
          <div className="form-group">
            <label htmlFor="username" className="form-label">Username</label>
            <input
              type="text"
              id="username"
              value={username || ''}
              placeholder="Memuat username..."
              disabled
              className="form-input form-input-disabled"
            />
            <small className="form-help">Username dari akun Anda</small>
          </div>

          {/* Job field */}
          <div className="form-group">
            <label htmlFor="job" className="form-label">Pekerjaan / Profesi</label>
            <input
              type="text"
              id="job"
              name="job"
              value={formData.job}
              onChange={handleChange}
              placeholder="Contoh: Mahasiswa, Developer, Dokter, dll"
              className="form-input"
              maxLength={50}
            />
            <small className="form-help">{formData.job.length}/50 karakter</small>
          </div>

          {/* Message field */}
          <div className="form-group">
            <label htmlFor="message" className="form-label">Pesan Testimoni</label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Bagikan pengalaman Anda menggunakan PiringSehat..."
              className="form-textarea"
              rows={5}
              maxLength={500}
            />
            <small className="form-help">{formData.message.length}/500 karakter</small>
          </div>

          {/* Error message */}
          {error && (
            <div className="alert alert-error">
              <span className="alert-icon">⚠️</span>
              {error}
            </div>
          )}

          {/* Success message */}
          {success && (
            <div className="alert alert-success">
              <span className="alert-icon">✓</span>
              Testimoni berhasil ditambahkan! Terima kasih atas dukungan Anda.
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="btn-submit"
          >
            {loading ? 'Mengirim...' : 'Kirim Testimoni'}
          </button>
        </form>
      </div>
    </section>
  )
}

export default AddTestimoni
