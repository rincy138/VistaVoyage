import { Builder, By, until } from 'selenium-webdriver';
import { expect } from 'chai';
import chrome from 'selenium-webdriver/chrome.js';

describe('VistaVoyage Agent Portal Management', function () {
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

    const loginAsAgent = async () => {
        await driver.get('http://localhost:5173/login');
        await driver.wait(until.elementLocated(By.name('email')), 15000);
        await driver.findElement(By.name('email')).sendKeys('agent@gmail.com');
        await driver.findElement(By.name('password')).sendKeys('Password123'); // Fixed to match seed script
        const loginBtn = await driver.findElement(By.className('login-btn'));
        await driver.executeScript("arguments[0].click();", loginBtn);
        await driver.wait(until.urlContains('/agent'), 20000);
    };

    it('should navigate through all agent dashboard tabs', async function () {
        await loginAsAgent().catch(err => {
            console.log("Agent login failed. Ensure agent@gmail.com exists with password123");
            throw err;
        });

        const tabs = [
            { text: 'Manage Packages', content: 'Create New Package' },
            { text: 'Bookings & Requests', content: 'Bookings & Requests' },
            { text: 'Manage Destinations', content: 'Available Destinations' },
            { text: 'Reviews', content: 'Traveler Reviews & Ratings' },
            { text: 'Manage Travelers', content: 'Manage Traveler Accounts' }
        ];

        for (const tab of tabs) {
            const tabBtn = await driver.wait(
                until.elementLocated(By.xpath(`//button[contains(text(), '${tab.text}')]`)),
                10000
            );
            await driver.executeScript("arguments[0].scrollIntoView();", tabBtn);
            await driver.executeScript("arguments[0].click();", tabBtn);
            await driver.sleep(1000); // Wait for transition

            const bodyText = await driver.findElement(By.tagName('body')).getText();
            expect(bodyText).to.contain(tab.content);
        }
    });
});
