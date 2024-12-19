import React, { useState, useEffect } from "react";
import {
  Accordion,
  AccordionItem,
  AccordionItemHeading,
  AccordionItemButton,
  AccordionItemPanel,
} from "react-accessible-accordion";
import { MdOutlineArrowDropDown, MdOutlineArrowDropUp } from "react-icons/md";
import "./About.css";
import data from './accordion';

const About = () => {
  const [expandedItems, setExpandedItems] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const images = [
    "/aboutus1.webp",
    "/aboutus2.webp",
    "/aboutus3.webp",
    "/aboutus4.webp"
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 3000); //3 sec
    return () => clearInterval(interval);
  }, [images.length]);

  useEffect(() => {
    const numbers = document.querySelectorAll(".number");
    const animateNumbers = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const updateCount = (element) => {
            const target = +element.getAttribute("data-target");
            const count = +element.innerText;
            const increment = target / 100;

            if (count < target) {
              element.innerText = Math.ceil(count + increment);
              setTimeout(() => updateCount(element), 30);
            } else {
              element.innerText = target;
            }
          };

          numbers.forEach((number) => updateCount(number));
        }
      });
    };

    const observer = new IntersectionObserver(animateNumbers, {
      threshold: 0.5,
    });
    numbers.forEach((number) => observer.observe(number));

    return () => observer.disconnect();
  }, []);

  const handleAccordionClick = (index) => {
    setExpandedItems((prevExpandedItems) =>
      prevExpandedItems.includes(index)
        ? prevExpandedItems.filter((item) => item !== index)
        : [...prevExpandedItems, index]
    );
  };

  return (
    <section id="about" className="about-section">
      <div className="about-container">
        <div className="about-content">
          <h2 className="section-title">About Us</h2>
          <p className="section-subtitle">Discover Our Story and Values</p>
          <div className="about-grid">
            <div className="about-carousel">
              <div
                className="carousel-track"
                style={{
                  transform: `translateX(-${currentImageIndex * 100}%)`,
                }}
              >
                {images.map((src, index) => (
                  <img src={src} alt={`Slide ${index + 1}`} key={index} />
                ))}
              </div>
            </div>
            <div className="about-text">
              <p>
                At Skyline, we're more than just a real estate company. We're your partners in finding the perfect place to call home. With years of experience and a passion for excellence, we've helped countless individuals and families discover their dream properties.
              </p>
              <p>
                Our commitment to quality, integrity, and customer satisfaction sets us apart in the industry. We believe that everyone deserves a space they love, and we work tirelessly to make that a reality for each of our clients.
              </p>

              <div className="stats-container">
                <div className="stat">
                  <div className="stat-card">
                    <h3 className="number" data-target="500">0</h3>
                    <p>Properties Sold</p>
                  </div>
                </div>
                <div className="stat">
                  <div className="stat-card">
                    <h3 className="number" data-target="300">0</h3>
                    <p>Satisfied Clients</p>
                  </div>
                </div>
                <div className="stat">
                  <div className="stat-card">
                    <h3 className="number" data-target="15">0</h3>
                    <p>Years of Experience</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="values-section">
          <h3 className="values-title">Our Core Values</h3>
          <Accordion allowMultipleExpanded={true} allowZeroExpanded={true}>
            {data.map((item, i) => {
              const isExpanded = expandedItems.includes(i);
              return (
                <AccordionItem className={`accordionItem ${isExpanded ? "expanded" : ""}`} key={i} uuid={i.toString()}>
                  <AccordionItemHeading>
                    <AccordionItemButton
                      className="accordionButton"
                      onClick={() => handleAccordionClick(i)}
                    >
                      <div className="accordion-icon">{item.icon}</div>
                      <span className="accordion-title">{item.heading}</span>
                      <div className="accordion-arrow">
                        {isExpanded ? <MdOutlineArrowDropUp size={24} /> : <MdOutlineArrowDropDown size={24} />}
                      </div>
                    </AccordionItemButton>
                  </AccordionItemHeading>
                  <AccordionItemPanel>
                    <p className="accordion-content">{item.detail}</p>
                  </AccordionItemPanel>
                </AccordionItem>
              );
            })}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default About;