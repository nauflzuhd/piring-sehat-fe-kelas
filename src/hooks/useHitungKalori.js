import { useCalendarState } from './useCalendarState'
import { useFoodAutocomplete } from './useFoodAutocomplete'
import { useFoodLogs } from './useFoodLogs'
import { useNutritionAndTarget } from './useNutritionAndTarget'

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
