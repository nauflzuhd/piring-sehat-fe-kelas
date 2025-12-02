import { useState, useEffect } from 'react'
import './CariMakanan.css'
import { searchFoodsByName } from '../../services/makananService'

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

function CariMakanan() {
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('') // 🆕 DEBOUNCE STATE
  const [allFoods, setAllFoods] = useState([])
  const [groupedFoods, setGroupedFoods] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedLetter, setSelectedLetter] = useState('A')


  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 300)

    return () => clearTimeout(timeout)
  }, [searchTerm])

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

  const fetchDebouncedFoods = async () => {
    try {
      setIsLoading(true)
      setError('')

      const results = await searchFoodsByName(debouncedSearchTerm, 100)
      setAllFoods(results)
      groupFoodsByLetter(results)
    } catch (err) {
      console.error('Gagal mencari makanan:', err)
      setError('Gagal mencari makanan. Silakan coba lagi.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (debouncedSearchTerm.trim() === '') {
      loadAllFoods()
    } else {
      fetchDebouncedFoods()
    }
  }, [debouncedSearchTerm])

  const handleSearch = (e) => {
    e.preventDefault()
  }

  return (
    <div className="cari-background">
      <section id="cari" className="cari-section">
        <div className="cari-container">
          <h2 className="cari-title">Cari Makanan</h2>
          <p className="cari-description">
            Cari informasi nutrisi dari berbagai jenis makanan
          </p>

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
            {LETTERS.map((letter) => (
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
                      {(food.image_url || food.image) && (
                        <img src={food.image_url || food.image} alt={food.name} className="food-item-image" />
                      )}
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
        </div>
      </section>
    </div>
  )
}

export default CariMakanan
