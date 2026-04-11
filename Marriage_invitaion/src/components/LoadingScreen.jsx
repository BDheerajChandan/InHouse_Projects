/* src/components/LoadingScreen.jsx */
import { motion, AnimatePresence } from 'framer-motion';
import './LoadingScreen.css';

const LoadingScreen = ({ type, onComplete }) => {
  const isMarriage = type === 'Marriage';

  return (
    <AnimatePresence>
      <motion.div
        className={`loading-screen ${isMarriage ? 'marriage' : 'engagement'}`}
        initial={{ opacity: 1 }}
        exit={{ opacity: 0, scale: 1.05 }}
        transition={{ duration: 0.8, ease: 'easeInOut' }}
      >
        {/* Envelope */}
        <motion.div
          className="envelope-wrap"
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1, delay: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
        >
          {/* Envelope body */}
          <div className={`envelope ${isMarriage ? 'marriage' : 'engagement'}`}>
            {/* Envelope flap (opens) */}
            <motion.div
              className={`envelope-flap ${isMarriage ? 'marriage' : 'engagement'}`}
              initial={{ rotateX: 0 }}
              animate={{ rotateX: -160 }}
              transition={{ duration: 0.8, delay: 1.4, ease: 'easeInOut' }}
            />

            {/* Letter slides up */}
            <motion.div
              className={`envelope-letter ${isMarriage ? 'marriage' : 'engagement'}`}
              initial={{ y: 0, opacity: 0 }}
              animate={{ y: -60, opacity: 1 }}
              transition={{ duration: 0.8, delay: 1.8, ease: 'easeOut' }}
            >
              <span className="letter-icon">{isMarriage ? '💍' : '💎'}</span>
              <p className="letter-text">
                {isMarriage ? 'Wedding Invitation' : 'Engagement Invitation'}
              </p>
            </motion.div>

            {/* Decorative seal */}
            <motion.div
              className={`envelope-seal ${isMarriage ? 'marriage' : 'engagement'}`}
              initial={{ scale: 1 }}
              animate={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.4, delay: 1.2 }}
            >
              ♡
            </motion.div>
          </div>
        </motion.div>

        {/* Tagline */}
        <motion.p
          className="loading-tagline"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 2.4 }}
        >
          {isMarriage ? '— Opening with Love —' : '— A New Beginning —'}
        </motion.p>

        {/* Enter button */}
        <motion.button
          className={`loading-enter-btn ${isMarriage ? 'marriage' : 'engagement'}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 2.8 }}
          onClick={onComplete}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
        >
          Open Invitation ✦
        </motion.button>
      </motion.div>
    </AnimatePresence>
  );
};

export default LoadingScreen;