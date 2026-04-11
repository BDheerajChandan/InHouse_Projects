/* src/components/StorySection.jsx */
import { motion } from 'framer-motion';
import './StorySection.css';

const StorySection = ({ data }) => {
  const isMarriage = data.invitationType === 'Marriage';

  return (
    <section className={`story-section ${isMarriage ? 'marriage' : 'engagement'}`}>
      <div className="section-inner">
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <p className="section-eyebrow">♡ Our Journey ♡</p>
          <h2 className="section-title story-heading">Love Story</h2>
          <div className={`section-divider ${isMarriage ? 'marriage' : 'engagement'}`} />
        </motion.div>

        <div className="timeline">
          {/* Vertical connector line */}
          <motion.div
            className={`timeline-line ${isMarriage ? 'marriage' : 'engagement'}`}
            initial={{ scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 1.4, ease: 'easeOut' }}
          />

          {data.story.map((item, i) => (
            <motion.div
              key={i}
              className={`timeline-item ${i % 2 === 0 ? 'left' : 'right'}`}
              initial={{ opacity: 0, x: i % 2 === 0 ? -60 : 60 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.7, delay: i * 0.1 }}
            >
              {/* Card */}
              <motion.div
                className={`timeline-card ${isMarriage ? 'marriage' : 'engagement'}`}
                whileHover={{ scale: 1.03, y: -4 }}
              >
                <div className="timeline-card-header">
                  <span className="timeline-icon">{item.icon}</span>
                  <span className={`timeline-year ${isMarriage ? 'marriage' : 'engagement'}`}>
                    {item.year}
                  </span>
                </div>
                <h3 className="timeline-title">{item.title}</h3>
                <p className="timeline-desc">{item.description}</p>
              </motion.div>

              {/* Center dot */}
              <motion.div
                className={`timeline-dot ${isMarriage ? 'marriage' : 'engagement'}`}
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 + 0.3 }}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StorySection;