# Booking Notification System

## Overview
The VistaVoyage application now sends **email and WhatsApp confirmation messages** when users book packages, hotels, or taxis.

## Features

### ✅ Email Notifications
- **Sent to**: User's email address provided during booking
- **Content**: 
  - Beautiful HTML-formatted confirmation email
  - Booking ID and details
  - Item type (Package/Hotel/Taxi)
  - Travel date
  - Number of adults and children
  - Total amount paid
  - City and location information
  - Next steps and support information

### 📱 WhatsApp Notifications (Simulated)
- **Sent to**: User's phone number provided during booking
- **Content**:
  - Booking confirmation message
  - Key booking details
  - Booking ID for reference
- **Note**: Currently simulated (logged to console). For production, integrate with:
  - WhatsApp Business API
  - Twilio WhatsApp API
  - Other WhatsApp messaging services

## How It Works

### 1. User Makes a Booking
When a user books a package, hotel, or taxi, they provide:
- Full name
- Email address
- Phone number
- Other booking details

### 2. Booking is Created
The system:
1. Validates the booking
2. Creates the booking record in the database
3. Updates user statistics

### 3. Notifications are Sent
After successful booking:
- Email is sent via **Nodemailer** (using Gmail SMTP)
- WhatsApp message is prepared and logged (simulated)
- Both notifications run asynchronously (don't block the booking response)

## Technical Implementation

### Files Modified/Created

#### 1. `server/services/notificationService.js` (NEW)
- Contains email and WhatsApp notification functions
- Uses Nodemailer for email sending
- Exports `sendBookingNotifications()` function

#### 2. `server/routes/bookings.js` (MODIFIED)
- Now accepts additional fields: `fullName`, `email`, `phone`, `location`, `pickUpAddress`, `dropAddress`
- Fetches item names (package title, hotel name, taxi type)
- Calls notification service after successful booking

### Email Configuration
Email credentials are stored in `.env`:
```
EMAIL_USER=rincyjoseph2028@mca.ajce.in
EMAIL_PASS=cppm ttmo kqxh tsna
```

## Testing

### Test Email Notifications
1. Make a booking (Package/Hotel/Taxi)
2. Provide a valid email address
3. Check the email inbox for confirmation

### Check WhatsApp Logs
1. Make a booking with a phone number
2. Check the server console for WhatsApp message logs
3. Look for: `📱 WhatsApp Message (Simulated):`

## Console Output Examples

### Successful Email
```
✅ Email sent successfully to user@example.com
📧 Notification results: {
  email: { success: true, message: 'Email sent successfully' },
  whatsapp: { success: true, message: 'WhatsApp notification logged (simulated)' }
}
```

### Error Handling
```
❌ Error sending notifications: [error details]
```
Note: Booking still succeeds even if notifications fail

## Future Enhancements

### For Production WhatsApp Integration:

1. **Twilio WhatsApp API**:
```javascript
const twilio = require('twilio');
const client = twilio(accountSid, authToken);

await client.messages.create({
    from: 'whatsapp:+14155238886',
    to: `whatsapp:${phone}`,
    body: message
});
```

2. **WhatsApp Business API**:
- Register for WhatsApp Business API
- Get API credentials
- Implement webhook handlers
- Send template messages

3. **Other Services**:
- MessageBird
- Vonage (Nexmo)
- Infobip

## Notification Data Structure

```javascript
{
    email: "user@example.com",
    phone: "+919876543210",
    fullName: "John Doe",
    itemType: "Hotel",
    itemName: "Grand Palace Hotel",
    travelDate: "2026-02-15",
    totalAmount: 25000,
    adults: 2,
    children: 1,
    bookingId: 123,
    city: "Munnar",
    location: "Tea Garden Road"
}
```

## Important Notes

1. **No Changes to Other Features**: All existing functionality remains unchanged
2. **Async Notifications**: Notifications don't block the booking process
3. **Error Resilience**: Booking succeeds even if notifications fail
4. **Email Works**: Email notifications are fully functional
5. **WhatsApp Simulated**: WhatsApp messages are logged to console (not actually sent)

## Troubleshooting

### Email Not Received
- Check spam/junk folder
- Verify email address is correct
- Check server console for errors
- Verify `.env` email credentials

### Server Errors
- Check `server_error_log.txt` for detailed errors
- Verify all dependencies are installed
- Ensure `.env` file exists with correct values

## Dependencies

Already installed in `package.json`:
- `nodemailer`: ^7.0.11 (for email sending)
- `dotenv`: ^17.2.3 (for environment variables)
