const puppeteer = require('puppeteer');
const fs = require('fs');

const SESSION_FILE_PATH = './youtube_session.json';

async function scrapeYouTubeRecommendations() {
try
{
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
    ],});

    const page = await browser.newPage();

    // Load session data if it exists
    const sessionData = loadSession();
    if (sessionData) 
      {
      try 
      {
          await page.setCookie(...sessionData.cookies);
          await page.evaluateOnNewDocument(sessionData => {
            localStorage.clear();
            for (let key in sessionData.localStorage) 
              {
                localStorage.setItem(key, sessionData.localStorage[key]);
              }
        }, sessionData);
      }
      catch (error) 
      {
        console.error('Error setting cookies or localStorage:', error);
      }
    }

    await page.goto('https://www.youtube.com');

    // Check if login is required
    const isLoggedIn = await page.evaluate(() => {
        return !!document.querySelector('ytd-masthead button#avatar-btn');
    });

    if (!isLoggedIn) {
        console.log("Please log in to YouTube...");

        // Wait for the user to log in manually
        await page.waitForNavigation({ waitUntil: 'networkidle2' });

        // Save session data
        await saveSession(page);
    }

    var links = [];
    for (var i = 1; i <= 30; i++) 
      {
        var selector = `ytd-rich-item-renderer.ytd-rich-grid-renderer:nth-child(${i}) > div:nth-child(1) > ytd-rich-grid-media:nth-child(1) > div:nth-child(1) > div:nth-child(1) > ytd-thumbnail:nth-child(1) > a:nth-child(1)`;
        var href = await page.$eval(selector, el => el.getAttribute("href")).catch(err => null);
        if (href) 
          {
            href = "https://www.youtube.com" + href;
            links.push(href);
        }
    }

    return links;
  }
  finally
  {
    await browser.close();
  }
}


  

function loadSession() {
    if (fs.existsSync(SESSION_FILE_PATH)) {
        const sessionData = fs.readFileSync(SESSION_FILE_PATH);
        return JSON.parse(sessionData);
    }
    return null;
}

async function saveSession(page) {
    const cookies = await page.cookies();
    const localStorage = await page.evaluate(() => {
        let json = {};
        for (let key in localStorage) {
            json[key] = localStorage.getItem(key);
        }
        return json;
    });
    const sessionData = { cookies, localStorage };
    fs.writeFileSync(SESSION_FILE_PATH, JSON.stringify(sessionData));
}

// Example usage
scrapeYouTubeRecommendations().then(links => {
    console.log(links);
}).catch(error => {
    console.error(error);
});


module.exports = scrapeYouTubeRecommendations;