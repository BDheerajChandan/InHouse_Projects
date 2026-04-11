/* src/components/GallerySection.jsx */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './GallerySection.css';

// Gradient placeholder tiles when no images are uploaded yet
const GRADIENT_PLACEHOLDERS = [
  'linear-gradient(135deg, #8B0000 0%, #d4af37 100%)',
  'linear-gradient(135deg, #d4af37 0%, #fce4ec 100%)',
  'linear-gradient(135deg, #4a0020 0%, #8B0000 100%)',
  'linear-gradient(135deg, #6c3483 0%, #2980b9 100%)',
  'linear-gradient(135deg, #2980b9 0%, #bb8fce 100%)',
  'linear-gradient(135deg, #d4af37 0%, #8B0000 100%)',
  'linear-gradient(135deg, #3a1060 0%, #8e44ad 100%)',
  'linear-gradient(135deg, #8B0000 0%, #4a0020 100%)',
];

const PLACEHOLDER_EMOJIS = ['💑', '🌹', '💍', '🥂', '🎶', '💌', '🌸', '✨'];

const GallerySection = ({ data }) => {
  const isMarriage = data.invitationType === 'Marriage';
  const [lightbox, setLightbox] = useState(null);

  const images = data.gallery?.length ? data.gallery : [];
  const count = Math.max(images.length, 6);

  return (
    <section className={`gallery-section ${isMarriage ? 'marriage' : 'engagement'}`}>
      <div className="section-inner">
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <p className="section-eyebrow">♡ Memories ♡</p>
          <h2 className="section-title gallery-heading">Gallery</h2>
          <div className={`section-divider ${isMarriage ? 'marriage' : 'engagement'}`} />
          <p className="gallery-subtitle">
            {images.length === 0
              ? 'Place your couple images in /public/images/ to populate this gallery'
              : 'Moments captured with love'}
          </p>
        </motion.div>

        <div className="gallery-grid">
          {Array.from({ length: count }).map((_, i) => {
            const src = images[i];
            return (
              <motion.div
                key={i}
                className={`gallery-item ${isMarriage ? 'marriage' : 'engagement'}`}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.5, delay: (i % 4) * 0.08 }}
                whileHover={{ scale: 1.04, zIndex: 10 }}
                onClick={() => src && setLightbox({ src, index: i })}
                style={{ cursor: src ? 'zoom-in' : 'default' }}
              >
                {src ? (
                  <img
                    src={src}
                    alt={`Gallery ${i + 1}`}
                    className="gallery-img"
                    loading="lazy"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                {/* Placeholder shown when no image */}
                <div
                  className="gallery-placeholder"
                  style={{
                    background: GRADIENT_PLACEHOLDERS[i % GRADIENT_PLACEHOLDERS.length],
                    display: src ? 'none' : 'flex',
                  }}
                >
                  <span className="placeholder-emoji">
                    {PLACEHOLDER_EMOJIS[i % PLACEHOLDER_EMOJIS.length]}
                  </span>
                  <span className="placeholder-text">Photo {i + 1}</span>
                </div>

                {/* Hover overlay */}
                <div className={`gallery-overlay ${isMarriage ? 'marriage' : 'engagement'}`}>
                  <span>🔍</span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Lightbox */}
        <AnimatePresence>
          {lightbox && (
            <motion.div
              className="lightbox-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setLightbox(null)}
            >
              <motion.div
                className="lightbox-inner"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                <img src={lightbox.src} alt="Lightbox" className="lightbox-img" />
                <button className="lightbox-close" onClick={() => setLightbox(null)}>✕</button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default GallerySection;