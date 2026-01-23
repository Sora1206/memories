/**
 * Define the playlist structure. 
 * Ensure your MP3 files are in the 'songs/' directory.
 */
const playlist = [
    { 
        title: "Lowkey", 
        artist: "Niki", 
        src: "songs/Niki.mp3" 
    },
    { 
        title: "flowers in spring", 
        artist: "Constance Shim", 
        src: "songs/Flower.mp3" 
    },
    { 
        title: "Soft spot", 
        artist: "keshi", 
        src: "songs/Soft.mp3" 
    },
    { 
        title: "her", 
        artist: "JVKE", 
        src: "songs/Her.mp3" 
    },
    { 
        title: "Once then we'll be free", 
        artist: "Wisp", 
        src: "songs/Wisp.mp3" 
    }
    // Add all your songs here!
];

let currentTrackIndex = 0; // Start at the first song (index 0)


/**
 * Function to load a specific track from the playlist array, handling wrap-around logic.
 * @param {number} index - The index of the track to load.
 */
function loadTrack(index) {
    const audio = document.getElementById('background-audio');
    const trackTitleSpan = document.querySelector('.track-title');
    const trackNumberSpan = document.getElementById('track-number');
    const playPauseBtn = document.getElementById('play-pause-btn');

    // Handle wrap-around for index (Ensures continuous playlist looping)
    if (index < 0) {
        currentTrackIndex = playlist.length - 1; // Wrap to the last song
    } else if (index >= playlist.length) {
        currentTrackIndex = 0; // Wrap to the first song
    } else {
        currentTrackIndex = index;
    }

    const currentTrack = playlist[currentTrackIndex];
    audio.src = currentTrack.src;
    
    // Reset play state and load the new source
    audio.load();
    
    // Update the display information
    trackTitleSpan.textContent = `♪ "${currentTrack.title}" by [${currentTrack.artist}]`;
    trackNumberSpan.textContent = `Track ${currentTrackIndex + 1} / ${playlist.length}`;

    // Set play character until the user initiates playback
    playPauseBtn.textContent = '►'; // Use the play character
}


/**
 * Initialize the Intersection Observer for the scroll animation (Fade-in/Fade-out).
 */
function setupScrollAnimation() {
    const memoryCards = document.querySelectorAll('.memory-card');

    const observerOptions = {
        root: null, 
        rootMargin: '0px',
        threshold: 0.1 
    };

    const observerCallback = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('show');
            } else {
                entry.target.classList.remove('show');
            }
        });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    memoryCards.forEach(card => {
        observer.observe(card);
    });
}

/**
 * Manages the Play/Pause, Next/Previous buttons, VOLUME control, and updates the time display on the playlist bar.
 * Includes continuous track looping and Autoplay logic.
 */
function setupPlaylistControls() {
    const audio = document.getElementById('background-audio');
    const playPauseBtn = document.getElementById('play-pause-btn');
    const nextBtn = document.getElementById('next-btn'); 
    const prevBtn = document.getElementById('prev-btn'); 
    const currentTimeSpan = document.getElementById('current-time');
    const durationSpan = document.getElementById('duration');
    const volumeSlider = document.getElementById('volume-slider'); 
    
    // Flag to track if the music has successfully started
    let isAutoplayAttempted = false;

    // --- Time Formatting Helper ---
    const formatTime = (time) => {
        if (!isFinite(time) || time < 0) return '0:00';
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60).toString().padStart(2, '0');
        return `${minutes}:${seconds}`;
    };
    
    // Function to start playback and update the UI
    const startPlayback = () => {
        // Prevent re-attempting if it's already playing
        if (!audio.paused) return; 

        audio.play().then(() => {
            // Success: Change to PAUSE character
            playPauseBtn.textContent = '❚ ❚'; 
        }).catch(e => {
            // Failure is expected if no user gesture was detected yet
            console.warn('Playback blocked. Waiting for user interaction.');
            playPauseBtn.textContent = '►'; // Ensure it shows the PLAY character
        });
    };

    // ============================================================
    // NEW CODE: CHECK URL FOR TRACK NUMBER (e.g., notes.html?track=4)
    // ============================================================
    const urlParams = new URLSearchParams(window.location.search);
    const trackParam = urlParams.get('track');

    // If a track number was found in the URL, use it. Otherwise, use 0.
    if (trackParam !== null) {
        currentTrackIndex = parseInt(trackParam, 10);
    }
    // ============================================================

    // --- Initial Load & Autoplay Attempt ---
    loadTrack(currentTrackIndex); 
    
    // Listen for metadata to be loaded, then attempt to play
    audio.addEventListener('loadedmetadata', () => {
        durationSpan.textContent = formatTime(audio.duration);
        if (!isAutoplayAttempted) {
            startPlayback();
            isAutoplayAttempted = true; // Mark attempt
        }
    });

    // --- Fallback Listener: Start music on the very first user interaction (like a click) ---
    const firstInteractionListener = () => {
        // Only trigger if audio is currently paused
        if (audio.paused) {
            startPlayback();
        }
        // Remove this listener once triggered
        document.removeEventListener('click', firstInteractionListener);
        document.removeEventListener('touchend', firstInteractionListener);
    };

    // Add listeners to the entire document (using 'click' and 'touchend' for mobile)
    document.addEventListener('click', firstInteractionListener);
    document.addEventListener('touchend', firstInteractionListener);


    // --- Play/Pause Logic (UPDATED CHARACTERS) ---
    playPauseBtn.addEventListener('click', () => {
        // This click counts as user interaction, so we remove the fallback listener if it hasn't fired yet
        document.removeEventListener('click', firstInteractionListener);
        document.removeEventListener('touchend', firstInteractionListener);

        if (audio.paused) {
            startPlayback();
        } else {
            audio.pause();
            // Change to PLAY character
            playPauseBtn.textContent = '►'; 
        }
    });

    // --- Next/Previous Logic ---
    const switchTrackAndPlay = (newIndex) => {
        const wasPlaying = !audio.paused;
        loadTrack(newIndex); // Handles the wrap-around logic
        if (wasPlaying) {
            startPlayback();
        }
    };
    
    nextBtn.addEventListener('click', () => switchTrackAndPlay(currentTrackIndex + 1));
    prevBtn.addEventListener('click', () => switchTrackAndPlay(currentTrackIndex - 1));
    
    // --- Auto-advance when track ends (CONTINUOUS LOOPING) ---
    audio.addEventListener('ended', () => {
        // Automatically move to the next track and play
        switchTrackAndPlay(currentTrackIndex + 1);
    });

    // --- Volume Control Logic ---
    audio.volume = parseFloat(volumeSlider.value); 
    volumeSlider.addEventListener('input', (e) => {
        audio.volume = parseFloat(e.target.value);
    });

    // --- Time Update Logic ---
    audio.addEventListener('timeupdate', () => {
        currentTimeSpan.textContent = formatTime(audio.currentTime);
    });
    
    // Initial display setup (for cases where metadata loads very fast)
    if (audio.readyState >= 1) {
        durationSpan.textContent = formatTime(audio.duration || 0);
    }
}

/**
 * Handles video interactions: Sets default volume to 30% but NO LONGER PAUSES BGM
 * when a video is un-muted. BGM will continue playing over the video audio.
 * This works for all videos with the class '.local-video-player'.
 */
function setupVideoInteractions() {
    const videoPlayers = document.querySelectorAll('.local-video-player');
    
    videoPlayers.forEach(player => {
        // 1. Set the default volume to 30% (0.3)
        player.volume = 0.3; 

        // 2. No listeners here to control the background music.
    });
}


// Run all initializations when the page is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    setupScrollAnimation();
    setupPlaylistControls();
    setupVideoInteractions(); 
});