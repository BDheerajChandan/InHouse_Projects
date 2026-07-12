// src/components/BirthdayCard.jsx
import heroImg from '../assets/images/IMG_20260619_133600.jpg';

// const CONFETTI_COUNT = 18;

// function BirthdayCard() {
//   return (
//     <div className="birthday-page">
//       <div className="confetti-layer" aria-hidden="true">
//         {Array.from({ length: CONFETTI_COUNT }).map((_, i) => (
//           <span key={i} className="confetti" style={{ '--i': i }} />
//         ))}
//       </div>

//       <div className="birthday-card">
//         <div className="image-section">
//           <div className="polaroid">
//             <span className="tape" aria-hidden="true"></span>
//             <img src={heroImg} alt="Samarekha Mam" className="hero-image" />
//           </div>
//         </div>

//         <div className="content-section">
//           <p className="top-text">🎉 On Your Last Working Day 🎉</p>

//           <h1 className="main-title">
//             Wishing You Well, <span className="name-script">Samarekha Mam</span>
//           </h1>

//           <p className="message">
//             As you step into this exciting new chapter, we want to take a
//             moment to thank you for your dedication, guidance, and the
//             positive impact you've made during your time here. Your hard
//             work and warmth will always be remembered. 🌸✨
//           </p>

//           <div className="wish-box">
//             <p>
//               Dear Samarekha Mam,
//               <br /><br />
//               Congratulations on reaching this special milestone! 🎉
//               <br />
//               Your dedication, leadership, and kindness have left a lasting
//               impression on all of us. It has been a privilege to learn
//               from you and work alongside you.
//               <br /><br />
//               As you embark on your new journey, we wish you continued
//               success, good health, and happiness in all your future
//               endeavors. May this new chapter bring you even greater
//               achievements and joy. ✨🌷
//               <br /><br />
//               Thank you for everything, and best wishes for the road ahead!
//               <br /><br />
//               With respect and gratitude,
//               <br />
//               <strong>Dheeraj</strong>
//             </p>
//           </div>

//           <button
//             className="wish-btn"
//             onClick={() =>
//               alert(
//                 '🎉 Congratulations Samarekha Mam! Wishing you continued success, happiness, and all the best in your new journey ahead! 🌟🙏'
//               )
//             }
//           >
//             Send Wishes ✨
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default BirthdayCard;



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
            <img src={heroImg} alt="Samarekha Mam" className="hero-image" />
          </div>
        </div>

        <div className="content-section">
          <p className="top-text">🎉 On Your Last Working Day 🎉</p>

          <h1 className="main-title">
            Wishing You Well, <span className="name-script">Samarekha Mam</span>
          </h1>

          <p className="message">
            As you step into this exciting new chapter, I want to take a
            moment to thank you for your dedication, guidance, and the
            positive impact you've made during your time here. Your hard
            work and warmth will always be remembered. 🌸✨
          </p>

          <div className="wish-box">
            <p>
              Dear Samarekha Mam,
              <br /><br />
              Congratulations on reaching this special milestone! 🎉
              <br />
              Your dedication, leadership, and kindness have left a lasting
              impression on me. It has been a privilege to learn from you
              and work alongside you.
              <br /><br />
              As you embark on your new journey, I wish you continued
              success, good health, and happiness in all your future
              endeavors. May this new chapter bring you even greater
              achievements and joy. ✨🌷
              <br /><br />
              Thank you for everything, and best wishes for the road ahead!
              <br /><br />
              With respect and gratitude,
              <br />
              <strong>Dheeraj</strong>
            </p>
          </div>

          <button
            className="wish-btn"
            onClick={() =>
              alert(
                '🎉 Congratulations Samarekha Mam! Wishing you continued success, happiness, and all the best in your new journey ahead! 🌟🙏'
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