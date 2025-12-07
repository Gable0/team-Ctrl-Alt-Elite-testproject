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
  }

  /**
   * Initializes the persistent audio element and navigation interception.
   * Safe to call multiple times – everything is idempotent.
   */
  init() {
    // Create audio element if it doesn't exist
    if (!this.audio) {
      this.audio = document.createElement("audio");
      this.audio.id = "persistent-intro-audio";
      this.audio.loop = true;
      this.audio.preload = "auto";

      const source = document.createElement("source");
      source.src = "assets/sounds/reg game sounds/intro.wav";
      source.type = "audio/wav";

      this.audio.appendChild(source);
      document.body.appendChild(this.audio);
    }

    // Only start audio if not manually stopped
    if (!this.manuallyStopped) {
      this.start();

      // Fallback for autoplay restrictions – but only if not manually stopped
      const interactionEvents = [
        "click",
        "touchstart",
        "mouseenter",
        "keydown",
      ];
      interactionEvents.forEach((eventType) => {
        document.addEventListener(
          eventType,
          () => {
            if (!this.manuallyStopped) {
              this.start();
            }
          },
          { once: true, passive: true },
        );
      });
    }

    // Intercept navigation to prevent page reloads
    this.interceptNavigation();
  }

  /**
   * Starts (or resumes) playback of the persistent intro music.
   * Handles autoplay policy gracefully.
   */
  start() {
    if (this.started) return;

    this.audio.volume = 0;
    this.audio.currentTime = 25;
    this.audio.playbackRate = 0.9;

    this.audio
      .play()
      .then(() => {
        console.log("Persistent audio started");
        this.started = true;
        this.fadeIn();
      })
      .catch((error) => {
        console.log("Audio autoplay blocked:", error.message);
      });
  }

  /**
   * Performs a smooth fade-in of the background music over approximately 1.5 seconds.
   */
  fadeIn() {
    if (this.fadingIn) return;
    this.fadingIn = true;

    const fadeInDuration = 1500;
    const fadeInSteps = 50;
    const volumeIncrement = 1 / fadeInSteps;
    const stepDuration = fadeInDuration / fadeInSteps;

    let currentStep = 0;
    const fadeInInterval = setInterval(() => {
      currentStep++;
      this.audio.volume = Math.min(currentStep * volumeIncrement, 1);

      if (currentStep >= fadeInSteps) {
        clearInterval(fadeInInterval);
        this.audio.volume = 1;
        this.fadingIn = false;
      }
    }, stepDuration);
  }

  /**
   * Stops the music completely and marks it as manually stopped.
   * Subsequent page loads will respect this choice and not auto-play.
   */
  stop() {
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
      this.audio.volume = 0;
      this.started = false;
      this.fadingIn = false;
      this.manuallyStopped = true; // Mark as manually stopped
      console.log("Persistent audio stopped and muted");
    }
  }

  /**
   * Intercepts internal navigation (links/buttons that point to .html pages)
   * and performs client-side page loading to keep the audio element alive.
   */
  interceptNavigation() {
    if (this.navigationIntercepted) return;
    this.navigationIntercepted = true;

    // Intercept all link clicks
    document.addEventListener(
      "click",
      (e) => {
        const link = e.target.closest("a");
        if (link && link.href) {
          const url = new URL(link.href);
          if (
            url.origin === window.location.origin &&
            url.pathname.endsWith(".html")
          ) {
            e.preventDefault();
            this.navigateTo(url.pathname);
          }
        }
      },
      true,
    );

    // Intercept button clicks that set location.href
    document.addEventListener(
      "click",
      (e) => {
        const button = e.target.closest("button");
        if (button) {
          // Check onclick attribute
          const onclickAttr = button.getAttribute("onclick");
          if (onclickAttr && onclickAttr.includes("location.href")) {
            const match = onclickAttr.match(
              /location\.href\s*=\s*['"]([^'"]+)['"]/,
            );
            if (match && match[1].endsWith(".html")) {
              e.preventDefault();
              e.stopPropagation();
              button.onclick = null; // Remove original handler
              this.navigateTo(match[1]);
              return;
            }
          }

          // Check if button has onclick function
          if (button.onclick) {
            const onclickStr = button.onclick.toString();
            if (onclickStr.includes("location.href")) {
              const match = onclickStr.match(
                /location\.href\s*=\s*['"]([^'"]+)['"]/,
              );
              if (match && match[1].endsWith(".html")) {
                e.preventDefault();
                e.stopPropagation();
                this.navigateTo(match[1]);
                return;
              }
            }
          }
        }
      },
      true,
    );

    // Handle browser back/forward
    window.addEventListener("popstate", (e) => {
      this.loadPage(window.location.pathname);
    });

    // Push initial state
    if (!window.history.state) {
      window.history.replaceState(
        { path: window.location.pathname },
        "",
        window.location.pathname,
      );
    }
  }

  /**
   * Navigates to a new internal page without a full reload.
   *
   * @param {string} path - Destination pathname (e.g. "/shop.html")
   */
  async navigateTo(path) {
    window.history.pushState({ path: path }, "", path);
    await this.loadPage(path);
  }

  /**
   * Loads a new page via fetch, replaces body content while preserving the audio element,
   * and re-executes scripts from the new page.
   *
   * @param {string} path - The page to load
   */
  async loadPage(path) {
    try {
      const response = await fetch(path);
      const html = await response.text();

      // Parse HTML
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");

      // Replace body content (keep our audio element)
      const newBodyContent = doc.body.innerHTML;

      // Save audio element
      const audioElement = this.audio;

      // Replace body
      document.body.innerHTML = newBodyContent;

      // Restore audio element
      document.body.appendChild(audioElement);

      // Update title
      document.title = doc.title;

      // Execute scripts from new page
      const scripts = doc.querySelectorAll("script");
      for (const oldScript of scripts) {
        const newScript = document.createElement("script");

        if (oldScript.src) {
          newScript.src = oldScript.src;
        } else {
          newScript.textContent = oldScript.textContent;
        }

        if (oldScript.type) {
          newScript.type = oldScript.type;
        }

        document.body.appendChild(newScript);

        // Wait for module scripts to load
        if (oldScript.type === "module") {
          await new Promise((resolve) => {
            newScript.onload = resolve;
            newScript.onerror = resolve;
          });
        }
      }

      // Re-intercept navigation on new page
      this.interceptNavigation();

      console.log("Page loaded:", path);
    } catch (error) {
      console.error("Error loading page:", error);
    }
  }

  /**
   * Sets the volume of the persistent background music.
   *
   * @param {number} volume - Value between 0 and 1
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
if (typeof window !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => persistentAudio.init());
  } else {
    persistentAudio.init();
  }
}
