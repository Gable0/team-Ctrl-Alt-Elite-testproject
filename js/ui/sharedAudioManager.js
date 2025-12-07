// js/ui/sharedAudioManager.js
// Manages persistent background music across page navigations using the existing #intro-audio element.
// Persists playback position in localStorage and handles autoplay-policy fallbacks.

let audioInitialized = false;
let globalAudioElement = null;

/**
 * Initializes (or re-uses) the shared intro music element and starts playback.
 * Restores the last saved playback position and fades the music in smoothly.
 *
 * @returns {HTMLAudioElement|null} The audio element being used (or null if not found).
 */
export function initSharedAudio() {
  // Return early if music is already playing
  if (audioInitialized && globalAudioElement && !globalAudioElement.paused) {
    return globalAudioElement;
  }

  const introAudio = document.getElementById("intro-audio");
  if (!introAudio) return null;

  globalAudioElement = introAudio;
  let audioStarted = false;

  /**
   * Starts/resumes playback with a gentle fade-in.
   * Uses a saved timestamp from localStorage so the track continues where it left off.
   */
  function startIntroAudio() {
    if (audioStarted) return;

    const savedTime = parseFloat(localStorage.getItem("introAudioTime")) || 25;

    introAudio.volume = 0;
    introAudio.currentTime = savedTime;
    introAudio.playbackRate = 0.9;

    introAudio
      .play()
      .then(() => {
        audioStarted = true;
        audioInitialized = true;

        // Fade-in over ~1.5 seconds
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
      })
      .catch((error) => {
        console.log("Audio play failed (autoplay blocked?):", error);
      });
  }

  // Persist current playback position every 500 ms (only set up once)
  if (!audioInitialized) {
    setInterval(() => {
      if (introAudio && !introAudio.paused) {
        localStorage.setItem(
          "introAudioTime",
          introAudio.currentTime.toString(),
        );
      }
    }, 500);
  }

  // Attempt immediate playback
  startIntroAudio();

  // Fallback: start on first user interaction (covers browsers that block autoplay)
  const interactionEvents = ["click", "touchstart", "mouseenter", "keydown"];
  interactionEvents.forEach((eventType) => {
    document.body.addEventListener(eventType, startIntroAudio, {
      once: true,
      passive: true,
    });
  });

  return introAudio;
}
