const puppeteer = require('puppeteer');
const fs = require('fs').promises;

const SESSION_FILE_PATH = './youtube_session.json'; //Stores cookies here

async function scrapeYouTubeRecommendations() 
{
  //browser with settings to bypass google bot filter
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
  try 
  {
    const page = await browser.newPage();

    //load cookies if we have them saved to sign in automatically
    const sessionData = await loadSession();
    if (sessionData) 
    {
      try 
      {
        //check if cookies are in the correct format
        if (Array.isArray(sessionData.cookies)) 
        {
          console.log('Loaded cookies:');
          sessionData.cookies.forEach((cookie, index) => {
            console.log(`Cookie ${index}:`, cookie);
          });

          //validate each cookie
          const validCookies = sessionData.cookies.filter(cookie => {
            return cookie.name && cookie.value && cookie.domain && cookie.path && typeof cookie.expires === 'number';
          });

          for (const [index, cookie] of validCookies.entries()) 
          {
            try 
            {
              await page.setCookie(cookie);
              console.log(`Cookie ${index + 1} set successfully.`);
            } 
            catch (error) 
            {
              console.error(`Error setting cookie ${index + 1}:`, error);
            }
          }
        } 
        else 
        {
          console.error('Invalid cookie format in session data.');
        }
      } 
      catch (error) 
      {
        console.error('Error setting cookies:', error);
      }
    }

    //go to youtube, wait until it stops loading
    await page.goto('https://www.youtube.com', { waitUntil: 'networkidle2' });

    //are we logged in?
    let isLoggedIn = await page.evaluate(() => {
      return !!document.querySelector('ytd-masthead button#avatar-btn');
    });

    //if not logged in, wait until logged in and tell user
    if (!isLoggedIn) 
    {
      console.log("Please log in to YouTube...");

      //wait for sign in to finish
      await page.waitForSelector('ytd-masthead button#avatar-btn', { timeout: 0 });

      //save cookies
      await saveSession(page);
    }

    //extract links from page
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
  } 
  finally 
  {
    await browser.close();
  }
}

//load cookies
async function loadSession() 
{
  try 
  {
    const sessionFileExists = await fs.stat(SESSION_FILE_PATH).catch(() => false);
    if (sessionFileExists) 
    {
      const sessionData = await fs.readFile(SESSION_FILE_PATH, 'utf8');
      return JSON.parse(sessionData);
    }
  } 
  catch (error) 
  {
    console.error('Error loading session:', error);
  }
  return null;
}

//save cookies
async function saveSession(page) 
{
  try 
  {
    const cookies = await page.cookies();
    console.log('Saving cookies:', cookies);
    const sessionData = { cookies };
    await fs.writeFile(SESSION_FILE_PATH, JSON.stringify(sessionData));
  } 
  catch (error) 
  {
    console.error('Error saving session:', error);
  }
}

//let main run this function
module.exports = scrapeYouTubeRecommendations;
