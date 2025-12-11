/**
 * Navbar Component
 *
 * Komponen navigasi utama aplikasi. Menampilkan logo, tombol login,
 * menu navigasi, serta informasi pengguna ketika sudah login.
 *
 * @component
 * @param {Object} props
 * @param {string|null} props.userEmail - Email user yang sedang login
 * @param {function} props.onLogout - Fungsi untuk logout user
 * @param {function} props.onOpenLogin - Membuka modal/login page
 * @param {boolean} props.isAuthenticated - Status autentikasi user
 * @returns {JSX.Element}
 */

import { useState, useEffect, useRef } from 'react'

import './Navbar.css'
import HamburgerButton from './HamburgerButton'
import NavMenu from './NavMenu'
import UserInfo from './UserInfo'
import logo from '../../assets/new-logo.png'

function Navbar({ userEmail, onLogout, onOpenLogin, isAuthenticated }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const lastScrollY = useRef(0)

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)
  const closeMenu = () => setIsMenuOpen(false)

  // Lock body scroll when mobile menu is open
  useEffect(() => {

    if (!isMenuOpen) return

    // Prevent scroll when menu is open
    const preventScroll = (e) => e.preventDefault()
    document.addEventListener('wheel', preventScroll, { passive: false })
    document.addEventListener('touchmove', preventScroll, { passive: false })

    return () => {
      document.removeEventListener('wheel', preventScroll)
      document.removeEventListener('touchmove', preventScroll)
    }
  }, [isMenuOpen])

  // Hide navbar on scroll down, show on scroll up (tanpa threshold)
  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY || window.pageYOffset

      // Selalu tampilkan navbar ketika di paling atas
      if (currentY <= 0) {
        setIsVisible(true)
        lastScrollY.current = 0
        return
      }

      const prevY = lastScrollY.current

      // Scroll ke bawah -> sembunyikan navbar
      if (currentY > prevY) {
        setIsVisible(false)
      }
      // Scroll ke atas -> tampilkan navbar
      else if (currentY < prevY) {
        setIsVisible(true)
      }

      lastScrollY.current = currentY
    }

    // Tambahan: deteksi arah scroll via wheel event,
    // berguna ketika sudah mentok di bawah/atas sehingga scrollY tidak berubah
    const handleWheel = (event) => {
      const currentY = window.scrollY || window.pageYOffset

      // Tetap hormati aturan: kalau di paling atas, navbar harus selalu kelihatan
      if (currentY <= 0) {
        setIsVisible(true)
        return
      }

      if (event.deltaY > 0) {
        // Scroll gesture ke bawah
        setIsVisible(false)
      } else if (event.deltaY < 0) {
        // Scroll gesture ke atas
        setIsVisible(true)
      }
    }

    window.addEventListener('scroll', handleScroll)
    window.addEventListener('wheel', handleWheel, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('wheel', handleWheel)
    }
  }, [])

  return (
    <>
      <nav className={`navbar ${isVisible ? '' : 'navbar-hidden'}`}>

        <div className="navbar-container">

          <div className="navbar-brand">
            <img src={logo} alt="PiringSehat Logo" className="brand-image" />
            <h1 className="brand-logo">PiringSehat</h1>
          </div>

          <HamburgerButton isOpen={isMenuOpen} onClick={toggleMenu} />

          <NavMenu
            isOpen={isMenuOpen}
            onClose={closeMenu}
            userEmail={userEmail}
            onLogout={onLogout}
            onOpenLogin={onOpenLogin}
            isAuthenticated={isAuthenticated}
          />

          {isAuthenticated && userEmail ? (
            <UserInfo userEmail={userEmail} onLogout={onLogout} isMobile={false} />
          ) : (
            <button onClick={onOpenLogin} className="navbar-login-btn">
              Masuk
            </button>
          )}
        </div>
      </nav>
    </>
  )
}

export default Navbar