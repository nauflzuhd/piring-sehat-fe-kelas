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

import { useState, useEffect } from 'react'
import './Navbar.css'
import HamburgerButton from './HamburgerButton'
import NavMenu from './NavMenu'
import UserInfo from './UserInfo'
import logo from '../../assets/new-logo.png'

function Navbar({ userEmail, onLogout, onOpenLogin, isAuthenticated }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)
  const closeMenu = () => setIsMenuOpen(false)

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

  return (
    <>
      <nav className="navbar">
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