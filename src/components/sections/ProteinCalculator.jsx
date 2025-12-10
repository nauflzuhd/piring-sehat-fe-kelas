import { useState } from "react";
import "./ProteinCalculator.css";

/**
 * Komponen Kalkulator Kebutuhan Protein harian.
 * Menghitung rekomendasi gram protein berdasarkan berat badan, tingkat aktivitas, dan tujuan pengguna.
 *
 * Menggunakan tabel multiplier sederhana untuk menentukan kebutuhan protein per kg berat badan
 * sesuai kombinasi `goal` dan `activity`.
 */
function ProteinCalculator() {
  const [weight, setWeight] = useState("");
  const [activity, setActivity] = useState("");
  const [goal, setGoal] = useState("");
  const [formError, setFormError] = useState("");
  const [protein, setProtein] = useState(null);

  /**
   * Handler untuk menghitung kebutuhan protein ketika form disubmit.
   * @param {Event} e Event submit form.
   */
  const calculateProtein = (e) => {
    e.preventDefault();

    const weightNum = parseFloat(weight);
    if (!weightNum || weightNum <= 0) {
      setFormError("Masukkan berat badan yang valid.");
      return;
    }

    if (!activity || !goal) {
      setFormError("Pilih tingkat aktivitas dan tujuan terlebih dahulu.");
      return;
    }

    setFormError("");

    let multiplier = 1.2;

    // Menentukan multiplier berdasarkan goal + aktivitas
    const table = {
      cutting: { sedentari: 1.2, ringan: 1.4, sedang: 1.6, berat: 1.8 },
      maintain: { sedentari: 1.0, ringan: 1.2, sedang: 1.4, berat: 1.6 },
      bulking: { sedentari: 1.4, ringan: 1.6, sedang: 1.8, berat: 2.0 },
    };

    multiplier = table[goal][activity];

    const totalProtein = (weightNum * multiplier).toFixed(1);
    setProtein(totalProtein);
  };

  /**
   * Reset form input dan hasil perhitungan.
   */
  const resetForm = () => {
    setWeight("");
    setActivity("");
    setGoal("");
    setFormError("");
    setProtein(null);
  };

  return (
    <section className="protein-section">
      <div className="protein-container">
        <h2 className="protein-title">Kalkulator Kebutuhan Protein</h2>
        <p className="protein-description">
          Hitung berapa gram protein yang Anda butuhkan per hari.
        </p>

        <form onSubmit={calculateProtein} className="protein-form">
          <div className="protein-form-group">
            <label>Berat Badan (kg)</label>
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="masukkan berat badan"
              min="1"
              required
            />
          </div>

          <div className="protein-form-group">
            <label>Tingkat Aktivitas</label>
            <select
              value={activity}
              onChange={(e) => setActivity(e.target.value)}
            >
              <option value="">Pilih tingkat aktivitas</option>
              <option value="sedentari">Sedentari (jarang olahraga)</option>
              <option value="ringan">Ringan (1-3x/minggu)</option>
              <option value="sedang">Sedang (3-5x/minggu)</option>
              <option value="berat">Berat (6-7x/minggu)</option>
            </select>
          </div>

          <div className="protein-form-group">
            <label>Tujuan</label>
            <select value={goal} onChange={(e) => setGoal(e.target.value)}>
              <option value="">Pilih tujuan</option>
              <option value="cutting">Cutting (turunkan berat badan)</option>
              <option value="maintain">Maintain (pertahankan berat)</option>
              <option value="bulking">Bulking (naikkan massa otot)</option>
            </select>
          </div>

          {formError && <p className="protein-error-text">⚠️ {formError}</p>}

          <div className="protein-form-buttons">
            <button type="submit" className="protein-btn-calc">
              Hitung Protein
            </button>
            <button
              type="button"
              className="protein-btn-reset"
              onClick={resetForm}
            >
              Reset
            </button>
          </div>
        </form>

        {protein && (
          <div className="protein-result">
            <h3>Hasil Kebutuhan Protein Anda</h3>
            <div className="protein-value">{protein} gram/hari</div>
            <p className="protein-info">
              Berdasarkan berat badan Anda dan tujuan <b>{goal}</b>, Anda
              membutuhkan sekitar <b>{protein} gram protein per hari</b>.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

export default ProteinCalculator;