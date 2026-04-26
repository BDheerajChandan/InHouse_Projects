import heroImg from '../assets/images/IMG-20251017-WA0030.png';

function BirthdayCard() {
  return (
    <div className="birthday-page">
      <div className="overlay"></div>

      <div className="floating floating-1">🎈</div>
      <div className="floating floating-2">🎂</div>
      <div className="floating floating-3">🎁</div>
      <div className="floating floating-4">✨</div>

      <div className="birthday-card">
        <div className="image-section">
          <img src={heroImg} alt="Sonali" className="hero-image" />
        </div>

        <div className="content-section">
          <h3 className="top-text">Special Birthday Celebration</h3>

          <h1 className="main-title">
            Happy Birthday <span>Sonali</span> 🎉
          </h1>

          <p className="message">
            Wishing you a happy birthday, Sonali
          </p>

          <div className="wish-box">
            <p>
              Wishes from Dheeraj!!
            </p>
          </div>

          <button
            className="wish-btn"
            onClick={() => alert('Happy Birthday Sonali 🎂🎉')}
          >
            Send Wishes ✨
          </button>
        </div>
      </div>
    </div>
  );
}

export default BirthdayCard;