import '../App.css'
import Navbar from '../components/Navbar'
import { useRef, useEffect, useState, useCallback } from 'react'
import SplitText from '../TextAnimations/SplitText/SplitText'

function Home() {
  const sectionRef = useRef(null)
  const stateRef = useRef({ px: 0, py: 0, tx: 0, ty: 0, ticking: false })
  const [imagesVisible, setImagesVisible] = useState(false)
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

  // Get safe viewport height for mobile (excludes dynamic browser UI)
  const getViewportHeight = () => {
    return window.visualViewport ? window.visualViewport.height : window.innerHeight
  }

  useEffect(() => {
    centerCanvas()
    const onResize = () => centerCanvas()
    window.addEventListener('resize', onResize)
    // Also listen globally so movement continues over the navbar
    const onMove = (e) => handleMouseMove(e)
    window.addEventListener('mousemove', onMove)
    
    // Mobile viewport resize handling
    const onViewportChange = () => {
      if (window.visualViewport) {
        centerCanvas()
        // Clear cached elements on viewport change
        cachedElements = {}
      }
    }
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', onViewportChange)
    }
    
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
      
      const { hint, y, fadeDistance, zoomSection, zoomBox, white, black, viewport, stage } = latestScrollData
      
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
      
      // Stack cards with improved performance
      if (viewport && stage) {
        const sr = stage.getBoundingClientRect()
        const vh3 = getViewportHeight()
        const viewportHeight = viewport.getBoundingClientRect().height || vh3 * 0.8
        const startY = vh3 * 0.1
        const scrolled = Math.max(0, startY - sr.top)
        
        const isMobile = window.innerWidth <= 768
        const smoothingFactor = isMobile ? 0.85 : 1
        
        const p1 = Math.min(1, Math.max(0, (scrolled / viewportHeight) * smoothingFactor))
        const p2 = Math.min(1, Math.max(0, ((scrolled - viewportHeight) / viewportHeight) * smoothingFactor))
        const p3 = Math.min(1, Math.max(0, ((scrolled - viewportHeight * 2) / viewportHeight) * smoothingFactor))

        const topCard = viewport.querySelector('.top-card')
        const nextCard = viewport.querySelector('.next-card')
        const third = viewport.querySelector('.third-card')
        const fourth = viewport.querySelector('.fourth-card')

        if (topCard && nextCard && third && fourth) {
          // Optimized transform handling with hardware acceleration
          const scale1 = 1 - 0.12 * p1
          const fade1 = Math.max(0, 1 - 0.85 * p1)
          
          topCard.style.transform = `translate(-50%, 0) scale(${scale1}) translateZ(0)`
          topCard.style.opacity = String(fade1)
          topCard.style.visibility = p1 >= 0.999 ? 'hidden' : 'visible'

          // Optimized nextCard logic
          const rise1 = (1 - p1) * 100
          if (p2 <= 0) {
            nextCard.style.transform = `translate(-50%, ${rise1}%) translateZ(0)`
            nextCard.style.opacity = '1'
          } else {
            const scale2 = 1 - 0.12 * p2
            const fade2 = Math.max(0, 1 - 0.85 * p2)
            nextCard.style.transform = `translate(-50%, 0) scale(${scale2}) translateZ(0)`
            nextCard.style.opacity = String(fade2)
          }
          nextCard.style.visibility = p2 >= 0.999 ? 'hidden' : 'visible'
          nextCard.classList.toggle('on-top', p1 > 0.85 && p2 <= 0)

          // Optimized third card
          const rise2 = (1 - p2) * 100
          if (p3 <= 0) {
            third.style.transform = `translate(-50%, ${rise2}%) translateZ(0)`
            third.style.opacity = '1'
          } else {
            const scale3 = 1 - 0.12 * p3
            const fade3 = Math.max(0, 1 - 0.85 * p3)
            third.style.transform = `translate(-50%, 0) scale(${scale3}) translateZ(0)`
            third.style.opacity = String(fade3)
          }
          third.style.visibility = p3 >= 0.999 ? 'hidden' : 'visible'
          third.classList.toggle('on-top', p2 > 0.85 && p3 <= 0)

          // Optimized fourth card
          const rise3 = (1 - p3) * 100
          fourth.style.transform = `translate(-50%, ${rise3}%) translateZ(0)`
          fourth.style.opacity = '1'
          fourth.classList.toggle('on-top', p3 > 0.85)
        }
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
        white: getCachedElement('.white-section'),
        black: getCachedElement('.black-section'),
        viewport: getCachedElement('.stack-viewport'),
        stage: getCachedElement('.stack-stage')
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
  const TILE_SIZE = 300

  // Progressive appear delay across all hero images
  let appearCounter = 0

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
        const onFourthCard = target && target.closest && target.closest('.fourth-card')
        const onFirstThreeCards = target && target.closest && target.closest('.top-card, .next-card, .third-card')
        
        let scale = 1
        if (interactive) {
          scale = 0.6 // Shrink for interactive elements
          dot.textContent = ''
        } else if (onFirstThreeCards) {
          scale = 3.5 // Enlarge for first 3 cards only
          dot.textContent = 'VIEW PROJECT'
        } else {
          dot.textContent = '' // Normal cursor for fourth card and everything else
        }
        
        dot.style.setProperty('--dot-scale', String(scale))
        // Set cursor color based on state and underlying section
        const navOpen = document.body && document.body.classList.contains('nav-open')
        const inZoom = target && target.closest && target.closest('.zoom-section')
        const inWhite = target && target.closest && target.closest('.white-section, .about-section')
        if (navOpen) {
          dot.style.background = '#cbb8ff'
        } else if (inZoom) {
          dot.style.background = '#cbb8ff' // light purple over black div
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
      const ease = 0.3 // higher = faster but still smooth
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
      onMouseLeave={handleMouseLeave}
    >
      <div className='parallax-bg' aria-hidden style={{ '--images-delay-base': '800ms' }}>
        {imagesVisible && (
          <>
          {(() => {
            // Triangular lattice (staggered rows)
            const nodes = []
            const imgs = ['hero1.jpg','hero2.jpg','hero3.jpg','hero4.jpg','hero5.jpg','hero6.jpg','hero7.jpg']
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
                const img = imgs[(r * cols + c) % imgs.length]
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
            const imgs = ['hero1.jpg','hero2.jpg','hero3.jpg','hero4.jpg','hero5.jpg','hero6.jpg','hero7.jpg']
            const inSafe = x >= SAFE_ZONE.xMin && x <= SAFE_ZONE.xMax && y >= SAFE_ZONE.yMin && y <= SAFE_ZONE.yMax
            const delayMs = appearCounter * baseStep + (inSafe ? EXTRA_DELAY_MS : 0); appearCounter += 1
            return (
              <img key={'left-' + i} className='parallax-item placed' style={{ '--x': `${x}%`, '--y': `${y}%`, '--size': `${TILE_SIZE}px`, '--appear': `${delayMs}ms`, animationDuration: '1100ms' }} src={'/images/' + imgs[i % imgs.length]} alt='' draggable='false' />
            )
          })}

          {Array.from({ length: 3 }, (_, i) => {
            const x = 110 + i * 12
            const y = 20 + i * 14
            const imgs = ['hero1.jpg','hero2.jpg','hero3.jpg','hero4.jpg','hero5.jpg','hero6.jpg','hero7.jpg']
            const inSafe = x >= SAFE_ZONE.xMin && x <= SAFE_ZONE.xMax && y >= SAFE_ZONE.yMin && y <= SAFE_ZONE.yMax
            const delayMs = appearCounter * baseStep + (inSafe ? EXTRA_DELAY_MS : 0); appearCounter += 1
            return (
              <img key={'right-' + i} className='parallax-item placed' style={{ '--x': `${x}%`, '--y': `${y}%`, '--size': `${TILE_SIZE}px`, '--appear': `${delayMs}ms`, animationDuration: '1100ms' }} src={'/images/' + imgs[i % imgs.length]} alt='' draggable='false' />
            )
          })}

          {Array.from({ length: 3 }, (_, i) => {
            const x = 20 + i * 18
            const y = 110 + i * 10
            const imgs = ['hero1.jpg','hero2.jpg','hero3.jpg','hero4.jpg','hero5.jpg','hero6.jpg','hero7.jpg']
            const inSafe = x >= SAFE_ZONE.xMin && x <= SAFE_ZONE.xMax && y >= SAFE_ZONE.yMin && y <= SAFE_ZONE.yMax
            const delayMs = appearCounter * baseStep + (inSafe ? EXTRA_DELAY_MS : 0); appearCounter += 1
            return (
              <img key={'bottom-' + i} className='parallax-item placed' style={{ '--x': `${x}%`, '--y': `${y}%`, '--size': `${TILE_SIZE}px`, '--appear': `${delayMs}ms`, animationDuration: '1100ms' }} src={'/images/' + imgs[i % imgs.length]} alt='' draggable='false' />
            )
          })}

          {Array.from({ length: 3 }, (_, i) => {
            const x = 15 + i * 20
            const y = -18 + i * 8
            const imgs = ['hero1.jpg','hero2.jpg','hero3.jpg','hero4.jpg','hero5.jpg','hero6.jpg','hero7.jpg']
            const inSafe = x >= SAFE_ZONE.xMin && x <= SAFE_ZONE.xMax && y >= SAFE_ZONE.yMin && y <= SAFE_ZONE.yMax
            const delayMs = appearCounter * baseStep + (inSafe ? EXTRA_DELAY_MS : 0); appearCounter += 1
            return (
              <img key={'top-' + i} className='parallax-item placed' style={{ '--x': `${x}%`, '--y': `${y}%`, '--size': `${TILE_SIZE}px`, '--appear': `${delayMs}ms`, animationDuration: '1100ms' }} src={'/images/' + imgs[i % imgs.length]} alt='' draggable='false' />
            )
          })}
          </>
        )}
          </div>
      <div className='hero-content'>
        <SplitText
          text="CLOU"
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
            <h2>I'm a versatile developer,data analyst, and designer who turns ideas into smart products—blending clean code, sharp design, and AI-powered automations for fast, effective solutions.</h2>
            <div className='zoom-right-content'>
              <p>
              Bringing your vision to life quickly and efficiently—whether it's branding, apps, or websites—I've got it covered, delivering smooth and effective solutions from start to finish.
              </p>
              <button className='cta-button' type='button'>SEE MY WORK</button>
            </div>
          </div>
        </div>
      </div>
    </section>
    <section className='white-section'>
      <div className='white-inner'>
        <span className='section-tag'>Cases</span>
        <h2 className='white-headline'>
          Extensive projects that we are particularly proud of 																							 
         				 
         																
        																
        																
        																
        																
        																
        																
        																
        				 
         																
         																
         																
         																
          – designed and communicated with purpose:
        </h2>

        <section className='stack-section'>
          <div className='stack-stage'>
            <div className='stack-viewport'>
              <div className='stack-card top-card'>
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
              </div>
              <div className='stack-card next-card'>
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
              </div>
              <div className='stack-card third-card'>
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
              </div>
              <div className='stack-card fourth-card'>
                <div className='card-content fourth-content'>
                  <div className='projects-tag'>Projects</div>
                  <h3 className='projects-title'>Discover more works</h3>
                  <button className='projects-btn'>show all projects</button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </section>
    <section className='black-section'>
      <div className='black-inner'>
      </div>
    </section>
    </>
  )
}

export default Home


