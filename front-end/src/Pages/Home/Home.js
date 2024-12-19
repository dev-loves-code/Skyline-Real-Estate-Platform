import React from "react";
import "./Home.css";
import About from "../../components/About/About";
import PropertyShowcase from "../../components/Landing/PropertyShowcase";

const Home = () => {
  return (
    <div>
      <div id="home" className="home-container">
        <div className="overlay">
          <div className="text-background">
            <h1 className="main-heading animated-text">SKYLINE</h1>
            <p className="sub-heading animated-text">
              Where We Help You Reach Your Dream Estate!
            </p>
          </div>
        </div>
      </div>
      <PropertyShowcase />
      <About />
    </div>
  );
};

export default Home;
