import { useState, useEffect } from 'react'
import { getQuote, getQuoteForPage } from '../utils/quotes'
import '../App.css'

const LoadingScreen = ({ onComplete, pageName = 'home' }) => {
  const [isVisible, setIsVisible] = useState(true)
  const [typingComplete, setTypingComplete] = useState(false)
  const [currentQuote, setCurrentQuote] = useState('')

  useEffect(() => {
    // Get the appropriate quote based on visit history and page
    const quote = getQuote(pageName)
    setCurrentQuote(quote)
    
    // Calculate timing based on quote length
    const quoteLength = quote.length
    const typingDuration = Math.max(2000, quoteLength * 80) // 80ms per character, minimum 2s
    const totalDuration = typingDuration + 1000 // Add 1 second pause
    
    // Start the typing animation after a brief delay
    const typingTimer = setTimeout(() => {
      setTypingComplete(true)
    }, typingDuration)

    // Hide the loading screen and call onComplete after typing is done
    const hideTimer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(() => {
        onComplete && onComplete()
      }, 500) // Wait for fade out animation
    }, totalDuration)

    return () => {
      clearTimeout(typingTimer)
      clearTimeout(hideTimer)
    }
  }, [onComplete, pageName])

  if (!isVisible && typingComplete) {
    return null
  }

  return (
    <div className={`loading-screen ${!isVisible ? 'fade-out' : ''}`}>
      <div className="loading-content">
        <h1 className="typing-text">
          <span 
            className="typing-line"
            style={{
              '--quote-length': currentQuote.length,
              animation: `typing ${Math.max(2, currentQuote.length * 0.08)}s steps(${currentQuote.length}, end) forwards, text-reveal 0.1s ease-in-out`
            }}
          >
            {currentQuote}
          </span>
          <span className="cursor">|</span>
        </h1>
      </div>
    </div>
  )
}

export default LoadingScreen
