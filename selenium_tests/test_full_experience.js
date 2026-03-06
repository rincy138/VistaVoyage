import { Builder, By, until } from 'selenium-webdriver';
import { expect } from 'chai';
import chrome from 'selenium-webdriver/chrome.js';

describe('VistaVoyage Full User Experience', function () {
    this.timeout(90000);
    let driver;
    const uniqueId = Date.now();
    const testUser = {
        name: `Traveler ${uniqueId}`,
        email: `tester_${uniqueId}@example.com`,
        password: 'Password123'
    };

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

    const clickElement = async (selector, timeout = 15000) => {
        const el = await driver.wait(until.elementLocated(selector), timeout);
        await driver.wait(until.elementIsVisible(el), timeout);
        await driver.executeScript("arguments[0].scrollIntoView({block: 'center'});", el);
        await driver.sleep(500);

        try {
            await el.click();
        } catch (e) {
            await driver.executeScript("arguments[0].click();", el);
        }
    };

    it('should register a new user successfully', async function () {
        await driver.get('http://localhost:5173/register');
        await driver.findElement(By.name('name')).sendKeys(testUser.name);
        await driver.findElement(By.name('email')).sendKeys(testUser.email);
        await driver.findElement(By.name('password')).sendKeys(testUser.password);
        await driver.findElement(By.name('confirmPassword')).sendKeys(testUser.password);
        await clickElement(By.css('button[type="submit"]'));
        await driver.wait(until.urlIs('http://localhost:5173/'), 15000);
    });

    it('should be able to logout and login again', async function () {
        await driver.sleep(2000);
        await clickElement(By.css('.profile-menu-container button.btn-icon'));
        await clickElement(By.className('logout-btn-simple'));
        await driver.wait(until.urlContains('/login'), 15000);

        await driver.findElement(By.name('email')).sendKeys(testUser.email);
        await driver.findElement(By.name('password')).sendKeys(testUser.password);
        await clickElement(By.className('login-btn'));
        await driver.wait(until.urlIs('http://localhost:5173/'), 15000);
    });

    it('should navigate through all dashboard features', async function () {
        await driver.sleep(2000);

        // Define routes to check
        const routes = [
            { selector: 'a[href="/destinations"]', path: '/destinations' },
            { selector: 'a[href="/hotels"]', path: '/hotels' },
            { selector: 'a[href="/taxis"]', path: '/taxis' },
            { selector: 'a[href="/packing-assistant"]', path: '/packing-assistant' },
            { selector: 'a[href="/group-trips"]', path: '/group-trips' }
        ];

        for (const route of routes) {
            await clickElement(By.css(route.selector));
            await driver.wait(until.urlContains(route.path), 15000);
            // Go back to home to ensure we are clicking from the same state
            await driver.get('http://localhost:5173/');
            await driver.sleep(1000);
        }

        // Final check on profile
        await driver.get('http://localhost:5173/profile');
        await driver.wait(until.urlContains('/profile'), 15000);
        const bodyText = await driver.findElement(By.tagName('body')).getText();
        expect(bodyText).to.contain(testUser.name);
    });
});
