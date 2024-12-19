import React from 'react';
import { FaPhone, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';
import { HashLink as Link } from 'react-router-hash-link';
import './Footer.css';

const Footer = () => {
  return (
    <footer id="contact" className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h3>Contact Us</h3>
          <p><FaPhone /> +1 (123) 456-7890</p>
          <p><FaEnvelope /> info@example.com</p>
          <p><FaMapMarkerAlt /> 123 Main St, City, State 12345</p>
        </div>
        <div className="footer-section">
          <h3>Quick Links</h3>
          <ul>
            <li><Link smooth to="/#home">Home</Link></li>
            <li><Link smooth to="/#about">About</Link></li>
            <li><Link smooth to="/properties">Properties</Link></li>
            <li><Link smooth to="/#contact">Contact</Link></li>
          </ul>
        </div>
        <div className="footer-section">
          <h3>Newsletter</h3>
          <p>Stay updated with our latest news and offers!</p>
          <form className="newsletter-form">
            <input type="email" placeholder="Enter your email" required />
            <button type="submit">Subscribe</button>
          </form>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; 2024 Skyline. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;