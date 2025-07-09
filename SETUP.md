# 🎵 YouTube Audio Streamer

A modern web application that allows you to stream and download high-quality audio from YouTube videos using Node.js.

## Features

- 🎵 **Stream Audio**: Stream audio directly in your browser without downloading
- 📥 **Download MP3**: Download high-quality MP3 files (192kbps)
- 🚀 **Fast Processing**: Quick video information retrieval
- 🎨 **Modern UI**: Beautiful, responsive web interface
- 📱 **Mobile Friendly**: Works on all devices

## Prerequisites

- Node.js (v14 or higher)
- npm (comes with Node.js)
- Python 3 (for yt-dlp)

## Installation

1. **Clone or download the project**
   ```bash
   git clone <repository-url>
   cd youtube-audio-streamer
   ```

2. **Install Node.js dependencies**
   ```bash
   npm install
   ```

3. **The yt-dlp binary is already included in the project**
   - The `yt-dlp` executable is downloaded automatically
   - No additional setup required

## Usage

1. **Start the server**
   ```bash
   npm start
   ```
   
   For development with auto-restart:
   ```bash
   npm run dev
   ```

2. **Open your browser**
   - Navigate to `http://localhost:3000`
   - The web interface will load automatically

3. **Use the application**
   - Paste a YouTube URL in the input field
   - Click "Get Info" to fetch video information
   - Choose to either:
     - **Stream Audio**: Play audio directly in the browser
     - **Download MP3**: Save the audio file to your device

## API Endpoints

### POST `/api/video-info`
Get information about a YouTube video.

**Request:**
```json
{
  "url": "https://www.youtube.com/watch?v=VIDEO_ID"
}
```

**Response:**
```json
{
  "title": "Video Title",
  "duration": 180,
  "uploader": "Channel Name",
  "thumbnail": "https://thumbnail-url.jpg",
  "id": "VIDEO_ID"
}
```

### GET `/api/stream/:videoId?url=<YOUTUBE_URL>`
Stream audio directly from a YouTube video.

**Parameters:**
- `videoId`: The YouTube video ID
- `url`: The complete YouTube URL (query parameter)

### POST `/api/download`
Download audio as MP3 file.

**Request:**
```json
{
  "url": "https://www.youtube.com/watch?v=VIDEO_ID"
}
```

**Response:** MP3 file download

## Supported YouTube URL Formats

- `https://www.youtube.com/watch?v=VIDEO_ID`
- `https://youtu.be/VIDEO_ID`
- `https://www.youtube.com/embed/VIDEO_ID`
- `https://youtube.com/watch?v=VIDEO_ID`

## Features in Detail

### Audio Streaming
- Real-time audio streaming without file downloads
- Supports standard HTML5 audio controls
- Automatic quality optimization (192kbps MP3)

### Audio Downloads
- High-quality MP3 downloads
- Automatic file cleanup after download
- Unique filename generation to prevent conflicts

### Web Interface
- **Modern Design**: Beautiful gradient backgrounds and smooth animations
- **Responsive Layout**: Works on desktop, tablet, and mobile devices
- **Real-time Feedback**: Loading indicators, success/error messages
- **Keyboard Shortcuts**: 
  - `Enter`: Get video info
  - `Ctrl/Cmd + Enter`: Quick info fetch
  - `Escape`: Clear interface

### Error Handling
- Invalid URL detection
- Network error handling
- Audio streaming error recovery
- User-friendly error messages

## File Structure

```
youtube-audio-streamer/
├── server.js              # Main Express server
├── package.json           # Node.js dependencies
├── yt-dlp                 # YouTube downloader binary
├── downloads/             # Temporary download storage
└── public/
    ├── index.html         # Main web interface
    └── app.js            # Frontend JavaScript
```

## Configuration

### Environment Variables
- `PORT`: Server port (default: 3000)

### Server Settings
- **Audio Quality**: 192kbps MP3
- **Download Cleanup**: Files deleted after 1 hour
- **Streaming**: Direct pipe to browser

## Troubleshooting

### Common Issues

1. **"Command not found" errors**
   - Ensure the `yt-dlp` binary is executable: `chmod +x ./yt-dlp`

2. **Video info not loading**
   - Check if the YouTube URL is valid
   - Ensure internet connection is working
   - Some videos may be geo-restricted

3. **Audio streaming fails**
   - Try refreshing the page
   - Check browser console for errors
   - Some videos may have playback restrictions

4. **Downloads not working**
   - Check disk space availability
   - Ensure write permissions in the downloads directory

### Performance Tips

1. **For better performance:**
   - Use a VPS or server with good internet connectivity
   - Consider using a CDN for static files
   - Monitor server resources during heavy usage

2. **For production deployment:**
   - Use a process manager like PM2
   - Set up proper logging
   - Configure reverse proxy (nginx)
   - Use HTTPS

## Security Considerations

- The app processes user-provided URLs - ensure proper validation
- Downloads are automatically cleaned up to prevent disk space issues
- Consider rate limiting for production use
- Audio streaming uses secure pipes to prevent data leaks

## Dependencies

### Main Dependencies
- **express**: Web server framework
- **youtube-dl-exec**: Node.js wrapper for yt-dlp
- **cors**: Cross-origin resource sharing
- **multer**: File upload handling

### Binary Dependencies
- **yt-dlp**: YouTube audio/video extraction tool

## License

MIT License - feel free to modify and distribute.

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the console logs for detailed error messages
3. Ensure all dependencies are properly installed

---

**Note**: This application is for educational purposes. Please respect YouTube's Terms of Service and copyright laws when using this tool.