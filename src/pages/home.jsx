import '../App.css'
import Navbar from '../components/Navbar'
import TestimonialSlideshow from '../components/TestimonialSlideshow'
import Footer from '../components/Footer'
import LoadingScreen from '../components/LoadingScreen'
import ScrollStack, { ScrollStackItem } from '../components/ScrollStack/ScrollStack'
import { useRef, useEffect, useState, useCallback } from 'react'
import SplitText from '../TextAnimations/SplitText/SplitText'

function Home() {
  const sectionRef = useRef(null)
  const stateRef = useRef({ px: 0, py: 0, tx: 0, ty: 0, ticking: false })
  const [imagesVisible, setImagesVisible] = useState(false)
  const [showLoading, setShowLoading] = useState(true)
  const [contentReady, setContentReady] = useState(false)
  // Center the canvas within the viewport
  const centerCanvas = () => {
    const el = sectionRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const canvasWidth = rect.width * 2.0 // matches 200vw
    const canvasHeight = rect.height * 2.0 // matches 200vh
    const maxX = rect.width - canvasWidth // negative
    const maxY = rect.height - canvasHeight // negative
    const cx = maxX / 2
    const cy = maxY / 2
    stateRef.current.px = cx
    stateRef.current.py = cy
    stateRef.current.tx = cx
    stateRef.current.ty = cy
    el.style.setProperty('--px', cx.toFixed(1) + 'px')
    el.style.setProperty('--py', cy.toFixed(1) + 'px')
  }

  const handleSplitComplete = useCallback(() => {
    setImagesVisible((v) => (v ? v : true))
  }, [])

  const handleLoadingComplete = useCallback(() => {
    setShowLoading(false)
    setContentReady(true)
  }, [])

  // Get safe viewport height for mobile (excludes dynamic browser UI)
  const getViewportHeight = () => {
    return window.visualViewport ? window.visualViewport.height : window.innerHeight
  }

  useEffect(() => {
    centerCanvas()
    // Stack heights are now handled by ScrollStack component

    const onResize = () => {
      centerCanvas()
      // ScrollStack component handles its own resize logic
    }
    window.addEventListener('resize', onResize)
    // Also listen globally so movement continues over the navbar
    const onMove = (e) => handleMouseMove(e)
    window.addEventListener('mousemove', onMove)
    
    // Mobile viewport resize handling
    const onViewportChange = () => {
      if (window.visualViewport) {
        centerCanvas()
        // ScrollStack component handles its own viewport changes
      }
    }
    
    // Handle orientation change for stack
    const onOrientationChange = () => {
      setTimeout(() => {
        centerCanvas()
        // ScrollStack component handles its own orientation changes
      }, 100)
    }
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', onViewportChange)
    }
    window.addEventListener('orientationchange', onOrientationChange)
    
    // Cache DOM elements to avoid repeated queries
    let cachedElements = {}
    const getCachedElement = (selector) => {
      if (!cachedElements[selector]) {
        cachedElements[selector] = document.querySelector(selector)
      }
      return cachedElements[selector]
    }
    
    // Use RAF for smoother animations
    let rafId = null
    let latestScrollData = null
    
    const updateAnimations = () => {
      if (!latestScrollData) return
      
      const { hint, y, fadeDistance, zoomSection, zoomBox, zoomSectionBottom, zoomBoxBottom, white, black, footerTransition } = latestScrollData
      
      // Scroll hint fade
      if (hint) {
        const opacity = Math.max(0, 1 - y / fadeDistance)
        hint.style.opacity = String(opacity)
      }
      
      // Zoom section scaling
      if (zoomSection && zoomBox) {
        const rect = zoomSection.getBoundingClientRect()
        const vh = getViewportHeight()
        const progress = Math.min(1, Math.max(0, 1 - rect.top / vh))
        const scale = 0.92 + progress * (1.1 - 0.92)
        zoomBox.style.setProperty('--zoom', String(scale))
      }
      
      // Bottom zoom section scaling
      if (zoomSectionBottom && zoomBoxBottom) {
        const rect = zoomSectionBottom.getBoundingClientRect()
        const vh = getViewportHeight()
        const progress = Math.min(1, Math.max(0, 1 - rect.top / vh))
        const scale = 0.92 + progress * (1.1 - 0.92)
        zoomBoxBottom.style.setProperty('--zoom-bottom', String(scale))
      }
      
      // White section smooth lift
      if (white) {
        const wr = white.getBoundingClientRect()
        const vh2 = getViewportHeight()
        const start = vh2 * 0.9
        const end = vh2 * 0.4
        const t = Math.min(1, Math.max(0, (start - wr.top) / (start - end)))
        const eased = t * t * (3 - 2 * t)
        const translate = (1 - eased) * 40
        white.style.transform = `translateY(-${translate}px)`
      }
      
      // Black section movement
      if (black) {
        const inner = black.querySelector('.black-inner')
        if (inner) {
          const br = black.getBoundingClientRect()
          const vhb = getViewportHeight()
          const start = vhb * 1.1
          const end = vhb * 0.2
          const t = Math.min(1, Math.max(0, (start - br.top) / (start - end)))
          const eased = t * t * (3 - 2 * t)
          const startOffset = 24
          const endOffset = -40
          const offset = startOffset + (endOffset - startOffset) * eased
          inner.style.transform = `translateY(${offset}vh)`
        }
      }
      
      // Stack animation is now handled by ScrollStack component
      
      // Footer transition animation
      if (footerTransition) {
        const rect = footerTransition.getBoundingClientRect()
        const vh = getViewportHeight()
        // Start animation when footer is about to come into view
        const triggerPoint = vh * 0.8 // Trigger when footer is 80% down the viewport
        const progress = Math.min(1, Math.max(0, (vh - rect.top) / triggerPoint))
        const eased = progress * progress * (3 - 2 * progress) // smooth easing
        // Use responsive translateY value based on viewport width
        const maxTranslateY = Math.max(50, window.innerWidth * 0.08) // 8vw equivalent, minimum 50px
        const translateY = (1 - eased) * maxTranslateY
        footerTransition.style.transform = `translateY(${translateY}px)`
      }
      
      rafId = null
    }
    
    // Improved scroll handler with caching and throttling
    let scrollTimer = null
    const isMobile = window.innerWidth <= 768
    const throttleDelay = isMobile ? 8 : 16 // More aggressive throttling on mobile
    
    const onScroll = () => {
      // Clear existing timer
      if (scrollTimer) {
        clearTimeout(scrollTimer)
      }
      
      const y = window.scrollY || window.pageYOffset || 0
      
      // Store minimal scroll data immediately
      latestScrollData = {
        hint: getCachedElement('.scroll-hint'),
        y,
        fadeDistance: 220,
        zoomSection: getCachedElement('.zoom-section'),
        zoomBox: getCachedElement('.zoom-box'),
        zoomSectionBottom: getCachedElement('.zoom-section-bottom'),
        zoomBoxBottom: getCachedElement('.zoom-box-bottom'),
        white: getCachedElement('.white-section'),
        black: getCachedElement('.black-section'),
        footerTransition: getCachedElement('.footer-transition')
      }
      
      
      // Schedule animation update with throttling
      if (!rafId) {
        rafId = requestAnimationFrame(updateAnimations)
      }
      
      // Add a small delay to prevent excessive updates
      scrollTimer = setTimeout(() => {
        if (latestScrollData && !rafId) {
          rafId = requestAnimationFrame(updateAnimations)
        }
      }, throttleDelay)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    // initialize once on mount
    onScroll()
    return () => {
      window.removeEventListener('resize', onResize)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('orientationchange', onOrientationChange)
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', onViewportChange)
      }
      // Clean up timers and animation frames
      if (scrollTimer) {
        clearTimeout(scrollTimer)
      }
      if (rafId) {
        cancelAnimationFrame(rafId)
      }
    }
  }, [])

  // Uniform tile size for all images
  const TILE_SIZE = 210

  // Progressive appear delay across all hero images
  let appearCounter = 0

  // 23 unique images - no repetition
  const allImages = [
    'hero1.jpg', 'hero2.jpg', 'hero3.jpg', 'hero4.jpg', 'hero5.jpg',
    'hero6.jpg', 'hero7.jpg', 'hero8.jpg', 'hero9.jpg', 'hero10.jpg',
    'hero11.jpg', 'hero12.jpg', 'hero13.jpg', 'hero14.jpg', 'hero15.jpg',
    'hero16.jpg', 'hero17.jpg', 'hero18.jpg', 'hero19.jpg', 'hero20.jpg',
    'hero21.jpg', 'hero22.jpg', 'hero23.jpg'
  ]
  let imageIndex = 0 // Track image usage across all sections

  // Center-safe zone to keep background clear behind the hero text initially
  const SAFE_ZONE = { xMin: 40, xMax: 60, yMin: 22, yMax: 55 }
  const EXTRA_DELAY_MS = 1400
  const baseStep = 120

  let raf = 0
  const handleMouseMove = (e) => {
    const el = sectionRef.current
    if (!el) return
    if (raf) cancelAnimationFrame(raf)
    raf = requestAnimationFrame(() => {
      const rect = el.getBoundingClientRect()
      const canvasWidth = rect.width * 2.0 // matches 200vw
      const canvasHeight = rect.height * 2.0 // matches 200vh
      const rx = (e.clientX - rect.left) / rect.width
      const ry = (e.clientY - rect.top) / rect.height
      const maxX = rect.width - canvasWidth
      const maxY = rect.height - canvasHeight
      stateRef.current.tx = maxX * rx
      stateRef.current.ty = maxY * ry
      const dot = document.getElementById('cursor-dot')
      if (dot) {
        dot.style.left = `${e.clientX}px`
        dot.style.top = `${e.clientY}px`
        dot.style.opacity = '1'
        // Adjust dot size based on hover target
        const target = document.elementFromPoint(e.clientX, e.clientY)
        const interactive = target && target.closest && target.closest('a, button, [role="button"], .burger-btn, .menu-row, .overlay-close, .nav-links a')
        const onTestimonial = target && target.closest && target.closest('.testimonial-item')
        const onFourthCard = target && target.closest && target.closest('.fourth-card')
        const onFirstThreeCards = target && target.closest && target.closest('.top-card, .next-card, .third-card')
        const inBlackSection = target && target.closest && target.closest('.black-inner')
        
        // Remove all cursor classes first
        dot.classList.remove('large', 'small')
        
        if (interactive || onTestimonial) {
          dot.classList.add('small') // Shrink for interactive elements and testimonials
          dot.textContent = ''
        } else if (onFirstThreeCards) {
          dot.classList.add('large') // Enlarge for first 3 cards only
          dot.textContent = 'VIEW PROJECT'
        } else {
          dot.textContent = '' // Normal cursor for fourth card and everything else
        }
        
        // Set cursor color based on state and underlying section
        const navOpen = document.body && document.body.classList.contains('nav-open')
        const inZoom = target && target.closest && target.closest('.zoom-section')
        const inZoomBottom = target && target.closest && target.closest('.zoom-section-bottom')
        const inWhite = target && target.closest && target.closest('.white-section, .about-section')
        const inFooter = target && target.closest && target.closest('.footer')
        const inFooterTransition = target && target.closest && target.closest('.footer-transition')
        
        if (navOpen) {
          dot.style.background = '#cbb8ff'
        } else if (inZoomBottom) {
          dot.style.background = '#000' // Black cursor in bottom zoom section (testimonials area)
        } else if (inFooterTransition) {
          dot.style.background = '#000' // Black cursor in footer transition
        } else if (inFooter) {
          dot.style.background = '#cbb8ff' // Light purple in footer
        } else if (inBlackSection) {
          dot.style.background = '#cbb8ff' // Purple in black section
        } else if (inZoom) {
          dot.style.background = '#cbb8ff' // light purple over top zoom div
        } else if (inWhite) {
          dot.style.background = '#000' // black over white sections
        } else {
          dot.style.background = '#000'
        }
      }
      if (!stateRef.current.ticking) {
        stateRef.current.ticking = true
        smoothTick()
      }
      // JS-driven hover so tiles highlight even under navbar
      const items = document.querySelectorAll('.parallax-item')
      let closest = null
      let closestDist = Infinity
      items.forEach((node) => {
        const r = node.getBoundingClientRect()
        // distance to rect (0 if inside)
        const dx = e.clientX < r.left ? r.left - e.clientX : e.clientX > r.right ? e.clientX - r.right : 0
        const dy = e.clientY < r.top ? r.top - e.clientY : e.clientY > r.bottom ? e.clientY - r.bottom : 0
        const d2 = dx * dx + dy * dy
        if (d2 < closestDist) {
          closestDist = d2
          closest = node
        }
      })
      items.forEach((node) => {
        if (node === closest && closestDist <= 2000) {
          node.classList.add('hovered')
        } else {
          node.classList.remove('hovered')
        }
      })
      raf = 0
    })
  }

  const handleMouseLeave = () => {
    const el = sectionRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const canvasWidth = rect.width * 2.0
    const canvasHeight = rect.height * 2.0
    const maxX = rect.width - canvasWidth
    const maxY = rect.height - canvasHeight
    stateRef.current.tx = maxX / 2
    stateRef.current.ty = maxY / 2
    const dot = document.getElementById('cursor-dot')
    if (dot) {
      dot.style.opacity = '0'
      dot.style.setProperty('--dot-scale', '1')
      dot.textContent = '' // Clear text when mouse leaves
    }
    if (!stateRef.current.ticking) {
      stateRef.current.ticking = true
      smoothTick()
    }
    // clear JS-driven hover
    document.querySelectorAll('.parallax-item.hovered').forEach((n) => n.classList.remove('hovered'))
  }

  const smoothTick = () => {
    const el = sectionRef.current
    if (!el) {
      stateRef.current.ticking = false
      return
    }
      const ease = 0.1 // lower = smoother/slower
    const { px, py, tx, ty } = stateRef.current
    const nextPx = px + (tx - px) * ease
    const nextPy = py + (ty - py) * ease
    stateRef.current.px = nextPx
    stateRef.current.py = nextPy
    el.style.setProperty('--px', nextPx.toFixed(1) + 'px')
    el.style.setProperty('--py', nextPy.toFixed(1) + 'px')
    // stop when very close to target
    if (Math.abs(tx - nextPx) < 0.5 && Math.abs(ty - nextPy) < 0.5) {
      stateRef.current.px = tx
      stateRef.current.py = ty
      el.style.setProperty('--px', tx.toFixed(1) + 'px')
      el.style.setProperty('--py', ty.toFixed(1) + 'px')
      stateRef.current.ticking = false
      return
    }
    requestAnimationFrame(smoothTick)
  }

  return (
    <>
    {showLoading && <LoadingScreen onComplete={handleLoadingComplete} pageName="home" />}
    {contentReady && (
      <>
        <Navbar />
        <div id='cursor-dot' className='cursor-dot'></div>
        <div id='global-overlay' className='global-overlay'></div>
    <section
      className='hero-section'
      data-aos='fade-up'
      data-aos-duration='1200'
      data-aos-easing='ease-out-cubic'
      ref={sectionRef}
      onMouseMove={handleMouseMove}
    >
      <div className='parallax-bg' aria-hidden style={{ '--images-delay-base': '800ms' }}>
        {imagesVisible && (
          <>
          {(() => {
            // Triangular lattice (staggered rows)
            const nodes = []
            const rows = 3
            const cols = 4
            const startY = 20 // top percentage
            const endY = 80  // bottom percentage
            const dy = (endY - startY) / (rows - 1)
            const startX = 5
            const endX = 90
            const dx = (endX - startX) / (cols - 1)
            for (let r = 0; r < rows; r++) {
              const y = startY + r * dy
              const rowOffset = (r % 2 === 1) ? dx / 2 : 0 // stagger every other row
              for (let c = 0; c < cols; c++) {
                // Skip the specific tile at r=1, c=0 (x≈19.17%, y=50%)
                if (r === 1 && c === 0) { continue }
                let x = startX + c * dx + rowOffset
                if (r === 0 && c === 1) {
                  x += 2; // smaller nudge to the right
                }
                // Nudge the specific tile at r=1, c=1 slightly to the left
                if (r === 1 && c === 1) {
                  x -= 9
                }
                const img = allImages[imageIndex++] // Use unique image and increment
                const inSafe = x >= SAFE_ZONE.xMin && x <= SAFE_ZONE.xMax && y >= SAFE_ZONE.yMin && y <= SAFE_ZONE.yMax
                const delayMs = appearCounter * baseStep + (inSafe ? EXTRA_DELAY_MS : 0); appearCounter += 1
                nodes.push(
                  <img
                    key={`tri-${r}-${c}`}
                    className='parallax-item placed'
                    style={{ '--x': `${x}%`, '--y': `${y}%`, '--size': `${TILE_SIZE}px`, '--appear': `${delayMs}ms`, animationDuration: '1100ms' }}
                    src={`/images/${img}`}
                    alt=''
                    draggable='false'
                  />
                )
              }
            }
            return nodes
          })()}

          {Array.from({ length: 3 }, (_, i) => {
            const x = -20 + i * 12
            const y = 25 + i * 12
            const img = allImages[imageIndex++] // Use unique image and increment
            const inSafe = x >= SAFE_ZONE.xMin && x <= SAFE_ZONE.xMax && y >= SAFE_ZONE.yMin && y <= SAFE_ZONE.yMax
            const delayMs = appearCounter * baseStep + (inSafe ? EXTRA_DELAY_MS : 0); appearCounter += 1
            return (
              <img key={'left-' + i} className='parallax-item placed' style={{ '--x': `${x}%`, '--y': `${y}%`, '--size': `${TILE_SIZE}px`, '--appear': `${delayMs}ms`, animationDuration: '1100ms' }} src={'/images/' + img} alt='' draggable='false' />
            )
          })}

          {Array.from({ length: 3 }, (_, i) => {
            const x = 110 + i * 12
            const y = 20 + i * 14
            const img = allImages[imageIndex++] // Use unique image and increment
            const inSafe = x >= SAFE_ZONE.xMin && x <= SAFE_ZONE.xMax && y >= SAFE_ZONE.yMin && y <= SAFE_ZONE.yMax
            const delayMs = appearCounter * baseStep + (inSafe ? EXTRA_DELAY_MS : 0); appearCounter += 1
            return (
              <img key={'right-' + i} className='parallax-item placed' style={{ '--x': `${x}%`, '--y': `${y}%`, '--size': `${TILE_SIZE}px`, '--appear': `${delayMs}ms`, animationDuration: '1100ms' }} src={'/images/' + img} alt='' draggable='false' />
            )
          })}

          {Array.from({ length: 3 }, (_, i) => {
            const x = 20 + i * 18
            const y = 110 + i * 10
            const img = allImages[imageIndex++] // Use unique image and increment
            const inSafe = x >= SAFE_ZONE.xMin && x <= SAFE_ZONE.xMax && y >= SAFE_ZONE.yMin && y <= SAFE_ZONE.yMax
            const delayMs = appearCounter * baseStep + (inSafe ? EXTRA_DELAY_MS : 0); appearCounter += 1
            return (
              <img key={'bottom-' + i} className='parallax-item placed' style={{ '--x': `${x}%`, '--y': `${y}%`, '--size': `${TILE_SIZE}px`, '--appear': `${delayMs}ms`, animationDuration: '1100ms' }} src={'/images/' + img} alt='' draggable='false' />
            )
          })}

          {Array.from({ length: 3 }, (_, i) => {
            const x = 15 + i * 20
            const y = -18 + i * 8
            const img = allImages[imageIndex++] // Use unique image and increment
            const inSafe = x >= SAFE_ZONE.xMin && x <= SAFE_ZONE.xMax && y >= SAFE_ZONE.yMin && y <= SAFE_ZONE.yMax
            const delayMs = appearCounter * baseStep + (inSafe ? EXTRA_DELAY_MS : 0); appearCounter += 1
            return (
              <img key={'top-' + i} className='parallax-item placed' style={{ '--x': `${x}%`, '--y': `${y}%`, '--size': `${TILE_SIZE}px`, '--appear': `${delayMs}ms`, animationDuration: '1100ms' }} src={'/images/' + img} alt='' draggable='false' />
            )
          })}
          </>
        )}
          </div>
      <div className='hero-content'>
        <SplitText
          text="Omar"
          tag="h1"
          splitType="chars"
          className="hero-title"
          delay={80}
          duration={1.0}
          ease="power3.out"
          startDelay={1}
          from={{ opacity: 0, y: 40 }}
          to={{ opacity: 1, y: 0 }}
          useScroll={false}
          onLetterAnimationComplete={handleSplitComplete}
        />
          </div>
      <div className='scroll-hint' aria-hidden>
        <span className='scroll-text'>Scroll</span>
      </div>
    </section>
    <section className='zoom-section'>
      <div className='zoom-stage'>
        <div className='zoom-box'>
          <div className='zoom-content'>
            <h2>Hello! I'm Omar Mostafa, a full-stack developer and designer who brings creative ideas to life with clean code and innovative solutions.</h2>
            <div className='zoom-right-content'>
              <p>
              Bringing your vision to life quickly and efficiently—whether it's branding, apps, or websites—I've got it covered, delivering smooth and effective solutions from start to finish.
              </p>
              <button className='cta-button' type='button' onClick={() => {
                const element = document.getElementById('work');
                if (element) {
                  element.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                  });
                }
              }}>View Projects</button>
            </div>
          </div>
        </div>
      </div>
    </section>
    <section id='work' className='white-section'>
      <div className='white-inner'>
        <span className='section-tag'>Cases</span>
        <h2 className='white-headline'>
          Extensive projects that i'm particularly proud of 																							 
         				 
         																
        																
        																
        																
        																
        																
        																
        																
        				 
         																
         																
         																
         																
          – designed and communicated with purpose:
        </h2>

        <section className='stack-section'>
          <ScrollStack
            useWindowScroll={true}
            itemDistance={120}
            itemScale={0.02}
            itemStackDistance={25}
            stackPosition="25%"
            scaleEndPosition="15%"
            baseScale={0.88}
            rotationAmount={0}
            blurAmount={0}
            className="custom-scroll-stack"
          >
            <ScrollStackItem itemClassName="top-card">
              <div className='card-content'>
                <div className='card-left'>
                  <h3 className='card-title'>BACK-TO-HOME</h3>
                  <div className='card-tags'>
                    <span className='card-tag'>Quasar</span>
                    <span className='card-tag'>Supabase</span>
                    <span className='card-tag'>CANVA</span>
                    <span className='card-tag'>UML</span>
                    <span className='card-tag'>SQL</span>
                  </div>
                </div>
                <div className='card-center'>
                  <div className='card-image-wrapper'>
                    <img src='/images/back-home.jpg' alt='Web Development' className='card-image' />
                  </div>
                </div>
              </div>
            </ScrollStackItem>
            
            <ScrollStackItem itemClassName="next-card">
              <div className='card-content'>
                <div className='card-left'>
                  <h3 className='card-title'>Data Analytics</h3>
                  <div className='card-tags'>
                    <span className='card-tag'>Python</span>
                    <span className='card-tag'>Machine Learning</span>
                    <span className='card-tag'>Visualization</span>
                  </div>
                </div>
                <div className='card-center'>
                  <div className='card-image-wrapper'>
                    <img src='/images/2.png' alt='Data Analytics' className='card-image' />
                  </div>
                </div>
              </div>
            </ScrollStackItem>
            
            <ScrollStackItem itemClassName="third-card">
              <div className='card-content'>
                <div className='card-left'>
                  <h3 className='card-title'>UI/UX Design</h3>
                  <div className='card-tags'>
                    <span className='card-tag'>Figma</span>
                    <span className='card-tag'>Prototyping</span>
                    <span className='card-tag'>User Research</span>
                  </div>
                </div>
                <div className='card-center'>
                  <div className='card-image-wrapper'>
                    <img src='/images/3.png' alt='UI/UX Design' className='card-image' />
                  </div>
                </div>
              </div>
            </ScrollStackItem>
            
            <ScrollStackItem itemClassName="fourth-card">
              <div className='card-content fourth-content'>
                <div className='projects-tag'>Projects</div>
                <h3 className='projects-title'>Discover more works</h3>
                <button className='projects-btn'>Show all projects</button>
              </div>
            </ScrollStackItem>
          </ScrollStack>
        </section>
      </div>
    </section>
    <section id='about' className='black-section'>
      <div className='black-inner'>
        <div className='black-content'>
          <div className='black-tag'>Why Omar?</div>
          <h2 className='black-title'>I bring a unique blend of technical expertise and creative vision to every project. With experience in full-stack development, data analysis, and UI/UX design, I transform complex ideas into elegant, user-friendly solutions that drive real business results.</h2>
          <button className='black-btn'>Get to know me</button>
        </div>
        <div className='black-image-container'>
          <img src='/images/omar.jpg' alt='Omar' className='black-image' />
        </div>
        <div className='black-bottom-content'>
          <div className='black-bottom-tag'>Why you?</div>
            <h3 className='black-bottom-title'>You need a developer who cares about both expertise and your business goals. I deliver solutions that work technically and drive real results.</h3>
          <button className='black-bottom-btn' onClick={() => {
            const element = document.getElementById('contact');
            if (element) {
              element.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
              });
            }
          }}>Contact</button>
        </div>
      </div>
    </section>
    <section id='journal' className='zoom-section-bottom'>
      <div className='zoom-stage-bottom'>
        <div className='zoom-box-bottom'>
          <div className='zoom-content-bottom'>
            <div className='zoom-tag-bottom'>Testimonials</div>
            <h2>Don't just take my word for it. Here's what clients say about working with me and the results we've achieved together.</h2>
            <TestimonialSlideshow />
            
            {/* Bottom section with heading and buttons */}
            <div className="slideshow-bottom-section">
              <h2 className="slideshow-bottom-heading">Scrolled all the way to the bottom? Then it's just getting started. What do you want next?</h2>
              <div className="slideshow-bottom-buttons">
                <button className="slideshow-btn primary" onClick={() => {
                  const element = document.getElementById('contact');
                  if (element) {
                    element.scrollIntoView({
                      behavior: 'smooth',
                      block: 'start'
                    });
                  }
                }}>Contact</button>
                <button className="slideshow-btn secondary">Discover projects</button>
                <button className="slideshow-btn secondary">Download CV</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
    
    <Footer />
      </>
    )}
    </>
  )
}

export default Home



