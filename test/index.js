const fs = require('fs');
const { Builder, By, Key, until } = require("selenium-webdriver");
const chrome = require('selenium-webdriver/chrome');

// ----------------------------------------------------------------
// CONSTANTS
// ----------------------------------------------------------------

DEFAULT_ENTITY_NAME = 'X-TEST-DEV15';

// TEST DOCUMENTS
const TEST_DOCUMENT_FILEPATH = '/Users/connormullin/Documents/test\ pdf.pdf';

// URL CONSTANTS
const URL_DASHBOARD = 'http://localhost:3000/app/dashboard';
const URL_ADMIN = 'http://localhost:3000/app/admin';

// USER CONSTANTS
const INGENIO_EMAIL = 'sha@ingenio.ca';
const INGENIO_PASSWORD = 'Password1!';

const FIRM_EMAIL = 'firmuser1@yopmail.com';
const FIRM_PASSWORD = 'Password1!';

// COMMON SELECTORS
const MORE_BUTTON = 'mui-ewnr1w-MuiButtonBase-root-MuiIconButton-root'; // className
const CREATE_BUTTON = "div[data-testid='createButton']" // xpath
const ENTITY_NAME = 'entity-autocomplete'; // id
const CORPORATION_NUMBER = 'corporationNumber'; // id
const ENTITY_JURISDICTION = 'jurisdiction'; // id
const OFFICE = 'division'; // id
const ENTITY_CREATION_TYPE = 'entityCreationType'; // id
const SEARCH_BAR = 'search-bar'; // id

// ----------------------------------------------------------------
//  HELPER FUNCTIONS
// ----------------------------------------------------------------

// LOG IN TO THE APPLICATION
async function login(driver, email, password) {
    await driver.get(URL_DASHBOARD);
    
    const emailInput = await driver.wait(until.elementLocated(By.id('email'), 10000));
    emailInput.sendKeys(email);
    
    const passwordInput = await driver.wait(until.elementLocated(By.id('password'), 10000));
    passwordInput.sendKeys(password, Key.RETURN);

    await driver.wait(until.elementLocated(By.id('path-1'), 10000));
    console.log(`Login Completed: ${email}...`)
};

// LOG OUT OF THE APPLICATION
async function logout(driver) {
    await driver.get(URL_DASHBOARD);
    await driver.sleep(1000);
    await driver.wait(until.elementLocated(By.xpath("//button[@aria-label='profile button']")))
        .click();
    await driver.sleep(1000);
    await driver.wait(until.elementLocated(By.xpath("//li[text()='Log Out']")))
        .click();
    await driver.sleep(1000);
    console.log('Logout Completed...');
}

// ENTER FIELD
async function enterTextField(driver, fieldID, value) {
    const inputField = await driver.wait(until.elementLocated(By.id(fieldID)));
    driver.wait(until.elementIsEnabled(inputField));
    inputField.sendKeys(value);
};

// ENTER DROPDOWN FIELD
async function enterDropdownField(driver, fieldID, value) {
    const dropdownField = await driver.wait(until.elementLocated(By.id(fieldID)));
    driver.wait(until.elementIsEnabled(dropdownField));
    dropdownField.click();
    const dropdownSelection = await driver.wait(until.elementLocated(By.xpath(`//li[@data-value='${value}']`)));
    dropdownSelection.click();
}

// ENTER DATE FIELD
async function enterDateField(driver, value) {
    const inputField = await driver.wait(until.elementLocated(By.xpath("//input[contains(@id, 'mui-')]")));
    driver.wait(until.elementIsEnabled(inputField));
    inputField.sendKeys(value);
    return inputField;
}

// HOW TO TAKE SCREENSHOTS
// await driver.takeScreenshot().then((image) => {
//     fs.writeFileSync('afterSleep', image, 'base64');
// });

// ----------------------------------------------------------------
// ENTITY & FIRM CREATION
// ----------------------------------------------------------------

/** CREATE NEW ENTITY
 * @param {WebDriver} driver 
 * @param {string} entityName Optional, defaults to DEFAULT_ENTITY_NAME
 * @param {string} entityCreationType Optional, defaults to Incorporated
 */
async function createNewEntity(driver, entityName, entityCreationType) {
    await driver.wait(until.elementLocated(By.css(CREATE_BUTTON))).click();
    await driver.wait(until.elementLocated(By.xpath("//div[@role='button']//div//span[text()='Entity']"))).click();

    await enterTextField(driver, ENTITY_NAME, entityName || DEFAULT_ENTITY_NAME);
    await enterTextField(driver, CORPORATION_NUMBER, '999999999');
    await enterDropdownField(driver, ENTITY_JURISDICTION, 'Alberta');
    await enterTextField(driver, OFFICE, 'Office');
    await enterDropdownField(driver, ENTITY_CREATION_TYPE, entityCreationType || 'Incorporated');

    const browseButton = await driver.wait(until.elementLocated(By.xpath("//input[@type='file']")));
    browseButton.sendKeys(TEST_DOCUMENT_FILEPATH);

    await driver.wait(until.elementLocated(By.xpath("//button[@type='submit']"))).click();
    await driver.wait(until.elementLocated(By.xpath("//p[text()='Onboarding Initiated']"))).then(() => {
        console.log('Onboarding Completed...');
    });
};

async function onboardNewEntity(driver) {
    await driver.get(URL_ADMIN);

    await driver.wait(until.elementLocated(By.xpath("//button[text()='Onboarding']")))
        .click();

    await driver.wait(until.elementLocated(By.id(SEARCH_BAR)))
        .sendKeys(DEFAULT_ENTITY_NAME);

    const moreButtons = await driver.wait(until.elementsLocated(By.className(MORE_BUTTON)))
    moreButtons[0].click();
            
    await driver.wait(until.elementLocated(By.xpath("//li[text()='Verify']")))
        .click();

    await driver.wait(until.elementLocated(By.xpath("//p[text()='Select All']")))
        .click();

    await enterTextField(driver, 'docName-select', 'Articles of Incorporation');
    await driver.wait(until.elementLocated(By.xpath("//li[text()='Articles of Incorporation']"))).click();
    await enterDateField(driver, '20200101');

    await driver.wait(until.elementLocated(By.xpath("//button[text()='SAVE DOCUMENT']")))
        .click();
    await driver.wait(until.elementLocated(By.xpath("//button[text()='MAP DOCUMENTS']")))
        .click();
    // await driver.sleep(10000);
    await driver.wait(until.elementLocated(By.xpath("//p[text()='Articles of Incorporation'][text()='2020-01-01']")))
        .click();
    await driver.wait(until.elementLocated(By.xpath("//button[text()='Create']")))
        .click();

    await enterTextField(driver, 'transaction-select', 'Incorporation');
    await driver.wait(until.elementLocated(By.xpath("//li[text()='Incorporation']")))
        .click();
    await enterDateField(driver, '20200101')

    await driver.wait(until.elementLocated(By.xpath("//button[text()='Create'][@form='transaction-dcoument']")))
        .click();
    await driver.wait(until.elementLocated(By.xpath("//button[text()='Complete']")))
        .click();

    console.log('Entity in Inputting Status...')
}

async function TC_001_01() {
    try {
        let options = new chrome.Options();
        let driver = await new Builder()
            .setChromeOptions(options)
            .forBrowser('chrome')
            .build();
        
        await login(driver, FIRM_EMAIL, FIRM_PASSWORD);
        await createNewEntity(driver);
        await logout(driver);

        await login(driver, INGENIO_EMAIL, INGENIO_PASSWORD);
        await onboardNewEntity(driver);
        await logout(driver);

        // driver.quit();
    } catch(err) {
        console.error(err);
    }
};

TC_001_01();

// Creating the first selenium test
// https://www.selenium.dev/documentation/webdriver/getting_started/first_script/

// Good way to wait for page to be loaded