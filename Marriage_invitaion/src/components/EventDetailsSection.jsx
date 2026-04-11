/* src/components/EventDetailsSection.jsx */
import { motion } from 'framer-motion';
import './EventDetailsSection.css';

const EventCard = ({ event, index, isMarriage }) => (
  <motion.div
    className={`event-card ${isMarriage ? 'marriage' : 'engagement'}`}
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-60px' }}
    transition={{ duration: 0.6, delay: index * 0.1 }}
    whileHover={{ y: -8, scale: 1.02 }}
    style={{ '--event-color': event.color }}
  >
    {/* Top accent bar */}
    <div className="event-accent-bar" style={{ background: event.color }} />

    <div className="event-icon">{event.icon}</div>

    <div className="event-body">
      <h3 className="event-name">{event.name}</h3>

      <div className="event-meta">
        <div className="event-meta-row">
          <span className="meta-icon">📅</span>
          <span>{event.date}</span>
        </div>
        <div className="event-meta-row">
          <span className="meta-icon">🕐</span>
          <span>{event.time}</span>
        </div>
        <div className="event-meta-row">
          <span className="meta-icon">📍</span>
          <span>{event.venue}</span>
        </div>
        {event.address && (
          <div className="event-meta-row event-address">
            <span className="meta-icon">🗺</span>
            <span>{event.address}</span>
          </div>
        )}
      </div>
    </div>
  </motion.div>
);

const EventDetailsSection = ({ data }) => {
  const isMarriage = data.invitationType === 'Marriage';

  return (
    <section className={`events-section ${isMarriage ? 'marriage' : 'engagement'}`}>
      <div className="section-inner">
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <p className="section-eyebrow">♡ Celebrations ♡</p>
          <h2 className="section-title events-title">Event Schedule</h2>
          <div className={`section-divider ${isMarriage ? 'marriage' : 'engagement'}`} />
          <p className="events-subtitle">
            {isMarriage
              ? 'Join us across these beautiful celebrations'
              : 'Be part of our joyful celebration'}
          </p>
        </motion.div>

        <div className="events-grid">
          {data.events.map((event, i) => (
            <EventCard
              key={i}
              event={event}
              index={i}
              isMarriage={isMarriage}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default EventDetailsSection;