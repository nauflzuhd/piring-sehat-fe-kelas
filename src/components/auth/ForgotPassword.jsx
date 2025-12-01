import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { sendPasswordResetEmail } from 'firebase/auth'
import { auth } from '../../firebase'
import './ForgotPassword.css'

function ForgotPassword() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!email) {
      setError('Mohon masukkan email Anda')
      return
    }

    try {
      setError('')
      setMessage('')
      setLoading(true)

      await sendPasswordResetEmail(auth, email)

      setMessage('Link reset password telah dikirim! Cek inbox atau folder spam email Anda.')
      
      // Opsional: Kosongkan email setelah sukses
      setEmail('')

    } catch (err) {
      console.error(err)
      // Menangani pesan error dari Firebase agar lebih ramah pengguna
      if (err.code === 'auth/user-not-found') {
        setError('Email tidak terdaftar di sistem kami.')
      } else if (err.code === 'auth/invalid-email') {
        setError('Format email tidak valid.')
      } else {
        setError('Gagal mengirim email. Coba lagi nanti.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="forgot-container">
      <div className="forgot-card">
        <div className="forgot-header">
          <h1>Lupa Password?</h1>
          <p>Masukkan email yang terdaftar, kami akan mengirimkan link untuk mereset password Anda.</p>
        </div>

        {error && <div className="error-message">{error}</div>}
        {message && <div className="success-message">{message}</div>}

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
           <button type="button" onClick={() => navigate('/login')} className="link-button">
             Kembali ke Login
           </button>
         </div>
      </div>
    </div>
  )
}

export default ForgotPassword