import { Builder, By, Key, until } from 'selenium-webdriver';
import { expect } from 'chai';
import chrome from 'selenium-webdriver/chrome.js';

describe('VistaVoyage Registration Page', function () {
    this.timeout(60000);
    let driver;

    before(async function () {
        let options = new chrome.Options();
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

    it('should load the registration page', async function () {
        await driver.get('http://localhost:5173/register');
        const titleText = await driver.findElement(By.className('auth-title')).getText();
        expect(titleText).to.equal('Create Account');
    });

    it('should show error for password mismatch', async function () {
        await driver.get('http://localhost:5173/register');

        await driver.findElement(By.name('name')).sendKeys('Test User');
        await driver.findElement(By.name('email')).sendKeys('test@example.com');
        await driver.findElement(By.name('password')).sendKeys('password123');
        await driver.findElement(By.name('confirmPassword')).sendKeys('password456');

        // Using XPath or tag search for button since it might have generic class
        // Use executeScript to click to avoid "ElementClickInterceptedError" if button is obscured
        const submitBtn = await driver.findElement(By.css('button[type="submit"]'));
        await driver.executeScript("arguments[0].scrollIntoView();", submitBtn);
        await driver.executeScript("arguments[0].click();", submitBtn);

        // Wait for error message
        const errorMsg = await driver.wait(
            until.elementLocated(By.className('error-message')),
            5000
        );

        const text = await errorMsg.getText();
        expect(text).to.equal('Passwords do not match');
    });
});
