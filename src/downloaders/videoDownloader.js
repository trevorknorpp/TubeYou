const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const ytdl = require('ytdl-core');
const ffmpeg = require('fluent-ffmpeg');

const SAVED_FRAMES_PATH = './savedFramesTemp'; //Stores frames here

//download frames of each video and store them in seperate subpaths
async function downloadFrames(videoUrls) 
{
    if (fs.existsSync(SAVED_FRAMES_PATH)) 
        fs.rmSync(SAVED_FRAMES_PATH, { recursive: true, force: true });

    fs.mkdirSync(SAVED_FRAMES_PATH, { recursive: true });

    //make file path for each url and call method to save frames to that path
    for (let i = 0; i < videoUrls.length; i++) 
    {
        const videoUrl = videoUrls[i];
        const frameDir = path.join(SAVED_FRAMES_PATH, `video${i + 1}`);
        
        if (fs.existsSync(frameDir)) 
            fs.rmSync(frameDir, { recursive: true, force: true });

        fs.mkdirSync(frameDir, { recursive: true });

        try
        {
            await downloadFirst20FramesToPath(videoUrl, frameDir)
        }
        catch
        {
            console.error('Could not download frames for ', videoUrl, ' to path ', frameDir);
        }
    }
}

async function downloadFirst20FramesToPath(videoUrl, frameDir) 
{
    //delete if exists
    if (fs.existsSync(frameDir)) 
        fs.rmSync(frameDir, { recursive: true, force: true });

    fs.mkdirSync(frameDir, { recursive: true });

    return new Promise((resolve, reject) => {
        const videoStream = ytdl(videoUrl, { quality: 'highestvideo' });

        ffmpeg(videoStream)
            .on('end', () => {
                console.log(`Downloaded frames to ${frameDir}`);
                resolve();
            })
            .on('error', (err) => {
                console.error(`Error downloading video frames: ${err.message}`);
                reject(err);
            })
            .screenshots({
                count: 20,
                folder: frameDir,
                filename: 'frame_%04d.jpg',
                timemarks: Array.from({ length: 20 }, (_, i) => (i * 0.1).toString())
            });
    });
}

//let main run this function
module.exports = downloadFrames;
