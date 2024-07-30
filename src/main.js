const scrapeYouTubeRecommendations = require('./scarper/youtubeScraper');

(async () => {
  try {
    const videoUrls = await scrapeYouTubeRecommendations();
    console.log('Scraped Video URLs:', videoUrls);
  } catch (error) {
    console.error('Error scraping YouTube recommendations:', error);
  }
})();