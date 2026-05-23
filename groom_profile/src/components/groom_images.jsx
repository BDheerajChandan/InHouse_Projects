// groom_images.jsx
import { useState, useEffect, useRef } from "react";
import groomImgs from "../config/groom_images.json";
import familyImgs from "../config/groom_with_family.json";
import "./groom_images.css";

const image_container_delay = 3500;

const AutoSlider = ({ images, label, onOpen }) => {
  const [index, setIndex] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    const delay = index < 2 ? image_container_delay : 3500;
    timerRef.current = setTimeout(() => {
      setIndex((i) => (i + 1) % images.length);
    }, delay);
    return () => clearTimeout(timerRef.current);
  }, [index, images.length]);

  const current = images[index];

  return (
    <div className="gi-slider-card" title={`View all ${label}`}>
      <div className="gi-slider-img-wrap">
        {images.map((img, i) => (
          <img
            key={i}
            src={img.url}
            alt={img.desc}
            className={`gi-slide-img ${i === index ? "active" : ""}`}
          />
        ))}
        {/* Blur overlay — clicking opens gallery */}
        <div className="gi-slider-overlay" onClick={onOpen}>
          <span className="gi-slider-view-label">👁 View All Photos</span>
        </div>
      </div>
      <div className="gi-slider-footer">
        <span className="gi-slider-section-label">{label}</span>
        <span className="gi-slider-desc">{current.desc}</span>
        <div className="gi-slider-dots">
          {images.map((_, i) => (
            <span key={i} className={`gi-dot ${i === index ? "active" : ""}`} />
          ))}
        </div>
      </div>
    </div>
  );
};

const Gallery = ({ images, label, onImageClick, onClose }) => (
  <div className="gi-gallery-backdrop" onClick={onClose}>
    <div className="gi-gallery-panel" onClick={(e) => e.stopPropagation()}>
      <div className="gi-gallery-topbar">
        <span className="gi-gallery-title">{label}</span>
        <button className="gi-close-btn" onClick={onClose}>✕ Close</button>
      </div>
      <div className="gi-gallery-grid">
        {images.map((img, i) => (
          <div className="gi-gallery-item" key={i} onClick={() => onImageClick(img)}>
            <div className="gi-gallery-img-wrap">
              <img src={img.url} alt={img.desc} className="gi-gallery-img" />
              <div className="gi-gallery-img-overlay">
                <span>🔍 View Full</span>
              </div>
            </div>
            <p className="gi-gallery-caption">{img.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const Modal = ({ image, onClose }) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const lastPos = useRef({ x: 0, y: 0 });

  // Pinch-to-zoom state
  const lastDist = useRef(null);
  const imgRef = useRef(null);

  const MIN_SCALE = 0.5;
  const MAX_SCALE = 5;

  const clampScale = (s) => Math.min(MAX_SCALE, Math.max(MIN_SCALE, s));

  // Reset on image change
  useEffect(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, [image]);

  // ESC key
  useEffect(() => {
    const handleKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const zoomIn  = () => setScale((s) => clampScale(parseFloat((s + 0.25).toFixed(2))));
  const zoomOut = () => setScale((s) => clampScale(parseFloat((s - 0.25).toFixed(2))));
  const resetZoom = () => { setScale(1); setPosition({ x: 0, y: 0 }); };
  const fitView = () => { setScale(1); setPosition({ x: 0, y: 0 }); };

  // Mouse drag (pan when zoomed in)
  const onMouseDown = (e) => {
    if (scale <= 1) return;
    setIsDragging(true);
    dragStart.current = { x: e.clientX - lastPos.current.x, y: e.clientY - lastPos.current.y };
  };
  const onMouseMove = (e) => {
    if (!isDragging) return;
    const nx = e.clientX - dragStart.current.x;
    const ny = e.clientY - dragStart.current.y;
    lastPos.current = { x: nx, y: ny };
    setPosition({ x: nx, y: ny });
  };
  const onMouseUp = () => setIsDragging(false);

  // Mouse wheel zoom
  const onWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.15 : 0.15;
    setScale((s) => clampScale(parseFloat((s + delta).toFixed(2))));
  };

  // Touch pinch-to-zoom
  const onTouchMove = (e) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (lastDist.current !== null) {
        const delta = (dist - lastDist.current) * 0.01;
        setScale((s) => clampScale(parseFloat((s + delta).toFixed(2))));
      }
      lastDist.current = dist;
    }
  };
  const onTouchEnd = () => { lastDist.current = null; };

  const zoomPercent = Math.round(scale * 100);

  return (
    <div className="gi-modal-backdrop" onClick={onClose}>
      <div className="gi-modal-box" onClick={(e) => e.stopPropagation()}>

        {/* Toolbar */}
        <div className="gi-modal-toolbar">
          <button className="gi-modal-tool-btn" onClick={zoomOut} title="Zoom Out">
            🔍 −
          </button>
          <span className="gi-zoom-level">{zoomPercent}%</span>
          <button className="gi-modal-tool-btn" onClick={zoomIn} title="Zoom In">
            🔍 +
          </button>
          <button className="gi-modal-tool-btn" onClick={fitView} title="Fit to View">
            ⤡ Fit
          </button>
          <button className="gi-modal-tool-btn" onClick={resetZoom} title="Reset 1:1">
            ⤢ 1:1
          </button>
          <button className="gi-modal-tool-btn gi-modal-close-btn" onClick={onClose}>
            ✕ Close
          </button>
        </div>

        {/* Image container */}
        <div
          className="gi-modal-img-container"
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
          onWheel={onWheel}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          style={{ cursor: scale > 1 ? (isDragging ? "grabbing" : "grab") : "default" }}
        >
          <img
            ref={imgRef}
            src={image.url}
            alt={image.desc}
            className="gi-modal-img"
            draggable={false}
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
              transition: isDragging ? "none" : "transform 0.15s ease",
            }}
          />
        </div>

        {/* Description + hint */}
        <div className="gi-modal-footer">
          <p className="gi-modal-desc">{image.desc}</p>
          <p className="gi-modal-hint">🖱 Scroll to zoom · 👆 Pinch to zoom · Drag to pan</p>
        </div>
      </div>
    </div>
  );
};

const GroomImages = () => {
  const [activeSection, setActiveSection] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  const sections = {
    groom:  { images: groomImgs,  label: "🤵 Groom Photos" },
    family: { images: familyImgs, label: "👨‍👩‍👦 Groom With Family" },
  };

  const handleClose = () => {
    setActiveSection(null);
    setSelectedImage(null);
  };

  return (
    <section className="gi-section">
      <div className="gi-sliders-row">
        <AutoSlider
          images={groomImgs}
          label="🤵 Groom Photos"
          onOpen={() => setActiveSection("groom")}
        />
        <AutoSlider
          images={familyImgs}
          label="👨‍👩‍👦 With Family"
          onOpen={() => setActiveSection("family")}
        />
      </div>

      {activeSection && !selectedImage && (
        <Gallery
          images={sections[activeSection].images}
          label={sections[activeSection].label}
          onImageClick={setSelectedImage}
          onClose={handleClose}
        />
      )}

      {selectedImage && (
        <Modal
          image={selectedImage}
          onClose={() => setSelectedImage(null)}
        />
      )}
    </section>
  );
};

export default GroomImages;