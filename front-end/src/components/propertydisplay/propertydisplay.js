import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import "./propertydisplay.css";
import { Context } from "../../Context/ContextProvider";
import {
  Checkbox,
  IconButton,
  Radio,
  RadioGroup,
  FormControlLabel,
  TextField,
  Slider,
  Box,
} from "@mui/material";
import FavoriteBorder from "@mui/icons-material/FavoriteBorder";
import Favorite from "@mui/icons-material/Favorite";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import LocationOnIcon from "@mui/icons-material/LocationOn";

const PropertyList = () => {
  const [properties, setProperties] = useState([]);
  const { favoriteItems, toggleFav, LikedItems, toggleLike } =
    useContext(Context);

  const [searchQuery, setSearchQuery] = useState("");
  const [type, setPropertyType] = useState("all");
  const [priceRange, setPriceRange] = useState([0, 10000000]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProperties();
  }, [searchQuery, type, priceRange]);

  const fetchProperties = async () => {
    try {
      const queryParams = new URLSearchParams({
        searchQuery,
        type,
        minPrice: priceRange[0],
        maxPrice: priceRange[1],
      }).toString();

      const response = await fetch(
        `http://localhost:5000/properties?${queryParams}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch properties");
      }
      const data = await response.json();
      console.log("Fetched properties:", data);
      setProperties(data);
    } catch (error) {
      console.error("Error fetching properties:", error);
      alert("Failed to fetch properties. Please try again.");
    }
  };

  const handlePropertyClick = (propertyId) =>
    navigate(`/properties/${propertyId}`);

  const handleInteractionClick = (e, callback) => {
    e.stopPropagation();
    callback();
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleTypeChange = (e) => {
    setPropertyType(e.target.value);
  };

  const handlePriceChange = (e, newValue) => {
    setPriceRange(newValue);
  };

  return (
    <div className="property-page">
      <div className="property-container">
        <div className="property-header">
          <h2>Curated Luxury Properties</h2>
          <p>
            Experience the epitome of refined living with our exclusive
            collection of distinguished properties.
          </p>
        </div>

        <div className="filter-section">
          <TextField
            label="Search"
            variant="outlined"
            value={searchQuery}
            onChange={handleSearchChange}
            fullWidth
            margin="normal"
          />

          <RadioGroup row value={type} onChange={handleTypeChange}>
            <FormControlLabel
              value="all"
              control={<Radio />}
              label="All Types"
            />
            <FormControlLabel
              value="sale"
              control={<Radio />}
              label="For Sale"
            />
            <FormControlLabel
              value="rent"
              control={<Radio />}
              label="For Rent"
            />
          </RadioGroup>

          <Box sx={{ width: 300 }}>
            <Slider
              value={priceRange}
              onChange={handlePriceChange}
              valueLabelDisplay="auto"
              valueLabelFormat={(value) => `$${value.toLocaleString()}`}
              min={0}
              max={10000000}
              step={1000}
              aria-labelledby="price-range-slider"
            />
          </Box>
        </div>

        <div className="property-grid">
          {properties.map((property) => (
            <div
              key={property.id}
              onClick={() => handlePropertyClick(property.id)}
              className="property-card"
            >
              <div className="property-image-container">
                <img
                  src={`http://localhost:5000${property.images[0]}`}
                  alt={property.name}
                  className="property-image"
                />

                <div
                  className={`property-tag ${property.type === "sale" ? "tag-sale" : "tag-rent"}`}
                >
                  {property.type === "sale" ? "For Sale" : "For Rent"}
                </div>

                <div className="property-category">{property.category}</div>
              </div>

              <div className="property-content">
                <div className="property-price">
                  $
                  {typeof property.price === "number"
                    ? property.price.toLocaleString()
                    : property.price}
                </div>

                <h3 className="property-title">{property.name}</h3>

                <div className="property-location">
                  <LocationOnIcon className="location-icon" />
                  <span>{property.location}</span>
                </div>
              </div>

              <div className="property-actions">
                <IconButton
                  onClick={(e) =>
                    handleInteractionClick(e, () => toggleLike(property.id))
                  }
                  className="action-button"
                  sx={{
                    color: "grey",
                    "&:hover": { color: "red" },
                  }}
                >
                  <Checkbox
                    icon={<FavoriteBorder />}
                    checkedIcon={<Favorite />}
                    checked={LikedItems[property.id] || false}
                    className="action-checkbox"
                    sx={{
                      color: LikedItems[property.id] ? "red" : "inherit", // Match the checked color
                      "&.Mui-checked": {
                        color: "red", // Ensure red when checked
                      },
                    }}
                  />
                </IconButton>

                <IconButton
                  onClick={(e) =>
                    handleInteractionClick(e, () => toggleFav(property.id))
                  }
                  className="action-button"
                  sx={{
                    color: "grey",
                    "&:hover": { color: "#f0d678" },
                  }}
                >
                  <Checkbox
                    icon={<BookmarkBorderIcon />}
                    checkedIcon={<BookmarkIcon />}
                    checked={favoriteItems[property.id] || false}
                    className="action-checkbox"
                    sx={{
                      color: favoriteItems[property.id] ? "#f0d678" : "inherit", // Match the checked color
                      "&.Mui-checked": {
                        color: "#f0d678", // Ensure gold when checked
                      },
                    }}
                  />
                </IconButton>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PropertyList;
