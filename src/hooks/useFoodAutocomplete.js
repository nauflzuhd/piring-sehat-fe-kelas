import { useState, useEffect } from 'react'
import { getFirstFoodByName, searchFoodsByName } from '../services/makananService'

/**
 * Hook untuk fitur autocomplete nama makanan dan pengisian otomatis kalori.
 *
 * @param {{supabaseUserId?: string|null}} params Parameter yang berisi `supabaseUserId`.
 * @returns {object} State dan handler untuk form makanan (nama, kalori, saran, dll).
 *
 * Hook ini mengelola input nama makanan, menampilkan saran berdasarkan query,
 * dan menyediakan fungsi untuk mengisi otomatis nilai kalori dari database.
 */
export function useFoodAutocomplete({ supabaseUserId }) {
  const [foodName, setFoodName] = useState('')
  const [calories, setCalories] = useState('')
  const [autoFood, setAutoFood] = useState(null)
  const [autoFillLoading, setAutoFillLoading] = useState(false)
  const [autoFillError, setAutoFillError] = useState('')
  const [foodSuggestions, setFoodSuggestions] = useState([])
  const [suggestionsLoading, setSuggestionsLoading] = useState(false)

  useEffect(() => {
    let active = true

    const loadSuggestions = async () => {
      const query = foodName.trim()
      if (!query) {
        setFoodSuggestions([])
        return
      }

      try {
        setSuggestionsLoading(true)
        const results = await searchFoodsByName(query, 5)
        if (!active) return
        setFoodSuggestions(results)
      } catch (error) {
        console.error('Gagal memuat saran makanan:', error)
        if (active) setFoodSuggestions([])
      } finally {
        if (active) setSuggestionsLoading(false)
      }
    }

    const timeoutId = setTimeout(() => {
      loadSuggestions()
    }, 300)

    return () => {
      active = false
      clearTimeout(timeoutId)
    }
  }, [foodName])

  /**
   * Handler ketika pengguna memilih salah satu saran makanan.
   * Mengisi `foodName`, `calories`, dan `autoFood` berdasarkan pilihan.
   * @param {object} food Objek makanan yang dipilih (dari service).
   */
  const handleSelectSuggestion = (food) => {
    setFoodName(food.name || '')
    if (food.calories != null) {
      setCalories(String(food.calories))
    }
    setAutoFood(food)
    setAutoFillError('')
    setFoodSuggestions([])
  }

  /**
   * Mengisi otomatis nilai kalori berdasarkan `foodName` saat ini.
   * Memanggil service `getFirstFoodByName` lalu memperbarui state.
   */
  const handleAutoFillCalories = async () => {
    const trimmedFoodName = foodName.trim()
    if (!trimmedFoodName) {
      setAutoFillError('Silakan masukkan nama makanan terlebih dahulu.')
      return
    }
    if (!supabaseUserId) return

    try {
      setAutoFillError('')
      setAutoFillLoading(true)

      const food = await getFirstFoodByName(trimmedFoodName)

      if (!food) {
        setAutoFillError('Makanan tidak ditemukan di database.')
        setAutoFood(null)
        return
      }

      setAutoFood(food)
      if (food.calories != null) {
        setCalories(String(food.calories))
      }
    } catch (error) {
      console.error('Gagal mengisi otomatis dari database:', error)
      setAutoFillError('Terjadi kesalahan saat mengambil data makanan.')
    } finally {
      setAutoFillLoading(false)
    }
  }

  return {
    foodName,
    setFoodName,
    calories,
    setCalories,
    autoFood,
    autoFillLoading,
    autoFillError,
    foodSuggestions,
    suggestionsLoading,
    handleSelectSuggestion,
    handleAutoFillCalories,
  }
}