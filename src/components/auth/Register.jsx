/**
 * Halaman Register untuk aplikasi PiringSehat.
 *
 * Komponen ini menyediakan:
 * - Pendaftaran menggunakan Email & Password
 * - Login menggunakan Google OAuth
 * - Login menggunakan GitHub OAuth
 * - Validasi form input
 * - Error handling dari Firebase Auth
 *
 * Setelah pendaftaran berhasil, user akan diarahkan ke halaman login
 * atau halaman utama jika menggunakan OAuth.
 *
 * @component
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Register.css'
import { useAuth } from '../../hooks/useAuth'

function Register() {
  /** Navigator untuk berpindah halaman */
  const navigate = useNavigate()

  /**
   * State untuk menyimpan daftar input pengguna.
   * @type {string}
   */
  const [username, setUsername] = useState('')

  /** @type {string} */
  const [email, setEmail] = useState('')

  /** @type {string} */
  const [password, setPassword] = useState('')

  /** @type {string} */
  const [confirmPassword, setConfirmPassword] = useState('')

  /**
   * Menyimpan pesan error yang muncul selama proses registrasi.
   * @type {string}
   */
  const [error, setError] = useState('')

  /**
   * Menyimpan pesan sukses jika pendaftaran berhasil.
   * @type {string}
   */
  const [success, setSuccess] = useState('')

  /**
   * Status loading untuk mencegah klik berulang.
   * @type {boolean}
   */
  const [loading, setLoading] = useState(false)

  /** 
   * Hook autentikasi custom yang menyediakan fungsi pendaftaran dan login OAuth.
   * @typedef {Object} AuthHook
   * @property {Function} registerWithEmail - Daftar menggunakan email & password.
   * @property {Function} loginWithGoogle - Login menggunakan Google OAuth.
   * @property {Function} loginWithGithub - Login menggunakan GitHub OAuth.
   */
  const { registerWithEmail, loginWithGoogle, loginWithGithub } = useAuth()

  /**
   * Event handler untuk mengirim form pendaftaran.
   *
   * Proses:
   * 1. Validasi input
   * 2. Panggil registerWithEmail()
   * 3. Tampilkan pesan sukses
   * 4. Redirect ke login
   *
   * @async
   * @function handleSubmit
   * @param {React.FormEvent<HTMLFormElement>} e - Event submit form.
   */
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validasi input dasar
    if (!username || !email || !password || !confirmPassword) {
      setError('Semua field harus diisi!')
      return
    }
    if (password !== confirmPassword) {
      setError('Password dan konfirmasi password tidak cocok!')
      return
    }
    if (password.length < 6) {
      setError('Password minimal 6 karakter!')
      return
    }

    try {
      setError('')
      setSuccess('')
      setLoading(true)

      await registerWithEmail(username, email, password)

      setSuccess('Akun berhasil dibuat! Mengalihkan...')

      // Redirect setelah sukses
      setTimeout(() => {
        navigate('/login')
      }, 1500)

    } catch (err) {
      console.error(err)

      // Handling error Firebase
      if (err.code === 'auth/email-already-in-use') {
        setError('Email sudah terdaftar. Silakan login.')
      } else if (err.code === 'auth/weak-password') {
        setError('Password terlalu lemah.')
      } else if (err.code === 'auth/invalid-email') {
        setError('Format email tidak valid.')
      } else {
        setError('Gagal mendaftar: ' + err.message)
      }
    } finally {
      setLoading(false)
    }
  }

  /**
   * Mengarahkan user kembali ke halaman login.
   * @function handleGoToLogin
   */
  const handleGoToLogin = () => {
    navigate('/login')
  }

  /**
   * Registrasi menggunakan Google OAuth.
   *
   * @async
   * @function handleGoogleRegister
   */
  const handleGoogleRegister = async () => {
    try {
      setError('')
      setSuccess('')
      setLoading(true)

      await loginWithGoogle()

      setSuccess('Akun berhasil dibuat! Mengalihkan...')

      setTimeout(() => {
        navigate('/')
      }, 1500)

    } catch (err) {
      console.error(err)
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Popup ditutup. Silakan coba lagi.')
      } else {
        setError('Gagal daftar dengan Google: ' + err.message)
      }
    } finally {
      setLoading(false)
    }
  }

  /**
   * Registrasi menggunakan GitHub OAuth.
   *
   * @async
   * @function handleGithubRegister
   */
  const handleGithubRegister = async () => {
    try {
      setError('')
      setSuccess('')
      setLoading(true)

      await loginWithGithub()

      setSuccess('Akun berhasil dibuat! Mengalihkan...')

      setTimeout(() => {
        navigate('/')
      }, 1500)

    } catch (err) {
      console.error(err)
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Popup ditutup. Silakan coba lagi.')
      } else {
        setError('Gagal daftar dengan GitHub: ' + err.message)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="register-container">
      <div className="register-card">
        <div className="register-header">
          <h1>PiringSehat</h1>
          <p>Buat akun baru Anda</p>
        </div>

        <form onSubmit={handleSubmit} className="register-form">
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}
          
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Pilih username"
              className="form-input"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@email.com"
              className="form-input"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan password (min 6 karakter)"
              className="form-input"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Konfirmasi Password</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Konfirmasi password"
              className="form-input"
              disabled={loading}
            />
          </div>

          <button type="submit" className="register-button" disabled={loading}>
            {loading ? 'Mendaftar...' : 'Daftar'}
          </button>

          <div className="divider">
            <span>atau</span>
          </div>

          <button 
            type="button" 
            onClick={handleGoogleRegister} 
            className="oauth-button google-button"
            disabled={loading}
          >
            <svg className="oauth-icon" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Daftar dengan Google
          </button>

          <button 
            type="button" 
            onClick={handleGithubRegister} 
            className="oauth-button github-button"
            disabled={loading}
          >
            <svg className="oauth-icon" viewBox="0 0 24 24">
              <path fill="#181717" d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            Daftar dengan GitHub
          </button>

          <div className="form-footer">
            <span>Sudah punya akun?</span>
            <button type="button" onClick={handleGoToLogin} className="link-button">
              Masuk di sini
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Register