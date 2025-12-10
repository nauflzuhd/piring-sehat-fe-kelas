import './TentangKami.css'

/**
 * Static component to display "About Us" information.
 *
 * Berisi misi, visi, nilai, dan fitur yang ditawarkan oleh aplikasi.
 */
function TentangKami() {
  return (
    <section id="tentang" className="tentang-section">
      <div className="tentang-container">
        <div className="tentang-header">
          <h2 className="tentang-title">Tentang Kami</h2>
          <p className="tentang-subtitle">
            Membantu Anda Menjalani Hidup Lebih Sehat
          </p>
        </div>

        <div className="about-content">
          <div className="about-card">
            <div className="card-icon">🎯</div>
            <h3>Misi Kami</h3>
            <p>
              Piring Sehat hadir untuk membantu masyarakat Indonesia menjalani gaya hidup yang lebih sehat 
              melalui informasi nutrisi yang akurat dan mudah diakses.
            </p>
          </div>

          <div className="about-card">
            <div className="card-icon">💡</div>
            <h3>Visi Kami</h3>
            <p>
              Menjadi platform terpercaya dalam memberikan edukasi dan panduan nutrisi untuk 
              meningkatkan kualitas hidup masyarakat Indonesia.
            </p>
          </div>

          <div className="about-card">
            <div className="card-icon">❤️</div>
            <h3>Nilai Kami</h3>
            <p>
              Kami percaya bahwa setiap orang berhak mendapatkan informasi kesehatan yang mudah dipahami 
              dan dapat diterapkan dalam kehidupan sehari-hari.
            </p>
          </div>
        </div>

        <div className="features-section">
          <h3 className="features-title">Apa yang Kami Tawarkan</h3>
          <div className="features-grid">
            <div className="feature-box">
              <span className="feature-emoji">📊</span>
              <h4>Kalkulator BMI</h4>
              <p>Hitung dan ketahui kategori berat badan Anda dengan mudah</p>
            </div>
            <div className="feature-box">
              <span className="feature-emoji">🍎</span>
              <h4>Database Makanan</h4>
              <p>Akses informasi nutrisi berbagai jenis makanan Indonesia</p>
            </div>
            <div className="feature-box">
              <span className="feature-emoji">🔢</span>
              <h4>Hitung Kalori</h4>
              <p>Pantau asupan kalori harian untuk mencapai target kesehatan</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default TentangKami