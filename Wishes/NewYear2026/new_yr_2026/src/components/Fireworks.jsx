// src/components/Fireworks.jsx

import { useEffect } from 'react'
import '../styling/Fireworks.css'

const Fireworks = () => {
  useEffect(() => {
    const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ffa500']
    
    const createFirework = () => {
      const firework = document.createElement('div')
      firework.className = 'firework'
      firework.style.left = Math.random() * 100 + '%'
      firework.style.top = Math.random() * 50 + '%'
      firework.style.setProperty('--firework-color', colors[Math.floor(Math.random() * colors.length)])
      
      document.querySelector('.fireworks-container')?.appendChild(firework)
      
      setTimeout(() => {
        firework.remove()
      }, 2000)
    }

    const interval = setInterval(createFirework, 800)
    
    return () => clearInterval(interval)
  }, [])

  return <div className="fireworks-container"></div>
}

export default Fireworks