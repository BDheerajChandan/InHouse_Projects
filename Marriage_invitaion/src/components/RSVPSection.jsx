/* src/components/RSVPSection.jsx */
import { motion } from 'framer-motion';
import './RSVPSection.css';

const RSVPSection = ({ data }) => {
  const isMarriage = data.invitationType === 'Marriage';
  const { rsvp } = data;

  const whatsappMsg = encodeURIComponent(
    `Hi! I received your ${data.invitationType} invitation for ${data.brideName} & ${data.groomName}. I would love to attend! 🎊`
  );

  return (
    <section className={`rsvp-section ${isMarriage ? 'marriage' : 'engagement'}`}>
      {/* Decorative circles */}
      <div className="rsvp-circle rsvp-circle-1" />
      <div className="rsvp-circle rsvp-circle-2" />

      <div className="section-inner">
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <p className="section-eyebrow">♡ Join Us ♡</p>
          <h2 className="section-title rsvp-heading">RSVP</h2>
          <div className={`section-divider ${isMarriage ? 'marriage' : 'engagement'}`} />
        </motion.div>

        <motion.div
          className={`rsvp-card ${isMarriage ? 'marriage' : 'engagement'}`}
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          <motion.p
            className="rsvp-quote"
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            {isMarriage
              ? '"Two souls, one heart. Your presence makes our day complete."'
              : '"Love is in the air — and we want you there!"'}
          </motion.p>

          <p className="rsvp-subtext">
            Kindly confirm your attendance by reaching out to us via any of the options below.
          </p>

          <div className="rsvp-buttons">
            {/* WhatsApp */}
            <motion.a
              href={`https://wa.me/${rsvp.whatsapp}?text=${whatsappMsg}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rsvp-btn whatsapp-btn"
              whileHover={{ scale: 1.05, y: -3 }}
              whileTap={{ scale: 0.97 }}
            >
              <span className="btn-icon">💬</span>
              <span>WhatsApp</span>
            </motion.a>

            {/* Phone */}
            <motion.a
              href={`tel:${rsvp.contact}`}
              className={`rsvp-btn phone-btn ${isMarriage ? 'marriage' : 'engagement'}`}
              whileHover={{ scale: 1.05, y: -3 }}
              whileTap={{ scale: 0.97 }}
            >
              <span className="btn-icon">📞</span>
              <span>{rsvp.contact}</span>
            </motion.a>

            {/* Email */}
            <motion.a
              href={`mailto:${rsvp.email}?subject=RSVP for ${data.brideName} %26 ${data.groomName}'s ${data.invitationType}&body=Hello, I would love to attend your celebration!`}
              className="rsvp-btn email-btn"
              whileHover={{ scale: 1.05, y: -3 }}
              whileTap={{ scale: 0.97 }}
            >
              <span className="btn-icon">✉️</span>
              <span>Email</span>
            </motion.a>
          </div>

          {/* Contact details */}
          <div className="rsvp-contact-info">
            <p className="contact-label">Contact Details</p>
            <p className="contact-detail">📞 {rsvp.contact}</p>
            <p className="contact-detail">✉️ {rsvp.email}</p>
          </div>
        </motion.div>

        {/* Animated hearts row */}
        <div className="rsvp-hearts" aria-hidden="true">
          {['💕', '❤️', '💖', '💗', '💓'].map((h, i) => (
            <motion.span
              key={i}
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.3, ease: 'easeInOut' }}
              style={{ fontSize: '1.4rem' }}
            >
              {h}
            </motion.span>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RSVPSection;