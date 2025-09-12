import { useState, useEffect } from 'react'
import '../App.css'

const TestimonialSlideshow = () => {
  const [currentSet, setCurrentSet] = useState(0)

  const testimonials = [
    {
      id: 1,
      image: '/images/1.png',
      tag: 'Client work',
      name: 'Time for a burst of courage',
      testimonial: 'Laila follows the sun south and finds it between paella and tinto verano. Time out in Valencia. Vamos!',
      link: 'read more'
    },
    {
      id: 2,
      image: '/images/2.png',
      tag: 'Client work',
      name: 'An unforgettable trip to Copenhagen',
      testimonial: 'Where to eat, shop and chill in the Danish design capital.',
      link: 'read more'
    },
    {
      id: 3,
      image: '/images/3.png',
      tag: 'Client work',
      name: 'Hej fra København!',
      testimonial: 'Michelle is experiencing her first time out in the Danish design capital.',
      link: 'read more'
    },
    {
      id: 4,
      image: '/images/4.png',
      tag: 'Client work',
      name: 'Among Chilangos and nomads',
      testimonial: 'Dripping tacos, boiling stadiums, and hip co-working spaces. Time out in Mexico City!',
      link: 'read more'
    },
    {
      id: 5,
      image: '/images/hero1.jpg',
      tag: 'Project',
      name: 'Modern web solutions',
      testimonial: 'Creating responsive and interactive websites that deliver exceptional user experiences.',
      link: 'read more'
    },
    {
      id: 6,
      image: '/images/hero2.jpg',
      tag: 'Project',
      name: 'Data visualization mastery',
      testimonial: 'Transforming complex data into beautiful, insightful visual stories.',
      link: 'read more'
    },
    {
      id: 7,
      image: '/images/hero3.jpg',
      tag: 'Project',
      name: 'UI/UX design excellence',
      testimonial: 'Crafting intuitive interfaces that users love and businesses trust.',
      link: 'read more'
    },
    {
      id: 8,
      image: '/images/hero4.jpg',
      tag: 'Project',
      name: 'Full-stack development',
      testimonial: 'Building robust applications from concept to deployment.',
      link: 'read more'
    }
  ]

  const totalTestimonials = testimonials.length
  const [scrollOffset, setScrollOffset] = useState(0)

  const goNext = () => {
    setCurrentSet((prev) => {
      const next = (prev + 1) % totalTestimonials
      setScrollOffset(next * 15) // Each testimonial move is 15% (100% / ~6-7 visible)
      return next
    })
  }

  const goPrev = () => {
    setCurrentSet((prev) => {
      const next = (prev - 1 + totalTestimonials) % totalTestimonials
      setScrollOffset(next * 15) // Each testimonial move is 15%
      return next
    })
  }

  const goToSet = (index) => {
    setCurrentSet(index)
    setScrollOffset(index * 15) // Each testimonial move is 15%
  }

  // Handle horizontal scroll for navigation
  useEffect(() => {
    let isScrolling = false
    
    const handleWheel = (e) => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        // Horizontal scroll detected
        e.preventDefault()
        
        if (!isScrolling) {
          isScrolling = true
          
          if (e.deltaX > 0) {
            goNext()
          } else {
            goPrev()
          }
          
          setTimeout(() => {
            isScrolling = false
          }, 300) // Throttle scroll events
        }
      }
    }

    const container = document.querySelector('.testimonial-slideshow')
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false })
      return () => container.removeEventListener('wheel', handleWheel)
    }
  }, [])

  // Get all testimonials for smooth scrolling
  const getAllTestimonials = () => {
    return testimonials
  }

  const allTestimonials = getAllTestimonials()

  return (
    <div className="testimonial-slideshow">
      {/* Navigation buttons */}
      <div className="testimonial-nav">
        <button className="nav-btn prev-btn" onClick={goPrev}>
          <i className="fa-solid fa-arrow-left"></i>
        </button>
        <button className="nav-btn next-btn" onClick={goNext}>
          <i className="fa-solid fa-arrow-right"></i>
        </button>
      </div>

      <div className="testimonial-container">
        <div 
          className="testimonial-scroll-container"
          style={{ transform: `translateX(-${scrollOffset}%)` }}
        >
          {allTestimonials.map((testimonial, index) => (
            <div key={testimonial.id} className="testimonial-item">
              <div className="testimonial-image">
                <img 
                  src={testimonial.image} 
                  alt={testimonial.name}
                />
                <div className="testimonial-tag">{testimonial.tag}</div>
              </div>
              <div className="testimonial-content">
                <h4 className="testimonial-name">{testimonial.name}</h4>
                <p className="testimonial-text">{testimonial.testimonial}</p>
                <span className="testimonial-link">{testimonial.link}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default TestimonialSlideshow
