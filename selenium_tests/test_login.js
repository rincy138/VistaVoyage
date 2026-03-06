import { Builder, By, Key, until } from 'selenium-webdriver';
import { expect } from 'chai';
import chrome from 'selenium-webdriver/chrome.js';

describe('VistaVoyage Login Page', function () {
    this.timeout(30000);
    let driver;

    before(async function () {
        let options = new chrome.Options();
        // options.addArguments('--headless'); // Uncomment for headless mode
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

    it('should load the login page and check the title', async function () {
        await driver.get('http://localhost:5173/login');

        const titleText = await driver.findElement(By.className('auth-title')).getText();
        expect(titleText).to.equal('Signin to VistaVoyage');
    });

    it('should show error for invalid login', async function () {
        await driver.get('http://localhost:5173/login');

        const emailInput = await driver.findElement(By.name('email'));
        const passwordInput = await driver.findElement(By.name('password'));
        const loginBtn = await driver.findElement(By.className('login-btn'));

        await emailInput.sendKeys('invalid@example.com');
        await passwordInput.sendKeys('wrongpassword');
        await loginBtn.click();

        // Wait for error message
        const errorMsg = await driver.wait(
            until.elementLocated(By.className('error-message')),
            10000
        );

        const text = await errorMsg.getText();
        expect(text).to.not.be.empty;
    });
});
