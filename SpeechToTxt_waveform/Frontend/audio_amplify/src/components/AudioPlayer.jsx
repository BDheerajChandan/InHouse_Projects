// AudioPlayer.jsx
import React, { useRef, useState, useEffect } from "react";       // Importing React for compnent usages

export default function AudioPlayer({ audioSrc, onCancel }) {     // Function that handles Audio source and action on cancel status 
  const audioRef = useRef(null);                                  // For Audio reference
  const [isPlaying, setIsPlaying] = useState(false);              // For handling toggle button for play/pause button
  const [currentTime, setCurrentTime] = useState(0);              // For current Time      
  const [duration, setDuration] = useState(0);                    // For recording duration
  const [isLoading, setIsLoading] = useState(true);               // 

  const togglePlay = () => {                                      // Set Toggle button functionality
    if (!audioRef.current) return;                                // No audio reference then return null

    if (isPlaying) {                                              // If play button false means it is in pause state
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      const playPromise = audioRef.current.play();                // If play button is True and is defined 
      if (playPromise !== undefined) {                            // then set play button true
        playPromise
          .then(() => {
            setIsPlaying(true);
          })
          .catch((error) => {
            console.error("Error playing audio:", error);         // Error message if error during play
            setIsPlaying(false);
          });
      }
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handlePlay = () => setIsPlaying(true);                        // Handel event for play button
    const handlePause = () => setIsPlaying(false);                      // Handle event for pause button
    const handleEnded = () => setIsPlaying(false);                      // Handle event for end_play button
    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);   // Handle audio duration 
    const handleLoadedMetadata = () => {                                // Get audio duration
      setDuration(audio.duration || 0);
      setIsLoading(false);
    };
    const handleCanPlay = () => setIsLoading(false);                    // Handle play button

    audio.addEventListener("play", handlePlay);                         // Event listeners for play button 
    audio.addEventListener("pause", handlePause);                       // Event listeners for pause button 
    audio.addEventListener("ended", handleEnded);                       // Event listeners for ending play button 
    audio.addEventListener("timeupdate", handleTimeUpdate);             // Event listeners for timeupdate
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);     // Event listeners for handling metadata
    audio.addEventListener("canplay", handleCanPlay);                   // Event listeners for handling play after pause

    if (audio.readyState >= 2) {                                        // Audio duration more than 2 then set audio duration
      setDuration(audio.duration || 0);
      setIsLoading(false);
    }

    return () => {                                                      // Return 
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("canplay", handleCanPlay);
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio && audioSrc) {                  // If audio source or audio 
      setIsLoading(true);                     // Set loading to True
      setIsPlaying(false);                    // Set playing as False
      setCurrentTime(0);                      // Set current time and duration as 0
      setDuration(0);
      audio.load();                           // Then load audio

      const checkDuration = () => {           // FUnction to check audio duration
        if (audio.duration && isFinite(audio.duration) && audio.duration > 0) {
          setDuration(audio.duration);
          setIsLoading(false);
        } else {
          setTimeout(checkDuration, 200);
        }
      };

      checkDuration();                        // Call function to get audio duration 
    }
  }, [audioSrc]);                             // Audio Source       

  const handleSeek = (e) => {                 // For seek functionality
    const newTime = parseFloat(e.target.value);
    if (audioRef.current && !isNaN(newTime)) {  
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const formatTime = (sec) => {                       // Return recorded time in seconds
    if (isNaN(sec) || !isFinite(sec)) return "0:00";
    const minutes = Math.floor(sec / 60);
    const seconds = Math.floor(sec % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: "12px",
      padding: "12px 16px",
      backgroundColor: "#DCF8C6",
      borderRadius: "8px",
      boxShadow: "0 1px 2px rgba(0,0,0,0.1)"
    }}>
      <audio ref={audioRef} src={audioSrc} preload="auto" />  {/*Audio data*/}
      
      <button
        onClick={togglePlay}                                  // Toggle button for play/pause
        disabled={isLoading}
        style={{                                             
          width: "44px",
          height: "44px",
          borderRadius: "50%",
          border: "none",
          backgroundColor: "#128C7E",
          color: "white",
          fontSize: "20px",
          cursor: isLoading ? "not-allowed" : "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: isLoading ? 0.6 : 1
        }}
      >
        {isLoading ? "⏳" : isPlaying ? "⏸" : "▶"}        {/* If loading is then play or pause as per stustus of IsPlaying */}
      </button>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "4px" }}>
        <input
          type="range"
          min={0}
          max={duration || 0}
          step="0.01"
          value={currentTime}
          onChange={handleSeek}
          disabled={isLoading}
          style={{
            width: "100%",
            cursor: isLoading ? "not-allowed" : "pointer",
            accentColor: "#128C7E",
            height: "4px"
          }}
        />
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: "12px",
          color: "#667781",
          fontFamily: "monospace"
        }}>
          <span>{formatTime(currentTime)}</span>    {/* For current time as input*/}
          <span>{formatTime(duration)}</span>       {/* For current Duration as input*/}
        </div>
      </div>

      <button
        onClick={onCancel}                  // On click, cancel button
        style={{
          width: "36px",
          height: "36px",
          borderRadius: "50%",
          border: "none",
          backgroundColor: "#EF4444",
          color: "white",
          fontSize: "18px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: "bold"
        }}
      >
        ✕
      </button>
    </div>
  );
}