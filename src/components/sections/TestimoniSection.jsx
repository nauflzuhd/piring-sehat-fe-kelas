import './TestimoniSection.css'

function TestimoniSection() {
  const testimonials = [
    {
      name: 'Asep Seluncur',
      role: 'Fullstack Developer',
      quote:
        'Sejak rutin pakai PiringSehat, aku jadi lebih sadar jumlah kalori harian dan berat badan lebih terkontrol.',
    },
    {
      name: 'Pudong Lele',
      role: 'Mahasiswa',
      quote:
        'Fitur hitung kalori dan kalkulator BMI-nya simpel tapi lengkap. Bikin aku lebih gampang jaga pola makan.',
    },
    {
      name: 'Linggangguli',
      role: 'Vibecoder Sejati',
      quote:
        'Sekarang lebih mudah menyusun menu sehat untuk keluarga karena bisa cek kebutuhan gizi langsung di sini.',
    },
  ]

  return (
    <section className="testimoni-section">
      <div className="testimoni-container">
        <div className="testimoni-header">
          <h2 className="testimoni-title">Apa Kata Pengguna Kami</h2>
          <p className="testimoni-subtitle">
            Beberapa cerita dari mereka yang sudah memulai hidup sehat bersama PiringSehat.
          </p>
        </div>

        <div className="testimoni-grid">
          {testimonials.map((item) => (
            <article key={item.name} className="testimoni-card">
              <p className="testimoni-quote">“{item.quote}”</p>
              <div className="testimoni-user">
                <div className="avatar-placeholder">{item.name.charAt(0)}</div>
                <div className="testimoni-user-info">
                  <span className="testimoni-name">{item.name}</span>
                  <span className="testimoni-role">{item.role}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default TestimoniSection
