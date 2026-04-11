/* src/components/VenueSection.jsx */
import { motion } from 'framer-motion';
import './VenueSection.css';

const VenueSection = ({ data }) => {
  const isMarriage = data.invitationType === 'Marriage';
  const { venue } = data;

  return (
    <section className={`venue-section ${isMarriage ? 'marriage' : 'engagement'}`}>
      <div className="section-inner">
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <p className="section-eyebrow">♡ Find Us Here ♡</p>
          <h2 className="section-title venue-heading">Venue</h2>
          <div className={`section-divider ${isMarriage ? 'marriage' : 'engagement'}`} />
        </motion.div>

        <div className="venue-layout">
          {/* Info Card */}
          <motion.div
            className={`venue-info-card ${isMarriage ? 'marriage' : 'engagement'}`}
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <div className="venue-icon-wrap">
              <span className="venue-icon">{isMarriage ? '💒' : '💍'}</span>
            </div>

            <h3 className="venue-name">{venue.name}</h3>
            <p className="venue-address">📍 {venue.address}</p>

            {venue.latitude && (
              <p className="venue-coords">
                🌐 {venue.latitude.toFixed(4)}°N, {venue.longitude.toFixed(4)}°E
              </p>
            )}

            <div className="venue-actions">
              <a
                href={venue.mapLink}
                target="_blank"
                rel="noopener noreferrer"
                className={`venue-btn ${isMarriage ? 'marriage' : 'engagement'}`}
              >
                🗺 Open in Google Maps
              </a>
            </div>

            {/* Event list at venue */}
            <div className="venue-events">
              <h4 className="venue-events-title">Events at this venue:</h4>
              {data.events.map((event, i) => (
                <div key={i} className="venue-event-row">
                  <span>{event.icon}</span>
                  <span className="venue-event-name">{event.name}</span>
                  <span className="venue-event-time">{event.time}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Map */}
          <motion.div
            className={`venue-map-wrap ${isMarriage ? 'marriage' : 'engagement'}`}
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            <iframe
              src={venue.mapEmbedUrl}
              width="100%"
              height="100%"
              style={{ border: 0, borderRadius: '16px', minHeight: '320px' }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Venue Map"
            />
            {/* Fallback if embed not available */}
            <div className="map-fallback">
              <div className="map-fallback-content">
                <span style={{ fontSize: '3rem' }}>🗺</span>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontFamily: 'var(--font-body)', fontSize: '0.85rem', marginTop: 12 }}>
                  {venue.name}
                </p>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-body)', fontSize: '0.75rem', marginTop: 4 }}>
                  {venue.address}
                </p>
                <a
                  href={venue.mapLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    marginTop: 16,
                    padding: '8px 20px',
                    borderRadius: 50,
                    background: isMarriage ? 'rgba(212,175,55,0.2)' : 'rgba(142,68,173,0.2)',
                    color: isMarriage ? '#d4af37' : '#bb8fce',
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.75rem',
                    border: `1px solid ${isMarriage ? 'rgba(212,175,55,0.4)' : 'rgba(142,68,173,0.4)'}`,
                    display: 'inline-block',
                  }}
                >
                  Open in Google Maps →
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default VenueSection;