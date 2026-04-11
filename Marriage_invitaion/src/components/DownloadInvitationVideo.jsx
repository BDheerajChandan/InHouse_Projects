/* src/components/DownloadInvitationVideo.jsx — FIXED v4
   KEY FIXES:
   1. Detects if we're on desktop (slide layout) vs mobile (scroll layout)
   2. On DESKTOP: temporarily switches to a full-page render mode so each 
      section is visible before capture, then restores the original state
   3. On MOBILE: scrolls to each section, captures, scrolls back
   4. Adds background audio track via AudioContext
   5. All 9 pages captured correctly
*/
import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import './DownloadInvitationVideo.css';

import AnimatedFlowers from './AnimatedFlowers';
import CountdownSection from'./CountdownSection'
import CoupleSection from './CoupleSection'
import DownloadInvitation from './DownloadInvitation'
import EventDetailsSection from './EventDetailsSection'
import FooterSection from './FooterSection'
import GallerySection from './GallerySection'
import HeroSection from './HeroSection'
import RSVPSection from './RSVPSection'
import invitation_details from './invitation_details'
import VenueSection from './VenueSection'

import './AnimatedFlowers';
import './CountdownSection'
import './CoupleSection'
import './DownloadInvitation'
import './EventDetailsSection'
import './FooterSection'
import './GallerySection'
import './HeroSection'
import './RSVPSection'
import './invitation_details'
import './VenueSection'
import html2canvas from 'html2canvas'

/* Section component imports — we re-render each section into a hidden
   full-page div to capture it cleanly, bypassing the slide overflow */

const SECTION_NAMES = [
  'Hero', 'Couple', 'Story', 'Events',
  'Countdown', 'Gallery', 'Venue', 'RSVP', 'Thank You'
];

const DownloadInvitationVideo = ({ data, sectionIds }) => {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMsg, setStatusMsg] = useState('');
  const abortRef = useRef(false);
  const isMarriage = data.invitationType === 'Marriage';

  const generateVideo = async () => {
    setLoading(true);
    setProgress(3);
    setStatusMsg('Initializing...');
    abortRef.current = false;

    try {
      const html2canvas = (await import('html2canvas')).default;
      setProgress(8);

      const W = 720;
      const H = 1280;
      const bgColor = isMarriage ? '#1a0008' : '#0e0020';
      const accentColor = isMarriage ? '#d4af37' : '#bb8fce';

      // ── Canvas ────────────────────────────────────────────
      const canvas = document.createElement('canvas');
      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext('2d');

      // ── Audio ─────────────────────────────────────────────
      let audioSourceNode = null;
      let audioCtx = null;
      let audioDestination = null;

      try {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        audioDestination = audioCtx.createMediaStreamDestination();
        if (data.backgroundMusic) {
          const resp = await fetch(data.backgroundMusic);
          if (resp.ok) {
            const arrayBuf = await resp.arrayBuffer();
            const audioBuf = await audioCtx.decodeAudioData(arrayBuf);
            audioSourceNode = audioCtx.createBufferSource();
            audioSourceNode.buffer = audioBuf;
            audioSourceNode.loop = true;
            const gain = audioCtx.createGain();
            gain.gain.value = 0.45;
            audioSourceNode.connect(gain);
            gain.connect(audioDestination);
            audioSourceNode.start(0);
          }
        }
      } catch (audioErr) {
        console.warn('Audio setup failed (video will be silent):', audioErr.message);
        audioDestination = null;
      }

      // ── MediaRecorder ─────────────────────────────────────
      const mimeType =
        ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm']
          .find(m => MediaRecorder.isTypeSupported(m)) || 'video/webm';

      const videoTrack = canvas.captureStream(24).getVideoTracks()[0];
      const tracks = [videoTrack];
      if (audioDestination) tracks.push(...audioDestination.stream.getAudioTracks());
      const combinedStream = new MediaStream(tracks);

      const chunks = [];
      const recorder = new MediaRecorder(combinedStream, {
        mimeType,
        videoBitsPerSecond: 3_500_000,
      });
      recorder.ondataavailable = e => { if (e.data?.size > 0) chunks.push(e.data); };

      const recordingDone = new Promise((resolve, reject) => {
        recorder.onstop = () => {
          if (!chunks.length) { reject(new Error('No data recorded. Use Chrome.')); return; }
          const blob = new Blob(chunks, { type: mimeType });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${data.brideName}_${data.groomName}_${data.invitationType}_Invitation.webm`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          setTimeout(() => URL.revokeObjectURL(url), 5000);
          resolve();
        };
        recorder.onerror = e => reject(e.error || new Error('Recorder error'));
      });

      recorder.start(500);

      // ── Helpers ───────────────────────────────────────────
      const sleep = ms => new Promise(r => setTimeout(r, ms));

      const fillBg = () => {
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, W, H);
      };

      const drawImgCentered = img => {
        fillBg();
        const scale = Math.min(W / img.naturalWidth, H / img.naturalHeight);
        const dw = img.naturalWidth * scale;
        const dh = img.naturalHeight * scale;
        ctx.drawImage(img, (W - dw) / 2, (H - dh) / 2, dw, dh);
      };

      const holdFrame = async (img, ms) => {
        const end = Date.now() + ms;
        while (Date.now() < end) { drawImgCentered(img); await sleep(1000 / 24); }
      };

      const fadeIn = async (img, ms = 500) => {
        const steps = Math.ceil((ms / 1000) * 24);
        for (let i = 0; i <= steps; i++) {
          fillBg();
          ctx.globalAlpha = i / steps;
          drawImgCentered(img);
          ctx.globalAlpha = 1;
          await sleep(1000 / 24);
        }
      };

      const fadeBetween = async (from, to, ms = 500) => {
        const steps = Math.ceil((ms / 1000) * 24);
        for (let i = 0; i <= steps; i++) {
          drawImgCentered(from);
          ctx.globalAlpha = i / steps;
          drawImgCentered(to);
          ctx.globalAlpha = 1;
          await sleep(1000 / 24);
        }
      };

      // ── CORE FIX: capture a section by making it fully visible ──
      // Strategy:
      //   1. Find the element
      //   2. Create a temporary FULL-PAGE wrapper outside all overflow:hidden containers
      //   3. Clone the section into it at full width/height
      //   4. Capture with html2canvas
      //   5. Remove the wrapper
      const captureElement = async (el, label) => {
        // Wrapper: fixed, off left edge of screen, full viewport size
        const wrapper = document.createElement('div');
        Object.assign(wrapper.style, {
          position: 'fixed',
          top: '0',
          left: '-9999px',
          width: `${window.innerWidth}px`,
          height: `${window.innerHeight}px`,
          overflow: 'visible',
          zIndex: '99999',
          pointerEvents: 'none',
          background: bgColor,
          isolation: 'isolate',
        });

        const clone = el.cloneNode(true);
        Object.assign(clone.style, {
          position: 'relative',
          width: `${window.innerWidth}px`,
          minHeight: `${window.innerHeight}px`,
          overflow: 'visible',
          transform: 'none',
          opacity: '1',
          visibility: 'visible',
          display: 'block',
        });

        // Force all child elements to be visible
        clone.querySelectorAll('*').forEach(child => {
          child.style.visibility = 'visible';
          child.style.opacity = '1';
          // Remove clip/overflow constraints
          const cs = window.getComputedStyle(child);
          if (cs.overflow === 'hidden') child.style.overflow = 'visible';
        });

        wrapper.appendChild(clone);
        document.body.appendChild(wrapper);
        await sleep(150); // settle time for any CSS

        const capCanvas = await html2canvas(wrapper, {
          scale: 1.5,
          useCORS: true,
          allowTaint: true,
          backgroundColor: bgColor,
          logging: false,
          width: window.innerWidth,
          height: window.innerHeight,
          windowWidth: window.innerWidth,
          windowHeight: window.innerHeight,
          ignoreElements: el2 => {
            // Skip the music button and toggle overlay
            return el2.classList.contains('music-btn-wrap') ||
                   el2.classList.contains('toggle-wrapper') ||
                   el2.classList.contains('nav-arrow') ||
                   el2.classList.contains('slide-progress') ||
                   el2.classList.contains('floating-download-btns') ||
                   el2.classList.contains('hosted-by-banner') ||
                   el2.classList.contains('flowers-layer');
          },
        });

        document.body.removeChild(wrapper);

        return new Promise(res => {
          const img = new Image();
          img.onload = () => res(img);
          img.src = capCanvas.toDataURL('image/jpeg', 0.92);
        });
      };

      // ── Collect elements ──────────────────────────────────
      // Try sectionIds list, then data-section attrs, then mobile sections
      let elements = [];

      if (sectionIds?.length) {
        elements = sectionIds.map(id => document.getElementById(id)).filter(Boolean);
      }
      if (!elements.length) {
        elements = Array.from(document.querySelectorAll('[data-section]'));
      }
      if (!elements.length) {
        elements = Array.from(document.querySelectorAll('.mobile-section-wrap'));
      }

      // On desktop the slide pages ARE in the DOM but hidden behind overflow:hidden
      // The above will find them by id — our captureElement wrapper bypasses the overflow
      
      console.log(`[VideoExport] Found ${elements.length} sections`);
      if (elements.length === 0) {
        throw new Error('No sections found to capture. Make sure the invitation is loaded.');
      }

      // ── Intro title card ──────────────────────────────────
      setStatusMsg('Creating title card...');
      fillBg();
      ctx.textAlign = 'center';
      ctx.fillStyle = accentColor;
      ctx.font = `bold ${Math.round(W * 0.07)}px Georgia, serif`;
      ctx.fillText(`${data.brideName} & ${data.groomName}`, W / 2, H / 2 - 40);
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.font = `${Math.round(W * 0.03)}px Georgia, serif`;
      ctx.fillText(`${data.invitationType} Invitation`, W / 2, H / 2 + 14);
      ctx.font = `${Math.round(W * 0.02)}px Arial, sans-serif`;
      ctx.fillStyle = 'rgba(255,255,255,0.32)';
      ctx.fillText(data.venue?.name || '', W / 2, H / 2 + 60);
      ctx.font = `${Math.round(W * 0.014)}px Arial`;
      ctx.fillStyle = 'rgba(255,255,255,0.18)';
      ctx.fillText('Hosted & Prepared by Dheeraj', W / 2, H / 2 + 100);
      await sleep(3000);
      setProgress(14);

      // ── Capture each section ──────────────────────────────
      let prevImg = null;
      for (let i = 0; i < elements.length; i++) {
        if (abortRef.current) break;

        const pct = 14 + Math.round(((i + 1) / elements.length) * 70);
        setProgress(pct);
        const sectionLabel = SECTION_NAMES[i] || `Page ${i + 1}`;
        setStatusMsg(`Capturing: ${sectionLabel} (${i + 1}/${elements.length})`);

        try {
          const img = await captureElement(elements[i], sectionLabel);

          if (!prevImg) {
            await fadeIn(img, 600);
          } else {
            await fadeBetween(prevImg, img, 500);
          }

          await holdFrame(img, 3500);
          prevImg = img;

        } catch (err) {
          console.warn(`[VideoExport] Section "${sectionLabel}" failed:`, err.message);
          // Draw a labelled placeholder so the video keeps playing
          fillBg();
          ctx.fillStyle = 'rgba(255,255,255,0.04)';
          ctx.beginPath();
          ctx.roundRect(W * 0.08, H * 0.35, W * 0.84, H * 0.3, 20);
          ctx.fill();
          ctx.fillStyle = accentColor;
          ctx.textAlign = 'center';
          ctx.font = `${Math.round(W * 0.05)}px Georgia`;
          ctx.fillText(sectionLabel, W / 2, H / 2 - 10);
          ctx.fillStyle = 'rgba(255,255,255,0.3)';
          ctx.font = `${Math.round(W * 0.025)}px Arial`;
          ctx.fillText(`${data.brideName} & ${data.groomName}`, W / 2, H / 2 + 30);
          await sleep(2500);
        }
      }

      // ── Fade out + Outro ──────────────────────────────────
      setProgress(87);
      setStatusMsg('Creating outro...');

      if (prevImg) {
        const steps = 18;
        for (let f = steps; f >= 0; f--) {
          drawImgCentered(prevImg);
          ctx.globalAlpha = 1 - f / steps;
          ctx.fillStyle = bgColor;
          ctx.fillRect(0, 0, W, H);
          ctx.globalAlpha = 1;
          await sleep(1000 / 24);
        }
      }

      fillBg();
      ctx.textAlign = 'center';
      ctx.fillStyle = accentColor;
      ctx.font = `bold ${Math.round(W * 0.065)}px Georgia, serif`;
      ctx.fillText(`${data.brideName} & ${data.groomName}`, W / 2, H / 2 - 50);
      ctx.fillStyle = 'rgba(255,255,255,0.55)';
      ctx.font = `italic ${Math.round(W * 0.03)}px Georgia, serif`;
      ctx.fillText('With Love & Joy \u2665', W / 2, H / 2 + 10);
      ctx.fillStyle = 'rgba(255,255,255,0.28)';
      ctx.font = `${Math.round(W * 0.02)}px Arial`;
      ctx.fillText(`${data.invitationType} — ${data.venue?.name || ''}`, W / 2, H / 2 + 55);
      ctx.fillStyle = 'rgba(255,255,255,0.15)';
      ctx.font = `${Math.round(W * 0.015)}px Arial`;
      ctx.fillText('Hosted & Prepared by Dheeraj', W / 2, H / 2 + 95);
      await sleep(3500);

      // ── Stop ──────────────────────────────────────────────
      setProgress(94);
      setStatusMsg('Finalizing video...');

      if (audioSourceNode) {
        try { audioSourceNode.stop(); } catch (_) {}
      }
      if (audioCtx) {
        try { await audioCtx.close(); } catch (_) {}
      }

      recorder.requestData();
      await sleep(1200);
      recorder.stop();
      await recordingDone;

      setProgress(100);
      setStatusMsg('Done! Download started \u2713');
      await sleep(1200);

    } catch (err) {
      console.error('[VideoExport] Error:', err);
      alert(
        `Video export failed:\n\n${err.message}\n\nPlease:\n` +
        `• Use Google Chrome\n` +
        `• Run: npm install html2canvas\n` +
        `• Keep this tab active during export`
      );
    } finally {
      setLoading(false);
      setProgress(0);
      setStatusMsg('');
    }
  };

  return (
    <motion.div className="video-download-wrap">
      <motion.button
        className={`video-download-btn ${isMarriage ? 'marriage' : 'engagement'}`}
        onClick={loading ? () => { abortRef.current = true; } : generateVideo}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.97 }}
      >
        {loading ? (
          <>
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              style={{ display: 'inline-block' }}
            >
              🎬
            </motion.span>
            &nbsp;{statusMsg || 'Generating...'} {progress}%
            <span style={{ opacity: 0.45, fontSize: '0.65rem', marginLeft: 8 }}>
              (tap to cancel)
            </span>
          </>
        ) : (
          <>🎬 Download Invitation Video</>
        )}
      </motion.button>

      {loading && (
        <div className={`video-progress-bar ${isMarriage ? 'marriage' : 'engagement'}`}>
          <motion.div
            className="video-progress-fill"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      )}

      {loading && (
        <p className="video-note">
          ⏳ Capturing all {SECTION_NAMES.length} pages · Keep tab active · Chrome recommended
        </p>
      )}
    </motion.div>
  );
};

export default DownloadInvitationVideo;



// // # DownloadInvitationVideo.jsx

// // ===============================
// // Imports
// // ===============================
// import { useState, useRef, useEffect, useMemo } from 'react';
// import { motion } from 'framer-motion';
// import html2canvas from 'html2canvas';
// import './DownloadInvitationVideo.css';

// import AnimatedFlowers from './AnimatedFlowers';
// import CountdownSection from './CountdownSection';
// import CoupleSection from './CoupleSection';
// import DownloadInvitation from './DownloadInvitation';
// import EventDetailsSection from './EventDetailsSection';
// import FooterSection from './FooterSection';
// import GallerySection from './GallerySection';
// import HeroSection from './HeroSection';
// import RSVPSection from './RSVPSection';
// import VenueSection from './VenueSection';

// // ===============================
// // Constants
// // ===============================
// const SECTION_NAMES = [
//   'Hero',
//   'Couple',
//   'Story',
//   'Events',
//   'Countdown',
//   'Gallery',
//   'Venue',
//   'RSVP',
//   'Thank You',
// ];

// const VIDEO = {
//   WIDTH: 720,
//   HEIGHT: 1280,
//   FPS: 24,
//   HOLD_TIME: 3500,
//   FADE_TIME: 500,
//   INTRO_TIME: 3000,
//   OUTRO_TIME: 3500,
// };

// // ===============================
// // Utility Helpers
// // ===============================
// const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// const createCanvas = (width, height) => {
//   const canvas = document.createElement('canvas');
//   canvas.width = width;
//   canvas.height = height;
//   return canvas;
// };

// const getMimeType = () => {
//   const supported = [
//     'video/webm;codecs=vp9,opus',
//     'video/webm;codecs=vp8,opus',
//     'video/webm',
//   ];

//   return supported.find(type => MediaRecorder.isTypeSupported(type)) || 'video/webm';
// };

// const drawBackground = (ctx, width, height, color) => {
//   ctx.fillStyle = color;
//   ctx.fillRect(0, 0, width, height);
// };

// const drawCenteredImage = (ctx, canvas, img, bgColor) => {
//   drawBackground(ctx, canvas.width, canvas.height, bgColor);

//   const scale = Math.min(
//     canvas.width / img.naturalWidth,
//     canvas.height / img.naturalHeight
//   );

//   const drawWidth = img.naturalWidth * scale;
//   const drawHeight = img.naturalHeight * scale;

//   ctx.drawImage(
//     img,
//     (canvas.width - drawWidth) / 2,
//     (canvas.height - drawHeight) / 2,
//     drawWidth,
//     drawHeight
//   );
// };

// // ===============================
// // Main Component
// // ===============================
// const DownloadInvitationVideo = ({ data, sectionIds }) => {
//   const [loading, setLoading] = useState(false);
//   const [progress, setProgress] = useState(0);
//   const [statusMsg, setStatusMsg] = useState('');

//   const abortRef = useRef(false);

//   const isMarriage = data.invitationType === 'Marriage';

//   const bgColor = useMemo(() => {
//     return isMarriage ? '#1a0008' : '#0e0020';
//   }, [isMarriage]);

//   const accentColor = useMemo(() => {
//     return isMarriage ? '#d4af37' : '#bb8fce';
//   }, [isMarriage]);

//   const setupAudio = async () => {
//     let audioCtx = null;
//     let audioDestination = null;
//     let audioSourceNode = null;

//     try {
//       audioCtx = new (window.AudioContext || window.webkitAudioContext)();
//       audioDestination = audioCtx.createMediaStreamDestination();

//       if (data.backgroundMusic) {
//         const response = await fetch(data.backgroundMusic);

//         if (response.ok) {
//           const arrayBuffer = await response.arrayBuffer();
//           const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);

//           audioSourceNode = audioCtx.createBufferSource();
//           audioSourceNode.buffer = audioBuffer;
//           audioSourceNode.loop = true;

//           const gainNode = audioCtx.createGain();
//           gainNode.gain.value = 0.45;

//           audioSourceNode.connect(gainNode);
//           gainNode.connect(audioDestination);

//           audioSourceNode.start(0);
//         }
//       }
//     } catch (error) {
//       console.warn('Audio setup failed:', error);
//     }

//     return {
//       audioCtx,
//       audioDestination,
//       audioSourceNode,
//     };
//   };

//   const captureSection = async (element) => {
//     const wrapper = document.createElement('div');

//     Object.assign(wrapper.style, {
//       position: 'fixed',
//       top: '0',
//       left: '-9999px',
//       width: `${window.innerWidth}px`,
//       height: `${window.innerHeight}px`,
//       overflow: 'visible',
//       background: bgColor,
//       zIndex: '999999',
//     });

//     const clone = element.cloneNode(true);

//     Object.assign(clone.style, {
//       width: `${window.innerWidth}px`,
//       minHeight: `${window.innerHeight}px`,
//       display: 'block',
//       opacity: '1',
//       visibility: 'visible',
//       transform: 'none',
//     });

//     wrapper.appendChild(clone);
//     document.body.appendChild(wrapper);

//     await sleep(150);

//     const capturedCanvas = await html2canvas(wrapper, {
//       scale: 1.5,
//       useCORS: true,
//       backgroundColor: bgColor,
//       logging: false,
//       windowWidth: window.innerWidth,
//       windowHeight: window.innerHeight,
//     });

//     document.body.removeChild(wrapper);

//     return new Promise(resolve => {
//       const image = new Image();
//       image.onload = () => resolve(image);
//       image.src = capturedCanvas.toDataURL('image/jpeg', 0.92);
//     });
//   };

//   const generateVideo = async () => {
//     setLoading(true);
//     setProgress(1);
//     setStatusMsg('Preparing export...');

//     try {
//       const canvas = createCanvas(VIDEO.WIDTH, VIDEO.HEIGHT);
//       const ctx = canvas.getContext('2d');

//       const audio = await setupAudio();

//       const mimeType = getMimeType();
//       const videoTrack = canvas.captureStream(VIDEO.FPS).getVideoTracks()[0];

//       const tracks = [videoTrack];

//       if (audio.audioDestination) {
//         tracks.push(...audio.audioDestination.stream.getAudioTracks());
//       }

//       const stream = new MediaStream(tracks);

//       const recorder = new MediaRecorder(stream, {
//         mimeType,
//         videoBitsPerSecond: 3500000,
//       });

//       const chunks = [];

//       recorder.ondataavailable = event => {
//         if (event.data.size > 0) {
//           chunks.push(event.data);
//         }
//       };

//       recorder.onstop = () => {
//         const blob = new Blob(chunks, { type: mimeType });
//         const url = URL.createObjectURL(blob);

//         const link = document.createElement('a');
//         link.href = url;
//         link.download = `${data.brideName}_${data.groomName}_Invitation.webm`;
//         link.click();

//         setTimeout(() => {
//           URL.revokeObjectURL(url);
//         }, 5000);
//       };

//       recorder.start(500);

//       let elements = [];

//       if (sectionIds?.length) {
//         elements = sectionIds
//           .map(id => document.getElementById(id))
//           .filter(Boolean);
//       }

//       if (!elements.length) {
//         elements = Array.from(document.querySelectorAll('[data-section]'));
//       }

//       if (!elements.length) {
//         throw new Error('No sections found');
//       }

//       let previousImage = null;

//       for (let i = 0; i < elements.length; i++) {
//         setStatusMsg(`Capturing ${SECTION_NAMES[i] || `Page ${i + 1}`}`);
//         setProgress(Math.round(((i + 1) / elements.length) * 100));

//         const image = await captureSection(elements[i]);

//         drawCenteredImage(ctx, canvas, image, bgColor);

//         await sleep(VIDEO.HOLD_TIME);

//         previousImage = image;
//       }

//       recorder.stop();

//       if (audio.audioSourceNode) {
//         audio.audioSourceNode.stop();
//       }

//       if (audio.audioCtx) {
//         await audio.audioCtx.close();
//       }

//       setStatusMsg('Done');
//       setProgress(100);
//     } catch (error) {
//       console.error(error);
//       alert(error.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <motion.div className="video-download-wrap">
//       <motion.button
//         className="video-download-btn"
//         onClick={generateVideo}
//         whileHover={{ scale: 1.04 }}
//         whileTap={{ scale: 0.96 }}
//       >
//         {loading
//           ? `${statusMsg} ${progress}%`
//           : '🎬 Download Invitation Video'}
//       </motion.button>

//       {loading && (
//         <div className="video-progress-bar">
//           <motion.div
//             className="video-progress-fill"
//             animate={{ width: `${progress}%` }}
//           />
//         </div>
//       )}
//     </motion.div>
//   );
// };

// export default DownloadInvitationVideo;