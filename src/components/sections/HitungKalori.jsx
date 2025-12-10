import { useOutletContext } from 'react-router-dom'
import { useHitungKalori } from '../../hooks/useHitungKalori.js'
import './HitungKalori.css'

/**
 * Halaman utama untuk fitur pencatatan dan perhitungan kalori.
 * Menggabungkan calendar, input makanan, dan ringkasan nutrisi/target.
 *
 * Komponen ini menggunakan `useHitungKalori` untuk mendapatkan semua state dan handler
 * yang diperlukan (calendar, autocomplete, logs, nutrition). Jika pengguna belum login,
 * ia akan menampilkan state terkunci dengan tombol untuk membuka dialog login.
 */
function HitungKalori() {
  const { userEmail, supabaseUserId, onOpenLogin, isAuthenticated } = useOutletContext()
  const {
    foodName,
    setFoodName,
    calories,
    setCalories,
    calorieEntriesByDate,
    currentMonth,
    selectedDate,
    setSelectedDate,
    autoFood,
    autoFillLoading,
    autoFillError,
    foodSuggestions,
    suggestionsLoading,
    dailyNutrition,
    dailyTarget,
    targetInput,
    setTargetInput,
    savingTarget,
    handleAddEntry,
    handleDeleteEntry,
    getTotalCalories,
    getMonthlyCalories,
    getMonthInfo,
    buildCalendarDays,
    handlePrevMonth,
    handleNextMonth,
    isSameDate,
    handleSelectSuggestion,
    handleAutoFillCalories,
    handleSaveTarget,
  } = useHitungKalori({ supabaseUserId, userEmail, isAuthenticated, onOpenLogin })

  const monthFormatter = new Intl.DateTimeFormat('id-ID', {
    month: 'long',
    year: 'numeric',
  })

  const weekdayNames = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min']

  // Locked state when not logged in
  if (!isAuthenticated || !userEmail) {
    return (
      <section id="hitung" className="hitung-section">
        <div className="hitung-container">
          <h2 className="hitung-title">Hitung Kalori</h2>
          <p className="hitung-description">
            Catat asupan kalori harian Anda
          </p>

          <div className="locked-state">
            <div className="lock-icon">🔒</div>
            <h3 className="locked-title">Fitur Terkunci</h3>
            <p className="locked-description">
              Anda harus login terlebih dahulu untuk menggunakan fitur pencatatan kalori harian.
            </p>
            <button onClick={onOpenLogin} className="btn-login-prompt">
              Login Sekarang
            </button>
          </div>
        </div>
      </section>
    )
  }

  // Active state when logged in
  return (
    <section id="hitung" className="hitung-section">
      <div className="hitung-container">
        <div className="hitung-header">
          <h2 className="hitung-title">Hitung Kalori</h2>
          <p className="hitung-description">
            Catat asupan kalori harian Anda untuk tanggal yang dipilih di kalender.
          </p>
        </div>

        <div className="hitung-layout">
          <div className="calendar-column">
            <div className="calendar-container">
              <div className="calendar-header">
                <button
                  type="button"
                  className="calendar-nav-button"
                  onClick={handlePrevMonth}
                >
                  &#9664;
                </button>
                <div className="calendar-title">
                  {monthFormatter.format(currentMonth)}
                </div>
                <button
                  type="button"
                  className="calendar-nav-button"
                  onClick={handleNextMonth}
                >
                  &#9654;
                </button>
              </div>
              <div className="calendar-grid">
              {buildCalendarDays().map((date, index) => {
                if (!date) {
                  return <div key={`empty-${index}`} className="calendar-cell empty" />
                }

                const isToday = isSameDate(date, new Date())
                const isSelected = isSameDate(date, selectedDate)

                const dateKey = date.toISOString().split('T')[0]
                const hasEntries = (calorieEntriesByDate[dateKey] || []).length > 0

                const classNames = [
                  'calendar-cell',
                  isToday ? 'today' : '',
                  isSelected ? 'selected' : '',
                  hasEntries ? 'has-entries' : '',
                ]
                  .filter(Boolean)
                  .join(' ')

                return (
                  <button
                    key={date.toISOString()}
                    type="button"
                    className={classNames}
                    onClick={() => setSelectedDate(date)}
                  >
                    {date.getDate()}
                  </button>
                )
              })}
              </div>
            </div>
            <div className="summary-card summary-card-nutrition">
              <span className="summary-label">Ringkasan Nutrisi Hari Ini</span>
              <span className="summary-unit">
                Protein: {dailyNutrition.protein.toFixed(1)} g
              </span>
              <span className="summary-unit">
                Karbohidrat: {dailyNutrition.carbs.toFixed(1)} g
              </span>
              <span className="summary-unit">
                Lemak: {dailyNutrition.fat.toFixed(1)} g
              </span>
              <hr style={{ margin: '10px 0', borderColor: '#ecfdf5' }} />
              <span className="summary-unit">
                Target kalori harian:{' '}
                {dailyTarget != null ? `${dailyTarget} kkal` : 'belum diatur'}
              </span>
              {dailyTarget != null && dailyTarget > 0 && (
                <span className="summary-unit">
                  Progress hari ini: {Math.min(100, Math.round((getTotalCalories() / dailyTarget) * 100))}%
                </span>
              )}
              <form onSubmit={handleSaveTarget} style={{ marginTop: '8px' }}>
                <input
                  type="number"
                  min="0"
                  step="50"
                  placeholder="Target kkal/hari"
                  value={targetInput}
                  onChange={(e) => setTargetInput(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '6px 8px',
                    borderRadius: '6px',
                    border: '1px solid #e5e7eb',
                    fontSize: '0.85rem',
                    marginBottom: '6px',
                  }}
                />
                <button
                  type="submit"
                  disabled={savingTarget}
                  style={{
                    width: '100%',
                    padding: '6px 8px',
                    borderRadius: '6px',
                    border: 'none',
                    background: '#10b981',
                    color: '#fff',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                  }}
                >
                  {savingTarget ? 'Menyimpan...' : 'Simpan Target'}
                </button>
              </form>
            </div>
            <div className="tracker-summary tracker-summary-calendar">
              <div className="summary-card">
                <span className="summary-label">Total Kalori Hari Ini</span>
                <span className="summary-value">{getTotalCalories()}</span>
                <span className="summary-unit">kkal</span>
              </div>
              <div className="summary-card summary-card-monthly">
                <span className="summary-label">Total Kalori Bulan Ini</span>
                <span className="summary-value">{getMonthlyCalories()}</span>
                <span className="summary-unit">kkal</span>
              </div>
            </div>
          </div>

          <div className="calorie-tracker">
            <form onSubmit={handleAddEntry} className="calorie-form">
              <h3 className="form-title">Tambah Makanan</h3>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="foodName">Nama Makanan</label>
                  <input
                    type="text"
                    id="foodName"
                    value={foodName}
                    onChange={(e) => setFoodName(e.target.value)}
                    placeholder="Contoh: Nasi Goreng"
                    required
                  />
                  {foodSuggestions.length > 0 && (
                    <div className="food-suggestions">
                      {foodSuggestions.map((food) => (
                        <button
                          key={food.id}
                          type="button"
                          className="food-suggestion-item"
                          onClick={() => handleSelectSuggestion(food)}
                        >
                          <span className="food-suggestion-name">{food.name}</span>
                          {food.calories != null && (
                            <span className="food-suggestion-calories">{food.calories} kkal</span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                  {autoFood && (
                    <p className="auto-fill-info">
                      Menggunakan data: {autoFood.name} ({autoFood.calories} kkal)
                    </p>
                  )}
                  {autoFillError && (
                    <p className="auto-fill-error">{autoFillError}</p>
                  )}
                </div>
                <div className="form-group">
                  <label htmlFor="calories">Kalori (kkal)</label>
                  <input
                    type="number"
                    id="calories"
                    value={calories}
                    onChange={(e) => setCalories(e.target.value)}
                    placeholder="Contoh: 300"
                    min="1"
                    step="1"
                    required
                  />
                </div>
              </div>
              <button type="submit" className="btn-add-entry">
                ➕ Tambah
              </button>
            </form>

            <div className="entries-section">
              <h3 className="entries-title">Riwayat untuk Tanggal Ini</h3>
              {(calorieEntriesByDate[selectedDate.toISOString().split('T')[0]] || []).length === 0 ? (
                <div className="empty-state">
                  <p>Belum ada catatan makanan untuk tanggal ini</p>
                </div>
              ) : (
                <div className="entries-list">
                  {(
                    calorieEntriesByDate[selectedDate.toISOString().split('T')[0]] || []
                  ).map((entry) => (
                    <div key={entry.id} className="entry-item">
                      <div className="entry-info">
                        <span className="entry-name">{entry.foodName}</span>
                        <span className="entry-time">{entry.time}</span>
                      </div>
                      <div className="entry-actions">
                        <span className="entry-calories">{entry.calories} kkal</span>
                        <button
                          onClick={() => handleDeleteEntry(entry.id)}
                          className="btn-delete"
                          aria-label="Hapus"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HitungKalori