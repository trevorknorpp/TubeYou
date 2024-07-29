const puppeteer = require('puppeteer');

async function scrapeYouTubeRecommendations() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('https://www.youtube.com/feed/recommended', { waitUntil: 'networkidle2' });

  const videoUrls = await page.evaluate(() => {
    const videos = Array.from(document.querySelectorAll('#video-title'));
    return videos.map(video => video.href);
  });

  await browser.close();
  return videoUrls;
}

module.exports = scrapeYouTubeRecommendations;
console.log('Scarped finished');