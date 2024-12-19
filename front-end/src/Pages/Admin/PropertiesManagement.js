import React, { useState, useEffect } from "react";
import {
  Radio,
  RadioGroup,
  FormControlLabel,
  TextField,
  Slider,
  Box,
} from "@mui/material";
import "./PropertiesManagement.css";

export default function PropertiesManagement() {
  const [formData, setFormData] = useState({
    name: "",
    numberOfBedrooms: "",
    numberOfBathrooms: "",
    interior: "",
    exterior: "",
    price: "",
    location: "",
    category: "",
    type: "",
    description: "",
    agentId: "",
    latitude: "",
    longitude: "",
    images: [],
  });

  const [properties, setProperties] = useState([]);
  const [editingProperty, setEditingProperty] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [type, setPropertyType] = useState("all");
  const [priceRange, setPriceRange] = useState([0, 10000000]);

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
        `http://localhost:5000/admin/get-properties?${queryParams}`
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const newImages = Array.from(e.target.files);
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...newImages],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();
    for (const key in formData) {
      if (key === "images" && formData.images.length > 0) {
        // Only append images if there are new images to upload
        formData.images.forEach((image) => data.append("images", image));
      } else {
        data.append(key, formData[key]);
      }
    }

    try {
      const url = editingProperty
        ? `http://localhost:5000/admin/edit-property/${editingProperty.id}`
        : "http://localhost:5000/admin/add-properties";
      const method = editingProperty ? "PUT" : "POST";

      const response = await fetch(url, {
        method: method,
        body: data,
      });

      if (response.ok) {
        alert(
          editingProperty
            ? "Property updated successfully!"
            : "Property added successfully!"
        );
        setFormData({
          name: "",
          numberOfBedrooms: "",
          numberOfBathrooms: "",
          interior: "",
          exterior: "",
          price: "",
          location: "",
          category: "",
          type: "",
          description: "",
          agentId: "",
          latitude: "",
          longitude: "",
          images: [],
        });
        setEditingProperty(null);
        setIsAddingNew(false);
        fetchProperties();
      } else {
        alert("Failed to submit property.");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("An error occurred while adding/updating the property.");
    }
  };

  const handleEdit = (property) => {
    setEditingProperty(property);
    setFormData({
      name: property.name,
      numberOfBedrooms: property.numberOfBedrooms,
      numberOfBathrooms: property.numberOfBathrooms,
      interior: property.interior,
      exterior: property.exterior,
      price: property.price,
      location: property.location,
      category: property.category,
      type: property.type,
      description: property.description,
      agentId: property.agentId,
      latitude: property.latitude,
      longitude: property.longitude,
      images: property.images || [],
    });
    setIsAddingNew(true);
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/admin/delete-property/${deleteId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        alert("Property deleted successfully!");
        setDeleteId(null);
        fetchProperties();
      } else {
        alert("Failed to delete property.");
      }
    } catch (error) {
      console.error("Error deleting property:", error);
      alert("An error occurred while deleting the property.");
    }
  };

  const handleAddNew = () => {
    setIsAddingNew(true);
    setEditingProperty(null);
    setFormData({
      name: "",
      numberOfBedrooms: "",
      numberOfBathrooms: "",
      interior: "",
      exterior: "",
      price: "",
      location: "",
      category: "",
      type: "",
      description: "",
      agentId: "",
      latitude: "",
      longitude: "",
      images: [],
    });
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
    <div className="page">
      <h1>Properties Management Page</h1>
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
          <FormControlLabel value="all" control={<Radio />} label="All Types" />
          <FormControlLabel value="sale" control={<Radio />} label="For Sale" />
          <FormControlLabel value="rent" control={<Radio />} label="For Rent" />
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
      <div className="properties-management">
        <div className="form-section">
          {!isAddingNew && (
            <button onClick={handleAddNew} className="add-new-button">
              Add New Property
            </button>
          )}
          {(isAddingNew || editingProperty) && (
            <form onSubmit={handleSubmit} className="form-container">
              <input
                type="text"
                name="name"
                placeholder="Enter property name (e.g., Luxurious Villa)"
                value={formData.name}
                onChange={handleChange}
                required
                className="input-field"
              />
              <input
                type="number"
                name="numberOfBedrooms"
                placeholder="Number of Bedrooms"
                value={formData.numberOfBedrooms}
                onChange={handleChange}
                required
                className="input-field"
              />
              <input
                type="number"
                name="numberOfBathrooms"
                placeholder="Number of Bathrooms"
                value={formData.numberOfBathrooms}
                onChange={handleChange}
                required
                className="input-field"
              />
              <input
                type="text"
                name="interior"
                placeholder="Interior Features"
                value={formData.interior}
                onChange={handleChange}
                className="input-field"
              />
              <input
                type="text"
                name="exterior"
                placeholder="Exterior Features"
                value={formData.exterior}
                onChange={handleChange}
                className="input-field"
              />
              <input
                type="number"
                name="price"
                placeholder="Price"
                value={formData.price}
                onChange={handleChange}
                required
                className="input-field"
              />
              <input
                type="text"
                name="location"
                placeholder="Location"
                value={formData.location}
                onChange={handleChange}
                required
                className="input-field"
              />
              <input
                type="text"
                name="category"
                placeholder="Category (e.g., Apartment, Villa)"
                value={formData.category}
                onChange={handleChange}
                className="input-field"
              />

              <div className="type-radio-group">
                <label>
                  <input
                    type="radio"
                    name="type"
                    value="rent"
                    checked={formData.type === "rent"}
                    onChange={handleChange}
                  />
                  Rent
                </label>
                <label>
                  <input
                    type="radio"
                    name="type"
                    value="sale"
                    checked={formData.type === "sale"}
                    onChange={handleChange}
                  />
                  Sale
                </label>
              </div>

              <textarea
                name="description"
                placeholder="Description"
                value={formData.description}
                onChange={handleChange}
                className="input-field"
              ></textarea>
              <input
                type="text"
                name="agentId"
                placeholder="Agent ID"
                value={formData.agentId}
                onChange={handleChange}
                className="input-field"
              />
              <input
                type="text"
                name="latitude"
                placeholder="Latitude"
                value={formData.latitude}
                onChange={handleChange}
                className="input-field"
              />
              <input
                type="text"
                name="longitude"
                placeholder="Longitude"
                value={formData.longitude}
                onChange={handleChange}
                className="input-field"
              />
              <input
                type="file"
                name="images"
                multiple
                onChange={handleFileChange}
                className="input-field"
              />
              <button type="submit" className="submit-button">
                Submit
              </button>
            </form>
          )}
        </div>

        <div className="properties-list-section">
          <table className="properties-table">
            <thead>
              <tr>
                <th>Property Name</th>
                <th>Price</th>
                <th>Type</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {properties.map((property) => (
                <tr key={property.id}>
                  <td>{property.name}</td>
                  <td>{property.price}</td>
                  <td>{property.type}</td>
                  <td>
                    <button
                      onClick={() => handleEdit(property)}
                      className="edit-button"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setDeleteId(property.id)}
                      className="delete-button"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {deleteId && (
        <div className="delete-confirmation">
          <div className="delete-modal">
            <p>Are you sure you want to delete this property?</p>
            <div className="modal-actions">
              <button onClick={handleDelete} className="delete-confirm">
                Yes, Delete
              </button>
              <button
                onClick={() => setDeleteId(null)}
                className="cancel-delete"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
