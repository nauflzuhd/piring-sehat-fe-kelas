/**
 * NavMenu Component
 *
 * Menu navigasi untuk tampilan mobile, mendukung link navigasi
 * dan menampilkan informasi user atau tombol login.
 *
 * @component
 * @param {Object} props
 * @param {boolean} props.isOpen - Status terbuka/tutup menu
 * @param {function} props.onClose - Menutup menu
 * @param {string|null} props.userEmail - Email user aktif
 * @param {function} props.onLogout - Logout user
 * @param {function} props.onOpenLogin - Membuka halaman login
 * @param {boolean} props.isAuthenticated - Status login user
 * @returns {JSX.Element}
 */

import { NavLink } from "react-router-dom";
import "./NavMenu.css";
import UserInfo from "./UserInfo";

function NavMenu({
  isOpen,
  onClose,
  userEmail,
  onLogout,
  onOpenLogin,
  isAuthenticated,
}) {
  const menuItems = [
    { to: "/", label: "Home" },
    { to: "/Kalkulator", label: "Kalkulator" },
    { to: "/cari-makanan", label: "Cari Makanan" },
    { to: "/hitung-kalori", label: "Hitung Kalori" },
    { to: "/forum", label: "Forum" },
  ];

  return (
    <div className={`navbar-menu ${isOpen ? "active" : ""}`}>
      <ul className="menu-list">
        {menuItems.map((item) => (
          <li key={item.to} className="navbar-item">
            <NavLink
              to={item.to}
              className={({ isActive }) =>
                `navbar-link ${isActive ? "active" : ""}`
              }
              onClick={onClose}
            >
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>

      <div className="mobile-auth-section">
        {isAuthenticated && userEmail ? (
          <div className="mobile-user-info-wrapper">
             <UserInfo userEmail={userEmail} onLogout={onLogout} isMobile={true} />
          </div>
        ) : (
          <div className="login-btn-mobile">
            <button
              onClick={() => {
                onClose();
                onOpenLogin();
              }}
              className="navbar-login-btn"
            >
              Masuk
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default NavMenu;