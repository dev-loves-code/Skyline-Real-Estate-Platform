import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [reservations, setReservations] = useState([]);

  useEffect(() => {
    fetch(`http://localhost:5000/admin/bookings`)
      .then((response) => response.json())
      .then((data) => setBookings(data))
      .catch((err) => console.error("Error fetching bookings:", err));

    fetch(`http://localhost:5000/admin/reservations`)
      .then((response) => response.json())
      .then((data) => setReservations(data))
      .catch((err) => console.error("Error fetching reservations:", err));
  }, []);

  return (
    <div className="admin-dashboard">
      <nav className="admin-nav">
        <ul>
          <li>
            <Link to="/admin/properties">Properties Management</Link>
          </li>
          <li>
            <Link to="/admin/agents">Agents Management</Link>
          </li>
        </ul>
      </nav>
      <div className="admin-content">
        <h1>Welcome to the Admin Dashboard</h1>
        <p>Select an option to manage data.</p>

        {/* Bookings Table */}
        <h2>Bookings</h2>
        <table className="data-table">
          <thead>
            <tr>
              <th>Property Name</th>
              <th>Check-In Date</th>
              <th>Check-Out Date</th>
              <th>Total Price</th>
              <th>User Name</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking, index) => (
              <tr key={index}>
                <td>{booking.name}</td>
                <td>{new Date(booking.checkInDate).toLocaleDateString()}</td>
                <td>{new Date(booking.checkOutDate).toLocaleDateString()}</td>
                <td>${booking.totalPrice}</td>
                <td>{booking.userName}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Reservations Table */}
        <h2>Reservations</h2>
        <table className="data-table">
          <thead>
            <tr>
              <th>Property Name</th>
              <th>Reservation Date</th>
              <th>Agent Name</th>
              <th>User Name</th>
            </tr>
          </thead>
          <tbody>
            {reservations.map((reservation, index) => (
              <tr key={index}>
                <td>{reservation.name}</td>
                <td>
                  {new Date(reservation.reservationDate).toLocaleDateString()}
                </td>
                <td>{reservation.agentName}</td>
                <td>{reservation.userName}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard;
