const express = require('express');
const router = express.Router();
const pool = require('../utils/database');
const moment = require('moment');

router.get('/unavailable-dates/:propertyId', async (req, res) => {
  const { propertyId } = req.params;
  try {
    const [bookings] = await pool.execute(
      `SELECT checkInDate, checkOutDate FROM Bookings WHERE propertyId = ?`,
      [propertyId]
    );

    const unavailableDates = [];
    bookings.forEach((booking) => {
      const start = moment(booking.checkInDate);
      const end = moment(booking.checkOutDate);
      while (start.isBefore(end)) {
        unavailableDates.push(start.format('YYYY-MM-DD'));
        start.add(1, 'day');
      }
    });

    res.status(200).json({ unavailableDates });
  } catch (err) {
    console.error('Error fetching unavailable dates:', err);
    res.status(500).json({ message: 'Server error', errorDetails: err.message });
  }
});


router.post('/create', async (req, res) => {
  const { userId, propertyId, firstName, lastName, phone, checkInDate, checkOutDate, cardNumber } = req.body;


  if (!userId || !propertyId || !firstName || !lastName || !phone || !checkInDate || !checkOutDate || !cardNumber) {
    return res.status(400).json({ message: 'All fields are required' });
  }


  if (!/^\d{16}$/.test(cardNumber)) {
    return res.status(400).json({ message: 'Card number must be 16 digits' });
  }


  if (phone.length > 15) {
    return res.status(400).json({ message: 'Phone number is too long' });
  }

  try {

    const [userCheck] = await pool.execute(`SELECT id FROM users WHERE id = ?`, [userId]);
    const [propertyCheck] = await pool.execute(`SELECT id, price FROM properties WHERE id = ?`, [propertyId]);

    if (userCheck.length === 0 || propertyCheck.length === 0) {
      return res.status(400).json({ message: 'Invalid userId or propertyId' });
    }

    const property = propertyCheck[0];
    const nights = moment(checkOutDate).diff(moment(checkInDate), 'days');
    const totalPrice = nights * property.price;

    await pool.execute(
      `INSERT INTO Bookings (userId, propertyId, firstName, lastName, phone, checkInDate, checkOutDate, cardNumber, totalPrice)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, propertyId, firstName, lastName, phone, checkInDate, checkOutDate, cardNumber, totalPrice]
    );

    res.status(201).json({ message: 'Booking created successfully' });
  } catch (err) {
    console.error('Database Error:', err);
    res.status(500).json({ message: 'Server error', errorDetails: err.message });
  }
});

module.exports = router;
