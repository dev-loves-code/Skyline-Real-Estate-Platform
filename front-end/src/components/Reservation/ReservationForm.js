import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import moment from 'moment';

import './ReservationForm.css';

const ReservationForm = () => {
  const { propertyId } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    reservationDate: null,
  });
  const [isAvailable, setIsAvailable] = useState(null);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    setUser(storedUser);
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDateChange = (date) => {
    setFormData({ ...formData, reservationDate: date });
  };

  const checkAvailability = async () => {
    if (!formData.reservationDate) {
      setError('Please select a reservation date.');
      return;
    }
  
  
    const formattedDate = moment(formData.reservationDate).format('YYYY-MM-DD');
    const apiUrl = `http://localhost:5000/reservations/availability/${propertyId}/${formattedDate}`;
  
    try {
      const response = await fetch(apiUrl);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server error: ${response.statusText}`);
      }
  
      const data = await response.json();
      setIsAvailable(data.available);
    } catch (err) {
      setError('Error checking availability. Please try again.');
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!user) {
      setError('Please sign in to make a reservation.');
      return;
    }
  
    
    const formattedDate = moment(formData.reservationDate).format('YYYY-MM-DD');
  
    if (isAvailable === false) {
      setError('The selected date is unavailable.');
      return;
    }
  
    try {
      const response = await fetch('http://localhost:5000/reservations/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          reservationDate: formattedDate,
          userId: user.id,
          propertyId,
        }),
      });
  
      const data = await response.json();
      if (response.ok) {
        alert('Reservation submitted successfully!');
        navigate('/');
      } else {
        
        console.error('Reservation Error:', data);
        setError(data.message || 'An unexpected error occurred');
      }
    } catch (error) {
      console.error('Submission Error:', error);
      setError('Error submitting reservation.');
    }
  };
  

  if (!user) {
    return (
      <div className="not-signed-in">
        <p>You need to sign in to make a reservation.</p>
        <button onClick={() => navigate('/auth')}>Sign In</button>
      </div>
    );
  }

  return (
    <div className="reservation-form-container">
      <h2>Make a Reservation</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>First Name</label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Last Name</label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Phone Number</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Reservation Date</label>
          <DatePicker
            selected={formData.reservationDate}
            onChange={handleDateChange}
            dateFormat="yyyy-MM-dd"
            minDate={new Date()}
            required
          />
          <button type="button" onClick={checkAvailability}>
            Check Availability
          </button>
        </div>
        {isAvailable !== null && (
          <p>{isAvailable ? 'Date is available' : 'Date is not available'}</p>
        )}
        {error && <p className="error">{error}</p>}
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default ReservationForm;
