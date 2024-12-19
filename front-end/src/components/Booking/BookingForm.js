import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import moment from 'moment';

import './BookingForm.css';

const BookingForm = () => {
  const { propertyId } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    checkInDate: null,
    checkOutDate: null,
    cardNumber: '',
  });
  const [propertyDetails, setPropertyDetails] = useState(null);
  const [unavailableDates, setUnavailableDates] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    setUser(storedUser);

    async function fetchPropertyDetails() {
      try {
        const response = await fetch(`http://localhost:5000/properties/${propertyId}`);
        const propertyData = await response.json();
        setPropertyDetails(propertyData);

        const unavailableResponse = await fetch(
          `http://localhost:5000/bookings/unavailable-dates/${propertyId}`
        );
        const unavailableData = await unavailableResponse.json();
        setUnavailableDates(unavailableData.unavailableDates || []);
      } catch (err) {
        setError('Error fetching property details or unavailable dates.');
      }
    }

    fetchPropertyDetails();
  }, [propertyId]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDateChange = (dates) => {
    const [start, end] = dates;
    setFormData({ ...formData, checkInDate: start, checkOutDate: end });

    if (start && end && propertyDetails) {
      const nights = moment(end).diff(moment(start), 'days');
      setTotalPrice(propertyDetails.price * nights);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      setError('Please sign in to proceed with booking.');
      return;
    }

    const requiredFields = ['checkInDate', 'checkOutDate', 'firstName', 'lastName', 'phone', 'cardNumber'];
    for (let field of requiredFields) {
      if (!formData[field]) {
        setError(`Please fill in the ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
        return;
      }
    }

    if (formData.cardNumber.length !== 16 || isNaN(formData.cardNumber)) {
      setError('Card number must be 16 digits.');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/bookings/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          userId: user.id,
          propertyId,
          checkInDate: moment(formData.checkInDate).format('YYYY-MM-DD'),
          checkOutDate: moment(formData.checkOutDate).format('YYYY-MM-DD'),
        }),
      });

      if (response.ok) {
        alert('Booking submitted successfully!');
        navigate('/');
      } else {
        const data = await response.json();
        setError(data.message);
      }
    } catch (err) {
      setError('Error submitting booking.');
    }
  };

  if (!user) {
    return (
      <div className="not-signed-in">
        <p>You need to sign in to book this property.</p>
        <button onClick={() => navigate('/auth')}>Sign In</button>
      </div>
    );
  }

  if (!propertyDetails) {
    return <p>Loading property details...</p>;
  }

  return (
    <div className="booking-form-container">
      <h2>Book Property: {propertyDetails.name}</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>First Name</label>
          <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} required />
        </div>
        <div className="form-group">
          <label>Last Name</label>
          <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} required />
        </div>
        <div className="form-group">
          <label>Phone Number</label>
          <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} required />
        </div>
        <div className="form-group">
          <label>Check-in and Check-out Dates</label>
          <DatePicker
            selected={formData.checkInDate}
            onChange={handleDateChange}
            startDate={formData.checkInDate}
            endDate={formData.checkOutDate}
            selectsRange
            inline
            excludeDates={unavailableDates.map((date) => new Date(date))}
            minDate={new Date()}
            required
          />
        </div>
        <div className="form-group">
          <label>Card Number</label>
          <input
            type="text"
            name="cardNumber"
            value={formData.cardNumber}
            onChange={handleInputChange}
            placeholder="16 digit card number"
            maxLength="16"
            required
          />
        </div>
        <p className="total-price">Total Price: ${totalPrice.toLocaleString()}</p>
        {error && <p className="error">{error}</p>}
        <button type="submit">Pay Now</button>
      </form>
    </div>
  );
};

export default BookingForm;
