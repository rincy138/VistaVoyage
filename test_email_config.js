
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendTestEmail = async () => {
    console.log('Attempting to send email...');
    console.log('User:', process.env.EMAIL_USER ? 'Set' : 'Not Set');
    console.log('Pass:', process.env.EMAIL_PASS ? 'Set' : 'Not Set');

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.error('❌ EMAIL_USER or EMAIL_PASS environment variables are missing.');
        return;
    }

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_USER, // Send to self for testing
        subject: 'VistaVoyage Test Email',
        text: 'If you receive this, the email configuration is working correctly!'
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Email sent: ' + info.response);
    } catch (error) {
        console.error('❌ Error sending email:');
        console.error(error);
    }
};

sendTestEmail();
