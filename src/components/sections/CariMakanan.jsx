import { useState, useEffect, useRef } from 'react'

import { useOutletContext } from 'react-router-dom'
import './CariMakanan.css'
import bgCari from "../../assets/new-logo.png";
import notFoundImage from "../../assets/notfound.png";

import { searchFoodsByName, createFood } from '../../services/makananService'

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

/**
 * Halaman pencarian makanan.
 * Menyediakan pencarian dengan debounce, navigasi huruf, dan pengelompokan hasil berdasarkan huruf pertama.
 *
 * - `searchTerm` dipakai untuk input pengguna, dan `debouncedSearchTerm` untuk menunda pemanggilan API.
 * - Saat tidak ada query, komponen memuat daftar makanan lengkap (limit tertentu) lalu mengelompokkannya.
 */
function CariMakanan() {

  const [searchTerm, setSearchTerm] = useState('')

  const [allFoods, setAllFoods] = useState([])
  const [groupedFoods, setGroupedFoods] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedLetter, setSelectedLetter] = useState('A')
  const [isAddFoodModalOpen, setIsAddFoodModalOpen] = useState(false)

  const [newFood, setNewFood] = useState({
    name: '',
    calories: '',
    proteins: '',
    carbohydrate: '',
    fat: '',
    image_url: '',
  })

  const { userRole, isAuthenticated } = useOutletContext() || {}
  const isAdmin = isAuthenticated && userRole === 'admin'

  const nameInputRef = useRef(null)

  // Kunci scroll halaman ketika modal tambah makanan terbuka
  useEffect(() => {
    const originalOverflow = document.body.style.overflow

    const preventScroll = (e) => {
      e.preventDefault()
    }

    if (isAddFoodModalOpen) {
      // Fokuskan ke input nama makanan ketika modal dibuka
      if (nameInputRef.current && typeof nameInputRef.current.focus === 'function') {
        nameInputRef.current.focus()
      }

      // Scroll ke tengah modal ketika pertama kali dibuka
      setTimeout(() => {
        const modalEl = document.querySelector('.modal')

        if (modalEl && typeof modalEl.scrollIntoView === 'function') {
          modalEl.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      }, 0)

      // Kunci scroll via CSS dan event (mirip dengan mobile menu di Navbar)
      document.body.style.overflow = 'hidden'
      document.addEventListener('wheel', preventScroll, { passive: false })

      document.addEventListener('touchmove', preventScroll, { passive: false })
    } else {
      document.body.style.overflow = originalOverflow || ''
    }

    return () => {
      document.body.style.overflow = originalOverflow || ''
      document.removeEventListener('wheel', preventScroll)
      document.removeEventListener('touchmove', preventScroll)
    }
  }, [isAddFoodModalOpen])

  // Load awal semua makanan (hingga limit tertentu) saat komponen pertama kali mount,
  // lalu mengelompokkannya berdasarkan huruf pertama.
  useEffect(() => {
    loadAllFoods()
  }, [])

  const loadAllFoods = async () => {
    try {
      setIsLoading(true)
      setError('')
      const results = await searchFoodsByName('', 1000)
      setAllFoods(results)
      groupFoodsByLetter(results)
    } catch (err) {
      console.error('Gagal memuat makanan:', err)
      setError('Gagal memuat data makanan: ' + err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const groupFoodsByLetter = (foods) => {
    const grouped = {}
    
    foods.forEach((food) => {
      const firstLetter = (food.name || '').charAt(0).toUpperCase()
      if (!grouped[firstLetter]) {
        grouped[firstLetter] = []
      }
      grouped[firstLetter].push(food)
    })

    setGroupedFoods(grouped)
    const firstAvailableLetter = Object.keys(grouped).sort()[0]
    if (firstAvailableLetter) {
      setSelectedLetter(firstAvailableLetter)
    }
  }

  const getAvailableLetters = () => {
    return Object.keys(groupedFoods).sort()
  }

  const handleSearch = (e) => {
    e.preventDefault()
    const term = searchTerm.trim()

    if (term === '') {
      // Jika input kosong, muat ulang semua makanan
      loadAllFoods()
      return
    }

    ;(async () => {
      try {
        setIsLoading(true)
        setError('')
        const results = await searchFoodsByName(term, 100)
        setAllFoods(results)
        groupFoodsByLetter(results)
      } catch (err) {
        console.error('Gagal mencari makanan:', err)
        setError('Gagal mencari makanan. Silakan coba lagi.')
      } finally {
        setIsLoading(false)
      }
    })()
  }

  const handleOpenAddFoodModal = () => {
    setIsAddFoodModalOpen(true)
  }

  const handleCloseAddFoodModal = () => {
    setIsAddFoodModalOpen(false)
    setNewFood({
      name: '',
      calories: '',
      proteins: '',
      carbohydrate: '',
      fat: '',
      image_url: '',
    })
  }

  const handleChangeNewFood = (e) => {
    const { name, value } = e.target
    setNewFood((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleNumericKeyDown = (e) => {
    if (['e', 'E', '+', '-'].includes(e.key)) {
      e.preventDefault()
    }
  }

  const handleSubmitNewFood = async (e) => {
    e.preventDefault()

    try {
      setIsLoading(true)
      setError('')

      await createFood(newFood)

      // Setelah berhasil, refresh data makanan dan tutup modal
      await loadAllFoods()
      handleCloseAddFoodModal()
    } catch (err) {
      console.error('Gagal menambah makanan baru:', err)
      setError(err.message || 'Gagal menambah makanan baru')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="cari-background">
      <section id="cari" className="cari-section">
        <div className="cari-container">
          <h2 className="cari-title">Cari Makanan</h2>
          <p className="cari-description">
            Cari informasi nutrisi dari berbagai jenis makanan
          </p>

          {isAdmin && (
            <div className="add-food-container">
              <button
                type="button"
                className="add-food-button"
                onClick={handleOpenAddFoodModal}
              >
                + Tambah Makanan Baru
              </button>
            </div>
          )}

          <form onSubmit={handleSearch} className="search-form">
            <div className="search-box">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari Makanan"
                className="search-input"
              />
              <button type="submit" className="search-button" disabled={isLoading}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="m21 21-4.35-4.35"></path>
                </svg>
              </button>
            </div>
          </form>

          {error && <div className="error-message">{error}</div>}

          {/* Letter Navigation */}
          <div className="letter-navigation">
            {getAvailableLetters().map((letter) => (
              <button
                key={letter}
                className={`letter-btn ${selectedLetter === letter ? 'active' : ''}`}
                onClick={() => setSelectedLetter(letter)}
              >
                {letter}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>Memuat data makanan...</div>
          ) : (
            <div className="foods-container">
              <h3 className="foods-letter-title">{selectedLetter}</h3>
              <div className="foods-list">
                {groupedFoods[selectedLetter] && groupedFoods[selectedLetter].length > 0 ? (
                  groupedFoods[selectedLetter].map((food) => (
                    <div key={food.id} className="food-item">
                      <img
                        src={food.image_url || food.image || notFoundImage}
                        alt={food.name}
                        className="food-item-image"
                        onError={(e) => {
                          if (e.target.src !== notFoundImage) {
                            e.target.src = notFoundImage
                          }
                        }}
                      />

                      <div className="food-item-content">
                        <h4>{food.name}</h4>
                        <div className="food-item-info">
                          {food.calories && <span className="info-badge">Kalori: {food.calories} kkal</span>}
                          {(food.proteins || food.protein) && <span className="info-badge">Protein: {food.proteins || food.protein}g</span>}
                          {(food.carbohydrate || food.carbs) && <span className="info-badge">Karbo: {food.carbohydrate || food.carbs}g</span>}
                          {food.fat && <span className="info-badge">Lemak: {food.fat}g</span>}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p style={{ textAlign: 'center', padding: '20px' }}>Tidak ada data untuk huruf {selectedLetter}</p>
                )}
              </div>
            </div>
          )}
          {isAdmin && isAddFoodModalOpen && (
            <div className="modal-overlay" role="dialog" aria-modal="true">
              <div className="modal">
                <h3 className="modal-title">Tambah Makanan Baru</h3>
                <form className="modal-form" onSubmit={handleSubmitNewFood}>
                  <div className="modal-form-group">
                    <label htmlFor="name">Nama Makanan</label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      ref={nameInputRef}
                      autoFocus
                      value={newFood.name}
                      onChange={handleChangeNewFood}
                      required
                    />
                  </div>

                  <div className="modal-form-grid">
                    <div className="modal-form-group">
                      <label htmlFor="calories">Kalori (kkal)</label>
                      <input
                        id="calories"
                        name="calories"
                        type="number"
                        min="0"
                        step="0.1"
                        onKeyDown={handleNumericKeyDown}
                        value={newFood.calories}
                        onChange={handleChangeNewFood}
                        required
                      />
                    </div>
                    <div className="modal-form-group">
                      <label htmlFor="proteins">Protein (g)</label>
                      <input
                        id="proteins"
                        name="proteins"
                        type="number"
                        min="0"
                        step="0.1"
                        onKeyDown={handleNumericKeyDown}
                        value={newFood.proteins}
                        onChange={handleChangeNewFood}
                      />
                    </div>
                  </div>

                  <div className="modal-form-grid">
                    <div className="modal-form-group">
                      <label htmlFor="carbohydrate">Karbohidrat (g)</label>
                      <input
                        id="carbohydrate"
                        name="carbohydrate"
                        type="number"
                        min="0"
                        step="0.1"
                        onKeyDown={handleNumericKeyDown}
                        value={newFood.carbohydrate}
                        onChange={handleChangeNewFood}
                      />
                    </div>
                    <div className="modal-form-group">
                      <label htmlFor="fat">Lemak (g)</label>
                      <input
                        id="fat"
                        name="fat"
                        type="number"
                        min="0"
                        step="0.1"
                        onKeyDown={handleNumericKeyDown}
                        value={newFood.fat}
                        onChange={handleChangeNewFood}
                      />
                    </div>
                  </div>

                  <div className="modal-form-group">
                    <label htmlFor="image_url">URL Gambar (opsional)</label>
                    <input
                      id="image_url"
                      name="image_url"
                      type="url"
                      value={newFood.image_url}
                      onChange={handleChangeNewFood}
                      placeholder="https://contoh.com/gambar.jpg"
                    />
                  </div>

                  <div className="modal-actions">
                    <button
                      type="button"
                      className="modal-button secondary"
                      onClick={handleCloseAddFoodModal}
                    >
                      Batal
                    </button>
                    <button type="submit" className="modal-button primary">
                      Simpan
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

export default CariMakanan