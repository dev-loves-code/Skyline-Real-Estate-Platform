import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Context } from "../../Context/ContextProvider";
import { Checkbox, IconButton } from "@mui/material";
import FavoriteBorder from "@mui/icons-material/FavoriteBorder";
import Favorite from "@mui/icons-material/Favorite";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import BedIcon from "@mui/icons-material/Bed";
import BathtubIcon from "@mui/icons-material/Bathtub";
import SquareFootIcon from "@mui/icons-material/SquareFoot";
import TerrainIcon from "@mui/icons-material/Terrain";
import "./propertycard.css";
import MapComponent from "../Map/map";

export default function PropertyDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [propertyDetails, setPropertyDetails] = useState(null);
  const [agentDetails, setAgentDetails] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { favoriteItems, toggleFav, LikedItems, toggleLike } =
    useContext(Context);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    setUser(storedUser);

    async function fetchPropertyAndAgentDetails() {
      try {
        setIsLoading(true);

        const propertyResponse = await fetch(
          `http://localhost:5000/properties/${id}`
        );
        const propertyData = await propertyResponse.json();

        if (!propertyData) {
          throw new Error("Property not found");
        }

        setPropertyDetails(propertyData);

        const agentsResponse = await fetch(
          `http://localhost:5000/agents/${propertyData.agentId}`
        );
        const agentData = await agentsResponse.json();

        setAgentDetails(
          agentData || {
            name: "Unassigned Agent",
            email: "support@realestate.com",
            phone: "N/A",
            picture: "/path/to/default-agent-image.jpg",
          }
        );

        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching property or agent details:", error);
        setIsLoading(false);
      }
    }

    fetchPropertyAndAgentDetails();
  }, [id]);

  if (isLoading) {
    return (
      <div className="property-card-details">
        <div className="property-info">
          <h2>Loading property details...</h2>
        </div>
      </div>
    );
  }

  if (!propertyDetails) {
    return (
      <div className="property-card-details">
        <div className="property-info">
          <h2>Property not found</h2>
        </div>
      </div>
    );
  }

  const nextImage = () => {
    setCurrentImageIndex(
      (prevIndex) => (prevIndex + 1) % propertyDetails.images.length
    );
  };

  const prevImage = () => {
    setCurrentImageIndex(
      (prevIndex) =>
        (prevIndex - 1 + propertyDetails.images.length) %
        propertyDetails.images.length
    );
  };

  const isFavorite = favoriteItems[propertyDetails.id] || false;
  const isLiked = LikedItems[propertyDetails.id] || false;

  return (
    <div className="property-card-details">
      <div className="image-carousel">
        <button onClick={prevImage} className="carousel-button prev">
          ❮
        </button>
        <img
          src={`http://localhost:5000${propertyDetails.images[currentImageIndex]}`}
          alt={`${propertyDetails.name} ${currentImageIndex + 1}`}
          onError={(e) => {
            e.target.src = "/path/to/placeholder-image.webp";
          }}
        />
        <button onClick={nextImage} className="carousel-button next">
          ❯
        </button>
      </div>

      <div className="property-info">
        <div className="property-header">
          <h2>{propertyDetails.name}</h2>
          <div className="property-actions">
            <IconButton
              className="action-button"
              sx={{ "&:hover": { color: "red" } }}
            >
              <Checkbox
                icon={<FavoriteBorder />}
                checkedIcon={<Favorite />}
                className="action-checkbox"
                onChange={() => toggleLike(propertyDetails.id)}
                checked={isLiked}
                sx={{
                  color: isLiked ? "red" : "inherit", // Set the color when liked
                  "&.Mui-checked": {
                    color: "red", // Ensure red when checked
                  },
                }}
              />
            </IconButton>

            <IconButton
              className="action-button"
              sx={{ "&:hover": { color: "#f0d678" } }}
            >
              <Checkbox
                icon={<BookmarkBorderIcon />}
                checkedIcon={<BookmarkIcon />}
                checked={isFavorite}
                onChange={() => toggleFav(propertyDetails.id)}
                className="action-checkbox"
                sx={{
                  color: isFavorite ? "#f0d678" : "inherit", // Set the color when favorited
                  "&.Mui-checked": {
                    color: "#f0d678", // Ensure gold when checked
                  },
                }}
              />
            </IconButton>
          </div>
        </div>

        <p className="price">${propertyDetails.price.toLocaleString()}</p>

        <div className="location">
          <LocationOnIcon className="location-icon" />
          {propertyDetails.location}
        </div>

        <div className="property-type">
          {propertyDetails.type === "sale" ? "For Sale" : "For Rent"}
        </div>

        <div className="features">
          <span className="feature-item">
            <BedIcon /> {propertyDetails.numberOfBedrooms} Bedrooms
          </span>
          <span className="feature-item">
            <BathtubIcon /> {propertyDetails.numberOfBathrooms} Bathrooms
          </span>
          <span className="feature-item">
            <SquareFootIcon /> {propertyDetails.interior} sq ft Interior
          </span>
          <span className="feature-item">
            <TerrainIcon /> {propertyDetails.exterior} sq ft Exterior
          </span>
        </div>

        <p className="description">{propertyDetails.description}</p>
      </div>

      <MapComponent
        latitude={propertyDetails.latitude}
        longitude={propertyDetails.longitude}
      />

      <div className="additional-info">
        <div
          className={propertyDetails.type === "rent" ? "for-rent" : "for-sale"}
        >
          <h3>
            {propertyDetails.type === "rent"
              ? "Book this property"
              : "Agent Information"}
          </h3>
          {propertyDetails.type === "rent" ? (
            <>
              <p>
                Interested in renting this estate? Contact our agents for
                further details and proceed with booking.
              </p>
              <button
                className="booking-button"
                onClick={() =>
                  user
                    ? navigate(`/book/${propertyDetails.id}`)
                    : alert("Please sign in to proceed")
                }
              >
                Book Now
              </button>
            </>
          ) : (
            <>
              <div className="agent-profile">
                <img
                  src={`http://localhost:5000${agentDetails.picture}`}
                  alt={`${agentDetails.name}`}
                  className="agent-image"
                />
                <div className="agent-details">
                  <p>
                    <strong>Agent Name:</strong>{" "}
                    {agentDetails.name || "Unassigned"}
                  </p>
                  <p>
                    <strong>Email:</strong>{" "}
                    {agentDetails.email || "Not available"}
                  </p>
                </div>
              </div>
              <button
                className="reservation-button"
                onClick={() =>
                  user
                    ? navigate(`/reservation/${propertyDetails.id}`)
                    : alert("Please sign in to proceed")
                }
              >
                Make a Reservation
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
