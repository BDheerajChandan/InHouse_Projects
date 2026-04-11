// /* src/components/BackgroundMusic.jsx */
// import { useEffect, useRef, useState } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import './BackgroundMusic.css';

// const BackgroundMusic = ({ src, type }) => {
//   const audioRef = useRef(null);
//   const [isPlaying, setIsPlaying] = useState(false);
//   const [hasInteracted, setHasInteracted] = useState(false);
//   const [volume, setVolume] = useState(0.4);
//   const [showVolume, setShowVolume] = useState(false);

//   // Attempt autoplay after 1s; fallback on first interaction
//   useEffect(() => {
//     const audio = audioRef.current;
//     if (!audio) return;
//     audio.volume = 0;
//     audio.loop = true;

//     const tryPlay = async () => {
//       try {
//         await audio.play();
//         setIsPlaying(true);
//         // Fade in volume
//         let v = 0;
//         const fade = setInterval(() => {
//           v = Math.min(v + 0.04, volume);
//           audio.volume = v;
//           if (v >= volume) clearInterval(fade);
//         }, 80);
//       } catch {
//         // Browser blocked autoplay - wait for user interaction
//       }
//     };

//     const timer = setTimeout(tryPlay, 1000);
//     return () => clearTimeout(timer);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [src]);

//   // First-interaction fallback
//   useEffect(() => {
//     if (hasInteracted) return;
//     const handler = () => {
//       setHasInteracted(true);
//       const audio = audioRef.current;
//       if (audio && audio.paused) {
//         audio.play().then(() => {
//           setIsPlaying(true);
//           audio.volume = volume;
//         }).catch(() => {});
//       }
//     };
//     document.addEventListener('click', handler, { once: true });
//     return () => document.removeEventListener('click', handler);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [hasInteracted]);

//   const togglePlay = () => {
//     const audio = audioRef.current;
//     if (!audio) return;
//     if (isPlaying) {
//       audio.pause();
//       setIsPlaying(false);
//     } else {
//       audio.play().then(() => setIsPlaying(true)).catch(() => {});
//     }
//   };

//   const handleVolume = (e) => {
//     const v = parseFloat(e.target.value);
//     setVolume(v);
//     if (audioRef.current) audioRef.current.volume = v;
//   };

//   const isMarriage = type === 'Marriage';

//   return (
//     <>
//       <audio ref={audioRef} src={src} loop preload="auto" />

//       <motion.div
//         className={`music-btn-wrap ${isMarriage ? 'marriage' : 'engagement'}`}
//         initial={{ opacity: 0, scale: 0.8 }}
//         animate={{ opacity: 1, scale: 1 }}
//         transition={{ delay: 2, duration: 0.5 }}
//       >
//         {/* Volume Slider */}
//         <AnimatePresence>
//           {showVolume && (
//             <motion.div
//               className="volume-panel"
//               initial={{ opacity: 0, x: 10 }}
//               animate={{ opacity: 1, x: 0 }}
//               exit={{ opacity: 0, x: 10 }}
//             >
//               <input
//                 type="range"
//                 min="0"
//                 max="1"
//                 step="0.05"
//                 value={volume}
//                 onChange={handleVolume}
//                 className="volume-slider"
//                 aria-label="Volume"
//               />
//             </motion.div>
//           )}
//         </AnimatePresence>

//         {/* Volume toggle */}
//         <button
//           className="vol-icon-btn"
//           onClick={() => setShowVolume((p) => !p)}
//           aria-label="Volume"
//         >
//           🔊
//         </button>

//         {/* Play/Pause */}
//         <button
//           className="music-play-btn"
//           onClick={togglePlay}
//           aria-label={isPlaying ? 'Pause music' : 'Play music'}
//         >
//           {isPlaying ? (
//             <div className="music-bars">
//               {[1, 2, 3, 4].map((i) => (
//                 <motion.div
//                   key={i}
//                   className="bar"
//                   animate={{ scaleY: [0.4, 1, 0.4] }}
//                   transition={{
//                     duration: 0.8,
//                     repeat: Infinity,
//                     delay: i * 0.15,
//                     ease: 'easeInOut',
//                   }}
//                 />
//               ))}
//             </div>
//           ) : (
//             <span className="play-icon">▶</span>
//           )}
//         </button>
//       </motion.div>
//     </>
//   );
// };

// export default BackgroundMusic;

// /* src/components/BackgroundMusic.jsx — FIXED v2 */
// import { useEffect, useRef, useState, useCallback } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import './BackgroundMusic.css';

// const BackgroundMusic = ({ src, type }) => {
//   const audioRef = useRef(null);
//   const [isPlaying, setIsPlaying] = useState(false);
//   const [volume, setVolume] = useState(0.4);
//   const [showVolume, setShowVolume] = useState(false);
//   const fadeIntervalRef = useRef(null);
//   const isMarriage = type === 'Marriage';

//   // ── Fade-in helper ──────────────────────────────────────
//   const fadeIn = useCallback((audio, targetVol) => {
//     if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
//     audio.volume = 0;
//     let v = 0;
//     fadeIntervalRef.current = setInterval(() => {
//       v = Math.min(v + 0.03, targetVol);
//       audio.volume = v;
//       if (v >= targetVol) {
//         clearInterval(fadeIntervalRef.current);
//         fadeIntervalRef.current = null;
//       }
//     }, 80);
//   }, []);

//   // ── Reload & play whenever src changes ──────────────────
//   useEffect(() => {
//     if (!src) return;
//     const audio = audioRef.current;
//     if (!audio) return;

//     // Stop any current playback cleanly
//     audio.pause();
//     setIsPlaying(false);
//     if (fadeIntervalRef.current) {
//       clearInterval(fadeIntervalRef.current);
//       fadeIntervalRef.current = null;
//     }

//     // Set new source and reload
//     audio.src = src;
//     audio.load();     // ← critical: forces browser to reload the new file
//     audio.loop = true;

//     // Attempt autoplay after 1 second
//     const timer = setTimeout(async () => {
//       try {
//         await audio.play();
//         setIsPlaying(true);
//         fadeIn(audio, volume);
//       } catch {
//         // Browser blocked autoplay — user must click play
//         setIsPlaying(false);
//       }
//     }, 1000);

//     return () => {
//       clearTimeout(timer);
//       if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
//     };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [src]);

//   // ── First-interaction fallback for autoplay block ───────
//   useEffect(() => {
//     const handler = async () => {
//       const audio = audioRef.current;
//       if (audio && audio.paused && audio.src) {
//         try {
//           await audio.play();
//           setIsPlaying(true);
//           fadeIn(audio, volume);
//         } catch { /* ignore */ }
//       }
//     };
//     window.addEventListener('click', handler, { once: true });
//     return () => window.removeEventListener('click', handler);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [src]);

//   // ── Volume changes ───────────────────────────────────────
//   useEffect(() => {
//     if (audioRef.current) audioRef.current.volume = volume;
//   }, [volume]);

//   const togglePlay = async () => {
//     const audio = audioRef.current;
//     if (!audio) return;
//     if (isPlaying) {
//       audio.pause();
//       setIsPlaying(false);
//     } else {
//       try {
//         await audio.play();
//         setIsPlaying(true);
//         fadeIn(audio, volume);
//       } catch (e) {
//         console.warn('Play failed:', e);
//       }
//     }
//   };

//   return (
//     <>
//       {/* The audio element — src is set imperatively in the effect */}
//       <audio ref={audioRef} loop preload="auto" />

//       <motion.div
//         className={`music-btn-wrap ${isMarriage ? 'marriage' : 'engagement'}`}
//         initial={{ opacity: 0, scale: 0.8 }}
//         animate={{ opacity: 1, scale: 1 }}
//         transition={{ delay: 1.5, duration: 0.5 }}
//       >
//         {/* Volume panel */}
//         <AnimatePresence>
//           {showVolume && (
//             <motion.div
//               className="volume-panel"
//               initial={{ opacity: 0, x: 10 }}
//               animate={{ opacity: 1, x: 0 }}
//               exit={{ opacity: 0, x: 10 }}
//             >
//               <input
//                 type="range"
//                 min="0"
//                 max="1"
//                 step="0.05"
//                 value={volume}
//                 onChange={(e) => setVolume(parseFloat(e.target.value))}
//                 className="volume-slider"
//                 aria-label="Volume"
//               />
//             </motion.div>
//           )}
//         </AnimatePresence>

//         <button
//           className="vol-icon-btn"
//           onClick={() => setShowVolume((p) => !p)}
//           aria-label="Volume"
//         >
//           🔊
//         </button>

//         <button
//           className="music-play-btn"
//           onClick={togglePlay}
//           aria-label={isPlaying ? 'Pause music' : 'Play music'}
//         >
//           {isPlaying ? (
//             <div className="music-bars">
//               {[1, 2, 3, 4].map((i) => (
//                 <motion.div
//                   key={i}
//                   className="bar"
//                   animate={{ scaleY: [0.4, 1, 0.4] }}
//                   transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15, ease: 'easeInOut' }}
//                 />
//               ))}
//             </div>
//           ) : (
//             <span className="play-icon">▶</span>
//           )}
//         </button>
//       </motion.div>
//     </>
//   );
// };

// export default BackgroundMusic;


///////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////

/* src/components/BackgroundMusic.jsx — FIXED v2 */
import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './BackgroundMusic.css';

const BackgroundMusic = ({ src, type }) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.4);
  const [showVolume, setShowVolume] = useState(false);
  const fadeIntervalRef = useRef(null);
  const isMarriage = type === 'Marriage';

  // ── Fade-in helper ──────────────────────────────────────
  const fadeIn = useCallback((audio, targetVol) => {
    if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
    audio.volume = 0;
    let v = 0;
    fadeIntervalRef.current = setInterval(() => {
      v = Math.min(v + 0.03, targetVol);
      audio.volume = v;
      if (v >= targetVol) {
        clearInterval(fadeIntervalRef.current);
        fadeIntervalRef.current = null;
      }
    }, 80);
  }, []);

  // ── Reload & play whenever src changes ──────────────────
  useEffect(() => {
    if (!src) return;
    const audio = audioRef.current;
    if (!audio) return;

    // Stop any current playback cleanly
    audio.pause();
    setIsPlaying(false);
    if (fadeIntervalRef.current) {
      clearInterval(fadeIntervalRef.current);
      fadeIntervalRef.current = null;
    }

    // Set new source and reload
    audio.src = src;
    audio.load();     // ← critical: forces browser to reload the new file
    audio.loop = true;

    // Attempt autoplay after 1 second
    const timer = setTimeout(async () => {
      try {
        await audio.play();
        setIsPlaying(true);
        fadeIn(audio, volume);
      } catch {
        // Browser blocked autoplay — user must click play
        setIsPlaying(false);
      }
    }, 1000);

    return () => {
      clearTimeout(timer);
      if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);

  // ── First-interaction fallback for autoplay block ───────
  useEffect(() => {
    const handler = async () => {
      const audio = audioRef.current;
      if (audio && audio.paused && audio.src) {
        try {
          await audio.play();
          setIsPlaying(true);
          fadeIn(audio, volume);
        } catch { /* ignore */ }
      }
    };
    window.addEventListener('click', handler, { once: true });
    return () => window.removeEventListener('click', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);

  // ── Volume changes ───────────────────────────────────────
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      try {
        await audio.play();
        setIsPlaying(true);
        fadeIn(audio, volume);
      } catch (e) {
        console.warn('Play failed:', e);
      }
    }
  };

  return (
    <>
      {/* The audio element — src is set imperatively in the effect */}
      <audio ref={audioRef} loop preload="auto" />

      <motion.div
        className={`music-btn-wrap ${isMarriage ? 'marriage' : 'engagement'}`}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.5, duration: 0.5 }}
      >
        {/* Volume panel */}
        <AnimatePresence>
          {showVolume && (
            <motion.div
              className="volume-panel"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
            >
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="volume-slider"
                aria-label="Volume"
              />
            </motion.div>
          )}
        </AnimatePresence>

        <button
          className="vol-icon-btn"
          onClick={() => setShowVolume((p) => !p)}
          aria-label="Volume"
        >
          🔊
        </button>

        <button
          className="music-play-btn"
          onClick={togglePlay}
          aria-label={isPlaying ? 'Pause music' : 'Play music'}
        >
          {isPlaying ? (
            <div className="music-bars">
              {[1, 2, 3, 4].map((i) => (
                <motion.div
                  key={i}
                  className="bar"
                  animate={{ scaleY: [0.4, 1, 0.4] }}
                  transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15, ease: 'easeInOut' }}
                />
              ))}
            </div>
          ) : (
            <span className="play-icon">▶</span>
          )}
        </button>
      </motion.div>
    </>
  );
};

export default BackgroundMusic;