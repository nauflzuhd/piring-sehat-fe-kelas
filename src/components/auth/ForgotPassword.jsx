/**
 * Halaman untuk fitur Lupa Password.
 * User memasukkan email yang terdaftar, lalu Firebase akan mengirim link reset password.
 *
 * @component
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { sendPasswordResetEmail } from 'firebase/auth'
import { auth } from '../../firebase'
import './ForgotPassword.css'

/**
 * Komponen ForgotPassword untuk menangani permintaan reset password.
 *
 * @returns {JSX.Element} Halaman lupa password.
 */
function ForgotPassword() {
  const navigate = useNavigate()

  /** @type {[string, Function]} email - State untuk menyimpan input email */
  const [email, setEmail] = useState('')

  /** @type {[string, Function]} message - State untuk menyimpan pesan sukses */
  const [message, setMessage] = useState('')

  /** @type {[string, Function]} error - State untuk menyimpan pesan error */
  const [error, setError] = useState('')

  /** @type {[boolean, Function]} loading - State loading untuk disabled button */
  const [loading, setLoading] = useState(false)

  /**
   * Fungsi untuk menangani submit form reset password.
   *
   * @param {Event} e Event submit form.
   * @async
   * @returns {Promise<void>}
   */
  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validasi email kosong
    if (!email) {
      setError('Mohon masukkan email Anda')
      return
    }

    try {
      setError('')
      setMessage('')
      setLoading(true)

      // Mengirim link reset password ke email pengguna
      await sendPasswordResetEmail(auth, email)

      setMessage('Link reset password telah dikirim! Cek inbox atau folder spam email Anda.')

      // Reset input email setelah sukses
      setEmail('')
    } catch (err) {
      console.error(err)

      // Error handling Firebase dengan pesan yang lebih ramah
      if (err.code === 'auth/user-not-found') {
        setError('Email tidak terdaftar di sistem kami.')
      } else if (err.code === 'auth/invalid-email') {
        setError('Format email tidak valid.')
      } else {
        setError('Gagal mengirim email. Coba lagi nanti.')
      }
    } finally {
      // Mematikan state loading apapun hasilnya
      setLoading(false)
    }
  }

  return (
    <div className="forgot-container">
      <div className="forgot-card">
        <div className="forgot-header">
          <h1>Lupa Password?</h1>
          <p>
            Masukkan email yang terdaftar, kami akan mengirimkan link untuk
            mereset password Anda.
          </p>
        </div>

        {/* Pesan error */}
        {error && <div className="error-message">{error}</div>}

        {/* Pesan sukses */}
        {message && <div className="success-message">{message}</div>}

        {/* Form utama */}
        <form onSubmit={handleSubmit} className="forgot-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>

            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@email.com"
              className="form-input"
              disabled={loading} // Disable input saat loading
            />
          </div>

          <button type="submit" className="btn-reset" disabled={loading}>
            {loading ? 'Mengirim...' : 'Kirim Link Reset'}
          </button>
        </form>

        <div className="form-footer">
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="link-button"
          >
            Kembali ke Login
          </button>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword