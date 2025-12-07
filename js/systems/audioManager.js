// js/systems/audioManager.js
// Central audio system – handles SFX, music, fun-mode toggle and volume control.

class AudioManager {
  constructor() {
    /** @type {Object<string, HTMLAudioElement>} */
    this.sounds = {};
    /** @type {boolean} */
    this.enabled = true;
    /** @type {number} Master volume for sound effects (0–1) */
    this.volume = 0.5;
    /** @type {number} Volume for background music (0–1) */
    this.musicVolume = 0.3;
    /** @type {HTMLAudioElement|null} Currently playing music track */
    this.currentMusic = null;

    // Load fun-mode preference once at startup
    const savedFunMode = localStorage.getItem("funMode");
    /** @type {boolean} */
    this.funMode = savedFunMode === "true";
    console.log(`AudioManager initialized - Fun mode: ${this.funMode}`);
  }

  /**
   * Loads an audio file into the manager.
   *
   * @param {string} name      Unique identifier for the sound.
   * @param {string} path      Relative or absolute URL to the audio file.
   * @param {boolean} [isMusic=false] If true the sound will loop and use musicVolume.
   */
  loadSound(name, path, isMusic = false) {
    try {
      console.log(`Loading sound: ${name} from ${path}`);
      const audio = new Audio(path);
      audio.preload = "auto";
      audio.volume = isMusic ? this.musicVolume : this.volume;

      if (isMusic) {
        audio.loop = true;
      }

      this.sounds[name] = audio;
    } catch (error) {
      console.error(`Failed to load sound: ${name}`, error);
    }
  }

  /**
   * Plays a sound effect (clones the source to allow overlapping playback).
   *
   * @param {string} name Identifier of the sound to play.
   */
  playSound(name) {
    if (!this.enabled) {
      console.log("Audio is disabled");
      return;
    }

    if (!this.sounds[name]) {
      console.warn(`Sound not found: ${name}`);
      console.log("Available sounds:", Object.keys(this.sounds));
      return;
    }

    console.log(`Playing sound: ${name}`);

    try {
      const sound = this.sounds[name].cloneNode();
      sound.volume = this.volume;
      sound
        .play()
        .then(() => console.log(`Successfully played: ${name}`))
        .catch((err) => console.warn(`Failed to play: ${name}`, err));
    } catch (error) {
      console.error(`Error playing sound: ${name}`, error);
    }
  }

  /**
   * Starts playback of a music track (stops any currently playing music first).
   *
   * @param {string} name Identifier of the music track.
   */
  playMusic(name) {
    if (!this.enabled) {
      console.log("Audio is disabled");
      return;
    }

    if (!this.sounds[name]) {
      console.warn(`Music not found: ${name}`);
      return;
    }

    this.stopMusic();

    console.log(`Playing music: ${name}`);

    try {
      this.currentMusic = this.sounds[name];
      this.currentMusic.currentTime = 0;
      this.currentMusic.volume = this.musicVolume;
      this.currentMusic
        .play()
        .then(() => console.log(`Successfully started music: ${name}`))
        .catch((err) => console.warn(`Failed to play music: ${name}`, err));
    } catch (error) {
      console.error(`Error playing music: ${name}`, error);
    }
  }

  /** Stops the currently playing music (if any). */
  stopMusic() {
    if (this.currentMusic) {
      console.log("Stopping current music");
      this.currentMusic.pause();
      this.currentMusic.currentTime = 0;
      this.currentMusic = null;
    }
  }

  /** Plays the appropriate shoot sound – uses "chloe-shoot" when fun mode is active. */
  playShootSound() {
    // Re-read fun mode from storage each shot (in case it changed via settings)
    const currentFunMode = localStorage.getItem("funMode") === "true";
    this.funMode = currentFunMode;

    const soundName = this.funMode ? "chloe-shoot" : "shoot";
    console.log(
      `Playing shoot sound: ${soundName} (fun mode: ${this.funMode})`,
    );
    this.playSound(soundName);
  }

  /** Plays the enemy kill sound effect. */
  playKillEnemySound() {
    this.playSound("kill-enemy");
  }

  /** Plays the game-over sound effect and stops any background music. */
  playGameOverSound() {
    this.stopMusic();
    this.playSound("game-over");
  }

  /** Plays the start-game sound effect and stops any intro music. */
  playStartGameSound() {
    this.stopMusic();
    this.playSound("start-game");
  }

  /**
   * Enables or disables fun mode (Chloe shooting sound).
   *
   * @param {boolean} enabled
   */
  setFunMode(enabled) {
    this.funMode = enabled;
    localStorage.setItem("funMode", String(enabled));
    console.log(`Fun mode ${enabled ? "ENABLED" : "DISABLED"}`);
  }

  /** @returns {boolean} Current fun-mode state (reads from localStorage). */
  getFunMode() {
    const saved = localStorage.getItem("funMode") === "true";
    this.funMode = saved;
    return this.funMode;
  }

  /**
   * Sets master volume for sound effects.
   *
   * @param {number} volume Value between 0 and 1.
   */
  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
    console.log(`Volume set to: ${this.volume}`);
  }

  /**
   * Sets volume for background music.
   *
   * @param {number} volume Value between 0 and 1.
   */
  setMusicVolume(volume) {
    this.musicVolume = Math.max(0, Math.min(1, volume));
    if (this.currentMusic) {
      this.currentMusic.volume = this.musicVolume;
    }
    console.log(`Music volume set to: ${this.musicVolume}`);
  }
}

/** Singleton instance used throughout the game. */
export const audioManager = new AudioManager();

/**
 * Initializes all game audio assets.
 * Called once at game startup (e.g. from gameLoop.js).
 */
export function initAudio() {
  console.log("Initializing audio...");

  // Sound effects
  audioManager.loadSound("shoot", "assets/sounds/reg game sounds/shoot.wav");
  audioManager.loadSound("chloe-shoot", "assets/sounds/Chloe-shooting.wav");
  audioManager.loadSound(
    "kill-enemy",
    "assets/sounds/reg game sounds/kill-enemy.wav",
  );
  audioManager.loadSound(
    "game-over",
    "assets/sounds/reg game sounds/game-over.wav",
  );
  audioManager.loadSound(
    "start-game",
    "assets/sounds/reg game sounds/start-game.wav",
  );

  // Background music (looped)
  audioManager.loadSound(
    "intro",
    "assets/sounds/reg game sounds/intro.wav",
    true,
  );

  console.log(`Audio initialized with fun mode: ${audioManager.getFunMode()}`);
}

/** Placeholder – not currently used (intro music is handled by persistentAudio.js). */
export function playBackgroundGameMusic() {
  audioManager.playMusic("background-game");
}

/** Legacy helper – kept for compatibility, but intro music is now managed by persistentAudio.js. */
export function playIntroMusic() {
  audioManager.playMusic("intro");
}
