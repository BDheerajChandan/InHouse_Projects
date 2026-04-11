
import { useRef, useState } from 'react'
import html2canvas from 'html2canvas'
import './App.css'

function SlideOne() {
  return (
    <div className="slide hello-slide">
      <h1>Hello World</h1>
    </div>
  )
}

function SlideTwo() {
  return (
    <div className="slide morning-slide">
      <h1>Good Morning</h1>
    </div>
  )
}

function App() {
  const captureRef = useRef(null)
  const [currentSlide, setCurrentSlide] = useState(1)
  const [isRecording, setIsRecording] = useState(false)

  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === 1 ? 2 : 1))
  }

  const previousSlide = () => {
    setCurrentSlide((prev) => (prev === 2 ? 1 : 2))
  }

  const handleWheel = (event) => {
    if (event.deltaY > 0) {
      nextSlide()
    } else {
      previousSlide()
    }
  }

  const downloadVideo = async () => {
    setIsRecording(true)
    setCurrentSlide(1)

    await wait(300)

    const firstCanvas = await html2canvas(captureRef.current, {
      useCORS: true,
      scale: 2,
    })

    const videoCanvas = document.createElement('canvas')
    const ctx = videoCanvas.getContext('2d')

    videoCanvas.width = firstCanvas.width
    videoCanvas.height = firstCanvas.height

    const stream = videoCanvas.captureStream(30)

    const recorder = new MediaRecorder(stream, {
      mimeType: 'video/webm',
    })

    const chunks = []

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunks.push(event.data)
      }
    }

    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' })
      const url = URL.createObjectURL(blob)

      const a = document.createElement('a')
      a.href = url
      a.download = 'two-slides-video.webm'
      a.click()

      URL.revokeObjectURL(url)
      setIsRecording(false)
    }

    recorder.start()

    const fps = 30
    const durationPerSlide = 3
    const framesPerSlide = fps * durationPerSlide

    const recordFrames = async () => {
      for (let i = 0; i < framesPerSlide; i++) {
        const canvasFrame = await html2canvas(captureRef.current, {
          useCORS: true,
          scale: 2,
        })

        ctx.clearRect(0, 0, videoCanvas.width, videoCanvas.height)
        ctx.drawImage(canvasFrame, 0, 0)

        await wait(1000 / fps)
      }
    }

    await recordFrames()

    setCurrentSlide(2)
    await wait(500)

    await recordFrames()

    recorder.stop()
  }

  return (
    <div className="app-container">
      <div
        className="video-frame"
        ref={captureRef}
        onWheel={handleWheel}
      >
        {currentSlide === 1 ? <SlideOne /> : <SlideTwo />}
      </div>

      <div className="button-group">
        <button onClick={previousSlide}>Previous</button>
        <button onClick={nextSlide}>Next</button>
        <button onClick={downloadVideo} disabled={isRecording}>
          {isRecording ? 'Creating Video...' : 'Download Video'}
        </button>
      </div>
    </div>
  )
}

export default App


