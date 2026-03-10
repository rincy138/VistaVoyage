import { Builder, By, until } from 'selenium-webdriver';
import { expect } from 'chai';
import chrome from 'selenium-webdriver/chrome.js';

describe('VistaVoyage Booking Flow', function () {
    this.timeout(90000);
    let driver;

    before(async function () {
        let options = new chrome.Options();
        options.addArguments('--window-size=1920,1080');
        // options.addArguments('--headless');
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

    it('should complete a package booking with payment', async function () {
        await loginHelper('tester@example.com', 'Password123').catch(() => {
            console.log("Login failed, continuing anyway as it might be logged in.");
        });

        // 1. Navigate to Packages
        await driver.get('http://localhost:5173/packages');
        await driver.wait(until.elementLocated(By.css('body')), 15000);

        // Wait for results container or a no-packages message
        await driver.wait(async (d) => {
            const results = await d.findElements(By.className('results-container'));
            const noPackages = await d.findElements(By.className('no-packages'));
            return (results.length > 0 || noPackages.length > 0);
        }, 30000, 'Packages page did not load any results or empty state message');

        await driver.sleep(2000);

        // 2. Select first package
        const cards = await driver.findElements(By.className('minimal-card'));
        if (cards.length === 0) {
            throw new Error("No packages found to test booking.");
        }
        await driver.executeScript("arguments[0].scrollIntoView();", cards[0]);
        await driver.executeScript("arguments[0].click();", cards[0]);

        // 3. Wait for Details Page
        await driver.wait(until.urlContains('/packages/'), 20000);
        await driver.wait(until.elementLocated(By.className('booking-card')), 20000);

        // 4. Fill Booking Form
        // Date Selection - Ensure we find an enabled date (today+3 mo range)
        const dateTrigger = await driver.findElement(By.className('sd-trigger'));
        await driver.executeScript("arguments[0].scrollIntoView();", dateTrigger);
        await driver.executeScript("arguments[0].click();", dateTrigger);
        await driver.sleep(1000);

        // Seek a month with enabled days if current one is all disabled (e.g. past months)
        let dayBtns = await driver.findElements(By.css('.sd-day:not([disabled]):not(.empty)'));
        let attempts = 0;
        while (dayBtns.length === 0 && attempts < 3) {
            const nextBtn = await driver.findElement(By.className('sd-nav-btn')).then(async () => {
                const btns = await driver.findElements(By.css('.sd-nav-btn'));
                return btns.length > 1 ? btns[1] : btns[0]; // Second one is typically 'Next'
            });
            await driver.executeScript("arguments[0].click();", nextBtn);
            await driver.sleep(800);
            dayBtns = await driver.findElements(By.css('.sd-day:not([disabled]):not(.empty)'));
            attempts++;
        }

        if (dayBtns.length > 0) {
            await driver.executeScript("arguments[0].click();", dayBtns[0]);
        } else {
            // Fallback: just close it if somehow nothing is enabled, to proceed with default
            await driver.executeScript("arguments[0].click();", dateTrigger);
        }
        await driver.sleep(1000);

        // Guest count should be 1 by default (Adults)

        // Fill Passenger Details
        const nameInput = await driver.wait(until.elementLocated(By.css('input[placeholder="Full Name"]')), 15000);
        await nameInput.clear();
        await nameInput.sendKeys('John Doe');

        const ageInput = await driver.findElement(By.css('input[placeholder="Age"]'));
        await ageInput.clear();
        await ageInput.sendKeys('30');

        const idNumber = await driver.findElement(By.css('input[placeholder="ID Number"]'));
        await idNumber.clear();
        await idNumber.sendKeys('123456789012');

        const phoneInput = await driver.findElement(By.css('input[placeholder="Phone Number"]'));
        await phoneInput.clear();
        await phoneInput.sendKeys('9876543210');

        const addressInput = await driver.findElement(By.tagName('textarea'));
        await addressInput.clear();
        await addressInput.sendKeys('123 Test Street, New York');

        // 5. Submit Booking
        const bookBtn = await driver.findElement(By.className('btn-book-large'));
        await driver.executeScript("arguments[0].scrollIntoView();", bookBtn);
        await driver.executeScript("arguments[0].click();", bookBtn);

        // 6. Handle Payment Modal - Using specific class now
        try {
            const payOverlay = await driver.wait(until.elementLocated(By.className('payment-modal-overlay')), 20000);
            const upiInput = await driver.wait(until.elementLocated(By.css('input[placeholder*="bank"]')), 15000);
            await upiInput.sendKeys('test@upi');

            const verifyBtn = await driver.findElement(By.xpath("//button[contains(text(), 'Verify')]"));
            await driver.executeScript("arguments[0].click();", verifyBtn);

            // Wait for 'Verified' text on button
            await driver.wait(until.elementTextContains(verifyBtn, 'Verified'), 15000);

            const payBtn = await driver.findElement(By.xpath("//button[contains(text(), 'Pay')]"));
            await driver.executeScript("arguments[0].click();", payBtn);

            // 7. Success & Redirection
            await driver.wait(until.urlContains('/my-bookings'), 30000);

            // Verify booking exists in history
            const bookingHistory = await driver.wait(until.elementLocated(By.className('bookings-list')), 20000);
            expect(await bookingHistory.getText()).to.contain('John Doe');
        } catch (err) {
            // Check if there was a validation error visible on page instead
            const errorMsg = await driver.findElements(By.className('error'));
            if (errorMsg.length > 0) {
                const text = await errorMsg[0].getText();
                throw new Error("Form validation failed: " + text);
            }
            throw err;
        }
    });
});
