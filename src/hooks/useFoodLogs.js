import { useState, useEffect } from 'react'
import { addFoodLog, getFoodLogsByDate, getTotalCaloriesInRange, deleteFoodLog } from '../services/foodLogService'

/**
 * Hook untuk mengelola catatan makanan (food logs) per tanggal dan ringkasan bulanan.
 *
 * @param {object} params Parameter input hook.
 * @param {string|null|undefined} params.supabaseUserId ID pengguna dari Supabase.
 * @param {Date} params.selectedDate Tanggal yang sedang dipilih.
 * @param {object|null} params.autoFood Objek makanan yang terisi otomatis (bila ada).
 * @param {string} params.foodName Nama makanan yang diinput pengguna.
 * @param {string|number} params.calories Nilai kalori yang diinput pengguna.
 * @param {function} params.setFoodName Setter untuk `foodName`.
 * @param {function} params.setCalories Setter untuk `calories`.
 * @param {function} params.getMonthInfo Helper dari calendar untuk membuat rentang bulan.
 * @returns {object} API untuk mengelola food logs (tambah/hapus, total harian, total bulanan).
 *
 * Hook ini bertanggung jawab memuat dan menyimpan catatan kalori dari service,
 * serta meng-update state lokal setelah operasi CRUD agar UI langsung merefleksikan perubahan.
 */
export function useFoodLogs({ supabaseUserId, selectedDate, autoFood, foodName, calories, setFoodName, setCalories, getMonthInfo }) {
  const [calorieEntriesByDate, setCalorieEntriesByDate] = useState({})
  const [monthlyCalories, setMonthlyCalories] = useState(0)

  /**
   * Tambah entri makanan baru.
   * Mencegah default form submit dan memanggil service `addFoodLog`.
   */
  const handleAddEntry = async (e) => {
    e.preventDefault()
    if (!supabaseUserId) return

    if (foodName && calories) {
      const dateKey = selectedDate.toISOString().split('T')[0]

      try {
        const created = await addFoodLog({
          userId: supabaseUserId,
          date: dateKey,
          foodName,
          calories: parseFloat(calories),
          foodId: autoFood ? autoFood.id : null,
        })

        const newEntry = {
          id: created.id,
          foodName: created.food_name_custom || foodName,
          calories: parseFloat(created.calories),
          time: new Date(created.logged_at || new Date()).toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
          }),
        }

        setCalorieEntriesByDate((prev) => {
          const current = prev[dateKey] || []
          return {
            ...prev,
            [dateKey]: [...current, newEntry],
          }
        })
        setFoodName('')
        setCalories('')
      } catch (error) {
        console.error('Gagal menambah catatan kalori:', error)
      }
    }
  }

  /**
   * Hapus entri makanan berdasarkan id.
   * @param {string|number} id ID entri yang akan dihapus.
   */
  const handleDeleteEntry = async (id) => {
    const dateKey = selectedDate.toISOString().split('T')[0]

    try {
      await deleteFoodLog(id)

      setCalorieEntriesByDate((prev) => {
        const current = prev[dateKey] || []
        return {
          ...prev,
          [dateKey]: current.filter((entry) => entry.id !== id),
        }
      })
    } catch (error) {
      console.error('Gagal menghapus catatan kalori:', error)
    }
  }

  /**
   * Hitung total kalori untuk tanggal yang sedang dipilih.
   * @returns {number} Total kalori untuk hari tersebut.
   */
  const getTotalCalories = () => {
    const dateKey = selectedDate.toISOString().split('T')[0]
    const entries = calorieEntriesByDate[dateKey] || []
    return entries.reduce((total, entry) => total + entry.calories, 0)
  }

  /**
   * Ambil total kalori bulanan yang tersimpan di state.
   * @returns {number}
   */
  const getMonthlyCalories = () => {
    return monthlyCalories
  }

  useEffect(() => {
    const loadEntries = async () => {
      if (!supabaseUserId) return

      const dateKey = selectedDate.toISOString().split('T')[0]

      try {
        const logs = await getFoodLogsByDate(supabaseUserId, dateKey)

        const entries = logs.map((log) => ({
          id: log.id,
          foodName: log.food_name_custom,
          calories: parseFloat(log.calories),
          time: new Date(log.logged_at || new Date()).toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
          }),
        }))

        setCalorieEntriesByDate((prev) => ({
          ...prev,
          [dateKey]: entries,
        }))
      } catch (error) {
        console.error('Gagal memuat catatan kalori:', error)
      }
    }

    loadEntries()
  }, [selectedDate, supabaseUserId])

  useEffect(() => {
    const loadMonthlyTotal = async () => {
      if (!supabaseUserId) return

      const { year, month } = getMonthInfo(selectedDate)
      const startDate = new Date(year, month, 1).toISOString().split('T')[0]
      const endDate = new Date(year, month + 1, 0).toISOString().split('T')[0]

      try {
        const total = await getTotalCaloriesInRange(supabaseUserId, startDate, endDate)
        setMonthlyCalories(total)
      } catch (error) {
        console.error('Gagal memuat total kalori bulanan:', error)
      }
    }

    loadMonthlyTotal()
  }, [selectedDate, supabaseUserId, getMonthInfo])

  return {
    calorieEntriesByDate,
    monthlyCalories,
    handleAddEntry,
    handleDeleteEntry,
    getTotalCalories,
    getMonthlyCalories,
  }
}