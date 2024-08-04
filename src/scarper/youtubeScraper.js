const puppeteer = require('puppeteer');
const fs = require('fs').promises;

const SESSION_FILE_PATH = './youtube_session.json';

async function scrapeYouTubeRecommendations() {
  const browser = await puppeteer.launch({
    headless: false,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-infobars',
      '--window-position=0,0',
      '--ignore-certifcate-errors',
      '--ignore-certifcate-errors-spki-list',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--disable-gpu',
      '--window-size=1920x1080',
      '--hide-scrollbars',
      '--enable-automation',
      '--disable-blink-features=AutomationControlled'
    ],
  });
  try {
    const page = await browser.newPage();

    // Load session data if it exists
    const sessionData = await loadSession();
    if (sessionData) {
      try {
        // Check if cookies are in the correct format
        if (Array.isArray(sessionData.cookies)) {
          console.log('Loaded cookies:');
          sessionData.cookies.forEach((cookie, index) => {
            console.log(`Cookie ${index}:`, cookie);
          });

          // Validate each cookie
          const validCookies = sessionData.cookies.filter(cookie => {
            return cookie.name && cookie.value && cookie.domain && cookie.path && typeof cookie.expires === 'number';
          });

          if (validCookies.length === sessionData.cookies.length) {
            await page.setCookie(...validCookies);
          } else {
            console.error('Some cookies are invalid and will be ignored:', sessionData.cookies.filter(cookie => !validCookies.includes(cookie)));
            await page.setCookie(...validCookies); // Set only valid cookies
          }
        } else {
          console.error('Invalid cookie format in session data.');
        }

        // Validate and set localStorage
        if (sessionData.localStorage && typeof sessionData.localStorage === 'object') {
          console.log('Loaded localStorage:', sessionData.localStorage);
          await page.evaluateOnNewDocument(localStorageData => {
            localStorage.clear();
            for (let key in localStorageData) {
              localStorage.setItem(key, localStorageData[key]);
            }
          }, sessionData.localStorage);
        } else {
          console.error('Invalid localStorage format in session data.');
        }
      } catch (error) {
        console.error('Error setting cookies or localStorage:', error);
      }
    }

    await page.goto('https://www.youtube.com');

    // Check if login is required
    let isLoggedIn = await page.evaluate(() => {
      return !!document.querySelector('ytd-masthead button#avatar-btn');
    });

    if (!isLoggedIn) {
      console.log("Please log in to YouTube...");

      // Wait for the user to log in manually
      await page.waitForSelector('ytd-masthead button#avatar-btn', { timeout: 0 });

      // Save session data
      await saveSession(page);
    }

    var links = [];
    for (var i = 1; i <= 30; i++) {
      var selector = `ytd-rich-item-renderer.ytd-rich-grid-renderer:nth-child(${i}) > div:nth-child(1) > ytd-rich-grid-media:nth-child(1) > div:nth-child(1) > div:nth-child(1) > ytd-thumbnail:nth-child(1) > a:nth-child(1)`;
      var href = await page.$eval(selector, el => el.getAttribute("href")).catch(err => null);
      if (href) {
        href = "https://www.youtube.com" + href;
        links.push(href);
      }
    }

    return links;
  } finally {
    await browser.close();
  }
}

async function loadSession() {
  try {
    const sessionFileExists = await fs.stat(SESSION_FILE_PATH).catch(() => false);
    if (sessionFileExists) {
      const sessionData = await fs.readFile(SESSION_FILE_PATH, 'utf8');
      return JSON.parse(sessionData);
    }
  } catch (error) {
    console.error('Error loading session:', error);
  }
  return null;
}

async function saveSession(page) {
  try {
    const cookies = await page.cookies();
    const localStorage = await page.evaluate(() => {
      let json = {};
      for (let key in localStorage) {
        json[key] = localStorage.getItem(key);
      }
      return json;
    });
    console.log('Saving session data:', { cookies, localStorage });
    const sessionData = { cookies, localStorage };
    await fs.writeFile(SESSION_FILE_PATH, JSON.stringify(sessionData));
  } catch (error) {
    console.error('Error saving session:', error);
  }
}

// Example usage
scrapeYouTubeRecommendations().then(links => {
  console.log(links);
}).catch(error => {
  console.error(error);
});

module.exports = scrapeYouTubeRecommendations;
