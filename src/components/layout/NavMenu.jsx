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