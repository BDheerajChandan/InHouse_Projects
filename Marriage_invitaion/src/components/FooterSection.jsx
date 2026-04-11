/* src/components/FooterSection.jsx */
import { motion } from 'framer-motion';
import './FooterSection.css';

const FooterSection = ({ data, onDownloadPDF }) => {
  const isMarriage = data.invitationType === 'Marriage';

  return (
    <section className={`footer-section ${isMarriage ? 'marriage' : 'engagement'}`}>
      <div className="footer-inner">
        {/* Decorative top border */}
        <motion.div
          className={`footer-border-top ${isMarriage ? 'marriage' : 'engagement'}`}
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2 }}
        />

        {/* Monogram */}
        <motion.div
          className={`footer-monogram ${isMarriage ? 'marriage' : 'engagement'}`}
          initial={{ opacity: 0, scale: 0.5 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          animate={{ rotate: [0, 5, -5, 0] }}
        >
          {data.brideName[0]} &amp; {data.groomName[0]}
        </motion.div>

        {/* Thank you */}
        <motion.h2
          className={`footer-thankyou ${isMarriage ? 'marriage' : 'engagement'}`}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          Thank You
        </motion.h2>

        <motion.p
          className="footer-message"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
        >
          Your presence and blessings mean the world to us.
          <br />
          With love, <em>{data.brideName} &amp; {data.groomName}</em>
        </motion.p>

        {/* Animated hearts */}
        <motion.div
          className="footer-hearts"
          aria-hidden="true"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
        >
          {['✦', '♡', '✦', '♡', '✦'].map((icon, i) => (
            <motion.span
              key={i}
              className={`footer-heart-icon ${isMarriage ? 'marriage' : 'engagement'}`}
              animate={{ opacity: [0.3, 1, 0.3], scale: [0.9, 1.1, 0.9] }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.4 }}
            >
              {icon}
            </motion.span>
          ))}
        </motion.div>

        {/* Download PDF button */}
        {onDownloadPDF && (
          <motion.button
            className={`download-pdf-btn ${isMarriage ? 'marriage' : 'engagement'}`}
            onClick={onDownloadPDF}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.7 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
          >
            📄 Download Invitation PDF
          </motion.button>
        )}

        {/* Event details summary */}
        <motion.div
          className="footer-event-summary"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8 }}
        >
          <p className="footer-event-name">
            {isMarriage ? '💒 Wedding Ceremony' : '💍 Engagement Ceremony'}
          </p>
          <p className="footer-event-details">
            {data.events[isMarriage ? 4 : 0]?.date} &nbsp;·&nbsp;
            {data.events[isMarriage ? 4 : 0]?.time} &nbsp;·&nbsp;
            {data.venue.name}
          </p>
        </motion.div>

        {/* Decorative bottom divider */}
        <motion.div
          className={`footer-border-bottom ${isMarriage ? 'marriage' : 'engagement'}`}
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, delay: 0.2 }}
        />

        <p className="footer-copy">
          Crafted with ♥ using React &amp; Framer Motion
        </p>
      </div>
    </section>
  );
};

export default FooterSection;