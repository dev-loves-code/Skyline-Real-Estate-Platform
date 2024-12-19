import React, { useState, useEffect } from "react";
import Globe from "react-globe.gl";
import { motion } from "framer-motion";
import { LocationOn } from "@mui/icons-material";
import "./PropertyShowcase.css";
 
const PropertyShowcase = () => {
  const [properties, setProperties] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState(null);
 
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await fetch("http://localhost:5000/admin/get-properties");
        if (!response.ok) {
          throw new Error("Failed to fetch properties");
        }
        const data = await response.json();
        setProperties(data);
      } catch (error) {
        console.error("Error fetching properties:", error);
      }
    };
 
    fetchProperties();
  }, []);
 
  const handlePropertyClick = (property) => {
    setSelectedProperty(property);
  };
 
  return (
    <div className="globe-section">
      <div className="showcase-content">
        <div className="showcase-text">
          <motion.h1 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="showcase-title"
          >
            Global Property Marketplace
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="showcase-subtitle"
          >
            Discover properties from around the world. 
            Explore, compare, and find your perfect location.
          </motion.p>
        </div>
        <div className="globe-container">
          <Globe
            globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
            backgroundColor="rgba(0,0,0,0)"
            pointsData={properties.map((property) => ({
              lat: property.latitude,
              lng: property.longitude,
              name: property.name,
              price: property.price,
              type: property.type,
              location: property.location,
            }))}
            pointAltitude={0.05}
            pointColor={(d) => (d.type === "sale" ? "#F0D678" : "#7FC8A9")}
            pointRadius={0.3}
            onPointClick={(property) => handlePropertyClick(property)}
            pointLabel={(d) =>
              `<b>${d.name}</b><br>Price: $${d.price.toLocaleString()}<br>${d.location}`
            }
            width={600}
            height={600}
          />
        </div>
      </div>
 
      {selectedProperty && (
        <motion.div
          className="property-detail-popup"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <h3>{selectedProperty.name}</h3>
          <p>
            <LocationOn /> {selectedProperty.location}
          </p>
          <p>Price: ${selectedProperty.price.toLocaleString()}</p>
          <p>Type: {selectedProperty.type === "sale" ? "For Sale" : "For Rent"}</p>
          <button onClick={() => setSelectedProperty(null)}>Close</button>
        </motion.div>
      )}
    </div>
  );
};
 
export default PropertyShowcase;