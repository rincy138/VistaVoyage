import { Builder, By, until } from 'selenium-webdriver';
import { expect } from 'chai';
import chrome from 'selenium-webdriver/chrome.js';

describe('VistaVoyage User Profile Management', function () {
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
        await driver.wait(until.urlIs('http://localhost:5173/'), 15000);
    };

    it('should allow updating user profile and emergency contact', async function () {
        await loginHelper('tester@example.com', 'Password123').catch(() => {
            console.log("Login failed or timed out.");
        });

        // 1. Go to Profile
        await driver.get('http://localhost:5173/profile');
        await driver.wait(until.elementLocated(By.className('profile-page')), 30000); // 30s timeout

        // 2. Open Edit Modal (using the edit-avatar or edit button)
        const editBtn = await driver.wait(until.elementLocated(By.className('edit-avatar')), 10000);
        await driver.executeScript("arguments[0].click();", editBtn);

        // 3. Fill Edit Form
        const phoneInput = await driver.wait(until.elementLocated(By.css('input[placeholder="Enter phone number"]')), 10000);
        await phoneInput.clear();
        await phoneInput.sendKeys('9998887776');

        const emergencyName = await driver.findElement(By.css('input[placeholder="e.g. Spouse, Parent, Friend"]'));
        await emergencyName.clear();
        await emergencyName.sendKeys('Jane Doe');

        const emergencyPhone = await driver.findElement(By.css('input[placeholder="Emergency Phone Number"]'));
        await emergencyPhone.clear();
        await emergencyPhone.sendKeys('1112223334');

        // 4. Save Changes
        const saveBtn = await driver.findElement(By.xpath("//button[contains(text(), 'Save Changes')]"));
        await driver.executeScript("arguments[0].click();", saveBtn);

        // 5. Verify updates
        await driver.wait(until.stalenessOf(saveBtn), 10000); // Modal should close

        const pageText = await driver.findElement(By.tagName('body')).getText();
        expect(pageText).to.contain('9998887776');
    });
});
