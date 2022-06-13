const fs = require('fs');
const { Builder, By, Key, until } = require("selenium-webdriver");
const chrome = require('selenium-webdriver/chrome');

// ----------------------------------------------------------------
// CONSTANTS
// ----------------------------------------------------------------

DEFAULT_ENTITY_NAME = 'ZZZ - Dissolution22';
DEFAULT_FIRST_NAME = 'TEST22';
DEFAULT_LAST_NAME = 'TEST22';

// TEST DOCUMENTS
const TEST_DOCUMENT_FILEPATH = '/Users/connormullin/Documents/test\ pdf.pdf';

// URL CONSTANTS
const URL_DASHBOARD = 'http://localhost:3000/app/dashboard';
const URL_ADMIN = 'http://localhost:3000/app/admin';

// USER CONSTANTS
const INGENIO_EMAIL = 'sha@ingenio.ca';
const INGENIO_PASSWORD = 'Password1!';

const FIRM_EMAIL = 'connorjohnmullin@gmail.com';
const FIRM_PASSWORD = 'Password1!';

// COMMON SELECTORS
const MORE_BUTTON = "svg[data-testid='MoreVertIcon']"; // css
const CREATE_BUTTON = "div[data-testid='createButton']" // css
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
    driver.sleep(1000);
    dropdownField.click();
    const dropdownSelection = await driver.wait(until.elementLocated(By.xpath(`//li[text()='${value}']`)));
    dropdownSelection.click();
}

// ENTER DATE FIELD
async function enterDateField(driver, value) {
    const inputField = await driver.wait(until.elementLocated(By.xpath("//input[contains(@id, 'mui-')]")));
    driver.wait(until.elementIsEnabled(inputField));
    inputField.sendKeys(value);
    return inputField;
}

// ENTER SEARCH FIELD
async function enterSearchField(driver, fieldID, value) {
    await enterTextField(driver, fieldID, value);
    await driver.wait(until.elementLocated(By.xpath(`//li[text()='${value}']`)))
        .click();
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
        console.log('Entity in Imported Status...');
    });
};

// Only does incorporation right now
async function onboardNewEntity(driver, entityName) {
    await driver.get(URL_ADMIN);

    await driver.wait(until.elementLocated(By.xpath("//button[text()='Onboarding']")))
        .click();

    await driver.wait(until.elementLocated(By.id(SEARCH_BAR)))
        .sendKeys(entityName || DEFAULT_ENTITY_NAME);

    await driver.wait(until.elementLocated(By.css(MORE_BUTTON)))
        .click();
            
    await driver.wait(until.elementLocated(By.xpath("//li[text()='Verify']")))
        .click();

    await driver.wait(until.elementLocated(By.xpath("//p[text()='Select All']")))
        .click();

    await enterSearchField(driver, 'docName-select', 'Articles of Incorporation');
    await enterDateField(driver, '20200101');

    await driver.wait(until.elementLocated(By.xpath("//button[text()='SAVE DOCUMENT']")))
        .click();
    await driver.wait(until.elementLocated(By.xpath("//button[text()='MAP DOCUMENTS']")))
        .click();

    // Break up here for different types of transactions?

    console.log('Entity in Mapped Status...');

    await driver.wait(until.elementLocated(By.xpath("//p[text()='Articles of Incorporation'][text()='2020-01-01']")))
        .click();
    await driver.wait(until.elementLocated(By.xpath("//button[text()='Create']")))
        .click();

    await enterSearchField(driver, 'transaction-select', 'Incorporation');
    await enterDateField(driver, '20200101')

    await driver.wait(until.elementLocated(By.xpath("//button[text()='Create'][@form='transaction-dcoument']")))
        .click();
    await driver.wait(until.elementLocated(By.xpath("//button[text()='Complete']")))
        .click();

    console.log('Entity in Inputting Status...')

    // Incorporation General Details
    await enterDropdownField(driver, 'documentSelector', 'Articles of Incorporation');
    await enterTextField(driver, 'general_details::corporation_number', '999999999');
    await enterTextField(driver, 'general_details::legal_name', `${DEFAULT_ENTITY_NAME}`);
    await enterDateField(driver, '20200101');
    await enterDropdownField(driver, 'general_details::entity_type', 'Limited Liability Corporation');
    await enterDropdownField(driver, 'general_details::corporation_type', 'Private Corporation');
    await enterDropdownField(driver, 'general_details::creation_type', 'Incorporated');
    await enterTextField(driver, 'business_info::nature_of_business', 'Nature of Business');
    await enterDropdownField(driver, 'business_info::naics_code', '22 Utilities');
    await enterTextField(driver, 'business_info::business_number', '999999999');
    await enterTextField(driver, 'general_details::authorized_director_set', '1');
    await driver.wait(until.elementLocated(By.xpath("//button[text()='Next Page']")))
        .click();

    // Incorporation Share Structure
    await enterDateField(driver, '20200101');
    await enterTextField(driver, 'share_structure[0][share_class_name]', 'Class A');
    await enterTextField(driver, 'share_structure[0][votes_per_share]', '1');
    await enterTextField(driver, 'share_structure[0][redemption_value]', '20');
    await driver.wait(until.elementLocated(By.xpath("//button[text()='Next Page']")))
        .click();

    // Incorporation Directors
    await enterDateField(driver, '20200101');
    const directorField = await driver.wait(until.elementLocated(By.xpath("//input[@role='combobox']")));
    directorField.click();
    directorField.sendKeys(DEFAULT_FIRST_NAME);
    await driver.sleep(2000);
    directorField.sendKeys(Key.ENTER);

    // New Contact (Director)
    await enterTextField(driver, 'lastName', DEFAULT_LAST_NAME);
    await enterSearchField(driver, 'positionTypeCheckbox', 'Chairman');
    await driver.findElement(By.id('positionTypeCheckbox'))
        .sendKeys(Key.TAB);
    await enterTextField(driver, `addressList[0]['addressSearch']-select`, '111');
    await driver.sleep(2000);
    await driver.findElement(By.id(`addressList[0]['addressSearch']-select`))
        .sendKeys(Key.ENTER);
    await driver.wait(until.elementLocated(By.xpath("//button[text()='SAVE']")))
        .click();
    await driver.wait(until.elementLocated(By.xpath("//button[text()='Next Page']")))
        .click();

    // Legal Associated Addresses
    await enterDropdownField(driver, 'legal_associated_addresses[0][legal_associated_address_assignment_type]', 'Registered Office');
    await enterDateField(driver, '20200101');
    const associatedAddressField = await driver.wait(until.elementLocated(By.xpath("//input[@role='combobox']")));
    associatedAddressField.click();
    associatedAddressField.sendKeys(DEFAULT_FIRST_NAME);
    await driver.sleep(2000);
    associatedAddressField.sendKeys(Key.ENTER);
    await enterTextField(driver, 'legal_associated_addresses[0][legal_associated_address_data].legal_associated_address_street_address', '123 paper street');
    await enterTextField(driver, 'legal_associated_addresses[0][legal_associated_address_data].legal_associated_address_city', 'Calgary');
    await driver.wait(until.elementLocated(By.xpath("//textarea[@name='legal_associated_addresses[0][legal_associated_address_data].legal_associated_address_province']")))
        .sendKeys('Alberta');
    await driver.wait(until.elementLocated(By.xpath("//textarea[@name='legal_associated_addresses[0][legal_associated_address_data].legal_associated_address_country']")))
        .sendKeys('Canada');
    await driver.wait(until.elementLocated(By.xpath("//textarea[@name='legal_associated_addresses[0][legal_associated_address_data].legal_associated_address_postal_code']")))
        .sendKeys('T2N 0A2');
    await driver.wait(until.elementLocated(By.xpath("//button[text()='Review']")))
        .click();
}


// Create a New Entity and onboard it with an Incorporation Transaction
async function Test_Case_00() {
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
        // await logout(driver);

        // driver.quit();
    } catch(err) {
        console.error(err);
    }
};

async function Test_Case_01() {
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

    } catch(err) {
        console.error(err);
    }
}

Test_Case_00();