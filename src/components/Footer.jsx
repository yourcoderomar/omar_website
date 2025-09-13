import React from 'react'
import '../App.css'

const Footer = () => {
  return (
    <>
      <div className="footer-transition"></div>
      <footer id="contact" className="footer">
        <div className="footer-content">
        {/* Left side - Main brand and tagline */}
        <div className="footer-left">
          <div className="footer-brand">
            <h1 className="footer-logo">Omar</h1>
          </div>
          <div className="footer-tagline">
            <p>Full-stack developer and designer</p>
            <p>Turning creativity into impactful solutions.</p>
          </div>
        </div>

        {/* Center - Contact info */}
        <div className="footer-center">
          <div className="footer-contact-header">
            <span className="black-tag">contact</span>
          </div>
          <div className="footer-contact-info">
            <div className="company-info">
              <p className="company-name">El Rehab City</p>
              <p className="company-name">Egypt,Cairo</p>
            </div>
            <div className="contact-details">
              <a href="tel:+41412405662" className="phone">+02 01155306633</a>
              <a href="mailto:hallo@clou.ch" className="email">omarmostafamohie12<br />@gmail.com</a>
            </div>
          </div>
        </div>

        {/* Right side - Links and social */}
        <div className="footer-right">
          <div className="footer-links-header">
            <span className="black-tag">links</span>
          </div>
          <div className="footer-links">
            <div className="social-links">
              <a href="#" className="footer-link">Instagram</a>
              <a href="#" className="footer-link">LinkedIn</a>
              <a href="#" className="footer-link">Github</a>
            </div>

            <div className="legal-links">
              <a href="#" className="footer-link legal">Resume</a>
              <a href="#" className="footer-link legal">Terms and Conditions</a>
            </div>
          </div>
        </div>
      </div>


    </footer>
    </>
  )
}

export default Footer
