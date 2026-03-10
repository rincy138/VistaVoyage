import 'dotenv/config';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

console.log('--- Email Connection Test ---');
console.log('User:', process.env.EMAIL_USER);
console.log('Pass:', process.env.EMAIL_PASS ? '********' : 'MISSING');

const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_USER, // Send to yourself
    subject: 'VistaVoyage Test Email',
    text: 'If you see this, your email configuration is correct!'
};

transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
        console.error('\n❌ ERROR SENDING EMAIL:');
        console.error(error.message);
        if (error.message.includes('Invalid login')) {
            console.log('\nTIP: Use a fresh Google App Password (16 characters).');
        }
    } else {
        console.log('\n✅ SUCCESS!');
        console.log('Message ID:', info.messageId);
        console.log('Check your inbox (and spam folder) for rincyjoseph2028@mca.ajce.in');
    }
});
