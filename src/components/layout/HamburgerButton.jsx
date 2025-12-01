import './HamburgerButton.css';

function HamburgerButton({ isOpen, onClick }) {
  return (
    <button 
      className={`hamburger-btn ${isOpen ? 'open' : ''}`} 
      onClick={onClick}
      aria-label="Toggle menu"
    >
      <span className="hamburger-line"></span>
      <span className="hamburger-line"></span>
      <span className="hamburger-line"></span>
    </button>
  );
}

export default HamburgerButton;