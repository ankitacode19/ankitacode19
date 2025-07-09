const express = require('express');
const youtubedl = require('youtube-dl-exec');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Create downloads directory if it doesn't exist
const downloadsDir = path.join(__dirname, 'downloads');
if (!fs.existsSync(downloadsDir)) {
    fs.mkdirSync(downloadsDir);
}

// Serve main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Get video info endpoint
app.post('/api/video-info', async (req, res) => {
    try {
        const { url } = req.body;
        
        if (!url) {
            return res.status(400).json({ error: 'YouTube URL is required' });
        }

        // Get video information
        const info = await youtubedl(url, {
            dumpSingleJson: true,
            noWarnings: true,
            noCallHome: true,
            noCheckCertificate: true,
            preferFreeFormats: true,
            youtubeSkipDashManifest: true,
        });

        res.json({
            title: info.title,
            duration: info.duration,
            uploader: info.uploader,
            thumbnail: info.thumbnail,
            id: info.id
        });

    } catch (error) {
        console.error('Error getting video info:', error);
        res.status(500).json({ error: 'Failed to get video information' });
    }
});

// Stream audio endpoint
app.get('/api/stream/:videoId', async (req, res) => {
    try {
        const { videoId } = req.params;
        const { url } = req.query;
        
        if (!url) {
            return res.status(400).json({ error: 'YouTube URL is required' });
        }

        // Set response headers for audio streaming
        res.setHeader('Content-Type', 'audio/mpeg');
        res.setHeader('Accept-Ranges', 'bytes');
        res.setHeader('Cache-Control', 'no-cache');

        // Stream audio directly using youtube-dl
        const ytdlProcess = spawn('./yt-dlp', [
            '--extract-audio',
            '--audio-format', 'mp3',
            '--audio-quality', '192K',
            '--no-warnings',
            '--no-call-home',
            '--no-check-certificate',
            '--prefer-free-formats',
            '--youtube-skip-dash-manifest',
            '-o', '-',
            url
        ]);

        // Pipe the audio stream to response
        ytdlProcess.stdout.pipe(res);

        // Handle errors
        ytdlProcess.stderr.on('data', (data) => {
            console.error('yt-dlp stderr:', data.toString());
        });

        ytdlProcess.on('error', (error) => {
            console.error('Error streaming audio:', error);
            if (!res.headersSent) {
                res.status(500).json({ error: 'Failed to stream audio' });
            }
        });

        ytdlProcess.on('close', (code) => {
            if (code !== 0) {
                console.error(`yt-dlp process exited with code ${code}`);
            }
        });

        // Handle client disconnect
        req.on('close', () => {
            ytdlProcess.kill();
        });

    } catch (error) {
        console.error('Error in stream endpoint:', error);
        if (!res.headersSent) {
            res.status(500).json({ error: 'Failed to stream audio' });
        }
    }
});

// Download audio endpoint (alternative to streaming)
app.post('/api/download', async (req, res) => {
    try {
        const { url } = req.body;
        
        if (!url) {
            return res.status(400).json({ error: 'YouTube URL is required' });
        }

        // Generate unique filename
        const timestamp = Date.now();
        const outputPath = path.join(downloadsDir, `audio_${timestamp}.%(ext)s`);

        // Download audio
        await youtubedl(url, {
            extractAudio: true,
            audioFormat: 'mp3',
            audioQuality: '192K',
            output: outputPath,
            noWarnings: true,
            noCallHome: true,
            noCheckCertificate: true,
            preferFreeFormats: true,
            youtubeSkipDashManifest: true,
        });

        // Find the downloaded file
        const files = fs.readdirSync(downloadsDir);
        const downloadedFile = files.find(file => file.startsWith(`audio_${timestamp}`));
        
        if (downloadedFile) {
            const filePath = path.join(downloadsDir, downloadedFile);
            res.download(filePath, (err) => {
                if (err) {
                    console.error('Error sending file:', err);
                } else {
                    // Clean up file after download
                    setTimeout(() => {
                        try {
                            fs.unlinkSync(filePath);
                        } catch (error) {
                            console.error('Error deleting file:', error);
                        }
                    }, 60000); // Delete after 1 minute
                }
            });
        } else {
            res.status(500).json({ error: 'Downloaded file not found' });
        }

    } catch (error) {
        console.error('Error downloading audio:', error);
        res.status(500).json({ error: 'Failed to download audio' });
    }
});

// Clean up old downloads periodically
setInterval(() => {
    const files = fs.readdirSync(downloadsDir);
    const now = Date.now();
    
    files.forEach(file => {
        const filePath = path.join(downloadsDir, file);
        const stats = fs.statSync(filePath);
        const fileAge = now - stats.mtime.getTime();
        
        // Delete files older than 1 hour
        if (fileAge > 3600000) {
            try {
                fs.unlinkSync(filePath);
                console.log(`Deleted old file: ${file}`);
            } catch (error) {
                console.error('Error deleting old file:', error);
            }
        }
    });
}, 300000); // Check every 5 minutes

app.listen(PORT, () => {
    console.log(`🎵 YouTube Audio Streamer running on http://localhost:${PORT}`);
    console.log('📁 Downloads directory:', downloadsDir);
});