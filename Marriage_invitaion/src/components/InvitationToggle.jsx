/* src/components/InvitationToggle.jsx */
import { motion, AnimatePresence } from 'framer-motion';
import './InvitationToggle.css';

const InvitationToggle = ({ type, onChange }) => {
  const isMarriage = type === 'Marriage';

  return (
    <>
      <motion.div
        className="hosted-by-banner"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        ✦ Hosted &amp; Prepared by <strong>Dheeraj</strong> ✦
      </motion.div>
      <motion.div
        className="toggle-wrapper"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <span className={`toggle-label ${isMarriage ? 'active-marriage' : ''}`}>
          💒 Marriage
        </span>

        <button
          className={`toggle-switch ${isMarriage ? 'marriage' : 'engagement'}`}
          onClick={() => onChange(isMarriage ? 'Engagement' : 'Marriage')}
          aria-label="Toggle invitation type"
        >
          <motion.div
            className="toggle-thumb"
            animate={{ x: isMarriage ? 2 : 30 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          />
          <AnimatePresence mode="wait">
            <motion.span
              key={type}
              className="toggle-icon"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {isMarriage ? '💍' : '💎'}
            </motion.span>
          </AnimatePresence>
        </button>

        <span className={`toggle-label ${!isMarriage ? 'active-engagement' : ''}`}>
          💎 Engagement
        </span>
      </motion.div>
    </>
  );
};

export default InvitationToggle;