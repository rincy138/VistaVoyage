# Selenium Testing for VistaVoyage

This project uses **Selenium WebDriver** with **Mocha** and **Chai** for end-to-end (E2E) testing.

## Prerequisites

1.  **Google Chrome**: Ensure you have Google Chrome installed.
2.  **Node.js Dependencies**: These have already been installed (`selenium-webdriver`, `mocha`, `chai`).
3.  **Application Running**: The frontend must be running on `http://localhost:5173`.
    ```bash
    npm run dev
    ```

## Running Tests

To run the Selenium tests, use the following command:

```bash
npm run test:selenium
```

## Creating New Tests

All Selenium tests are located in the `selenium_tests/` directory. You can create new `.js` files there following the pattern in `test_login.js`.

### Example Test Structure

```javascript
import { Builder, By, Key, until } from 'selenium-webdriver';
import { expect } from 'chai';

describe('My Feature', function () {
  this.timeout(30000); // Selenium tests can take time
  let driver;

  before(async function () {
    driver = await new Builder().forBrowser('chrome').build();
  });

  after(async function () {
    await driver.quit();
  });

  it('should do something', async function () {
    await driver.get('http://localhost:5173/my-page');
    // ... test logic
  });
});
```

## Notes

- **Headless Mode**: If you want to run tests without a browser window popping up, uncomment the `--headless` line in the `before` hook of your test files.
- **Drivers**: `selenium-webdriver` version 4.x automatically manages drivers using "Selenium Manager". You don't need to manually download `chromedriver.exe` as long as you have Chrome installed.
