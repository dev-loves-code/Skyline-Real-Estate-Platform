import React, { useContext, useState, useEffect } from "react";
import { Context } from "../../Context/ContextProvider";
import { Link } from "react-router-dom";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import BedIcon from "@mui/icons-material/Bed";
import BathtubIcon from "@mui/icons-material/Bathtub";
import SquareFootIcon from "@mui/icons-material/SquareFoot";
import "./Favorites.css";

const Favorites = () => {
  const { properties, favoriteItems } = useContext(Context);
  const [bookings, setBookings] = useState([]);
  const [reservations, setReservations] = useState([]);

  const favoriteProperties = properties.filter(
    (property) => favoriteItems[property.id]
  );

  const fetchBookings = async () => {
    try {
      const storedUser = localStorage.getItem("user");
      if (!storedUser) {
        alert("User not found. Please log in.");
        return;
      }
      const { name: username } = JSON.parse(storedUser);
      const response = await fetch(
        `http://localhost:5000/bookings/${username}`
      );
      if (!response.ok) throw new Error("Failed to fetch bookings");
      const data = await response.json();
      setBookings(data);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    }
  };

  const fetchReservations = async () => {
    try {
      const storedUser = localStorage.getItem("user");
      if (!storedUser) {
        alert("User not found. Please log in.");
        return;
      }
      const { name: username } = JSON.parse(storedUser);
      const response = await fetch(
        `http://localhost:5000/reservations/${username}`
      );
      if (!response.ok) throw new Error("Failed to fetch reservations");
      const data = await response.json();
      setReservations(data);
    } catch (error) {
      console.error("Error fetching reservations:", error);
    }
  };

  useEffect(() => {
    fetchBookings();
    fetchReservations();
  }, []);

  console.log("Bookings:", bookings);
  console.log("Reservations:", reservations);

  const formatDate = (date) => {
    // Trim the date string to display only the date part
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="favorites-container">
      <div className="favorites-header">
        <h2>Your Favorite Properties</h2>
        <p>
          A curated collection of distinguished properties that caught your
          attention
        </p>
      </div>

      {favoriteProperties.length > 0 ? (
        <div className="favorites-grid">
          {favoriteProperties.map((property) => (
            <Link
              to={`/properties/${property.id}`}
              className="favorite-card"
              key={property.id}
            >
              <div className="favorite-image">
                <img
                  src={`http://localhost:5000${property.images[0]}`}
                  alt={property.name}
                />
                <div className={`property-label label-${property.type}`}>
                  {property.type === "sale" ? "For Sale" : "For Rent"}
                </div>
                <div className="favorite-price">
                  ${property.price.toLocaleString()}
                </div>
              </div>
              <div className="favorite-details">
                <h3 className="favorite-title">{property.name}</h3>
                <div className="favorite-location">
                  <LocationOnIcon sx={{ fontSize: 20, color: "#f0d678" }} />
                  {property.location}
                </div>
                <div className="favorite-features">
                  <span className="feature-item">
                    <BedIcon sx={{ fontSize: 18 }} />
                    {property.numberOfBedrooms}
                  </span>
                  <span className="feature-item">
                    <BathtubIcon sx={{ fontSize: 18 }} />
                    {property.numberOfBathrooms}
                  </span>
                  <span className="feature-item">
                    <SquareFootIcon sx={{ fontSize: 18 }} />
                    {property.interior}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="no-favorites">
          <p>Your collection of favorite properties is currently empty.</p>
          <Link to="/properties" className="browse-link">
            Explore Our Properties
          </Link>
        </div>
      )}

      {/* Bookings Table */}
      <div className="section">
        <h3>Your Bookings</h3>
        {bookings.length > 0 ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>Property</th>
                <th>Check-in</th>
                <th>Check-out</th>
                <th>Total Price</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking, index) => (
                <tr key={index}>
                  <td>{booking.name}</td>
                  <td>{formatDate(booking.checkInDate)}</td>
                  <td>{formatDate(booking.checkOutDate)}</td>
                  <td>${booking.totalPrice}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>You have no bookings.</p>
        )}
      </div>

      {/* Reservations Table */}
      <div className="section">
        <h3>Your Reservations</h3>
        {reservations.length > 0 ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>Property</th>
                <th>Reservation Date</th>
                <th>Agent Email</th>
              </tr>
            </thead>
            <tbody>
              {reservations.map((reservation, index) => (
                <tr key={index}>
                  <td>{reservation.name}</td>
                  <td>{formatDate(reservation.reservationDate)}</td>
                  <td>{reservation.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>You have no reservations.</p>
        )}
      </div>
    </div>
  );
};

export default Favorites;
