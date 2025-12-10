/**
 * Footer Component
 *
 * Menampilkan informasi branding, tim, kontak, dan sosial media.
 * Komponen ini bersifat statis dan muncul di bagian bawah halaman.
 *
 * @component
 * @returns {JSX.Element} Footer UI component
 */

import './Footer.css'

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">

        <div className="footer-section brand-section">
          <h2 className="footer-logo">PiringSehat</h2>
          <p className="footer-desc">
            Platform kesehatan terpercaya untuk membantu 
            Anda mencapai pola hidup yang lebih baik dengan 
            mengatur jumlah kalori Anda.
          </p>
        </div>

        <div className="footer-section nav-section">
          <h3 className="footer-title">Our Team</h3>
          <ul className="footer-links">
            <li><a href="#" onClick={(e) => e.preventDefault()}>Fatih Dwi Anggoro</a></li>
            <li><a href="#" onClick={(e) => e.preventDefault()}>Muhammad Naufal Zuhdi</a></li>
            <li><a href="#" onClick={(e) => e.preventDefault()}>Rionaldo Benedictus Purba</a></li>
            <li><a href="#" onClick={(e) => e.preventDefault()}>Frans Malindo Ginting</a></li>
            <li><a href="#" onClick={(e) => e.preventDefault()}>Farid Sani Ahdaputra</a></li>
          </ul>
        </div>

        <div className="footer-section contact-section">
          <h3 className="footer-title">Hubungi Kami</h3>
          <div className="contact-info">
            <p>Email: piringsehatofficial@gmail.com</p>
            <p>Telp: +62 812 3456 7890</p>
          </div>
          
          <div className="social-icons">
            <a href="#" onClick={(e) => e.preventDefault()} aria-label="Instagram" className="icon-link">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor">
                <rect x="2" y="2" width="20" height="20" rx="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
              </svg>
            </a>

            <a href="#" onClick={(e) => e.preventDefault()} aria-label="Twitter/X" className="icon-link">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231z"/>
              </svg>
            </a>
          </div>
        </div>

      </div>

      <div className="footer-bottom">
        <p>&copy; 2025 PiringSehat. Hidup Sehat Dimulai dari Piring Anda.</p>
      </div>
    </footer>
  )
}

export default Footer