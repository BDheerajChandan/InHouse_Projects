/* src/components/HeroSection.jsx */
import { motion } from 'framer-motion';
import './HeroSection.css';

const HeroSection = ({ data, onViewInvitation }) => {
  const isMarriage = data.invitationType === 'Marriage';

  return (
    <section className={`hero-section ${isMarriage ? 'marriage' : 'engagement'}`}>
      {/* Background gradient overlay */}
      <div className="hero-bg-overlay" />

      {/* Decorative corner ornaments */}
      <div className="ornament top-left">✦</div>
      <div className="ornament top-right">✦</div>
      <div className="ornament bottom-left">✦</div>
      <div className="ornament bottom-right">✦</div>

      {/* Decorative border frame */}
      <div className="hero-frame" />

      <div className="hero-content">
        {/* Top tagline */}
        <motion.p
          className="hero-tagline"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
        >
          {isMarriage ? '— Together with their families —' : '— With the blessings of their families —'}
        </motion.p>

        {/* Couple names */}
        <motion.div
          className="hero-names"
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, delay: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <span className="hero-name bride">{data.brideName}</span>
          <motion.span
            className="hero-ampersand"
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          >
            &amp;
          </motion.span>
          <span className="hero-name groom">{data.groomName}</span>
        </motion.div>

        {/* Invitation type */}
        <motion.h2
          className="hero-invitation-type"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1 }}
        >
          {isMarriage ? 'Wedding Invitation' : 'Engagement Invitation'}
        </motion.h2>

        {/* Date & venue */}
        <motion.div
          className="hero-details"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.3 }}
        >
          <span className="hero-date">📅 {data.events[isMarriage ? 4 : 0]?.date}</span>
          <span className="hero-divider">·</span>
          <span className="hero-venue">📍 {data.venue.name}</span>
        </motion.div>

        {/* Parents */}
        <motion.p
          className="hero-parents"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.5 }}
        >
          Son / Daughter of {data.parents.groomParents} &amp; {data.parents.brideParents}
        </motion.p>

        {/* CTA Button */}
        <motion.button
          className={`hero-cta ${isMarriage ? 'marriage' : 'engagement'}`}
          onClick={onViewInvitation}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.8 }}
          whileHover={{ scale: 1.05, boxShadow: isMarriage ? '0 8px 32px rgba(212,175,55,0.5)' : '0 8px 32px rgba(142,68,173,0.5)' }}
          whileTap={{ scale: 0.97 }}
        >
          <motion.span
            animate={{ opacity: [1, 0.7, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            ✦
          </motion.span>
          &nbsp; View Invitation &nbsp;
          <motion.span
            animate={{ opacity: [1, 0.7, 1] }}
            transition={{ duration: 2, repeat: Infinity, delay: 1 }}
          >
            ✦
          </motion.span>
        </motion.button>
      </div>

      {/* Decorative bottom divider */}
      <motion.div
        className="hero-divider-bar"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1.5, delay: 2 }}
      />
    </section>
  );
};

export default HeroSection;