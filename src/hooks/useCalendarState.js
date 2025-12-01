import { useState } from 'react'

export function useCalendarState() {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())

  const getMonthInfo = (date) => {
    const year = date.getFullYear()
    const month = date.getMonth()

    const firstDayOfMonth = new Date(year, month, 1)
    const lastDayOfMonth = new Date(year, month + 1, 0)

    const startWeekday = firstDayOfMonth.getDay() === 0 ? 7 : firstDayOfMonth.getDay()
    const daysInMonth = lastDayOfMonth.getDate()

    return { year, month, startWeekday, daysInMonth }
  }

  const buildCalendarDays = () => {
    const { year, month, startWeekday, daysInMonth } = getMonthInfo(currentMonth)
    const days = []

    for (let i = 1; i < startWeekday; i += 1) {
      days.push(null)
    }

    for (let d = 1; d <= daysInMonth; d += 1) {
      days.push(new Date(year, month, d))
    }

    return days
  }

  const handlePrevMonth = () => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    setCurrentMonth(new Date(year, month - 1, 1))
  }

  const handleNextMonth = () => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    setCurrentMonth(new Date(year, month + 1, 1))
  }

  const isSameDate = (a, b) => {
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    )
  }

  return {
    currentMonth,
    selectedDate,
    setSelectedDate,
    getMonthInfo,
    buildCalendarDays,
    handlePrevMonth,
    handleNextMonth,
    isSameDate,
  }
}
