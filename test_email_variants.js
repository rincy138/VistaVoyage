import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const testConfig = (config, name) => {
    console.log(`--- Testing Config: ${name} ---`);
    const transporter = nodemailer.createTransport(config);

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_USER,
        subject: `VistaVoyage Test - ${name}`,
        text: `Testing configuration: ${name}`
    };

    return transporter.sendMail(mailOptions);
};

(async () => {
    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASS.replace(/\s+/g, '');

    const configs = [
        {
            name: 'Gmail Service',
            config: { service: 'gmail', auth: { user, pass } }
        },
        {
            name: 'SMTP 465 Secure',
            config: { host: 'smtp.gmail.com', port: 465, secure: true, auth: { user, pass } }
        },
        {
            name: 'SMTP 587 TLS',
            config: { host: 'smtp.gmail.com', port: 587, secure: false, auth: { user, pass } }
        }
    ];

    for (const item of configs) {
        try {
            const res = await testConfig(item.config, item.name);
            console.log(`✅ ${item.name} SUCCESS:`, res.response);
            break; // Stop if one works
        } catch (err) {
            console.error(`❌ ${item.name} FAILED:`, err.message);
        }
    }
})();
