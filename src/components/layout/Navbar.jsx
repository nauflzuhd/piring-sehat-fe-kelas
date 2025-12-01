import { useState } from 'react'
import './Navbar.css'
import HamburgerButton from './HamburgerButton'
import NavMenu from './NavMenu'
import UserInfo from './UserInfo'
import logo from '../../assets/new-logo.png' 

function Navbar({ userEmail, onLogout, onOpenLogin, isAuthenticated }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const closeMenu = () => {
    setIsMenuOpen(false)
  }

  return (
    <>
      {isMenuOpen && (
        <div className="menu-overlay" onClick={closeMenu}></div>
      )}

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