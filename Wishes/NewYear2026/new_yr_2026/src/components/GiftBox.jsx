import { useState, useEffect } from 'react'
import '../styling/GiftBox.css'

import gift1 from '../assets/gifts/gift1.png'
import gift2 from '../assets/gifts/gift2.png'
import gift3 from '../assets/gifts/gift3.png'
import gift4 from '../assets/gifts/gift4.png'
import gift5 from '../assets/gifts/gift5.png'
import gift6 from '../assets/gifts/gift6.png'
import gift7 from '../assets/gifts/gift7.png'
import gift8 from '../assets/gifts/gift8.png'

const GiftBox = ({ onClose, senderName }) => {
  const [selectedGift, setSelectedGift] = useState(null)
  const [isRevealing, setIsRevealing] = useState(false)

  const gifts = [
    { id: 1, name: 'New Year Gift 1', image: gift1 },
    { id: 2, name: 'New Year Gift 2', image: gift2 },
    { id: 3, name: 'New Year Gift 3', image: gift3 },
    { id: 4, name: 'New Year Gift 4', image: gift4 },
    { id: 5, name: 'New Year Gift 5', image: gift5 },
    { id: 6, name: 'New Year Gift 5', image: gift6 },
    { id: 7, name: 'New Year Gift 5', image: gift7 },
    { id: 8, name: 'New Year Gift 5', image: gift8 }
  ]

  useEffect(() => {
    const randomGift = gifts[Math.floor(Math.random() * gifts.length)]
    
    setTimeout(() => {
      setIsRevealing(true)
      setTimeout(() => {
        setSelectedGift(randomGift)
      }, 800)
    }, 300)
  }, [])

  return (
    <div className="gift-overlay" onClick={onClose}>
      <div className="gift-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>×</button>
        
        <div className="gift-content">
          {!selectedGift ? (
            <div className={`gift-box-animation ${isRevealing ? 'revealing' : ''}`}>
              <div className={`gift-box ${isRevealing ? 'revealing' : ''}`}>
                <div className="gift-lid"></div>
                <div className="gift-body"></div>
                <div className="gift-ribbon-h"></div>
                <div className="gift-ribbon-v"></div>
                <div className="gift-bow"></div>
              </div>
              <p className="opening-text">Unwrapping your gift...</p>
            </div>
          ) : (
            <div className="gift-revealed">
              <h2 className="gift-title">Your New Year Gift! 🎊</h2>
              <div className="gift-image-container">
                <img 
                  src={selectedGift.image} 
                  alt={selectedGift.name} 
                  className="gift-image"
                  onError={(e) => {
                    e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23ddd" width="200" height="200"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" fill="%23999" font-size="20"%3EGift%3C/text%3E%3C/svg%3E'
                  }}
                />
              </div>
              <p className="gift-message">Wishing you an amazing 2026! 🎉</p>
              <p className="gift-from">- {senderName}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default GiftBox