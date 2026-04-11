/* src/components/invitation_details.jsx */
/**
 * InvitationDetails - Master reusable component
 * Renders all sections of the invitation using passed data.
 * Can be used standalone or via the pages.
 */
import HeroSection from './HeroSection';
import CoupleSection from './CoupleSection';
import StorySection from './StorySection';
import EventDetailsSection from './EventDetailsSection';
import CountdownSection from './CountdownSection';
import GallerySection from './GallerySection';
import VenueSection from './VenueSection';
import RSVPSection from './RSVPSection';
import FooterSection from './FooterSection';
import DownloadInvitation from './DownloadInvitation';
import DownloadInvitationVideo from './DownloadInvitationVideo';
import AnimatedFlowers from './AnimatedFlowers';
import BackgroundMusic from './BackgroundMusic';
import MobileScrollIndicator from './MobileScrollIndicator';
import SlideNavigation from './SlideNavigation';
import { useState, useEffect, useRef, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import './invitation_details.css';

/* ─────────────────────────────────────────────
   Section IDs for video capture
───────────────────────────────────────────── */
const SECTION_IDS = [
  'section-hero', 'section-couple', 'section-story',
  'section-events', 'section-countdown', 'section-gallery',
  'section-venue', 'section-rsvp', 'section-footer',
];

/* ─────────────────────────────────────────────
   Desktop Slide Wrapper
───────────────────────────────────────────── */
const DesktopSlides = ({ data, onDownloadPDF }) => {
  const [current, setCurrent] = useState(0);
  const total = SECTION_IDS.length;
  const isThrottled = useRef(false);

  const goTo = useCallback((idx) => {
    setCurrent(Math.max(0, Math.min(idx, total - 1)));
  }, [total]);

  const next = useCallback(() => {
    if (!isThrottled.current) {
      isThrottled.current = true;
      setCurrent((c) => Math.min(c + 1, total - 1));
      setTimeout(() => { isThrottled.current = false; }, 800);
    }
  }, [total]);

  const prev = useCallback(() => {
    if (!isThrottled.current) {
      isThrottled.current = true;
      setCurrent((c) => Math.max(c - 1, 0));
      setTimeout(() => { isThrottled.current = false; }, 800);
    }
  }, []);

  // Mouse wheel navigation
  useEffect(() => {
    const handler = (e) => {
      if (Math.abs(e.deltaY) < 30) return;
      if (e.deltaY > 0) next();
      else prev();
    };
    window.addEventListener('wheel', handler, { passive: true });
    return () => window.removeEventListener('wheel', handler);
  }, [next, prev]);

  const sections = [
    <HeroSection key="hero" data={data} onViewInvitation={() => goTo(1)} />,
    <CoupleSection key="couple" data={data} />,
    <StorySection key="story" data={data} />,
    <EventDetailsSection key="events" data={data} />,
    <CountdownSection key="countdown" data={data} />,
    <GallerySection key="gallery" data={data} />,
    <VenueSection key="venue" data={data} />,
    <RSVPSection key="rsvp" data={data} />,
    <FooterSection key="footer" data={data} onDownloadPDF={onDownloadPDF} />,
  ];

  return (
    <div className="desktop-slide-root">
      <div
        className="desktop-slide-track"
        style={{ transform: `translateX(-${current * 100}vw)` }}
      >
        {sections.map((section, i) => (
          <div
            key={i}
            id={SECTION_IDS[i]}
            className="desktop-slide-page"
            data-section={SECTION_IDS[i]}
          >
            <AnimatePresence mode="wait">
              {current === i && (
                <motion.div
                  key={`slide-${i}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  style={{ width: '100%', height: '100%' }}
                >
                  {section}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      <SlideNavigation
        current={current}
        total={total}
        onPrev={prev}
        onNext={next}
        onGoTo={goTo}
        type={data.invitationType}
      />
    </div>
  );
};

/* ─────────────────────────────────────────────
   Mobile Scroll Wrapper
───────────────────────────────────────────── */
const MobileScroll = ({ data, onDownloadPDF }) => (
  <div className="mobile-scroll-root">
    {[
      { id: 'section-hero',      el: <HeroSection data={data} onViewInvitation={() => {}} /> },
      { id: 'section-couple',    el: <CoupleSection data={data} /> },
      { id: 'section-story',     el: <StorySection data={data} /> },
      { id: 'section-events',    el: <EventDetailsSection data={data} /> },
      { id: 'section-countdown', el: <CountdownSection data={data} /> },
      { id: 'section-gallery',   el: <GallerySection data={data} /> },
      { id: 'section-venue',     el: <VenueSection data={data} /> },
      { id: 'section-rsvp',      el: <RSVPSection data={data} /> },
      { id: 'section-footer',    el: <FooterSection data={data} onDownloadPDF={onDownloadPDF} /> },
    ].map(({ id, el }) => (
      <div key={id} id={id} data-section={id} className="mobile-section-wrap">
        {el}
      </div>
    ))}
    <MobileScrollIndicator type={data.invitationType} />
  </div>
);

/* ─────────────────────────────────────────────
   Main InvitationDetails Component
───────────────────────────────────────────── */
const InvitationDetails = (props) => {
  /**
   * Props can be passed individually or as a `data` object.
   * When individual props are passed, they are merged into a data shape.
   */
  const data = props.data || {
    invitationType: props.invitationType || 'Marriage',
    brideName:      props.brideName || 'Bride',
    groomName:      props.groomName || 'Groom',
    brideImage:     props.brideImage || null,
    groomImage:     props.groomImage || null,
    coupleImage:    props.coupleImage || null,
    parents:        props.parents || { brideParents: '', groomParents: '' },
    story:          props.story || [],
    events:         props.events || [],
    eventDate:      props.eventDate || '',
    venue:          props.venue || { name: '', address: '', mapEmbedUrl: '', mapLink: '' },
    rsvp:           props.rsvp || { contact: '', whatsapp: '', email: '' },
    gallery:        props.gallery || [],
    backgroundMusic: props.backgroundMusic || null,
    themeColor:     props.themeColor || '#d4af37',
    dressCode:      props.dressCode || '',
  };

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth <= 1024);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  // PDF download handler passed from App
  const handleDownloadPDF = props.onDownloadPDF || (() => {
    // Inline fallback: import & trigger PDF from FooterSection
  });

  return (
    <div className="invitation-details-root">
      {/* Floating flowers */}
      <AnimatedFlowers type={data.invitationType} count={20} />

      {/* Background Music */}
      {data.backgroundMusic && (
        <BackgroundMusic src={data.backgroundMusic} type={data.invitationType} />
      )}

      {/* Download Buttons (floating, bottom-left on mobile) */}
      <div className="floating-download-btns">
        <DownloadInvitation data={data} />
        <DownloadInvitationVideo data={data} sectionIds={SECTION_IDS} />
      </div>

      {/* Layout switch */}
      {isMobile
        ? <MobileScroll data={data} onDownloadPDF={handleDownloadPDF} />
        : <DesktopSlides data={data} onDownloadPDF={handleDownloadPDF} />
      }
    </div>
  );
};

export default InvitationDetails;