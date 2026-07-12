// src/components/BirthdayCard.jsx
import heroImg from '../assets/images/IMG_20260617_193414.jpg';

const CONFETTI_COUNT = 18;

function BirthdayCard() {
  return (
    <div className="birthday-page">
      <div className="confetti-layer" aria-hidden="true">
        {Array.from({ length: CONFETTI_COUNT }).map((_, i) => (
          <span key={i} className="confetti" style={{ '--i': i }} />
        ))}
      </div>

      <div className="birthday-card">
        <div className="image-section">
          <div className="polaroid">
            <span className="tape" aria-hidden="true"></span>
            <img src={heroImg} alt="Suprabha" className="hero-image" />
          </div>
        </div>

        <div className="content-section">
          <p className="top-text">🎂 Special Birthday Celebration</p>

          <h1 className="main-title">
            Happy Birthday <span className="name-script">Suprabha</span>
          </h1>

          <p className="message">
            Wishing you a day filled with happiness, laughter, love, and
            countless beautiful memories. May this special day bring you
            endless joy and make the coming year even more wonderful. 🌸✨
          </p>

          <div className="wish-box">
            <p>
              Dear Suprabha,
              <br /><br />
              Happy Birthday! 🎂💖
              <br />
              May your life be filled with happiness, success, good health,
              and unforgettable moments. Keep smiling, keep shining, and
              keep spreading your positivity wherever you go.
              <br /><br />
              May all your dreams come true and may every new day bring
              exciting opportunities and beautiful surprises into your
              life. ✨🌷
              <br /><br />
              Have an amazing birthday and a fantastic year ahead!
              <br /><br />
              Best Wishes,
              <br />
              <strong>Dheeraj</strong>
            </p>
          </div>

          <button
            className="wish-btn"
            onClick={() =>
              alert(
                '🎉 Happy Birthday Suprabha! 🎂💖 Wishing you happiness, success, good health, and lots of love! 🌷✨'
              )
            }
          >
            Send Wishes ✨
          </button>
        </div>
      </div>
    </div>
  );
}

export default BirthdayCard;