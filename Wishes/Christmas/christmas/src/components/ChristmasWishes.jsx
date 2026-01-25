// import { useState, useEffect } from 'react'
// import GiftBox from './GiftBox'
// import '../styling/ChristmasWishes.css'
// import audioBgm from '../assets/audio/audiobgm.mp3'
// import treeImg from '../assets/photo/tree.jpg'
// import bg1 from '../assets/photo/bg_1.jpg'
// import bg2 from '../assets/photo/bg_2.jpg'
// import bg3 from '../assets/photo/bg_3.jpg'
// // import bg4 from '../assets/photo/bg_4.jpg'

// const ChristmasWishes = () => {
//   const [currentBg, setCurrentBg] = useState(0)
//   const [showGift, setShowGift] = useState(false)
  
// //   const backgrounds = [bg1, bg2, bg3, bg4]
//  const backgrounds = [bg1, bg2, bg3]

//   useEffect(() => {
//     // Auto-play audio
//     const audio = document.getElementById('bgAudio')
//     if (audio) {
//       audio.play().catch(err => console.log('Audio autoplay prevented:', err))
//     }

//     // Background slideshow - every 2 seconds
//     const interval = setInterval(() => {
//       setCurrentBg(prev => (prev + 1) % backgrounds.length)
//     }, 2000)

//     return () => clearInterval(interval)
//   }, [])

//   return (
//     <div 
//       className="christmas-container"
//       style={{ backgroundImage: `url(${backgrounds[currentBg]})` }}
//     >
//       <audio id="bgAudio" loop>
//         <source src={audioBgm} type="audio/mpeg" />
//       </audio>

//       <div className="content-wrapper">
//         <div className="wishes-card">
//           <div className="tree-container">
//             <img src={treeImg} alt="Christmas Tree" className="christmas-tree" />
//           </div>
          
//           <div className="wishes-text">
//             <h1 className="main-heading">Merry Christmas!</h1>
//             <p className="sub-heading">Wishing you joy, peace, and happiness</p>
//             <p className="from-text">From: <span className="name">Dheeraj</span></p>
//           </div>

//           <button 
//             className="gift-button"
//             onClick={() => setShowGift(true)}
//           >
//             🎁 Click for a Gift from Dheeraj! 🎁
//           </button>
//         </div>
//       </div>

//       {showGift && <GiftBox onClose={() => setShowGift(false)} />}

//       <div className="snow"></div>
//       <div className="snow"></div>
//       <div className="snow"></div>
//       <div className="snow"></div>
//       <div className="snow"></div>
//     </div>
//   )
// }

// export default ChristmasWishes

import { useState, useEffect, useRef } from 'react'
import GiftBox from './GiftBox'
import '../styling/ChristmasWishes.css'
import audioBgm from '../assets/audio/audiobgm.mp3'
import treeImg from '../assets/photo/tree.jpg'
import bg1 from '../assets/photo/bg_1.jpg'
import bg2 from '../assets/photo/bg_2.jpg'
import bg3 from '../assets/photo/bg_3.jpg'

const ChristmasWishes = () => {
  const [currentBg, setCurrentBg] = useState(0)
  const [showGift, setShowGift] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [audioReady, setAudioReady] = useState(false)
  const audioRef = useRef(null)
  
  const backgrounds = [bg1, bg2, bg3]

  useEffect(() => {
    // Background slideshow - every 2 seconds
    const interval = setInterval(() => {
      setCurrentBg(prev => (prev + 1) % backgrounds.length)
    }, 3500)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const audio = audioRef.current
    if (audio) {
      setAudioReady(true)
      
      // Try to autoplay (will work on some browsers)
      const playPromise = audio.play()
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true)
          })
          .catch(err => {
            console.log('Audio autoplay prevented - user interaction needed')
            setIsPlaying(false)
          })
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
      className="christmas-container"
      style={{ backgroundImage: `url(${backgrounds[currentBg]})` }}
    >
      <audio ref={audioRef} loop preload="auto">
        <source src={audioBgm} type="audio/mpeg" />
      </audio>

      {/* Audio Control Button */}
      {audioReady && (
        <button 
          className="audio-control"
          onClick={toggleAudio}
          aria-label={isPlaying ? 'Pause music' : 'Play music'}
        >
          {isPlaying ? '🔊' : '🔇'}
        </button>
      )}

      <div className="content-wrapper">
        <div className="wishes-card">
          <div className="tree-container">
            <img src={treeImg} alt="Christmas Tree" className="christmas-tree" />
          </div>
          
          <div className="wishes-text">
            <h1 className="main-heading">Merry Christmas!</h1>
            <p className="sub-heading">Wishing you joy, peace, and happiness</p>
            <p className="from-text">From: <span className="name">Dheeraj</span></p>
          </div>

          <button 
            className="gift-button"
            onClick={() => setShowGift(true)}
          >
            🎁 Click for a Gift from Dheeraj! 🎁
          </button>
        </div>
      </div>

      {showGift && <GiftBox onClose={() => setShowGift(false)} />}

      <div className="snow"></div>
      <div className="snow"></div>
      <div className="snow"></div>
      <div className="snow"></div>
      <div className="snow"></div>
    </div>
  )
}

export default ChristmasWishes