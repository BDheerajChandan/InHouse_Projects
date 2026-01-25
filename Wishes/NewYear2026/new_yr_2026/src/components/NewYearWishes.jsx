import { useState, useEffect, useRef } from 'react'
import GiftBox from './GiftBox'
import Fireworks from './Fireworks'
import '../styling/NewYearWishes.css'
import audioBgm from '../assets/audio/newyear_bgm.mp3'
import bg1 from '../assets/photos/bg_1.jpg'
import bg2 from '../assets/photos/bg_2.jpg'
import bg3 from '../assets/photos/bg_3.jpg'
import bg4 from '../assets/photos/bg_4.jpg'
import bg5 from '../assets/photos/bg_5.jpg'
import bg6 from '../assets/photos/bg_6.jpg'
import bg7 from '../assets/photos/bg_7.jpg'
import bg8 from '../assets/photos/bg_8.jpg'
import bg9 from '../assets/photos/bg_9.jpg'
import bg10 from '../assets/photos/bg_10.jpg'
import bg11 from '../assets/photos/bg_11.jpg'
import bg12 from '../assets/photos/bg_12.jpg'

const NewYearWishes = () => {
  // IMPORTANT: Change this name to whoever you want to wish
  const SENDER_NAME = "Dheeraj"
  
  const [currentBg, setCurrentBg] = useState(0)
  const [showGift, setShowGift] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [audioReady, setAudioReady] = useState(false)
  const [showFireworks, setShowFireworks] = useState(true)
  const audioRef = useRef(null)
  
  const backgrounds = [bg1, bg2, bg3, bg4, bg5, bg6, bg7, bg8, bg9, bg10, bg11, bg12]

  useEffect(() => {
    // Background slideshow - every 3.5 seconds
    const interval = setInterval(() => {
      setCurrentBg(prev => (prev + 1) % backgrounds.length)
    }, 4500)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const audio = audioRef.current
    if (audio) {
      setAudioReady(true)
      
      const playPromise = audio.play()
      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsPlaying(true))
          .catch(() => setIsPlaying(false))
      }
    }
  }, [])

  const toggleAudio = () => {
    const audio = audioRef.current
    if (audio) {
      if (isPlaying) {
        audio.pause()
        setIsPlaying(false)
      } else {
        audio.play()
          .then(() => setIsPlaying(true))
          .catch(err => console.log('Audio play failed:', err))
      }
    }
  }

  return (
    <div 
      className="newyear-container"
      style={{ 
        '--bg-image': `url(${backgrounds[currentBg]})` 
      }}
    >
      <audio ref={audioRef} loop preload="auto">
        <source src={audioBgm} type="audio/mpeg" />
      </audio>

      {audioReady && (
        <button 
          className="audio-control"
          onClick={toggleAudio}
          aria-label={isPlaying ? 'Pause music' : 'Play music'}
        >
          {isPlaying ? '🔊' : '🔇'}
        </button>
      )}

      {showFireworks && <Fireworks />}

      <div className="content-wrapper">
        <div className="wishes-card">
          <div className="year-display">
            <div className="year-number">2026</div>
            <div className="sparkle">✨</div>
          </div>
          
          <div className="wishes-text">
            <h1 className="main-heading">Happy New Year!</h1>
            <p className="sub-heading">May this year bring you joy, success, and endless possibilities</p>
            <div className="countdown-text">
              <span className="countdown-label">Cheers to New Beginnings! 🥂</span>
            </div>
            <p className="from-text">From: <span className="name">{SENDER_NAME}</span></p>
          </div>

          <button 
            className="gift-button"
            onClick={() => setShowGift(true)}
          >
            🎁 Click for a New Year Gift! 🎁
          </button>
        </div>
      </div>

      {showGift && <GiftBox onClose={() => setShowGift(false)} senderName={SENDER_NAME} />}

      {/* Confetti elements */}
      <div className="confetti"></div>
      <div className="confetti"></div>
      <div className="confetti"></div>
      <div className="confetti"></div>
      <div className="confetti"></div>
      <div className="confetti"></div>
      <div className="confetti"></div>
      <div className="confetti"></div>
    </div>
  )
}

export default NewYearWishes