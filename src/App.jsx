import { useNavigate, Outlet } from 'react-router-dom'
import './App.css'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'

/**
 * Root layout aplikasi yang membungkus halaman dengan Navbar dan Footer.
 *
 * @component
 * @param {Object} props - Component props
 * @param {string} props.userEmail - Email user yang login
 * @param {string} props.username - Username user yang login
 * @param {string} props.supabaseUserId - ID user di Supabase
 * @param {Function} props.onLogout - Callback untuk logout
 * @param {boolean} props.isAuthenticated - Status autentikasi user
 * @returns {JSX.Element} Layout utama dengan Navbar, content, dan Footer
 *
 * @description
 * Komponen root yang menyediakan layout untuk seluruh aplikasi.
 * Meneruskan context ke child routes melalui Outlet.
 */
function App({ userEmail, username, supabaseUserId, userRole, onLogout, isAuthenticated }) {
  const navigate = useNavigate()

  const handleLogout = () => onLogout()
  const handleOpenLogin = () => navigate('/login')

  return (
    <div className="app">
      <Navbar
        userEmail={userEmail}
        onLogout={isAuthenticated ? handleLogout : null}
        isAuthenticated={isAuthenticated}
        onOpenLogin={handleOpenLogin}
      />

      <main className="content">
        <Outlet context={{
          userEmail,
          username,
          supabaseUserId,
          userRole,
          onOpenLogin: handleOpenLogin,
          isAuthenticated,
        }} />
      </main>

      <Footer />
    </div>
  )
}

export default App