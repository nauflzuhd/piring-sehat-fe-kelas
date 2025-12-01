import { useNavigate, Outlet } from 'react-router-dom'
import './App.css'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'

function App({ userEmail, supabaseUserId, onLogout, isAuthenticated }) {
  const navigate = useNavigate()

  const handleLogout = () => {
    onLogout()
  }

  const handleOpenLogin = () => {
    navigate('/login')
  }

  return (
    <div className="app">
      <Navbar 
        userEmail={userEmail} 
        onLogout={isAuthenticated ? handleLogout : null}
        isAuthenticated={isAuthenticated}
        onOpenLogin={handleOpenLogin}
      />
      
      <main className="content">
        <Outlet context={{ userEmail, supabaseUserId, onOpenLogin: handleOpenLogin, isAuthenticated }} />
      </main>

      <Footer />
    </div>
  )
}

export default App
