// js/core/persistentAudio.js
// Separation of Concerns: Handles persistent background music AND navigation interception
// Provides a singleton that survives page navigation, keeps intro music playing,
// and enables SPA-style navigation without full reloads.

/**
 * Singleton manager that keeps the intro music playing across page navigations
 * and intercepts internal link clicks to perform client-side routing.
 */

class PersistentAudioManager {
  constructor() {
    /** @type {HTMLAudioElement|null} */
    this.audio = null;
    /** @type {boolean} */
    this.started = false;
    /** @type {boolean} */
    this.fadingIn = false;
    /** @type {boolean} */
    this.navigationIntercepted = false;
    /** @type {boolean} */
    this.manuallyStopped = false;
    /** @type {boolean} */
    this.unmuted = false;
  }

  /**
   * Initializes the persistent audio element and navigation interception.
   */
  init() {
    // Create audio element if it doesn't exist
    if (!this.audio) {
      this.audio = document.createElement('audio');
      this.audio.id = 'persistent-intro-audio';
      this.audio.loop = true;
      this.audio.preload = 'auto';
      // FIREFOX FIX: Start muted to bypass autoplay restrictions
      this.audio.muted = true;

      const source = document.createElement('source');
      source.src = 'assets/sounds/reg game sounds/intro.wav';
      source.type = 'audio/wav';

      this.audio.appendChild(source);
      document.body.appendChild(this.audio);

      console.log('🎵 Persistent audio element created (starting muted)');
    }

    // FIREFOX FIX: Start playing immediately while muted (this is allowed)
    if (!this.manuallyStopped) {
      this.startMuted();
      this.setupUnmuteListener();
    }

    // Intercept navigation to prevent page reloads
    this.interceptNavigation();
  }

  /**
   * FIREFOX FIX: Starts playback while muted (always works)
   */
  startMuted() {
    if (this.started) return;

    this.audio.currentTime = 25;
    this.audio.playbackRate = 0.9;
    this.audio.volume = 1; // Set volume but keep muted
    this.audio.muted = true;

    const playPromise = this.audio.play();

    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          this.started = true;
          console.log(
            '✅ Audio playing (muted) - waiting for user interaction to unmute'
          );
        })
        .catch(error => {
          console.warn('⚠️ Even muted playback failed:', error);
          // Retry on next interaction
          this.setupUnmuteListener();
        });
    }
  }

  /**
   * FIREFOX FIX: Unmutes audio on first user interaction
   */
  setupUnmuteListener() {
    const interactionEvents = ['click', 'touchstart', 'keydown', 'mousedown'];

    const unmuteOnce = () => {
      if (!this.unmuted && this.audio) {
        console.log('👆 User interaction detected - unmuting audio');

        // If audio hasn't started yet, start it now
        if (!this.started) {
          this.startMuted();
        }

        // Unmute and fade in
        setTimeout(() => {
          if (this.audio && !this.manuallyStopped) {
            this.audio.muted = false;
            this.unmuted = true;
            this.fadeIn();
          }
        }, 50);
      }
    };

    interactionEvents.forEach(eventType => {
      document.addEventListener(eventType, unmuteOnce, {
        once: true,
        passive: true,
        capture: true,
      });
    });
  }

  /**
   * Performs a smooth fade-in of the background music.
   */
  fadeIn() {
    if (this.fadingIn || !this.audio) return;
    this.fadingIn = true;

    // Start from 0 and fade to full volume
    this.audio.volume = 0;

    const fadeDuration = 2000;
    const fadeSteps = 50;
    const targetVolume = 1;
    const volumeIncrement = targetVolume / fadeSteps;
    const stepDuration = fadeDuration / fadeSteps;

    let currentStep = 0;
    const fadeInInterval = setInterval(() => {
      if (!this.audio || this.manuallyStopped) {
        clearInterval(fadeInInterval);
        return;
      }

      currentStep++;
      this.audio.volume = Math.min(currentStep * volumeIncrement, targetVolume);

      if (currentStep >= fadeSteps) {
        clearInterval(fadeInInterval);
        this.audio.volume = targetVolume;
        this.fadingIn = false;
        console.log('✅ Audio fade-in complete');
      }
    }, stepDuration);
  }

  /**
   * Stops the music completely.
   */
  stop() {
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
      this.audio.volume = 0;
      this.audio.muted = true;
      this.started = false;
      this.fadingIn = false;
      this.unmuted = false;
      this.manuallyStopped = true;
      console.log('🛑 Persistent audio stopped');
    }
  }

  /**
   * Resumes audio (used when coming back from game)
   */
  resume() {
    this.manuallyStopped = false;
    this.started = false;
    this.unmuted = false;
    this.init();
  }

  /**
   * Intercepts internal navigation to keep audio alive.
   */
  interceptNavigation() {
    if (this.navigationIntercepted) return;
    this.navigationIntercepted = true;

    // Intercept all link clicks
    document.addEventListener(
      'click',
      e => {
        const link = e.target.closest('a');
        if (link && link.href) {
          const url = new URL(link.href);
          if (
            url.origin === window.location.origin &&
            url.pathname.endsWith('.html')
          ) {
            e.preventDefault();
            this.navigateTo(url.pathname);
          }
        }
      },
      true
    );

    // Intercept button clicks with location.href
    document.addEventListener(
      'click',
      e => {
        const button = e.target.closest('button');
        if (button) {
          const onclickAttr = button.getAttribute('onclick');
          if (onclickAttr && onclickAttr.includes('location.href')) {
            const match = onclickAttr.match(
              /location\.href\s*=\s*['"]([^'"]+)['"]/
            );
            if (match && match[1].endsWith('.html')) {
              e.preventDefault();
              e.stopPropagation();
              button.onclick = null;
              this.navigateTo(match[1]);
              return;
            }
          }

          if (button.onclick) {
            const onclickStr = button.onclick.toString();
            if (onclickStr.includes('location.href')) {
              const match = onclickStr.match(
                /location\.href\s*=\s*['"]([^'"]+)['"]/
              );
              if (match && match[1].endsWith('.html')) {
                e.preventDefault();
                e.stopPropagation();
                this.navigateTo(match[1]);
                return;
              }
            }
          }
        }
      },
      true
    );

    // Handle browser back/forward
    window.addEventListener('popstate', () => {
      this.loadPage(window.location.pathname);
    });

    // Push initial state
    if (!window.history.state) {
      window.history.replaceState(
        { path: window.location.pathname },
        '',
        window.location.pathname
      );
    }
  }

  /**
   * Navigates to a new page without reload.
   */
  async navigateTo(path) {
    window.history.pushState({ path: path }, '', path);
    await this.loadPage(path);
  }

  /**
   * Loads a new page via fetch.
   */
  async loadPage(path) {
    try {
      const response = await fetch(path);
      const html = await response.text();

      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      const newBodyContent = doc.body.innerHTML;

      // Save audio element
      const audioElement = this.audio;

      // Replace body
      document.body.innerHTML = newBodyContent;

      // Restore audio element
      if (audioElement) {
        document.body.appendChild(audioElement);
      }

      // Update title
      document.title = doc.title;

      // Execute scripts from new page
      const scripts = doc.querySelectorAll('script');
      for (const oldScript of scripts) {
        const newScript = document.createElement('script');

        if (oldScript.src) {
          newScript.src = oldScript.src;
        } else {
          newScript.textContent = oldScript.textContent;
        }

        if (oldScript.type) {
          newScript.type = oldScript.type;
        }

        // CRITICAL FIX: Append the script and wait for it to load
        document.body.appendChild(newScript);

        // Wait for module scripts to fully load before continuing
        if (oldScript.type === 'module' || oldScript.src) {
          await new Promise(resolve => {
            if (oldScript.src) {
              newScript.onload = resolve;
              newScript.onerror = resolve;
            } else {
              // Inline module scripts execute immediately but we need a small delay
              setTimeout(resolve, 10);
            }
          });
        }
      }

      // Re-intercept navigation on new page
      this.interceptNavigation();

      console.log('📄 Page loaded:', path);
    } catch (error) {
      console.error('❌ Error loading page:', error);
    }
  }

  /**
   * Sets the volume.
   */
  setVolume(volume) {
    if (this.audio) {
      this.audio.volume = Math.max(0, Math.min(1, volume));
    }
  }
}

// Create singleton instance
export const persistentAudio = new PersistentAudioManager();

// Auto-initialize when the DOM is ready
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => persistentAudio.init());
  } else {
    persistentAudio.init();
  }
}
