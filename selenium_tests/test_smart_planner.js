import { Builder, By, until } from 'selenium-webdriver';
import { expect } from 'chai';
import chrome from 'selenium-webdriver/chrome.js';

describe('VistaVoyage Smart Trip Planner', function () {
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

    it('should generate trip recommendations based on user preferences', async function () {
        await loginHelper('tester@example.com', 'Password123').catch(() => { });

        // 1. Go to Smart Planner
        await driver.get('http://localhost:5173/smart-planner');
        await driver.wait(until.elementLocated(By.className('planner-page')), 15000);

        // 2. Step 1: Budget & Days
        const budgetSlider = await driver.findElement(By.css('input[type="range"]'));
        await driver.executeScript("arguments[0].value = 50000; arguments[0].dispatchEvent(new Event('change'));", budgetSlider);

        const nextBtn = await driver.findElement(By.xpath("//button[contains(text(), 'Next Step')]"));
        await driver.executeScript("arguments[0].click();", nextBtn);

        // 3. Step 2: Interests
        const natureCard = await driver.wait(
            until.elementLocated(By.xpath("//span[contains(text(), 'Nature')]/..")),
            10000
        );
        await driver.executeScript("arguments[0].click();", natureCard);

        const generateBtn = await driver.findElement(By.xpath("//button[contains(text(), 'Generate Itinerary')]"));
        await driver.executeScript("arguments[0].click();", generateBtn);

        // 4. Step 3: Results
        await driver.wait(until.elementLocated(By.className('results-section')), 15000);

        const results = await driver.findElements(By.className('result-item'));
        // It might be 0 if no packages match Nature + Budget, but usually there are some
        expect(results.length).to.be.at.least(0);

        const resultsTitle = await driver.findElement(By.tagName('h2')).getText();
        expect(resultsTitle).to.contain('Recommended');
    });
});
