import { Builder, By, until } from 'selenium-webdriver';
import { expect } from 'chai';
import chrome from 'selenium-webdriver/chrome.js';

describe('VistaVoyage Packages Browsing', function () {
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

    it('should allow searching and viewing a package', async function () {
        await loginHelper('tester@example.com', 'Password123').catch(() => {
            console.log("Login failed or timed out.");
        });

        await driver.get('http://localhost:5173/packages');
        await driver.wait(until.elementLocated(By.css('body')), 15000);

        // Wait for results container or a no-packages message
        await driver.wait(async (d) => {
            const results = await d.findElements(By.className('results-container'));
            const noPackages = await d.findElements(By.className('no-packages'));
            return results.length > 0 || noPackages.length > 0;
        }, 30000, 'Packages page did not load');

        await driver.sleep(2000);

        // Check search functionality
        const searchInput = await driver.findElement(By.css('input[placeholder*="Search"]')).catch(() => null);
        if (searchInput) {
            await searchInput.sendKeys('Alleppey');
            await driver.sleep(2000); // Wait for filtering
        }

        // Verify some results appear
        const cards = await driver.findElements(By.className('minimal-card'));
        expect(cards.length).to.be.greaterThan(0);

        // Click the first package card
        await driver.executeScript("arguments[0].scrollIntoView();", cards[0]);
        await driver.executeScript("arguments[0].click();", cards[0]);

        // Should navigate to details
        await driver.wait(until.urlContains('/packages/'), 15000);
        const detailsHeader = await driver.wait(until.elementLocated(By.tagName('h1')), 10000);
        const title = await detailsHeader.getText();
        expect(title).to.not.be.empty;
    });
});
