import '../App.css'
import { useState, useEffect } from 'react'

function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const toggleMenu = () => setIsOpen((v) => !v)
  const closeMenu = () => setIsOpen(false)

  // Slideshow thumbs for each menu row
  const thumbSets = [
    ['hero1.jpg','hero2.jpg','hero3.jpg','hero4.jpg','hero5.jpg','hero6.jpg','hero7.jpg'],
    ['2.png','hero3.jpg','hero4.jpg','hero5.jpg','hero6.jpg','hero7.jpg','hero1.jpg'],
    ['3.png','hero2.jpg','hero4.jpg','hero5.jpg','hero6.jpg','hero7.jpg','hero1.jpg'],
    ['logo.png', 'logo-glass.png'],
  ]
  const [thumbIndex, setThumbIndex] = useState(0)
  useEffect(() => {
    const id = setInterval(() => {
      setThumbIndex((i) => (i + 1))
    }, 2000)
    return () => clearInterval(id)
  }, [])
  const thumbStyle = (row) => {
    const arr = thumbSets[row] || thumbSets[0]
    const img = arr[thumbIndex % arr.length]
    return { backgroundImage: `url('/images/${img}')` }
  }

  useEffect(() => {
    const body = document.body
    if (isOpen) {
      body.classList.add('nav-open')
    } else {
      body.classList.remove('nav-open')
    }
    return () => body.classList.remove('nav-open')
  }, [isOpen])
  return (
    <header className='navbar'>
      <div className='nav-inner'>
        <a className='nav-logo' href='/'>
          <img src='/images/logo.png' alt='Logo' draggable='false' />
        </a>
        <div className='nav-center'>
          <nav className='nav-links' aria-label='Primary'>
            <a href='#work'>Work</a>
            <a href='#about'>About</a>
            <a href='#journal'>Journal</a>
            <a href='#contact'>Contact</a>
          </nav>
        </div>
        <div className='nav-right'>
          <button className='burger-btn' type='button' aria-label='Open menu' aria-expanded={isOpen} onClick={toggleMenu}>
            <i className='fa-solid fa-bars'></i>
          </button>
        </div>
      </div>
      <div className={`nav-overlay ${isOpen ? 'open' : ''}`} role='dialog' aria-modal='true'>
        <div className='nav-overlay-inner'>
          <a className='overlay-logo' href='/' onClick={closeMenu} aria-label='Home'>
            <img src='/images/logo.png' alt='Logo' draggable='false' />
          </a>
          <button className='overlay-close' onClick={closeMenu} aria-label='Close menu'>
            <i className='fa-solid fa-xmark'></i>
          </button>
          <nav className='overlay-menu'>
            <a className='menu-row' href='#work' onClick={closeMenu}>
              <span className='menu-thumb' style={thumbStyle(0)}></span>
              <span className='menu-text'>Projects</span>
            </a>
            <a className='menu-row' href='#about' onClick={closeMenu}>
              <span className='menu-thumb' style={thumbStyle(1)}></span>
              <span className='menu-text'>Agency</span>
            </a>
            <a className='menu-row' href='#journal' onClick={closeMenu}>
              <span className='menu-thumb' style={thumbStyle(2)}></span>
              <span className='menu-text'>Journal</span>
            </a>
            <a className='menu-row' href='#contact' onClick={closeMenu}>
              <span className='menu-thumb' style={thumbStyle(3)}></span>
              <span className='menu-text'>Contact</span>
            </a>
          </nav>
          <div className='overlay-footer'>
            <div className='footer-col'>
              <div>Egypt,Cairo</div>
              <div>El Rehab City</div>
              <div>113/23</div>
            </div>
            <div className='footer-col'>
              <a href='mailto:omarmostafamohie12@gmail.com'>omarmostafamohie12@gmail.com</a>
              <div>+02 01155306633</div>
            </div>
            <div className='footer-col'>
              <div><a href='#'>Instagram</a></div>
              <div><a href='#'>LinkedIn</a></div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Navbar


