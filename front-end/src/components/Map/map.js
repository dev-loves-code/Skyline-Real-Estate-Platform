import React, { useEffect } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./map.css";

const MapComponent = ({ latitude, longitude }) => { 
  useEffect(() => {

    const map = L.map("map").setView([latitude, longitude], 13);


    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    L.marker([latitude, longitude]).addTo(map)
      .bindPopup("Property Location")
      .openPopup();

    return () => {
      map.remove(); 
    };
  }, [latitude, longitude]);

  return <div id="map" style={{ height: "400px", width: "100%" }} />;
};

export default MapComponent; 
