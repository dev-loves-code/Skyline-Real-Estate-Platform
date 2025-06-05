const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'your-email',
    pass: 'the-pass'
  },
 
  logger: true,
  debug: true
});

async function sendReservationNotification(reservationDetails, agentDetails) {
  try {
    console.log('Preparing email with details:', {
      reservationDetails,
      agentDetails
    });

    const mailOptions = {
      from: 'email',
      to: agentDetails.email,
      subject: `New Reservation for Property ${reservationDetails.propertyId}`,
      text: `
        A new reservation has been made:

        Property ID: ${reservationDetails.propertyId}
        Reservation Date: ${reservationDetails.reservationDate}
        Guest Name: ${reservationDetails.firstName} ${reservationDetails.lastName}
        Phone Number: ${reservationDetails.phone}

        Please review and follow up as needed.
      `,
      html: `
        <h2>New Reservation Notification</h2>
        <p><strong>Property ID:</strong> ${reservationDetails.propertyId}</p>
        <p><strong>Reservation Date:</strong> ${reservationDetails.reservationDate}</p>
        <p><strong>Guest Name:</strong> ${reservationDetails.firstName} ${reservationDetails.lastName}</p>
        <p><strong>Phone Number:</strong> ${reservationDetails.phone}</p>
        <p>Please review and follow up as needed.</p>
      `
    };

    console.log('Mail Options Prepared. Attempting to send email...');
    console.log('Sending to:', agentDetails.email);


    const info = await transporter.sendMail(mailOptions);
    
    console.log('Full Email Send Response:', {
      response: info.response,
      messageId: info.messageId,
      accepted: info.accepted,
      rejected: info.rejected
    });

    return true;
  } catch (error) {
    console.error('Comprehensive Email Sending Error:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code
    });
    return false;
  }
}

module.exports = { sendReservationNotification };
