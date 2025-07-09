// Global variables
let currentVideoData = null;

// Utility functions
function showElement(elementId) {
    document.getElementById(elementId).style.display = 'block';
}

function hideElement(elementId) {
    document.getElementById(elementId).style.display = 'none';
}

function showError(message) {
    const errorElement = document.getElementById('errorMessage');
    errorElement.textContent = message;
    showElement('errorMessage');
    setTimeout(() => hideElement('errorMessage'), 5000);
}

function showSuccess(message) {
    const successElement = document.getElementById('successMessage');
    successElement.textContent = message;
    showElement('successMessage');
    setTimeout(() => hideElement('successMessage'), 3000);
}

function formatDuration(seconds) {
    if (!seconds) return 'Unknown';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    } else {
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }
}

function isValidYouTubeUrl(url) {
    const patterns = [
        /^https?:\/\/(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)/,
        /^https?:\/\/(www\.)?youtube\.com\/watch\?.*v=/
    ];
    
    return patterns.some(pattern => pattern.test(url));
}

// Main functions
async function getVideoInfo() {
    const urlInput = document.getElementById('youtubeUrl');
    const url = urlInput.value.trim();
    
    if (!url) {
        showError('Please enter a YouTube URL');
        return;
    }
    
    if (!isValidYouTubeUrl(url)) {
        showError('Please enter a valid YouTube URL');
        return;
    }
    
    // Show loading spinner
    showElement('loadingSpinner');
    hideElement('errorMessage');
    hideElement('successMessage');
    hideElement('videoInfo');
    hideElement('audioPlayerSection');
    
    try {
        const response = await fetch('/api/video-info', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ url }),
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Failed to get video information');
        }
        
        // Store video data for later use
        currentVideoData = { ...data, url };
        
        // Display video information
        displayVideoInfo(data);
        showSuccess('Video information loaded successfully!');
        
    } catch (error) {
        console.error('Error:', error);
        showError(error.message || 'Failed to get video information');
    } finally {
        hideElement('loadingSpinner');
    }
}

function displayVideoInfo(videoData) {
    // Update video info elements
    document.getElementById('videoTitle').textContent = videoData.title || 'Unknown Title';
    document.getElementById('videoUploader').textContent = videoData.uploader || 'Unknown';
    document.getElementById('videoDuration').textContent = formatDuration(videoData.duration);
    
    // Set thumbnail
    const thumbnail = document.getElementById('videoThumbnail');
    if (videoData.thumbnail) {
        thumbnail.src = videoData.thumbnail;
        thumbnail.style.display = 'block';
    } else {
        thumbnail.style.display = 'none';
    }
    
    // Show video info section
    showElement('videoInfo');
}

async function streamAudio() {
    if (!currentVideoData) {
        showError('Please get video information first');
        return;
    }
    
    try {
        // Create stream URL
        const streamUrl = `/api/stream/${currentVideoData.id}?url=${encodeURIComponent(currentVideoData.url)}`;
        
        // Set up audio player
        const audioPlayer = document.getElementById('audioPlayer');
        audioPlayer.src = streamUrl;
        
        // Show audio player section
        showElement('audioPlayerSection');
        
        // Scroll to audio player
        document.getElementById('audioPlayerSection').scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
        });
        
        showSuccess('Audio stream started! Use the player controls below.');
        
        // Handle audio events
        audioPlayer.addEventListener('loadstart', () => {
            console.log('Audio loading started');
        });
        
        audioPlayer.addEventListener('canplay', () => {
            console.log('Audio can start playing');
        });
        
        audioPlayer.addEventListener('error', (e) => {
            console.error('Audio error:', e);
            showError('Failed to stream audio. Please try again.');
        });
        
    } catch (error) {
        console.error('Error streaming audio:', error);
        showError('Failed to start audio stream');
    }
}

async function downloadAudio() {
    if (!currentVideoData) {
        showError('Please get video information first');
        return;
    }
    
    showElement('loadingSpinner');
    
    try {
        const response = await fetch('/api/download', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ url: currentVideoData.url }),
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to download audio');
        }
        
        // Create download link
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = `${currentVideoData.title || 'audio'}.mp3`;
        
        // Trigger download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up object URL
        window.URL.revokeObjectURL(downloadUrl);
        
        showSuccess('Audio download started!');
        
    } catch (error) {
        console.error('Error downloading audio:', error);
        showError(error.message || 'Failed to download audio');
    } finally {
        hideElement('loadingSpinner');
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Handle Enter key in URL input
    const urlInput = document.getElementById('youtubeUrl');
    urlInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            getVideoInfo();
        }
    });
    
    // Handle paste event for URL input
    urlInput.addEventListener('paste', function(e) {
        setTimeout(() => {
            const url = e.target.value.trim();
            if (isValidYouTubeUrl(url)) {
                // Auto-trigger info fetching after paste
                setTimeout(() => getVideoInfo(), 500);
            }
        }, 100);
    });
    
    // Auto-hide error messages when user starts typing
    urlInput.addEventListener('input', function() {
        hideElement('errorMessage');
    });
    
    console.log('🎵 YouTube Audio Streamer loaded successfully!');
});

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + Enter to get video info
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        getVideoInfo();
    }
    
    // Escape to clear everything
    if (e.key === 'Escape') {
        hideElement('errorMessage');
        hideElement('successMessage');
        hideElement('audioPlayerSection');
        document.getElementById('youtubeUrl').focus();
    }
});

// Handle visibility change (pause audio when tab is hidden)
document.addEventListener('visibilitychange', function() {
    const audioPlayer = document.getElementById('audioPlayer');
    if (document.hidden && audioPlayer.src) {
        // Don't pause automatically - let user control playback
        console.log('Tab hidden - audio continues playing');
    }
});