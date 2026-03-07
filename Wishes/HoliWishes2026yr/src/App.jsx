// App.jsx

// import { useState, useRef, useCallback } from "react";
import "./App.css";
import { useState, useRef, useCallback, useEffect } from "react";

// const bgImages = Object.values(
//   import.meta.glob("./assets/bgimage/*", { eager: true, as: "url" })
// );
// const bgAudios = Object.values(
//   import.meta.glob("./assets/bgaudio/*", { eager: true, as: "url" })
// );
const bgImages = Object.values(
  import.meta.glob("./assets/bgimage/*", {
    eager: true,
    query: "?url",
    import: "default",
  })
);

const bgAudios = Object.values(
  import.meta.glob("./assets/bgaudio/*", {
    eager: true,
    query: "?url",
    import: "default",
  })
);

const SPLATTER_COLORS = [
  "#ff6f61",  // coral red
  "#ff9ff3",  // cotton candy
  "#48dbfb",  // sky glow
  "#00d2d3",  // cyan pulse
  "#54a0ff",  // bright blue
  "#5f27cd",  // deep violet
  "#341f97",  // royal purple
  "#10ac84",  // fresh teal
  "#1dd1a1",  // mint green
  "#ffb142",  // mango
  "#ffda79",  // soft amber
  "#ff5252",  // vivid red
  "#b8e994",  // light pistachio
  "#78e08f",  // fresh leaf
  "#079992",  // deep aqua
  "#6D214F",  // dark rose
  "#EE5A24",  // sunset orange
  "#0abde3",  // electric blue
  "#f368e0",  // bright magenta
  "#c8d6e5",  // light mist
];

let uid = 0;

function generateSplatter(cx, cy) {
  const drops = [];
  const count = Math.floor(Math.random() * 80) + 120; // 120–200 drops

  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    // Spread across ENTIRE screen — not just near click
    const maxDist = Math.max(window.innerWidth, window.innerHeight) * 0.75;
    const dist = Math.random() * maxDist * 0.9 + 30;
    const size = Math.random() * 12 + 2;

    drops.push({
      x: cx + Math.cos(angle) * dist,
      y: cy + Math.sin(angle) * dist,
      size,
      delay: Math.random() * 0.15,
      hasTail: Math.random() > 0.45,
      tailAngle: angle + (Math.random() - 0.5) * 0.4,
      tailDist: dist * (0.35 + Math.random() * 0.5),
      tailSize: size * (0.25 + Math.random() * 0.45),
    });
  }
  return drops;
}

// Big, satisfying throw sound
function playThrowSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();

    // Low thud
    const buf = ctx.createBuffer(1, ctx.sampleRate * 0.3, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.06));
    }
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const thudGain = ctx.createGain();
    thudGain.gain.setValueAtTime(1.2, ctx.currentTime);
    thudGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    src.connect(thudGain);
    thudGain.connect(ctx.destination);
    src.start();

    // Splat sweep
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(280, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.25);
    g.gain.setValueAtTime(0.5, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc.connect(g);
    g.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.3);

    // Fizz layer
    const buf2 = ctx.createBuffer(1, ctx.sampleRate * 0.4, ctx.sampleRate);
    const d2 = buf2.getChannelData(0);
    for (let i = 0; i < d2.length; i++) {
      d2[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.15));
    }
    const src2 = ctx.createBufferSource();
    src2.buffer = buf2;
    const fizzFilter = ctx.createBiquadFilter();
    fizzFilter.type = "highpass";
    fizzFilter.frequency.value = 3000;
    const fizzGain = ctx.createGain();
    fizzGain.gain.setValueAtTime(0.4, ctx.currentTime + 0.05);
    fizzGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    src2.connect(fizzFilter);
    fizzFilter.connect(fizzGain);
    fizzGain.connect(ctx.destination);
    src2.start(ctx.currentTime + 0.05);
  } catch (_) {}
}

// Small water drop for clear button
function playWaterDrop() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(900, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.18);
    g.gain.setValueAtTime(0.3, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
    osc.connect(g);
    g.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.25);
  } catch (_) {}
}

export default function App() {
  const [splashes, setSplashes] = useState([]);
  const [ripples, setRipples]   = useState([]);
  const [message, setMessage]   = useState(false);
  const [clearing, setClearing] = useState(false);
  const bgAudioRef = useRef(null);
  const bgAudioStarted = useRef(false);

  const [isReady, setIsReady] = useState(false);

// Preload all assets on mount so clicks feel instant
useEffect(() => {
  const preloadPromises = [];

  // Preload audio — decode it into browser memory
  if (hasBgAudio && bgAudioRef.current) {
    bgAudioRef.current.volume = 0.18;
    bgAudioRef.current.load(); // triggers fetch + buffer
    preloadPromises.push(
      new Promise(resolve => {
        bgAudioRef.current.addEventListener("canplaythrough", resolve, { once: true });
        bgAudioRef.current.addEventListener("error", resolve, { once: true }); // don't block on error
      })
    );
  }

  // Preload background image
  if (hasBgImage) {
    bgImages.forEach(src => {
      const img = new Image();
      preloadPromises.push(
        new Promise(resolve => {
          img.onload = resolve;
          img.onerror = resolve;
          img.src = src;
        })
      );
    });
  }

  // Warm up Web Audio API (avoids 300ms init delay on first click)
  try {
    const warmCtx = new (window.AudioContext || window.webkitAudioContext)();
    const warmBuf = warmCtx.createBuffer(1, 1, 22050);
    const warmSrc = warmCtx.createBufferSource();
    warmSrc.buffer = warmBuf;
    warmSrc.connect(warmCtx.destination);
    warmSrc.start(0);
    preloadPromises.push(warmCtx.resume());
  } catch (_) {}

  // Mark ready — wait for all, but cap at 1 second max
  const timeout = setTimeout(() => setIsReady(true), 1000);
  Promise.all(preloadPromises).then(() => {
    clearTimeout(timeout);
    setIsReady(true);
  });
}, []); // runs once on mount

  const hasBgImage = bgImages.length > 0;
  const hasBgAudio = bgAudios.length > 0;

  const throwSplash = useCallback((clientX, clientY) => {
    playThrowSound();

    // Resume bg audio if it was started before (e.g. after clear paused it)
    if (hasBgAudio && bgAudioRef.current) {
      if (!bgAudioStarted.current) {
        bgAudioRef.current.volume = 0.18;
        bgAudioStarted.current = true;
      }
      bgAudioRef.current.play().catch(() => {});  // ← resumes if paused
    }

    const color = SPLATTER_COLORS[Math.floor(Math.random() * SPLATTER_COLORS.length)];
    const id = ++uid;
    const drops = generateSplatter(clientX, clientY);

    // Ripple
    const rid = ++uid;
    setRipples(prev => [...prev, { id: rid, x: clientX, y: clientY }]);
    setTimeout(() => setRipples(prev => prev.filter(r => r.id !== rid)), 900);

    setSplashes(prev => [...prev, { id, color, drops }]);

    setMessage(false);
    requestAnimationFrame(() => setMessage(true));
    setTimeout(() => setMessage(false), 3500);
  }, [hasBgAudio]);

  const handleClear = useCallback((e) => {
    e.stopPropagation();
    playWaterDrop();

    // Pause bg audio on clear
    if (hasBgAudio && bgAudioRef.current) {
      bgAudioRef.current.pause();             // ← pause, not stop (keeps position)
    }

    setClearing(true);
    setTimeout(() => {
      setSplashes([]);
      setRipples([]);
      setMessage(false);
      setClearing(false);
    }, 700);
  }, []);

  return (
    <div className="app-root" onClick={e => throwSplash(e.clientX, e.clientY)}>

      {/* Background — with padding when image exists */}
      <div
        className={`app-bg ${hasBgImage ? "has-bg-image" : ""}`}
        style={hasBgImage ? { backgroundImage: `url(${bgImages[0]})` } : {}}
      />

      {hasBgAudio && (
        <audio ref={bgAudioRef} src={bgAudios[0]} loop preload="auto" />
      )}

      {/* Full-screen splatter — overlays EVERYTHING including card */}
      <svg
        className={`splatter-svg ${clearing ? "clearing" : ""}`}
        aria-hidden="true"
      >
        {splashes.map(splash =>
          splash.drops.map((drop, di) => (
            <g key={`${splash.id}-${di}`}>
              <circle
                cx={drop.x} cy={drop.y} r={drop.size}
                fill={splash.color}
                className="splatter-dot"
                style={{ animationDelay: `${drop.delay}s` }}
              />
              {drop.hasTail && (
                <circle
                  cx={drop.x + Math.cos(drop.tailAngle) * (drop.tailDist - Math.hypot(drop.x, drop.y) * 0)}
                  cy={drop.y + Math.sin(drop.tailAngle) * (drop.tailDist - Math.hypot(drop.x, drop.y) * 0)}
                  r={drop.tailSize}
                  fill={splash.color}
                  className="splatter-dot"
                  style={{ animationDelay: `${drop.delay + 0.05}s` }}
                />
              )}
            </g>
          ))
        )}
      </svg>

      {/* Ripples */}
      <div className="ripple-layer" aria-hidden="true">
        {ripples.map(r => (
          <div key={r.id} className="ripple" style={{ left: r.x, top: r.y }} />
        ))}
      </div>

      {/* Clear wash overlay */}
      {clearing && <div className="clear-wash" aria-hidden="true" />}

      {/* Card — splatter renders OVER it via z-index */}
      <div className="holi-card" onClick={e => e.stopPropagation()}>
        <p className="pre-title">Happy Holi 🎨</p>

        <h1 className="holi-title">
          <span style={{ color: "#e8413e" }}>H</span>
          <span style={{ color: "#f5c518" }}>O</span>
          <span style={{ color: "#4caf50" }}>L</span>
          <span style={{ color: "#2196f3" }}>I</span>
        </h1>
        <p className="year-text">2 0 2 6</p>

        <p className="wish-line">Wishing you a colorful festival of joy & love!</p>

        <div className="from-section">
          <span className="from-label">With love from</span>
          <span className="from-name">Dheeraj 💛</span>
        </div>

        {/* <div className="btn-row">
          <button
            className="water-btn throw-btn"
            onClick={e => { e.stopPropagation(); throwSplash(e.clientX, e.clientY); }}
            title="Throw colors!"
          >
            <span className="water-drop-icon">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C12 2 5 9.5 5 14a7 7 0 0014 0C19 9.5 12 2 12 2z"/>
              </svg>
            </span>
            Throw Colors!
          </button>

          <button
            className="water-btn clear-btn"
            onClick={handleClear}
            title="Wash away colors"
          >
            <span className="clear-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M12 2C12 2 5 9.5 5 14a7 7 0 0014 0C19 9.5 12 2 12 2z" fill="currentColor" fillOpacity="0.25"/>
                <path d="M9 14c0 1.657 1.343 3 3 3"/>
                <path d="M5 19l14-14" strokeLinecap="round"/>
              </svg>
            </span>
            Clear
          </button>
        </div> */}
        <div className="btn-row">
  <button
    className={`water-btn throw-btn ${!isReady ? "btn-loading" : ""}`}
    disabled={!isReady}
    onClick={e => { e.stopPropagation(); throwSplash(e.clientX, e.clientY); }}
    title="Throw colors!"
  >
    <span className="water-drop-icon">
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C12 2 5 9.5 5 14a7 7 0 0014 0C19 9.5 12 2 12 2z"/>
      </svg>
    </span>
    {isReady ? "Throw Colors!" : "Loading..."}
  </button>

  <button
    className={`water-btn clear-btn ${!isReady ? "btn-loading" : ""}`}
    disabled={!isReady}
    onClick={handleClear}
    title="Wash away colors"
  >
    <span className="clear-icon">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
        <path d="M12 2C12 2 5 9.5 5 14a7 7 0 0014 0C19 9.5 12 2 12 2z" fill="currentColor" fillOpacity="0.25"/>
        <path d="M9 14c0 1.657 1.343 3 3 3"/>
        <path d="M5 19l14-14" strokeLinecap="round"/>
      </svg>
    </span>
    Clear
  </button>
</div>

        <p className="tap-hint">Click anywhere to splash · tap Clear to wash off</p>
      </div>

      {/* Message */}
      <div className={`holi-message ${message ? "show" : ""}`} aria-live="polite">
        <span>Bura Mat Mano, Holi Hai! 🎉🌈</span>
      </div>
    </div>
  );
}