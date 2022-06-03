const { link } = require("fs");
const { Builder, By, Key, until } = require("selenium-webdriver");
const safari = require('selenium-webdriver/safari');

(async function facebookTest() {
    try {
        let options = new safari.Options();
        let driver = await new Builder()
          .forBrowser('safari')
          .setSafariOptions(options)
          .build();
        
        await driver.get('https://main.dev.ingenio.ca/app/dashboard')

        const emailInput = await driver.wait(until.elementLocated(By.id('email'), 10000));
        await emailInput.sendKeys('cmullin@ingenio.ca');

        const passwordInput = await driver.wait(until.elementLocated(By.id('password'), 10000));
        await passwordInput.sendKeys('abcDEF123!', Key.RETURN);

        await driver.wait(until.elementLocated(By.id('path-1'), 10000));

        let links = await driver.findElements(By.tagName('a'), 10000);

        for (const link of links) {
            let href = await link.getAttribute('href');
            console.log(href);
        }
        
        await driver.quit();
    } catch(err) {
        console.error(err);
    }
})();


// Creating the first selenium test
// https://www.selenium.dev/documentation/webdriver/getting_started/first_script/

// Good way to wait for page to be loaded

