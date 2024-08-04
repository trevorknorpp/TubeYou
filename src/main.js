const scrapeYouTubeRecommendations = require('./scarper/youtubeScraper');
const downloadFrames = require('./downloaders/videoDownloader');


(async () => {
  try 
  {
    //pull 30 links from Youtube recommended page
    const videoUrls = await scrapeYouTubeRecommendations();
    console.log('Scraped Video URLs:', videoUrls);

    //download 10 seconds @1fps of each video to this path
    await downloadFrames(videoUrls);
    console.log('Downloaded frames to inference');

    //return list of url that pass inference
    //const filteredVideoUrls = await inferenceFrames();
    //console.log('Links that passes inference:' , filteredVideoUrls);

  } 
  catch (error) 
  {
    console.error('Error in main.js', error);
  }
})();