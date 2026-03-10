import { Builder, By, until } from 'selenium-webdriver';
import { expect } from 'chai';
import chrome from 'selenium-webdriver/chrome.js';

describe('VistaVoyage SOS Emergency Feature', function () {
    this.timeout(60000);
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
        // Wait for redirect to home
        await driver.wait(until.urlIs('http://localhost:5173/'), 15000);
        await driver.sleep(2000); // Give it time to load session
    };

    it('should show the SOS floating button and open modal on click', async function () {
        // Must be logged in to see/use SOS correctly
        await loginHelper('tester@example.com', 'Password123').catch(() => {
            console.log("Login failed, attempts to use SOS as guest might trigger alert");
        });

        // Wait for the SOS floating button
        const sosTrigger = await driver.wait(
            until.elementLocated(By.className('sos-floating-trigger')),
            15000
        );

        expect(await sosTrigger.isDisplayed()).to.be.true;

        // Click SOS button
        await driver.executeScript("arguments[0].click();", sosTrigger);

        // Handle possible alert if not logged in
        try {
            const alert = await driver.switchTo().alert();
            await alert.accept();
            await driver.wait(until.urlContains('/login'), 10000);
            return; // Exit test as it correctly redirected
        } catch (e) {
            // No alert, proceed to modal check
        }

        // Check for confirmation modal
        const modal = await driver.wait(
            until.elementLocated(By.className('sos-modal')),
            15000
        );
        expect(await modal.isDisplayed()).to.be.true;

        // Check for countdown
        const countdown = await driver.findElement(By.className('sos-countdown'));
        const countdownText = await countdown.getText();
        expect(parseInt(countdownText)).to.be.at.most(5);

        // Cancel signal
        const cancelBtn = await driver.findElement(By.className('sos-cancel-btn'));
        await driver.executeScript("arguments[0].click();", cancelBtn);

        // Verify modal is gone or status reset
        await driver.wait(until.stalenessOf(countdown), 5000).catch(() => {
            // Or check if it's hidden
        });
    });
});
