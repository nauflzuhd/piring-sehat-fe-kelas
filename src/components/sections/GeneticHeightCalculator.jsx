import React, { useState } from "react";
import "./GeneticHeightCalculator.css";

/**
 * Komponen Kalkulator Tinggi Potensi Genetik.
 * Mengestimasi tinggi dewasa anak berdasarkan tinggi ayah dan ibu serta jenis kelamin anak.
 *
 * Menggunakan rumus sederhana: (tinggi_ayah + tinggi_ibu ± 13) / 2,
 * di mana tanda + dipakai untuk anak laki-laki dan - untuk anak perempuan.
 */
export default function GeneticHeightCalculator() {
  const [father, setFather] = useState("");
  const [mother, setMother] = useState("");
  const [gender, setGender] = useState("");
  const [result, setResult] = useState(null);
  const [genderError, setGenderError] = useState("");

  /**
   * Hitung estimasi tinggi dewasa berdasarkan input orang tua dan jenis kelamin.
   * @param {Event} e Event form submit (opsional).
   */
  const calculate = (e) => {
    e && e.preventDefault();
    if (!gender) {
      setGenderError("Silakan pilih jenis kelamin terlebih dahulu.");
      return;
    } else {
      setGenderError("");
    }
    const f = parseFloat(father);
    const m = parseFloat(mother);

    if (!f || !m) {
      setResult("Isi tinggi ayah & ibu dengan benar!");
      return;
    }

    let height = 0;
    if (gender === "male") {
      height = (f + m + 13) / 2;
    } else {
      height = (f + m - 13) / 2;
    }

    setResult(`Perkiraan tinggi dewasa: ${height.toFixed(1)} cm`);
  };

  /**
   * Reset input dan hasil kalkulasi.
   */
  const reset = () => {
    setFather("");
    setMother("");
    setGender("");
    setResult(null);
    setGenderError("");
  };

  return (
    <section id="genetic-height" className="genetic-section">
      <div className="genetic-container">
        <h2 className="genetic-title">Kalkulator Tinggi Potensi Genetik</h2>
        <p className="genetic-description">
          Perkirakan kemungkinan tinggi dewasa anak berdasarkan tinggi orang
          tua.
        </p>

        <form onSubmit={calculate} className="genetic-form">
          <div className="genetic-form-group">
            <label>Jenis Kelamin Anak</label>
            <div className="genetic-gender-options">
              <label className="genetic-gender-option">
                <input
                  type="radio"
                  name="childGender"
                  value="male"
                  checked={gender === "male"}
                  onChange={(e) => {
                    setGender(e.target.value);
                    setGenderError("");
                  }}
                />
                <span className="genetic-gender-text">Laki-laki</span>
              </label>
              <label className="genetic-gender-option">
                <input
                  type="radio"
                  name="childGender"
                  value="female"
                  checked={gender === "female"}
                  onChange={(e) => {
                    setGender(e.target.value);
                    setGenderError("");
                  }}
                />
                <span className="genetic-gender-text">Perempuan</span>
              </label>
            </div>
          </div>
          {genderError && (
            <p className="genetic-error-text">⚠️ {genderError}</p>
          )}

          <div className="genetic-form-group">
            <label htmlFor="father">Tinggi Ayah (cm)</label>
            <input
              id="father"
              type="number"
              value={father}
              onChange={(e) => setFather(e.target.value)}
              placeholder="masukkan tinggi badan ayah"
              min="1"
              required
            />
          </div>

          <div className="genetic-form-group">
            <label htmlFor="mother">Tinggi Ibu (cm)</label>
            <input
              id="mother"
              type="number"
              value={mother}
              onChange={(e) => setMother(e.target.value)}
              placeholder="masukkan tinggi badan ibu"
              min="1"
              required
            />
          </div>

          <div className="genetic-form-buttons">
            <button type="submit" className="genetic-btn-calculate">
              Hitung
            </button>
            <button type="button" onClick={reset} className="genetic-btn-reset">
              Reset
            </button>
          </div>
        </form>

        {result && (
          <div className="genetic-result">
            <h3>Hasil</h3>
            <div className="genetic-value">{result}</div>
          </div>
        )}
      </div>
    </section>
  );
}