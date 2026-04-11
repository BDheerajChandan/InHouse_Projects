/* src/App.jsx */
import { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

import InvitationDetails from './components/invitation_details';
import InvitationToggle from './components/InvitationToggle';
import LoadingScreen from './components/LoadingScreen';

import marriageData from './data/marriageData';
import engagementData from './data/engagementData';

import './App.css';
import './index.css';


// ─── SET THIS TO false TO LOCK THE INVITATION TYPE ───
const SHOW_TOGGLE = true; // change to false to hide the toggle

/* ─────────────────────────────────────────
   Custom Cursor (desktop only)
───────────────────────────────────────── */
const CustomCursor = ({ type }) => {
  const cursorRef = useRef(null);
  const dotRef = useRef(null);
  const posRef = useRef({ x: 0, y: 0 });
  const targetRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const move = (e) => {
      targetRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', move);

    let rafId;
    const lerp = (a, b, t) => a + (b - a) * t;

    const animate = () => {
      posRef.current.x = lerp(posRef.current.x, targetRef.current.x, 0.12);
      posRef.current.y = lerp(posRef.current.y, targetRef.current.y, 0.12);

      if (cursorRef.current) {
        cursorRef.current.style.left = `${posRef.current.x}px`;
        cursorRef.current.style.top = `${posRef.current.y}px`;
      }
      if (dotRef.current) {
        dotRef.current.style.left = `${targetRef.current.x}px`;
        dotRef.current.style.top = `${targetRef.current.y}px`;
      }
      rafId = requestAnimationFrame(animate);
    };
    animate();
    return () => {
      window.removeEventListener('mousemove', move);
      cancelAnimationFrame(rafId);
    };
  }, []);

  const color = type === 'Marriage'
    ? 'rgba(212,175,55,0.8)'
    : 'rgba(187,143,206,0.8)';

  return (
    <>
      <div ref={cursorRef} className="custom-cursor" style={{ borderColor: color }} />
      <div ref={dotRef} className="custom-cursor-dot" style={{ background: color }} />
    </>
  );
};

/* ─────────────────────────────────────────
   Confetti burst on invitation open
───────────────────────────────────────── */
const ConfettiBurst = ({ active, type }) => {
  if (!active) return null;
  const pieces = Array.from({ length: 40 }, (_, i) => i);
  const isMarriage = type === 'Marriage';
  const colors = isMarriage
    ? ['#d4af37', '#8B0000', '#fce4ec', '#fff9f0', '#f0d060']
    : ['#8e44ad', '#2980b9', '#bb8fce', '#f5f0ff', '#c0392b'];

  return (
    <div className="confetti-layer" aria-hidden="true">
      {pieces.map((i) => (
        <motion.div
          key={i}
          style={{
            position: 'absolute',
            left: `${Math.random() * 100}%`,
            top: '-10px',
            width: `${6 + Math.random() * 8}px`,
            height: `${6 + Math.random() * 8}px`,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
            background: colors[Math.floor(Math.random() * colors.length)],
          }}
          initial={{ y: 0, opacity: 1, rotate: 0 }}
          animate={{
            y: window.innerHeight + 50,
            opacity: [1, 1, 0],
            rotate: Math.random() > 0.5 ? 360 : -360,
            x: (Math.random() - 0.5) * 200,
          }}
          transition={{
            duration: 2.5 + Math.random() * 2,
            delay: Math.random() * 0.5,
            ease: 'easeIn',
          }}
        />
      ))}
    </div>
  );
};

/* ─────────────────────────────────────────
   Scroll Progress Bar
───────────────────────────────────────── */
const ScrollProgress = ({ type }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handler = () => {
      const el = document.querySelector('.mobile-scroll-root') || document.documentElement;
      const scrollTop = el.scrollTop || window.scrollY;
      const height = (el.scrollHeight || document.body.scrollHeight) - window.innerHeight;
      setProgress(height > 0 ? (scrollTop / height) * 100 : 0);
    };
    window.addEventListener('scroll', handler, { passive: true });
    document.querySelector('.mobile-scroll-root')?.addEventListener('scroll', handler, { passive: true });
    return () => {
      window.removeEventListener('scroll', handler);
      document.querySelector('.mobile-scroll-root')?.removeEventListener('scroll', handler);
    };
  }, []);

  return (
    <div
      className={`scroll-progress ${type === 'Engagement' ? 'engagement-theme' : ''}`}
      style={{ width: `${progress}%` }}
    />
  );
};

/* ─────────────────────────────────────────
   App Root
───────────────────────────────────────── */
export default function App() {
  
  // const [invitationType, setInvitationType] = useState('Marriage');
  const [invitationType, setInvitationType] = useState('Engagement');

  const [loading, setLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isMobile] = useState(() => /iPhone|iPad|iPod|Android/i.test(navigator.userAgent));

  const data = invitationType === 'Marriage' ? marriageData : engagementData;
  const isMarriage = invitationType === 'Marriage';

  const handleOpen = () => {
    setLoading(false);
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3500);
  };

  const handleToggle = (newType) => {
    setInvitationType(newType);
    // Brief confetti on switch
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 2500);
  };

  return (
    <div className={`app-wrapper ${isMarriage ? 'marriage-theme' : 'engagement-theme'}`}>
      {/* Custom cursor – desktop only */}
      {!isMobile && <CustomCursor type={invitationType} />}

      {/* Scroll progress bar */}
      <ScrollProgress type={invitationType} />

      {/* Confetti */}
      <ConfettiBurst active={showConfetti} type={invitationType} />

      {/* Loading / Envelope screen */}
      <AnimatePresence>
        {loading && (
          <LoadingScreen type={invitationType} onComplete={handleOpen} />
        )}
      </AnimatePresence>

      {/* Toggle – always visible */}
      {/* <InvitationToggle type={invitationType} onChange={handleToggle} /> */}
      {SHOW_TOGGLE && <InvitationToggle type={invitationType} onChange={handleToggle} />}

      {/* Main invitation content */}
      <AnimatePresence mode="wait">
        {!loading && (
          <motion.div
            key={invitationType}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            style={{ width: '100%', height: '100%' }}
          >
            <InvitationDetails data={data} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}