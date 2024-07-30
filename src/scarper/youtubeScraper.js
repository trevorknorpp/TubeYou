const puppeteer = require('puppeteer');

async function scrapeYouTubeRecommendations() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  try {
    await page.goto('https://www.youtube.com/feed/recommended', { waitUntil: 'networkidle2' });

    // Wait for the videos to load
    //prob wrong element to wait for
    await page.waitForSelector('ytd-rich-item-renderer', { timeout: 60000 });

    await page.waitForTimeout(5000);

    const videoUrls = await page.evaluate(() => {
      const videos = Array.from(document.querySelectorAll('#video-title'));
      return videos.map(video => video.href);
    });

    return videoUrls;
  } finally {
    await browser.close();
  }
}

module.exports = scrapeYouTubeRecommendations;