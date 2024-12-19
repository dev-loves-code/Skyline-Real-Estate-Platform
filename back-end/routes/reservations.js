const express = require('express');
const router = express.Router();
const pool = require('../utils/database');
const moment = require('moment'); 
const { sendReservationNotification } = require('../utils/emailService');

router.post('/create', async (req, res) => {
  console.log('Reservation Creation Request received:', req.body);

  const { userId, propertyId, firstName, lastName, phone, reservationDate } = req.body;

  if (!userId || !propertyId || !firstName || !lastName || !phone || !reservationDate) {
    console.log('Validation Failed: Missing required fields');
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const formattedDate = moment(reservationDate).format('YYYY-MM-DD');
    console.log(`Formatted Date: ${formattedDate}`);

  
    console.log(`Fetching agent for Property ID: ${propertyId}`);
    const [agentResult] = await pool.execute(
      `SELECT a.agentId, a.name, a.email 
       FROM Properties p
       JOIN Agents a ON p.agentId = a.agentId
       WHERE p.id = ?`,
      [propertyId]
    );

    if (agentResult.length === 0) {
      console.log(`No agent found for Property ID: ${propertyId}`);
      return res.status(404).json({ message: 'No agent found for this property' });
    }

    const agent = agentResult[0];
    console.log('Agent Details:', agent);

    console.log('Attempting to insert reservation');
    await pool.execute(
      `INSERT INTO Reservations (userId, propertyId, firstName, lastName, phone, reservationDate)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, propertyId, firstName, lastName, phone, formattedDate]
    );
    console.log('Reservation inserted successfully');

    console.log('Attempting to send email notification');
    const emailSent = await sendReservationNotification({
      propertyId,
      firstName,
      lastName,
      phone,
      reservationDate: formattedDate
    }, agent);

    res.status(201).json({ 
      message: 'Reservation created successfully', 
      emailNotification: emailSent ? 'Sent' : 'Failed' 
    });

  } catch (error) {
    console.error('Comprehensive Reservation Creation Error:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    res.status(500).json({ 
      message: 'Server error', 
      errorDetails: error.message 
    });
  }
});



router.get('/availability/:propertyId/:date', async (req, res) => {
  const { propertyId, date } = req.params;

  console.log('Checking availability:', { propertyId, date });

  if (!propertyId || !date) {
    return res.status(400).json({ message: 'Property ID and date are required' });
  }

  try {
    const [reservations] = await pool.execute(
      `SELECT * FROM Reservations WHERE propertyId = ? AND reservationDate = ?`,
      [propertyId, date]
    );

    if (reservations.length > 0) {
    
      return res.status(200).json({ message: 'Date is already booked', available: false });
    }

    res.status(200).json({ message: 'Date is available', available: true });
  } catch (error) {
    console.error('Error checking availability:', error);
    res.status(500).json({ message: 'Server error', errorDetails: error.message });
  }
});

module.exports = router;
