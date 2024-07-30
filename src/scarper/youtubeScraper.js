const puppeteer = require('puppeteer');

async function scrapeYouTubeRecommendations() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  try {
    const browser = await puppeteer.launch({headless: true});
    const page = await browser.newPage();

    await page.goto('https://www.youtube.com/user/PewDiePie/videos');
    var links =[]
    for (var i=1; i<=30; i++){ 
      //grab href and src(thumbnail) of each video

      var href = await page.$$eval("ytd-rich-item-renderer.ytd-rich-grid-renderer:nth-child(1) > div:nth-child(1) > ytd-rich-grid-media:nth-child(1) > div:nth-child(1) > div:nth-child(3) > div:nth-child(2) > h3:nth-child(1) > a:nth-child(2)", el => el.map(x => x.getAttribute("href")));
      href="https://www.youtube.com"+href;

      links.push(href);
  }
  return links;

  } finally {
    await browser.close();
  }
}

  

  /*
    const result = await page.evaluate(() => {
      let viddata = []; // Create an empty array that will store our data
      let channelName = document.querySelector('ytd-channel-name.ytd-c4-tabbed-header-renderer > div:nth-child(1) > div:nth-child(1) > yt-formatted-string:nth-child(1)').innerHTML;

      var numvids =document.querySelector('div.ytd-grid-renderer:nth-child(2)').childElementCount;
      console.log("THERE ARE "+numvids+" VIDEOS");
      for (var i=1; i<numvids; i++){ // Loop through each video

          var title = document.querySelector('ytd-grid-video-renderer.style-scope:nth-child('+i+') > div:nth-child(1) > div:nth-child(2) > div:nth-child(1) > h3:nth-child(1) > a:nth-child(2)').innerHTML; 
          var views = document.querySelector('ytd-grid-video-renderer.style-scope:nth-child('+i+') > div:nth-child(1) > div:nth-child(2) > div:nth-child(1) > div:nth-child(2) > div:nth-child(1) > div:nth-child(2) > span:nth-child(1)').innerHTML;
          var date = document.querySelector('ytd-grid-video-renderer.style-scope:nth-child('+i+') > div:nth-child(1) > div:nth-child(2) > div:nth-child(1) > div:nth-child(2) > div:nth-child(1) > div:nth-child(2) > span:nth-child(2)').innerHTML;

          viddata.push({title,views,date,channelName});  
      }

      return viddata; // Return our data array

  //merge href and src with other data
  for (var i=0; i<29; i++){
      result[i].links=links[i];
  }


  browser.close();
  return result; // Return the data
*/

module.exports = scrapeYouTubeRecommendations;