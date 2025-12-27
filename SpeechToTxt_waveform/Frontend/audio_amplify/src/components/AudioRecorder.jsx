// AudioRecorder.jsx
import React, { useState, useRef, useEffect } from "react";
import AudioWaveform from "./AudioWaveform";

export default function AudioRecorder({ onFinishRecording, onDelete }) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [resetWaveform, setResetWaveform] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerIntervalRef = useRef(null);
  const streamRef = useRef(null);
  const recognitionRef = useRef(null);
  const isRecognitionActiveRef = useRef(false);


  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("SpeechRecognition API not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      if (!isRecognitionActiveRef.current) return;

      let interim = "";
      let final = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcriptPiece = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += transcriptPiece + " ";
        } else {
          interim += transcriptPiece;
        }
      }

      if (final.trim()) {
        setTranscript((prev) => prev + final);
        setInterimTranscript("");
      } else {
        setInterimTranscript(interim);
      }
    };

    recognition.onerror = (event) => {
      console.error("SpeechRecognition error:", event.error);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          console.log("Speech recognition cleanup error:", e);
        }
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const options = MediaRecorder.isTypeSupported('audio/webm')
        ? { mimeType: 'audio/webm' }
        : MediaRecorder.isTypeSupported('audio/mp4')
          ? { mimeType: 'audio/mp4' }
          : {};

      const recorder = new MediaRecorder(stream, options);
      console.log("MediaRecorder started with mimeType:", recorder.mimeType);

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          console.log("Data chunk received:", event.data.size, "bytes");
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        console.log("Recording stopped. Total chunks:", audioChunksRef.current.length);

        if (audioChunksRef.current.length === 0) {
          console.error("No audio data recorded!");
          return;
        }

        const mimeType = recorder.mimeType || 'audio/webm';
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        console.log("Audio blob created:", audioBlob.size, "bytes, type:", audioBlob.type);

        audioChunksRef.current = [];

        // Send the blob to parent
        onFinishRecording(audioBlob);
      };

      mediaRecorderRef.current = recorder;
      recorder.start(1000);
      console.log("Recording started");

      setIsRecording(true);
      setIsPaused(false);
      setRecordingTime(0);
      setTranscript("");
      setInterimTranscript("");
      setResetWaveform(true);
      setTimeout(() => setResetWaveform(false), 0);

      // Start speech recognition
      if (recognitionRef.current) {
        isRecognitionActiveRef.current = true;
        try {
          recognitionRef.current.start();
          console.log("Speech recognition started");
        } catch (e) {
          console.log("Speech recognition start error:", e);
        }
      }

      timerIntervalRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error("Error starting recording:", error);
      alert("Could not access microphone. Please check permissions.");
    }
  };

  const stopRecording = () => {
    console.log("Stopping recording...");

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    // Stop speech recognition
    if (recognitionRef.current) {
      isRecognitionActiveRef.current = false;
      try {
        recognitionRef.current.stop();
        console.log("Speech recognition stopped");
      } catch (e) {
        console.log("Speech recognition stop error:", e);
      }
    }

    setIsRecording(false);
    setIsPaused(false);
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.pause();
      console.log("Recording paused");
    }

    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    // Pause speech recognition
    if (recognitionRef.current && isRecognitionActiveRef.current) {
      try {
        recognitionRef.current.stop();
        console.log("Speech recognition paused");
      } catch (e) {
        console.log("Speech recognition pause error:", e);
      }
    }

    setIsPaused(true);
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "paused") {
      mediaRecorderRef.current.resume();
      console.log("Recording resumed");
    }

    timerIntervalRef.current = setInterval(() => {
      setRecordingTime((prev) => prev + 1);
    }, 1000);

    // Resume speech recognition
    if (recognitionRef.current) {
      isRecognitionActiveRef.current = true;
      try {
        recognitionRef.current.start();
        console.log("Speech recognition resumed");
      } catch (e) {
        console.log("Speech recognition resume error:", e);
      }
    }

    setIsPaused(false);
  };

  const deleteRecording = () => {
    console.log("Deleting recording...");

    // Stop everything
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    if (recognitionRef.current) {
      isRecognitionActiveRef.current = false;
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.log("Speech recognition delete error:", e);
      }
    }

    // Clear chunks
    audioChunksRef.current = [];

    // Reset states
    setIsRecording(false);
    setIsPaused(false);
    setRecordingTime(0);
    setTranscript("");
    setInterimTranscript("");

    console.log("Recording deleted, no audio saved");

    // Call parent's onDelete to close recorder UI
    onDelete();
  };

  const handlePlayButton = () => {
    const fullText = transcript + interimTranscript;
    if (fullText.trim()) {
      alert(fullText);
    } else {
      alert("No transcript available yet. Start speaking to see transcription.");
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const currentText = transcript + interimTranscript;

  // Auto-start recording when component mounts
  // Prevent duplicate auto-start (especially in React StrictMode)
  const hasStartedRef = useRef(false);

  // Auto-start recording when component mounts
  useEffect(() => {
    if (hasStartedRef.current) {
      console.log("Recording already started — skipping duplicate start");
      return; // ✅ Skip second mount in StrictMode
    }
    hasStartedRef.current = true;

    startRecording();

    return () => {
      // Cleanup on unmount
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          console.log("Cleanup error:", e);
        }
      }
    };
  }, []);




  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      gap: "16px",
      width: "100%"
    }}>
      <div style={{
        backgroundColor: "white",
        padding: "20px",
        borderRadius: "12px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        minHeight: "200px",
        maxHeight: "350px",
        overflowY: "auto"
      }}>
        <h3 style={{
          margin: "0 0 12px 0",
          color: "#075E54",
          fontSize: "18px"
        }}>
          Live Transcription:
        </h3>
        <div style={{
          height:"100px",
          fontSize: "16px",
          lineHeight: "1.6",
          color: currentText ? "#333" : "#999",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word"
        }}>
          <textarea
            value={currentText || "Start speaking... Your words will appear here."}
            onChange={(e) => setTranscript(e.target.value)}
            style={{
              
              width: '100%',
              height: '100%',
              border: 'none',
              resize: 'none',
              backgroundColor: 'transparent',
              fontSize: '16px',
              lineHeight: '1.6',
              color: currentText ? '#333' : '#999',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              outline: 'none',
            }}
          />

        </div>
      </div>

      {/* Recording Controls */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        backgroundColor: "white",
        padding: "16px 20px",
        borderRadius: "30px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        width: "100%"
      }}>
        {/* Delete Button */}
        <button
          onClick={deleteRecording}
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "50%",
            border: "none",
            backgroundColor: "#f3f3f3",
            fontSize: "24px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#667781",
            flexShrink: 0
          }}
        >
          🗑️
        </button>

        {/* Timer */}
        <span style={{
          fontSize: "20px",
          fontWeight: "600",
          color: "#000",
          minWidth: "70px",
          flexShrink: 0
        }}>
          {formatTime(recordingTime)}
        </span>

        {/* Waveform */}
        <AudioWaveform
          recording={isRecording && !isPaused}
          reset={resetWaveform}
          stream={streamRef.current}
        />

        {/* Pause/Resume Button */}
        <button
          onClick={isPaused ? resumeRecording : pauseRecording}
          disabled={!isRecording}
          style={{
            width: "56px",
            height: "56px",
            borderRadius: "50%",
            border: "none",
            backgroundColor: isPaused ? "#FFA500" : "#F44336",
            color: "white",
            fontSize: "32px",
            cursor: !isRecording ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: "bold",
            flexShrink: 0,
            opacity: !isRecording ? 0.5 : 1
          }}
        >
          {isPaused ? "▶️" : "⏸"}
        </button>

        {/* Play/Alert Button - Shows transcript in alert */}
        <button
          onClick={handlePlayButton}
          style={{
            width: "64px",
            height: "64px",
            borderRadius: "50%",
            border: "none",
            backgroundColor: "#25D366",
            color: "white",
            fontSize: "28px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0
          }}
        >
          💬
        </button>

        {/* Stop/Record Button - Stops and saves recording */}
        <button
          onClick={stopRecording}
          disabled={!isRecording && !isPaused}
          style={{
            width: "64px",
            height: "64px",
            borderRadius: "50%",
            border: "none",
            backgroundColor: "#25D366",
            color: "white",
            fontSize: "36px",
            cursor: (!isRecording && !isPaused) ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            opacity: (!isRecording && !isPaused) ? 0.5 : 1
          }}
        >
          ⏺️
        </button>
      </div>
    </div>
  );
}