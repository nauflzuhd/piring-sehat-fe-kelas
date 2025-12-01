import './WelcomeSection.css'
import logo from '../../assets/new-logo.png'

function WelcomeSection() {
  return (
    <section id="home" className="welcome">
      <div className="welcome-content">
        <div className="welcome-text">
          <span className="welcome-badge">Platform Edukasi Gizi & Tracking Kalori</span>
          <h2>Hidup Sehat Dimulai dari Piring Anda.</h2>
          <p>
            PiringSehat membantu Anda memahami pola makan yang seimbang,
            agar setiap porsi yang Anda pilih membawa tubuh lebih bugar dan kuat.
          </p>
          <p className="welcome-desc">
            Jelajahi panduan nutrisi, kalkulator kesehatan, dan fitur pencatatan
            yang dirancang untuk menemani perjalanan Anda menuju gaya hidup sehat.
          </p>
        </div>
        <div className="welcome-image">
          <img src={logo} alt="PiringSehat Logo" className="logo-image" />
        </div>
      </div>
    </section>
  )
}

export default WelcomeSection
