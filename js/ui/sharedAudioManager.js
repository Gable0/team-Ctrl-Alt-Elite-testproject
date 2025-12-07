// js/ui/sharedAudioManager.js
// Manages persistent background music across page navigations

let audioInitialized = false;
let globalAudioElement = null;

export function initSharedAudio() {
    // If already initialized, just return the existing audio element
    if (audioInitialized && globalAudioElement && !globalAudioElement.paused) {
        return globalAudioElement;
    }

    const introAudio = document.getElementById('intro-audio');
    if (!introAudio) return;

    globalAudioElement = introAudio;
    let audioStarted = false;

    function startIntroAudio() {
        if (!audioStarted) {
            // Get saved time from localStorage, default to 25 seconds
            const savedTime = parseFloat(localStorage.getItem('introAudioTime')) || 25;
            
            introAudio.volume = 0;
            introAudio.currentTime = savedTime;
            introAudio.playbackRate = 0.90;
            
            introAudio.play().then(() => {
                audioStarted = true;
                audioInitialized = true;
                
                // Fade in
                const fadeInDuration = 1500;
                const fadeInSteps = 50;
                const volumeIncrement = 1 / fadeInSteps;
                const stepDuration = fadeInDuration / fadeInSteps;

                let currentStep = 0;
                const fadeInInterval = setInterval(() => {
                    currentStep++;
                    introAudio.volume = Math.min(currentStep * volumeIncrement, 1);

                    if (currentStep >= fadeInSteps) {
                        clearInterval(fadeInInterval);
                        introAudio.volume = 1;
                    }
                }, stepDuration);
            }).catch(error => {
                console.log('Audio play failed:', error);
            });
        }
    }

    // Save current time periodically (only set up once)
    if (!audioInitialized) {
        setInterval(() => {
            if (introAudio && !introAudio.paused) {
                localStorage.setItem('introAudioTime', introAudio.currentTime.toString());
            }
        }, 500);
    }

    // Try to play immediately
    startIntroAudio();

    // Fallback for autoplay blocking
    const interactionEvents = ['click', 'touchstart', 'mouseenter', 'keydown'];
    interactionEvents.forEach(eventType => {
        document.body.addEventListener(eventType, startIntroAudio, { once: true, passive: true });
    });

    return introAudio;
}