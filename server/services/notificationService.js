import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create email transporter
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // Use SSL
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS ? process.env.EMAIL_PASS.replace(/\s+/g, '') : ''
    },
    tls: {
        rejectUnauthorized: false
    }
});

/**
 * Send booking confirmation email
 */
export const sendBookingConfirmationEmail = async (bookingData) => {
    const {
        email,
        fullName,
        itemType,
        itemName,
        travelDate,
        totalAmount,
        adults,
        children,
        bookingId,
        city,
        location
    } = bookingData;

    // Get frontend URL from environment or use default
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    const mailOptions = {
        from: `"VistaVoyage" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: `Booking Confirmation - ${itemType} at VistaVoyage`,
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .booking-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
                    .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
                    .detail-label { font-weight: bold; color: #667eea; }
                    .total { font-size: 1.2em; font-weight: bold; color: #667eea; }
                    .footer { text-align: center; padding: 20px; color: #666; font-size: 0.9em; }
                    .success-icon { font-size: 48px; text-align: center; margin: 20px 0; }
                    .btn-invoice { 
                        display: inline-block; 
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        color: white !important; 
                        padding: 15px 30px; 
                        text-decoration: none; 
                        border-radius: 8px; 
                        font-weight: bold; 
                        margin: 20px 0;
                        text-align: center;
                        font-size: 16px;
                    }
                    .invoice-section { 
                        text-align: center; 
                        margin: 30px 0; 
                        padding: 25px; 
                        background: white; 
                        border-radius: 8px;
                        border: 2px dashed #667eea;
                    }
                    .instructions { 
                        background: #fff3cd; 
                        border-left: 4px solid #ffc107; 
                        padding: 15px; 
                        margin: 20px 0; 
                        border-radius: 4px;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🎉 Booking Confirmed!</h1>
                        <p>Thank you for choosing VistaVoyage</p>
                    </div>
                    <div class="content">
                        <div class="success-icon">✅</div>
                        <h2>Hello ${fullName},</h2>
                        <p>Your booking has been successfully confirmed! Here are your booking details:</p>
                        
                        <div class="booking-details">
                            <h3>Booking Information</h3>
                            <div class="detail-row">
                                <span class="detail-label">Booking ID:</span>
                                <span>#${bookingId}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Type:</span>
                                <span>${itemType}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">${itemType} Name:</span>
                                <span>${itemName}</span>
                            </div>
                            ${city ? `
                            <div class="detail-row">
                                <span class="detail-label">City:</span>
                                <span>${city}</span>
                            </div>
                            ` : ''}
                            ${location ? `
                            <div class="detail-row">
                                <span class="detail-label">Location:</span>
                                <span>${location}</span>
                            </div>
                            ` : ''}
                            <div class="detail-row">
                                <span class="detail-label">Travel Date:</span>
                                <span>${new Date(travelDate).toLocaleDateString('en-IN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })}</span>
                            </div>
                            ${adults ? `
                            <div class="detail-row">
                                <span class="detail-label">Adults:</span>
                                <span>${adults}</span>
                            </div>
                            ` : ''}
                            ${children > 0 ? `
                            <div class="detail-row">
                                <span class="detail-label">Children:</span>
                                <span>${children}</span>
                            </div>
                            ` : ''}
                            <div class="detail-row total">
                                <span class="detail-label">Total Amount:</span>
                                <span>₹${totalAmount.toLocaleString('en-IN')}</span>
                            </div>
                        </div>

                        <div class="invoice-section">
                            <h3 style="color: #667eea; margin-bottom: 15px;">📄 Download Your Invoice</h3>
                            <p style="margin-bottom: 20px;">Access your booking invoice anytime</p>
                            <a href="${frontendUrl}/my-bookings" class="btn-invoice">
                                📥 Download Details
                            </a>
                            <div class="instructions">
                                <strong>📌 How to Download Invoice:</strong>
                                <ol style="text-align: left; margin: 10px 0 0 20px; padding: 0;">
                                    <li>Click the button above to go to My Bookings page</li>
                                    <li>Find your booking (ID: #${bookingId})</li>
                                    <li>Click "Download Invoice" button on your booking card</li>
                                </ol>
                            </div>
                        </div>

                        <p><strong>What's Next?</strong></p>
                        <ul>
                            <li>You will receive a detailed itinerary shortly</li>
                            <li>Our team will contact you 24 hours before your travel date</li>
                            <li>Keep your booking ID (#${bookingId}) handy for reference</li>
                        </ul>

                        <p>If you have any questions, feel free to contact our support team.</p>
                    </div>
                    <div class="footer">
                        <p>© 2026 VistaVoyage. All rights reserved.</p>
                        <p>This is an automated email. Please do not reply to this message.</p>
                    </div>
                </div>
            </body>
            </html>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`✅ Email sent successfully to ${email}`);
        return { success: true, message: 'Email sent successfully' };
    } catch (error) {
        console.error('❌ Error sending email:', error);
        return { success: false, message: error.message };
    }
};

/**
 * Send booking cancellation email
 */
export const sendCancellationEmail = async (bookingData) => {
    const {
        email,
        fullName,
        itemType,
        itemName,
        bookingId
    } = bookingData;

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    const mailOptions = {
        from: `"VistaVoyage" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: `Booking Cancellation Confirmed - #${bookingId}`,
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: #ef4444; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .booking-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #ddd; }
                    .footer { text-align: center; padding: 20px; color: #666; font-size: 0.9em; }
                    .btn-home { 
                        display: inline-block; 
                        background: #ef4444;
                        color: white !important; 
                        padding: 12px 25px; 
                        text-decoration: none; 
                        border-radius: 6px; 
                        font-weight: bold; 
                        margin-top: 20px;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Booking Cancelled</h1>
                    </div>
                    <div class="content">
                        <h2>Hello ${fullName},</h2>
                        <p>This email is to confirm that your booking has been <strong>successfully cancelled</strong> as per your request.</p>
                        
                        <div class="booking-details">
                            <h3>Cancelled Booking Details</h3>
                            <p><strong>Booking ID:</strong> #${bookingId}</p>
                            <p><strong>Type:</strong> ${itemType}</p>
                            <p><strong>Item:</strong> ${itemName}</p>
                        </div>

                        <p><strong>Refund Information:</strong></p>
                        <p>If you have already paid for this booking, you can initiate a refund request from your "My Loans" page under the "Cancelled & Refunds" tab.</p>

                        <div style="text-align: center;">
                            <a href="${frontendUrl}/my-bookings" class="btn-home">Go to My Bookings</a>
                        </div>
                    </div>
                    <div class="footer">
                        <p>© 2026 VistaVoyage. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`✅ Cancellation email sent successfully to ${email}`);
        return { success: true, message: 'Email sent successfully' };
    } catch (error) {
        console.error('❌ Error sending cancellation email:', error);
        return { success: false, message: error.message };
    }
};

/**
 * Send group trip invite email
 */
export const sendGroupInviteEmail = async (inviteData) => {
    const { email, senderName, destination, tripName, inviteCode } = inviteData;
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const joinUrl = `${frontendUrl}/group-trips?join=${inviteCode}`;

    const mailOptions = {
        from: `"VistaVoyage" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: `You're invited to a trip: ${tripName}!`,
        html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
                <div style="background: #2dd4bf; padding: 30px; text-align: center; color: #0f172a;">
                    <h1 style="margin: 0;">VistaVoyage</h1>
                    <p style="margin: 5px 0 0 0;">Adventure Awaits!</p>
                </div>
                <div style="padding: 30px; background: #ffffff; color: #1e293b;">
                    <h2>Hello!</h2>
                    <p><strong>${senderName}</strong> has invited you to join a group trip to <strong>${destination}</strong>!</p>
                    
                    <div style="background: #f1f5f9; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
                        <p style="margin: 0 0 10px 0; color: #64748b; font-size: 0.9rem;">USE INVITE CODE</p>
                        <h3 style="margin: 0; font-size: 2rem; letter-spacing: 5px; color: #0d9488;">${inviteCode}</h3>
                    </div>

                    <p>Click the button below to join the trip and start planning together!</p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${joinUrl}" style="background: #0d9488; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Join the Trip</a>
                    </div>

                    <p style="font-size: 0.9rem; color: #64748b;">Or copy this link: <br/> ${joinUrl}</p>
                </div>
                <div style="padding: 20px; text-align: center; background: #f8fafc; font-size: 0.8rem; color: #94a3b8; border-top: 1px solid #e2e8f0;">
                    © 2026 VistaVoyage. All rights reserved.
                </div>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        return { success: true };
    } catch (error) {
        console.error('Invite Email Error:', error);
        return { success: false, message: error.message };
    }
};

/**
 * Send booking notifications (email only)
 */
export const sendBookingNotifications = async (bookingData) => {
    const results = {
        email: null
    };

    // Send email
    if (bookingData.email) {
        results.email = await sendBookingConfirmationEmail(bookingData);
    }

    return results;
};
