/* src/components/SlideNavigation.jsx */
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import './SlideNavigation.css';

const SECTION_LABELS = [
  'Welcome', 'Couple', 'Story', 'Events',
  'Countdown', 'Gallery', 'Venue', 'RSVP', 'Footer'
];

const SlideNavigation = ({ current, total, onPrev, onNext, onGoTo, type }) => {
  const isMarriage = type === 'Marriage';

  // Keyboard navigation
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') onNext();
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') onPrev();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onNext, onPrev]);

  return (
    <>
      {/* Left Arrow */}
      <motion.button
        className={`nav-arrow nav-arrow-left ${isMarriage ? 'marriage' : 'engagement'} ${current === 0 ? 'hidden' : ''}`}
        onClick={onPrev}
        whileHover={{ x: -4, scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Previous section"
      >
        <span>&#8592;</span>
      </motion.button>

      {/* Right Arrow */}
      <motion.button
        className={`nav-arrow nav-arrow-right ${isMarriage ? 'marriage' : 'engagement'} ${current === total - 1 ? 'hidden' : ''}`}
        onClick={onNext}
        whileHover={{ x: 4, scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Next section"
      >
        <span>&#8594;</span>
      </motion.button>

      {/* Section dots + label */}
      <div className={`slide-progress ${isMarriage ? 'marriage' : 'engagement'}`}>
        <span className="progress-label">{SECTION_LABELS[current]}</span>
        <div className="progress-dots">
          {Array.from({ length: total }).map((_, i) => (
            <button
              key={i}
              className={`progress-dot ${i === current ? 'active' : ''}`}
              onClick={() => onGoTo(i)}
              aria-label={`Go to ${SECTION_LABELS[i]}`}
            />
          ))}
        </div>
        <span className="progress-count">{current + 1} / {total}</span>
      </div>
    </>
  );
};

export default SlideNavigation;