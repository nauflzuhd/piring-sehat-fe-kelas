/**
 * UserInfo Component
 *
 * Menampilkan email user yang sedang login dan tombol logout.
 * Dapat ditampilkan versi mobile dan desktop.
 *
 * @component
 * @param {Object} props
 * @param {string|null} props.userEmail - Email pengguna
 * @param {function} props.onLogout - Fungsi logout
 * @param {boolean} [props.isMobile=false] - Mode tampilan mobile
 * @returns {JSX.Element|null}
 */

import { useState, useEffect } from 'react'
import './UserInfo.css'

function UserInfo({ userEmail, onLogout, isMobile = false }) {
  if (!userEmail) return null

  const [showConfirm, setShowConfirm] = useState(false)
  const className = isMobile ? 'user-info-mobile' : 'user-info-desktop'

  const handleOpenConfirm = () => setShowConfirm(true)
  const handleCancel = () => setShowConfirm(false)
  const handleConfirm = () => {
    setShowConfirm(false)
    onLogout()
  }

  useEffect(() => {
    if (!showConfirm) return

    // Prevent scroll
    const preventScroll = (e) => e.preventDefault()
    document.addEventListener('wheel', preventScroll, { passive: false })
    document.addEventListener('touchmove', preventScroll, { passive: false })
    document.addEventListener('keydown', (e) => {
      if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', ' '].includes(e.key)) {
        e.preventDefault()
      }
    })

    // Prevent clicks on elements outside modal
    const preventOutsideClick = (e) => {
      const modal = document.querySelector('.logout-modal')
      const backdrop = document.querySelector('.logout-modal-backdrop')
      if (backdrop && modal && e.target !== modal && !modal.contains(e.target)) {
        e.preventDefault()
        e.stopPropagation()
      }
    }
    document.addEventListener('click', preventOutsideClick, true)

    return () => {
      document.removeEventListener('wheel', preventScroll)
      document.removeEventListener('touchmove', preventScroll)
      document.removeEventListener('click', preventOutsideClick, true)
    }
  }, [showConfirm])

  return (
    <>
      <div className={className}>
        <span className="user-email">{userEmail}</span>
        <button onClick={handleOpenConfirm} className="logout-button">
          Keluar
        </button>
      </div>

      {showConfirm && (
        <div className="logout-modal-backdrop" onClick={(e) => e.preventDefault()} onWheel={(e) => e.preventDefault()} onTouchMove={(e) => e.preventDefault()} onPointerDown={(e) => e.preventDefault()}>
          <div className="logout-modal" onClick={(e) => e.stopPropagation()} onPointerDown={(e) => e.stopPropagation()}>
            <h3 className="logout-modal-title">Keluar dari akun?</h3>

            <p className="logout-modal-text">
              Kamu akan keluar dari sesi saat ini. Kamu bisa masuk kembali kapan saja.
            </p>
            <div className="logout-modal-actions">
              <button
                type="button"
                className="logout-cancel-btn"
                onClick={handleCancel}
                onMouseDown={(e) => e.preventDefault()}
              >
                Batal
              </button>
              <button
                type="button"
                className="logout-confirm-btn"
                onClick={handleConfirm}
                onMouseDown={(e) => e.preventDefault()}
              >
                Keluar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default UserInfo