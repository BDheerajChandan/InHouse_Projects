// groom_profile.jsx - groom_about.jsx + groom_images.jsx
import { useState } from "react";
import groomData from "../config/groom_details.json";
import GroomAbout from "./groom_about";
import GroomImages from "./groom_images";
import "./groom_profile.css";

const GroomProfile = () => {
  const { name, surname, occupation, location } = groomData;
  const fullName = `${name || ""}`.trim();
  const [profileFull, setProfileFull] = useState(false);

  return (
    <div className="gp-page">

<div
        className="hosted-by-banner"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        ✦ Hosted &amp; Prepared by <strong>Dheeraj</strong> ✦
      </div>

      {/* ── Hero ── */}
      <header className="gp-hero">
        <div className="gp-hero-ornament top-left">✦</div>
        <div className="gp-hero-ornament top-right">✦</div>

        <div
          className="gp-hero-avatar-ring"
          onClick={() => setProfileFull(true)}
          title="View profile photo"
        >
          <img
            src="/src/assets/images/Profile_Pic.jpg"
            alt={fullName}
            className="gp-hero-avatar"
            onError={(e) => {
              e.target.style.display = "none";
              e.target.nextSibling.style.display = "flex";
            }}
          />
          <div className="gp-hero-avatar-fallback">
            {name ? name[0].toUpperCase() : "G"}
          </div>
          <div className="gp-avatar-hover-label">🔍 View</div>
        </div>

        <div className="gp-hero-text">
          {/* <p className="gp-hero-sub">✨ Matrimonial Profile ✨</p> */}
          <h1 className="gp-hero-name">{fullName || "Groom Name"}</h1>
          {surname && (
            <p className="gp-hero-surname">{surname}</p>
          )}
          <div className="gp-hero-pills">
            {occupation && <span className="gp-pill">💼 {occupation}</span>}
            {location   && <span className="gp-pill">📍 {location}</span>}
          </div>
        </div>

        <div className="gp-hero-ornament bottom-left">✦</div>
        <div className="gp-hero-ornament bottom-right">✦</div>
      </header>

      {/* ── Profile Full View Modal ── */}
      {profileFull && (
        <div
          className="gp-profile-modal-backdrop"
          onClick={() => setProfileFull(false)}
        >
          <div
            className="gp-profile-modal-box"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="gp-profile-modal-toolbar">
              <button
                className="gp-profile-close-btn"
                onClick={() => setProfileFull(false)}
              >
                ✕ Close
              </button>
            </div>
            <img
              src="/src/assets/images/Profile_Pic.jpg"
              alt={fullName}
              className="gp-profile-modal-img"
            />
            <p className="gp-profile-modal-name">
              {fullName} {surname}
            </p>
          </div>
        </div>
      )}

      {/* ── Content ── */}
      <main className="gp-main">
        <div className="gp-section-divider">
          <span className="gp-divider-line" />
          <span className="gp-divider-icon">💍 Groom Details</span>
          <span className="gp-divider-line" />
        </div>
        <GroomAbout />

        <div className="gp-section-divider">
          <span className="gp-divider-line" />
          <span className="gp-divider-icon">📸 Photo Gallery</span>
          <span className="gp-divider-line" />
        </div>
        <GroomImages />
      </main>

      <footer className="gp-footer">
        <p>🙏 Wishing you a blessed and joyful union</p>
        <p className="gp-footer-sub">
          Profile shared in confidence · For family use only
        </p>
      </footer>
    </div>
  );
};

export default GroomProfile;