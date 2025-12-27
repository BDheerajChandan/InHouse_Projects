// AudioWaveform.jsx
import React, { useEffect, useRef } from "react";           // Importing React for compnent usages

const BUFFER_DURATION = 60;                                 // duration
const SAMPLE_RATE = 60;                                     // Samples 
const MAX_POINTS = BUFFER_DURATION * SAMPLE_RATE;           // Total points = duration * Samples

export default function AudioWaveform({             // Waveform functionality
  recording,                                        // Recording parameter
  reset = false,                                    // Reset parameter by default false
  updateInterval = 100,                             // Update interval 
  yMax = 100,                                       // Y max limit         
  stream = null                                     // stream as null
}) {
  const canvasRef = useRef(null);                   // Set canvas reference as null 
  const containerRef = useRef(null);                // Set container reference as null 
  const audioContextRef = useRef(null);             // Set audio context reference as null 
  const analyserRef = useRef(null);                 // Set analyzer reference as null for audio
  const dataArrayRef = useRef(null);                // Set Array data reference as null for audio
  const animationIdRef = useRef(null);              // Set Animation Id reference as null
  const waveformHistoryRef = useRef(new Array(MAX_POINTS).fill(0));   // Waveform history in Array and fill all 0s
  const lastUpdateRef = useRef(0);                  // Set last update reference as 0.

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;

    function resizeCanvas() {
      if (!canvas || !container) return;
      const width = container.clientWidth;
      const height = 60;                            // Canvas height
      const dpr = window.devicePixelRatio || 1;

      canvas.width = width * dpr;                   // Canvas height and width configuration
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      lastUpdateRef.current = 0;
    }

    resizeCanvas();                                 // Call function resizeCanvas()
    const resizeObserver = new ResizeObserver(() => resizeCanvas());
    resizeObserver.observe(container);

    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {                               // If reset , reset waveform history
    if (reset) {
      waveformHistoryRef.current = new Array(MAX_POINTS).fill(0);
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  }, [reset]);

  useEffect(() => {
    if (!recording || !stream) {
      cancelAnimationFrame(animationIdRef.current);
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
      return;
    }

    async function setupAudio() {
      try {
        const audioCtx = new AudioContext();
        const source = audioCtx.createMediaStreamSource(stream);
        const analyser = audioCtx.createAnalyser();

        analyser.fftSize = 1024;
        const dataArray = new Uint8Array(analyser.fftSize);
        source.connect(analyser);

        audioContextRef.current = audioCtx;
        analyserRef.current = analyser;
        dataArrayRef.current = dataArray;

        draw();
      } catch (err) {
        console.error("Audio context setup failed:", err);
      }
    }

    function draw(timestamp) {                        // To visualize graph
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      const dpr = window.devicePixelRatio || 1;
      const width = canvas.width / dpr;
      const height = canvas.height / dpr;

      animationIdRef.current = requestAnimationFrame(draw);

      const analyser = analyserRef.current;
      const dataArray = dataArrayRef.current;
      if (!analyser || !dataArray) return;

      analyser.getByteTimeDomainData(dataArray);

      let max = 0;
      for (let i = 0; i < dataArray.length; i++) {
        const val = Math.abs(dataArray[i] - 128) / 128;
        if (val > max) max = val;
      }

      let amplitude = max * yMax;
      if (amplitude <= 0.1) amplitude = 0;

      if (!lastUpdateRef.current || (timestamp - lastUpdateRef.current) > updateInterval) {
        waveformHistoryRef.current.push(amplitude);
        if (waveformHistoryRef.current.length > MAX_POINTS) {
          waveformHistoryRef.current.shift();
        }
        lastUpdateRef.current = timestamp;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.scale(dpr, dpr);

      const centerY = height / 2;
      const history = waveformHistoryRef.current;
      const barWidth = 3;
      const spacing = 2;
      const maxBars = Math.floor(width / (barWidth + spacing));
      const barsToDraw = history.slice(-maxBars);

      ctx.fillStyle = "#128C7E";
      let x = 0;

      for (let i = 0; i < barsToDraw.length; i++) {
        const amp = barsToDraw[i];
        const barHeight = Math.max(2, (amp / yMax) * (height * 0.6));
        ctx.fillRect(x, centerY - barHeight / 2, barWidth, barHeight);
        x += barWidth + spacing;
      }

      ctx.restore();
    }

    setupAudio();

    return () => {
      cancelAnimationFrame(animationIdRef.current);
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
    };
  }, [recording, updateInterval, yMax, stream]);

  return (
    <div ref={containerRef} style={{ flex: 1, display: "flex", alignItems: "center" }}>
      <canvas
        ref={canvasRef}
        style={{
          backgroundColor: "transparent",
          width: "100%",
          height: "60px",
          display: "block",
        }}
      />
    </div>
  );
}