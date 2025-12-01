import { useState, useEffect } from 'react'
import { getDailyNutritionSummary } from '../services/foodLogService'
import { getUserDailyCalorieTarget, updateUserDailyCalorieTarget } from '../services/userService'

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
