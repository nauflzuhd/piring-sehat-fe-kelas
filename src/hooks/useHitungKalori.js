import { useCalendarState } from './useCalendarState'
import { useFoodAutocomplete } from './useFoodAutocomplete'
import { useFoodLogs } from './useFoodLogs'
import { useNutritionAndTarget } from './useNutritionAndTarget'

/**
 * Hook komposit untuk fitur utama menghitung kalori yang digunakan di halaman utama.
 * Menggabungkan beberapa hook kecil: kalender, autocomplete, logs, dan nutrisi/target.
 *
 * @param {object} params Parameter input.
 * @param {string|null|undefined} params.supabaseUserId ID pengguna dari Supabase.
 * @param {string} params.userEmail Email pengguna (untuk tampilan saja).
 * @param {boolean} params.isAuthenticated Status autentikasi.
 * @param {function} params.onOpenLogin Callback untuk membuka dialog login.
 * @returns {object} API gabungan untuk UI hitung kalori (calendar, autocomplete, logs, nutrition).
 *
 * Hook ini menyatukan API dari hook-hook kecil sehingga komponen halaman cukup memanggil
 * satu hook `useHitungKalori` untuk mendapatkan semua data dan handler yang dibutuhkan.
 */
export function useHitungKalori({ supabaseUserId, userEmail, isAuthenticated, onOpenLogin }) {
  const calendar = useCalendarState()
  const autocomplete = useFoodAutocomplete({ supabaseUserId })
  const logs = useFoodLogs({
    supabaseUserId,
    selectedDate: calendar.selectedDate,
    autoFood: autocomplete.autoFood,
    foodName: autocomplete.foodName,
    calories: autocomplete.calories,
    setFoodName: autocomplete.setFoodName,
    setCalories: autocomplete.setCalories,
    getMonthInfo: calendar.getMonthInfo,
  })
  const nutrition = useNutritionAndTarget({
    supabaseUserId,
    selectedDate: calendar.selectedDate,
  })

  return {
    isAuthenticated,
    userEmail,
    onOpenLogin,
    // calendar
    currentMonth: calendar.currentMonth,
    selectedDate: calendar.selectedDate,
    setSelectedDate: calendar.setSelectedDate,
    getMonthInfo: calendar.getMonthInfo,
    buildCalendarDays: calendar.buildCalendarDays,
    handlePrevMonth: calendar.handlePrevMonth,
    handleNextMonth: calendar.handleNextMonth,
    isSameDate: calendar.isSameDate,
    // autocomplete
    foodName: autocomplete.foodName,
    setFoodName: autocomplete.setFoodName,
    calories: autocomplete.calories,
    setCalories: autocomplete.setCalories,
    autoFood: autocomplete.autoFood,
    autoFillLoading: autocomplete.autoFillLoading,
    autoFillError: autocomplete.autoFillError,
    foodSuggestions: autocomplete.foodSuggestions,
    suggestionsLoading: autocomplete.suggestionsLoading,
    handleSelectSuggestion: autocomplete.handleSelectSuggestion,
    handleAutoFillCalories: autocomplete.handleAutoFillCalories,
    // logs
    calorieEntriesByDate: logs.calorieEntriesByDate,
    getTotalCalories: logs.getTotalCalories,
    getMonthlyCalories: logs.getMonthlyCalories,
    handleAddEntry: logs.handleAddEntry,
    handleDeleteEntry: logs.handleDeleteEntry,
    // nutrition & target
    dailyNutrition: nutrition.dailyNutrition,
    dailyTarget: nutrition.dailyTarget,
    targetInput: nutrition.targetInput,
    setTargetInput: nutrition.setTargetInput,
    savingTarget: nutrition.savingTarget,
    handleSaveTarget: nutrition.handleSaveTarget,
  }
}