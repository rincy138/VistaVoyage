import { Builder, By, until } from 'selenium-webdriver';
import { expect } from 'chai';
import chrome from 'selenium-webdriver/chrome.js';

describe('VistaVoyage Taxi Booking Flow', function () {
    this.timeout(90000);
    let driver;

    before(async function () {
        let options = new chrome.Options();
        options.addArguments('--window-size=1920,1080');
        options.addArguments('--headless');
        driver = await new Builder()
            .forBrowser('chrome')
            .setChromeOptions(options)
            .build();
    });

    after(async function () {
        if (driver) {
            await driver.quit();
        }
    });

    const loginHelper = async (email, password) => {
        await driver.get('http://localhost:5173/login');
        await driver.wait(until.elementLocated(By.name('email')), 15000);
        await driver.findElement(By.name('email')).sendKeys(email);
        await driver.findElement(By.name('password')).sendKeys(password);
        const loginBtn = await driver.findElement(By.className('login-btn'));
        await driver.executeScript("arguments[0].click();", loginBtn);
        await driver.wait(until.urlIs('http://localhost:5173/'), 15000);
    };

    it('should complete a taxi booking with payment', async function () {
        await loginHelper('tester@example.com', 'Password123').catch(() => {
            console.log("Login failed, continuing anyway as it might be logged in.");
        });

        // 1. Navigate to Taxis
        console.log("Navigating to /taxis...");
        await driver.get('http://localhost:5173/taxis');
        await driver.wait(until.elementLocated(By.className('taxis-places-grid')), 20000);
        console.log("Found cities grid.");

        // 2. Select first city (place-card)
        const places = await driver.findElements(By.className('place-card'));
        if (places.length === 0) {
            throw new Error("No taxi cities found to test booking.");
        }
        console.log(`Found ${places.length} cities. Selecting first one...`);
        await driver.executeScript("arguments[0].scrollIntoView();", places[0]);
        await driver.executeScript("arguments[0].click();", places[0]);

        // 3. Wait for Taxi Grid to appear
        console.log("Waiting for taxis grid...");
        await driver.wait(until.elementLocated(By.className('taxis-grid')), 20000);
        await driver.sleep(1000);
        console.log("Taxis grid visible.");

        // 4. Select first taxi and click "Book This Ride"
        const taxiCards = await driver.findElements(By.className('taxi-card'));
        if (taxiCards.length === 0) {
            throw new Error("No taxis found in the selected city.");
        }
        console.log(`Found ${taxiCards.length} taxis. Clicking Book...`);
        const bookRideBtn = await taxiCards[0].findElement(By.xpath(".//button[contains(text(), 'Book This Ride')]"));
        await driver.executeScript("arguments[0].scrollIntoView();", bookRideBtn);
        await driver.executeScript("arguments[0].click();", bookRideBtn);

        // 5. Wait for Booking Modal
        console.log("Waiting for booking modal...");
        await driver.wait(until.elementLocated(By.className('booking-modal')), 15000);
        console.log("Booking modal open.");

        // 6. Fill Booking Form
        const inputs = {
            'Enter full name': `John Taxi Doe ${Date.now()}`,
            'Your phone': '9876543211',
            'Your email': 'taxi@example.com',
            'Hotel name or street address': 'Hotel Plaza, NYC',
            'Where are you going?': 'JFK Airport, NY',
            'ID Number': '123456789012',
        };

        for (const [placeholder, value] of Object.entries(inputs)) {
            const input = await driver.findElement(By.css(`input[placeholder="${placeholder}"]`));
            await input.clear();
            await input.sendKeys(value);
        }

        const addressTextarea = await driver.findElement(By.css('textarea[placeholder="Enter your full home address"]'));
        await addressTextarea.clear();
        await addressTextarea.sendKeys('456 Taxi Lane, Green City');

        // Set Date (default is tomorrow)
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const dateString = tomorrow.toISOString().split('T')[0];
        const dateInput = await driver.findElement(By.css('input[type="date"]'));
        await dateInput.sendKeys(dateString);
        console.log("Filled booking form.");

        // 7. Click Confirm Pickup
        const confirmBtn = await driver.findElement(By.xpath("//button[contains(text(), 'Confirm Pickup')]"));
        await driver.executeScript("arguments[0].scrollIntoView();", confirmBtn);
        await driver.executeScript("arguments[0].click();", confirmBtn);
        console.log("Clicked Confirm Pickup.");

        // 8. Handle Payment Modal
        try {
            console.log("Waiting for payment modal...");
            await driver.wait(until.elementLocated(By.className('payment-modal-overlay')), 30000);
            console.log("Payment modal visible.");
            const upiInput = await driver.wait(until.elementLocated(By.css('input[placeholder*="bank"]')), 15000);
            await upiInput.sendKeys('taxi@upi');

            const verifyBtn = await driver.findElement(By.xpath("//button[contains(text(), 'Verify')]"));
            console.log("Clicking Verify...");
            await driver.executeScript("arguments[0].click();", verifyBtn);

            // Wait for 'Verified' text on button
            await driver.wait(until.elementTextContains(verifyBtn, 'Verified'), 15000);
            console.log("Verified successfully.");

            const payBtn = await driver.findElement(By.xpath("//button[contains(text(), 'Pay')]"));
            console.log("Clicking Pay...");
            await driver.executeScript("arguments[0].click();", payBtn);

            // 9. Check for confirmation screen or redirection
            console.log("Waiting for confirmation screen...");
            await driver.wait(until.elementLocated(By.className('confirmation-screen')), 30000);
            const confirmationText = await driver.findElement(By.className('confirmation-screen')).getText();
            console.log("Confirmation text:", confirmationText);
            expect(confirmationText).to.contain('Ride Confirmed');
            console.log("Confirmed!");

            // 10. Check My Bookings (Taxis.jsx has a timeout before it resets, but let's navigate manually or wait)
            await driver.sleep(3000);
            console.log("Navigating to /my-bookings...");
            await driver.get('http://localhost:5173/my-bookings');
            await driver.wait(until.elementLocated(By.className('bookings-list')), 20000);
            const bookingHistory = await driver.findElement(By.className('bookings-list')).getText();
            expect(bookingHistory).to.contain('Taxi');
            console.log("Found in booking history.");

        } catch (err) {
            console.error("Test failed during payment or verification:", err);
            throw err;
        }
    });
});
