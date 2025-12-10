import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import Login from './components/auth/Login.jsx'
import Register from './components/auth/Register.jsx'
import ForgotPassword from './components/auth/ForgotPassword.jsx'
import WelcomeSection from './components/sections/WelcomeSection'
import TentangKami from './components/sections/TentangKami'
import TestimoniSection from './components/sections/TestimoniSection'
import AddTestimoni from './components/sections/AddTestimoni'
import ForumSection from './components/sections/ForumSection'
import ForumDetailSection from './components/sections/ForumDetailSection'
import BMICalculator from './components/sections/BMICalculator'
import GeneticHeightCalculator from './components/sections/GeneticHeightCalculator'
import ProteinCalculator from './components/sections/ProteinCalculator'
import CariMakanan from './components/sections/CariMakanan'
import HitungKalori from './components/sections/HitungKalori'
import { AuthProvider, useAuth } from './hooks/useAuth'

/**
 * Root aplikasi dengan routing dan authentication provider.
 *
 * @component
 * @description
 * MainApp menggunakan useAuth untuk mendapatkan informasi user,
 * kemudian mendaftarkan semua routes publik dan protected routes.
 */
function MainApp() {
  const { username, userEmail, supabaseUserId, userRole, isAuthenticated, logout } = useAuth()

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        <Route
          path="/"
          element={
            <App
              userEmail={isAuthenticated ? username : ""}
              username={username}
              supabaseUserId={supabaseUserId}
              userRole={userRole}
              onLogout={logout}
              isAuthenticated={isAuthenticated}
            />
          }
        >
          <Route
            index
            element={
              <>
                <WelcomeSection />
                <TentangKami />
                <TestimoniSection />
              </>
            }
          />
          <Route path="Kalkulator" element={<BMICalculator />} />
          <Route path="cari-makanan" element={<CariMakanan />} />
          <Route path="hitung-kalori" element={<HitungKalori />} />
          <Route path="testimoni" element={<AddTestimoni />} />
          <Route path="forum" element={<ForumSection />} />
          <Route path="forum/:id" element={<ForumDetailSection />} />
        </Route>

        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  </StrictMode>
);