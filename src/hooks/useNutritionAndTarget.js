import { useState, useEffect } from 'react'
import { getDailyNutritionSummary } from '../services/foodLogService'
import { getUserDailyCalorieTarget, updateUserDailyCalorieTarget } from '../services/userService'

/**
 * Hook untuk mendapatkan ringkasan nutrisi harian dan mengelola target kalori pengguna.
 *
 * @param {object} params Parameter input.
 * @param {string|null|undefined} params.supabaseUserId ID pengguna Supabase.
 * @param {Date} params.selectedDate Tanggal yang dipilih untuk melihat ringkasan nutrisi.
 * @returns {object} State dan handler terkait nutrisi harian dan target kalori.
 *
 * Hook ini mengambil ringkasan protein/karbo/fat untuk tanggal tertentu dan
 * memuat serta menyimpan target kalori harian pengguna.
 */
export function useNutritionAndTarget({ supabaseUserId, selectedDate }) {
  const [dailyNutrition, setDailyNutrition] = useState({ protein: 0, carbs: 0, fat: 0 })
  const [dailyTarget, setDailyTarget] = useState(null)
  const [targetInput, setTargetInput] = useState('')
  const [savingTarget, setSavingTarget] = useState(false)

  useEffect(() => {
    const loadNutrition = async () => {
      if (!supabaseUserId) return

      const dateKey = selectedDate.toISOString().split('T')[0]

      try {
        const totals = await getDailyNutritionSummary(supabaseUserId, dateKey)
        setDailyNutrition(totals)
      } catch (error) {
        console.error('Gagal memuat ringkasan nutrisi harian:', error)
        setDailyNutrition({ protein: 0, carbs: 0, fat: 0 })
      }
    }

    loadNutrition()
  }, [selectedDate, supabaseUserId])

  useEffect(() => {
    const loadTarget = async () => {
      if (!supabaseUserId) return

      try {
        const target = await getUserDailyCalorieTarget(supabaseUserId)
        setDailyTarget(target)
        setTargetInput(target != null ? String(target) : '')
      } catch (error) {
        console.error('Gagal memuat target kalori harian:', error)
      }
    }

    loadTarget()
  }, [supabaseUserId])

  /**
   * Simpan target kalori harian pengguna.
   * Mengambil nilai dari `targetInput` dan memanggil service untuk menyimpan.
   * @param {Event} e Event form submit (opsional, dipanggil dari form handler).
   */
  const handleSaveTarget = async (e) => {
    e.preventDefault()
    if (!supabaseUserId) return

    try {
      setSavingTarget(true)
      const value = targetInput === '' ? null : Number(targetInput)
      const saved = await updateUserDailyCalorieTarget(supabaseUserId, value)
      setDailyTarget(saved)
    } catch (error) {
      console.error('Gagal menyimpan target kalori harian:', error)
    } finally {
      setSavingTarget(false)
    }
  }

  return {
    dailyNutrition,
    dailyTarget,
    targetInput,
    setTargetInput,
    savingTarget,
    handleSaveTarget,
  }
}