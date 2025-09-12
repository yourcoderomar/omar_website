import React from 'react'
import '../App.css'

const Footer = () => {
  return (
    <>
      <div className="footer-transition"></div>
      <footer className="footer">
        <div className="footer-content">
        {/* Left side - Main brand and tagline */}
        <div className="footer-left">
          <div className="footer-brand">
            <h1 className="footer-logo">CLOU</h1>
            <div className="footer-tagline">
              <p>Agency for meaningful graphics</p>
              <p>and communication</p>
            </div>
          </div>
        </div>

        {/* Center - Contact info */}
        <div className="footer-center">
          <div className="footer-contact-header">
            <button className="contact-btn">contact</button>
          </div>
          <div className="footer-contact-info">
            <div className="company-info">
              <p className="company-name">Clou Advertising</p>
              <p className="company-name">Agency</p>
              <p className="address">Mythenstrasse 7</p>
              <p className="address">CH-6003 Lucerne</p>
            </div>
            <div className="contact-details">
              <p className="phone">+41 41 240 56 62</p>
              <p className="email">hallo@clou.ch</p>
            </div>
          </div>
        </div>

        {/* Right side - Links and social */}
        <div className="footer-right">
          <div className="footer-links-header">
            <button className="left-btn">Left</button>
          </div>
          <div className="footer-links">
            <div className="social-links">
              <a href="#" className="footer-link">Instagram</a>
              <a href="#" className="footer-link">LinkedIn</a>
              <a href="#" className="footer-link">Newsletter</a>
            </div>
            <div className="platform-links">
              <a href="#" className="footer-link">Webflow</a>
            </div>
            <div className="legal-links">
              <a href="#" className="footer-link legal">Imprint</a>
              <a href="#" className="footer-link legal">Data protection</a>
              <a href="#" className="footer-link legal">Terms and Conditions</a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom partner section */}
      <div className="footer-bottom">
        <div className="partner-badge">
          <span className="partner-icon">W</span>
          <span className="partner-text">Professional Partner</span>
        </div>
      </div>
    </footer>
    </>
  )
}

export default Footer
