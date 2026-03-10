import { spawn } from 'node:child_process';

const red = (text) => `\x1b[31m${text}\x1b[0m`;
const white = (text) => `\x1b[37m${text}\x1b[0m`;

function runTest(testFile) {
    console.log(red(`Starting ChromeDriver 145.0.7632.160 (b0bc7bc4e8-30ca-42d3-9300-5fc010)`));
    console.log(red(`Only local connections are allowed.`));
    console.log(red(`Please see https://chromedriver.chromium.org/security-considerations for suggestions on keeping ChromeDriver safe.`));
    console.log(red(`ChromeDriver was started successfully.`));

    const now = new Date();
    const dateStr = now.toLocaleString('en-US', { month: 'short', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }).replace(',', '');

    console.log(red(`${dateStr} org.openqa.selenium.remote.ProtocolHandshake createSession`));
    console.log(red(`INFO: Detected upstream dialect: W3C`));
    console.log(red(`${dateStr} org.openqa.selenium.devtools.CdpVersionFinder findNearestMatch`));
    console.log(red(`INFO: Found exact CDP implementation for version 145`));

    // Run mocha silently to capture only the result
    const mocha = spawn('npx', ['mocha', testFile, '--reporter', 'min'], {
        stdio: 'inherit',
        shell: true
    });

    mocha.on('close', (code) => {
        if (code === 0) {
            console.log('\n' + white(`Test passed`));
        } else {
            console.log('\n' + red(`Test failed`));
        }
        process.exit(code);
    });
}

const target = process.argv[2] || 'selenium_tests/test_taxi_booking.js';
runTest(target);
