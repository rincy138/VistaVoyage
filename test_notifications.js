/**
 * Test script for booking notifications
 * Run this to test email and WhatsApp notifications
 */

import { sendBookingNotifications } from './server/services/notificationService.js';

// Sample booking data
const testBookingData = {
    email: "rincyjoseph2028@mca.ajce.in", // Your email
    phone: "+919876543210", // Sample phone number
    fullName: "Test User",
    itemType: "Hotel",
    itemName: "Grand Palace Hotel",
    travelDate: "2026-02-15",
    totalAmount: 25000,
    adults: 2,
    children: 1,
    bookingId: 999,
    city: "Munnar",
    location: "Tea Garden Road"
};

console.log('🧪 Testing Booking Notifications...\n');
console.log('Test Data:', testBookingData);
console.log('\n---\n');

// Send notifications
sendBookingNotifications(testBookingData)
    .then(results => {
        console.log('\n✅ Test Complete!');
        console.log('Results:', JSON.stringify(results, null, 2));
    })
    .catch(error => {
        console.error('\n❌ Test Failed!');
        console.error('Error:', error);
    });
