/* src/components/MobileScrollIndicator.jsx */
import { motion } from 'framer-motion';
import './MobileScrollIndicator.css';

const MobileScrollIndicator = ({ type }) => {
  const isMarriage = type === 'Marriage';
  return (
    <motion.div
      className={`scroll-indicator ${isMarriage ? 'marriage' : 'engagement'}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 3 }}
    >
      <motion.div
        className="scroll-arrow"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
      >
        ↓
      </motion.div>
      <span className="scroll-text">Scroll</span>
    </motion.div>
  );
};

export default MobileScrollIndicator;