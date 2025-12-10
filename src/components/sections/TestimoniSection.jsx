import { useState, useEffect } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'
import './TestimoniSection.css'


/**
 * Komponen untuk menampilkan daftar testimoni dari database.
 *
 * @component
 * @returns {JSX.Element} Section testimoni dengan carousel 3 card per halaman
 *
 * @description
 * Komponen ini menampilkan:
 * - Testimoni dari database
 * - Carousel dengan 3 card per halaman
 * - Tombol Next/Back untuk navigasi antar halaman
 * - Button untuk menambah testimoni (dengan login prompt jika belum authenticated)
 * - Auto-refresh saat testimoni baru ditambahkan
 * - Loading state dan error handling
 *
 * @example
 * // Di halaman utama
 * <TestimoniSection />
 */
function TestimoniSection() {
  const navigate = useNavigate()
  const { isAuthenticated, onOpenLogin } = useOutletContext()
  const [testimonials, setTestimonials] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(0)
  const itemsPerPage = 3

  /**
   * Fetch testimoni dari API backend
   * @async
   */
  const fetchTestimonials = async () => {
    try {
      const apiUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'
      const response = await fetch(`${apiUrl}/api/testimonials`)

      if (!response.ok) throw new Error('Gagal mengambil testimoni')

      const data = await response.json()
      setTestimonials(data || [])
    } catch (err) {
      setTestimonials([])
    } finally {
      setLoading(false)
    }
  }

  /**
   * Handle klik tombol tambah testimoni
   */
  const handleAddTestimoni = () => {
    if (!isAuthenticated) {
      onOpenLogin()
    } else {
      navigate('/testimoni')
    }
  }

  /**
   * Handle klik tombol next untuk halaman berikutnya
   */
  const handleNext = () => {
    const maxPage = Math.ceil(displayTestimonials.length / itemsPerPage) - 1
    if (currentPage < maxPage) {
      setCurrentPage(currentPage + 1)
    }
  }

  /**
   * Handle klik tombol back untuk halaman sebelumnya
   */
  const handleBack = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1)
    }
  }

  // Fetch testimoni saat komponen pertama kali mount.
  // Memuat daftar testimoni dari backend dan mengisi state `testimonials`.
  useEffect(() => {
    fetchTestimonials()
  }, [])

  // Listen untuk event custom `testimoniAdded` pada window.
  // Event ini dipicu oleh komponen AddTestimoni setelah submit sukses,
  // sehingga daftar testimoni akan direfresh otomatis.
  useEffect(() => {
    window.addEventListener('testimoniAdded', fetchTestimonials)
    return () => window.removeEventListener('testimoniAdded', fetchTestimonials)
  }, [])

  const displayTestimonials = testimonials
  const startIndex = currentPage * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentTestimonials = displayTestimonials.slice(startIndex, endIndex)
  const totalPages = Math.ceil(displayTestimonials.length / itemsPerPage)
  const showNavigation = displayTestimonials.length > itemsPerPage

  return (
    <section className="testimoni-section">
      <div className="testimoni-container">
        <div className="testimoni-header">
          <h2 className="testimoni-title">Apa Kata Pengguna Kami</h2>
          <p className="testimoni-subtitle">
            Beberapa cerita dari mereka yang sudah memulai hidup sehat bersama PiringSehat.
          </p>
        </div>

        {loading ? (
          <div className="testimoni-loading">
            <p>Memuat testimoni...</p>
          </div>
        ) : (
          <>
            <div className="testimoni-carousel-wrapper">
              <div className="testimoni-grid">
                {currentTestimonials.map((item) => (
                  <article key={item.id || item.username} className="testimoni-card">
                    <p className="testimoni-quote">"{item.message || item.quote}"</p>
                    <div className="testimoni-user">
                      <div className="avatar-placeholder">
                        {(item.username || item.name).charAt(0).toUpperCase()}
                      </div>
                      <div className="testimoni-user-info">
                        <span className="testimoni-name">{item.username || item.name}</span>
                        <span className="testimoni-role">{item.job || item.role}</span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              {showNavigation && (
                <div className="testimoni-navigation">
                  <button 
                    className="btn-nav btn-back"
                    onClick={handleBack}
                    disabled={currentPage === 0}
                    aria-label="Testimoni sebelumnya"
                  >
                    ←
                  </button>
                  <span className="page-indicator">
                    {currentPage + 1} / {totalPages}
                  </span>
                  <button 
                    className="btn-nav btn-next"
                    onClick={handleNext}
                    disabled={currentPage === totalPages - 1}
                    aria-label="Testimoni berikutnya"
                  >
                    →
                  </button>
                </div>
              )}
            </div>

            <div className="testimoni-cta">
              <button 
                className="btn-tambah-testimoni"
                onClick={handleAddTestimoni}
              >
                ✍️ Bagikan Testimoni Anda
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  )
}

export default TestimoniSection