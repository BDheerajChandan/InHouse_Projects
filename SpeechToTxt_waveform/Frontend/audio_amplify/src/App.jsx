// App.jsx
import React, { useState, useEffect } from "react";
import AudioRecorder from "./components/AudioRecorder";
import AudioPlayer from "./components/AudioPlayer";

export default function App() {
  const [recordedBlob, setRecordedBlob] = useState(null);
  const [audioURL, setAudioURL] = useState("");
  const [message, setMessage] = useState("");
  const [showRecorder, setShowRecorder] = useState(false);

  useEffect(() => {
    if (recordedBlob) {
      const url = URL.createObjectURL(recordedBlob);
      setAudioURL(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setAudioURL("");
    }
  }, [recordedBlob]);

  const handleCancelAudio = () => {
    setRecordedBlob(null);
    console.log("Audio cancelled");
  };

  const handleStartRecording = () => {
    setShowRecorder(true);
    setRecordedBlob(null); // Clear any previous recording
  };

  const handleFinishRecording = (blob) => {
    setRecordedBlob(blob);
    setShowRecorder(false);
  };

  const handleDeleteRecording = () => {
    setShowRecorder(false);
    setRecordedBlob(null);
  };

  return (
    <div style={{
      minHeight: "100vh",
      width: "100vw",
      backgroundColor: "#E5DDD5",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      padding: "20px",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      boxSizing: "border-box"
    }}>
      <div style={{
        maxWidth: "900px",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        gap: "20px"
      }}>
        <h1 style={{
          textAlign: "center",
          color: "#075E54",
          fontSize: "32px",
          margin: "0 0 20px 0"
        }}>
          Live Speech to Text
        </h1>

        {/* Show recorded audio player if available and not recording */}
        {recordedBlob && !showRecorder && (
          <div style={{ marginBottom: "16px" }}>
            <AudioPlayer audioSrc={audioURL} onCancel={handleCancelAudio} />
          </div>
        )}

        {/* Recording Interface or Message Input */}
        {!showRecorder ? (
          // Message Input UI
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            backgroundColor: "white",
            padding: "12px 16px",
            borderRadius: "30px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
          }}>
            <input
              type="text"
              placeholder="Type a message or record audio..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              style={{
                flex: 1,
                border: "none",
                outline: "none",
                fontSize: "16px",
                padding: "12px 16px",
                backgroundColor: "transparent"
              }}
            />

            <button
              onClick={handleStartRecording}
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "50%",
                border: "none",
                backgroundColor: "#25D366",
                color: "white",
                fontSize: "24px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0
              }}
            >
              🎤
            </button>
          </div>
        ) : (
          // Recording UI (Full Screen)
          <AudioRecorder
            onFinishRecording={handleFinishRecording}
            onDelete={handleDeleteRecording}
          />
        )}
      </div>
    </div>
  );
}