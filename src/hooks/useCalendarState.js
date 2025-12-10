import { useState } from 'react'

/**
 * Hook untuk mengelola state kalender (bulan saat ini dan tanggal yang dipilih).
 *
 * @returns {object} API kalender yang berisi state dan helper untuk menavigasi bulan.
 *
 * Hook ini menyederhanakan logika pembuatan tampilan kalender (grid hari),
 * navigasi bulan, dan fungsi pembanding tanggal sehingga komponen UI bisa fokus pada render.
 */
export function useCalendarState() {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())

  /**
   * Mengambil informasi dasar tentang bulan dari sebuah tanggal.
   * @param {Date} date Tanggal yang menjadi referensi.
   * @returns {{year:number, month:number, startWeekday:number, daysInMonth:number}}
   * Menghasilkan tahun, indeks bulan (0-11), hari mulai (1-7, Senin=1..Minggu=7), dan jumlah hari dalam bulan.
   */
  const getMonthInfo = (date) => {
    const year = date.getFullYear()
    const month = date.getMonth()

    const firstDayOfMonth = new Date(year, month, 1)
    const lastDayOfMonth = new Date(year, month + 1, 0)

    const startWeekday = firstDayOfMonth.getDay() === 0 ? 7 : firstDayOfMonth.getDay()
    const daysInMonth = lastDayOfMonth.getDate()

    return { year, month, startWeekday, daysInMonth }
  }

  /**
   * Membangun array hari untuk ditampilkan di grid kalender.
   * Elemen `null` digunakan sebagai placeholder sebelum hari pertama bulan.
   * @returns {Array<Date|null>} Array hari (Date atau null untuk cell kosong).
   */
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

  /**
   * Pindah ke bulan sebelumnya (set ke hari pertama bulan tersebut).
   */
  const handlePrevMonth = () => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    setCurrentMonth(new Date(year, month - 1, 1))
  }

  /**
   * Pindah ke bulan berikutnya (set ke hari pertama bulan tersebut).
   */
  const handleNextMonth = () => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    setCurrentMonth(new Date(year, month + 1, 1))
  }

  /**
   * Bandingkan dua objek Date apakah sama (tahun, bulan, tanggal).
   * @param {Date} a Tanggal pertama.
   * @param {Date} b Tanggal kedua.
   * @returns {boolean} True jika tanggal sama.
   */
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