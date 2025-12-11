// js/systems/audioManager.js
// Central audio system – handles SFX, music, and volume control.
import { persistentAudio } from '../core/persistentAudio.js';

class AudioManager {
  constructor() {
    /** @type {Object<string, HTMLAudioElement>} */
    this.sounds = {};
    /** @type {boolean} */
    this.enabled = true;
    /** @type {number} Master volume for sound effects (0–1) */
    this.volume = parseFloat(localStorage.getItem('sfxVolume'));
    if (isNaN(this.volume)) this.volume = 0.5;
    /** @type {number} Volume for background music (0–1) */
    this.musicVolume = parseFloat(localStorage.getItem('musicVolume'));
    if (isNaN(this.musicVolume)) this.musicVolume = 0.5;
    /** @type {HTMLAudioElement|null} Currently playing music track */
    this.currentMusic = null;
    /** @type {string|null} Name of currently playing music */
    this.currentMusicName = null;
    /** @type {number|null} Active fade interval ID */
    this.fadeInterval = null;
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
      audio.preload = 'auto';
      audio.volume = isMusic ? this.musicVolume : this.volume;

      if (isMusic) {
        audio.loop = true;
      }

      // Add event listeners to track loading
      audio.addEventListener('canplaythrough', () => {
        console.log(`✓ Successfully loaded: ${name}`);
      });

      audio.addEventListener('error', e => {
        console.error(`✗ Failed to load: ${name}`, e);
      });

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
      console.log('Audio is disabled');
      return;
    }

    if (!this.sounds[name]) {
      console.warn(`Sound not found: ${name}`);
      console.log('Available sounds:', Object.keys(this.sounds));
      return;
    }

    console.log(`Playing sound: ${name}`);

    try {
      const sound = this.sounds[name].cloneNode();
      sound.volume = this.volume;
      sound
        .play()
        .then(() => console.log(`Successfully played: ${name}`))
        .catch(err => console.warn(`Failed to play: ${name}`, err));
    } catch (error) {
      console.error(`Error playing sound: ${name}`, error);
    }
  }

  /**
   * Starts playback of a music track (stops any currently playing music first).
   *
   * @param {string} name Identifier of the music track.
   * @param {boolean} [fade=false] Whether to fade in the music.
   */
  playMusic(name, fade = false) {
    if (!this.enabled) {
      console.log('Audio is disabled');
      return;
    }

    if (!this.sounds[name]) {
      console.error(`❌ Music not found: ${name}`);
      console.log('Available music tracks:', Object.keys(this.sounds));
      return;
    }

    // Don't restart if already playing this track
    if (
      this.currentMusicName === name &&
      this.currentMusic &&
      !this.currentMusic.paused
    ) {
      console.log(`Music ${name} is already playing`);
      return;
    }

    this.stopMusic();

    console.log(`🎵 Starting music: ${name}${fade ? ' (with fade-in)' : ''}`);

    try {
      this.currentMusic = this.sounds[name];
      this.currentMusicName = name;
      this.currentMusic.currentTime = 0;

      if (fade) {
        // Start at volume 0 and fade in
        this.currentMusic.volume = 0;
        this.currentMusic
          .play()
          .then(() => {
            console.log(`✓ Successfully started music: ${name}`);
            this.fadeIn();
          })
          .catch(err => {
            console.error(`✗ Failed to play music: ${name}`, err);
            console.log(
              'This might be due to autoplay restrictions. Try interacting with the page.'
            );
          });
      } else {
        // Normal playback at full volume
        this.currentMusic.volume = this.musicVolume;
        this.currentMusic
          .play()
          .then(() => console.log(`✓ Successfully started music: ${name}`))
          .catch(err => {
            console.error(`✗ Failed to play music: ${name}`, err);
            console.log(
              'This might be due to autoplay restrictions. Try interacting with the page.'
            );
          });
      }
    } catch (error) {
      console.error(`Error playing music: ${name}`, error);
    }
  }

  /**
   * Fades in the currently playing music over 2 seconds.
   */
  fadeIn() {
    if (!this.currentMusic) return;

    // Clear any existing fade
    if (this.fadeInterval) {
      clearInterval(this.fadeInterval);
    }

    const fadeDuration = 2000; // 2 seconds
    const fadeSteps = 50;
    const volumeIncrement = this.musicVolume / fadeSteps;
    const stepDuration = fadeDuration / fadeSteps;

    let currentStep = 0;
    this.fadeInterval = setInterval(() => {
      if (!this.currentMusic) {
        clearInterval(this.fadeInterval);
        return;
      }

      currentStep++;
      this.currentMusic.volume = Math.min(
        currentStep * volumeIncrement,
        this.musicVolume
      );

      if (currentStep >= fadeSteps) {
        clearInterval(this.fadeInterval);
        this.currentMusic.volume = this.musicVolume;
        this.fadeInterval = null;
        console.log('✓ Fade-in complete');
      }
    }, stepDuration);
  }

  /** Stops the currently playing music (if any). */
  stopMusic() {
    if (this.fadeInterval) {
      clearInterval(this.fadeInterval);
      this.fadeInterval = null;
    }

    if (this.currentMusic) {
      console.log(`🛑 Stopping current music: ${this.currentMusicName}`);
      this.currentMusic.pause();
      this.currentMusic.currentTime = 0;
      this.currentMusic = null;
      this.currentMusicName = null;
    }
  }

  /**
   * Plays level-appropriate background music based on current level.
   *
   * @param {number} level - Current game level
   * @param {boolean} [fade=false] - Whether to fade in the music
   */
  playLevelMusic(level, fade = false) {
    let musicName;

    if (level >= 1 && level <= 2) {
      musicName = 'background-music-1-2';
    } else if (level >= 3 && level <= 4) {
      musicName = 'background-music-3-4';
    } else {
      musicName = 'background-music-5';
    }

    console.log(`🎮 Level ${level} → Playing: ${musicName}`);
    this.playMusic(musicName, fade);
  }

  /** Plays the game over background music */
  playGameOverMusic() {
    console.log('💀 Playing game over background music');
    this.playMusic('game-over-background');
  }

  /** Plays the player shoot sound effect. */
  playShootSound() {
    this.playSound('player-shoot');
  }

  /** Plays the enemy kill sound effect. */
  playKillEnemySound() {
    if (!this.enabled) {
      console.log('Audio is disabled');
      return;
    }

    if (!this.sounds['kill-enemy']) {
      console.warn('Sound not found: kill-enemy');
      return;
    }

    console.log('Playing sound: kill-enemy');

    try {
      const sound = this.sounds['kill-enemy'].cloneNode();
      sound.volume = this.volume;

      sound
        .play()
        .then(() => {
          console.log('Successfully played: kill-enemy');
        })
        .catch(err => console.warn('Failed to play: kill-enemy', err));
    } catch (error) {
      console.error('Error playing sound: kill-enemy', error);
    }
  }

  /** Plays the laser hits player sound effect. */
  playLaserHitsPlayerSound() {
    console.log('💥 Laser hit player!');
    this.playSound('laser-hits-player');
  }

  /** Plays the enemy hits player sound effect. */
  playEnemyHitsPlayerSound() {
    console.log('💥 Enemy hit player!');
    this.playSound('enemy-hits-player');
  }

  /** Plays the game-over sound effect and background music. */
  playGameOverSound() {
    console.log('💀 Playing game over sound sequence');
    this.stopMusic();

    // Play game over background music first
    this.playGameOverMusic();

    // Then play game over sound effect after a short delay
    setTimeout(() => {
      this.playSound('game-over');
    }, 500);
  }

  /** Plays the start-game sound effect and stops any intro music. */
  playStartGameSound() {
    console.log('🚀 Playing start game sound');
    this.stopMusic();
    this.playSound('start-game');
  }

  /** Plays the power-up collection sound effect. */
  playPowerUpSound() {
    this.playSound('power-up');
  }

  /**
   * Sets master volume for sound effects.
   *
   * @param {number} newVolume Value between 0 and 1.
   */
  setVolume(newVolume) {
    this.volume = Math.max(0, Math.min(1, newVolume));
    // Apply to all existing SFX sounds
    Object.values(this.sounds).forEach(sound => {
      if (!sound.loop) {
        // SFX, not music
        sound.volume = this.volume;
      }
    });
    localStorage.setItem('sfxVolume', this.volume);
  }

  /**
   * Sets volume for background music.
   *
   * @param {number} newVolume Value between 0 and 1.
   */
  setMusicVolume(newVolume) {
    this.musicVolume = Math.max(0, Math.min(1, newVolume));
    // Apply to current music if playing
    if (this.currentMusic) {
      this.currentMusic.volume = this.musicVolume;
    }

    persistentAudio.setVolume(this.musicVolume);

    localStorage.setItem('musicVolume', this.musicVolume);
  }

  /** Returns current music volume (0–1) */
  getMusicVolume() {
    return this.musicVolume;
  }

  /** Returns current sound-effects volume (0–1) */
  getSFXVolume() {
    return this.volume;
  }
}

/** Singleton instance used throughout the game. */
export const audioManager = new AudioManager();
window.audioManger = audioManager;
/**
 * Initializes all game audio assets.
 * Called once at game startup (e.g. from gameLoop.js).
 */
export function initAudio() {
  console.log('🎵 Initializing audio system...');

  // Determine base path for GitHub Pages or local development
  const basePath = window.location.hostname === 'gable0.github.io'
    ? '/team-Ctrl-Alt-Elite-testproject'
    : '';

  // Sound effects
  audioManager.loadSound(
    'shoot',
    `${basePath}/assets/sounds/reg game sounds/shoot.wav`
  );
  audioManager.loadSound(
    'player-shoot',
    `${basePath}/assets/sounds/reg game sounds/player-shoot.wav`
  );
  audioManager.loadSound(
    'kill-enemy',
    `${basePath}/assets/sounds/reg game sounds/kill-enemy.wav`
  );
  audioManager.loadSound(
    'game-over',
    `${basePath}/assets/sounds/reg game sounds/game-over.wav`
  );
  audioManager.loadSound(
    'start-game',
    `${basePath}/assets/sounds/reg game sounds/start-game.wav`
  );
  audioManager.loadSound(
    'power-up',
    `${basePath}/assets/sounds/reg game sounds/power-up.wav`
  );
  audioManager.loadSound(
    'laser-hits-player',
    `${basePath}/assets/sounds/reg game sounds/laser-hits-player.wav`
  );
  audioManager.loadSound(
    'enemy-hits-player',
    `${basePath}/assets/sounds/reg game sounds/enemy-hits-player.wav`
  );

  // Background music (looped)
  audioManager.loadSound(
    'intro',
    `${basePath}/assets/sounds/reg game sounds/intro.wav`,
    true
  );
  audioManager.loadSound(
    'background-music-1-2',
    `${basePath}/assets/sounds/reg game sounds/background-music-1-2.wav`,
    true
  );
  audioManager.loadSound(
    'background-music-3-4',
    `${basePath}/assets/sounds/reg game sounds/background-music-3-4.wav`,
    true
  );
  audioManager.loadSound(
    'background-music-5',
    `${basePath}/assets/sounds/reg game sounds/background-music-5.wav`,
    true
  );
  audioManager.loadSound(
    'game-over-background',
    `${basePath}/assets/sounds/reg game sounds/game-over-background.wav`,
    true
  );

  console.log('✓ Audio initialized');
  console.log('📋 Loaded sounds:', Object.keys(audioManager.sounds));
}

/** Placeholder – not currently used (intro music is handled by persistentAudio.js). */
export function playBackgroundGameMusic() {
  audioManager.playMusic('background-game');
}

/** Legacy helper – kept for compatibility, but intro music is now managed by persistentAudio.js. */
export function playIntroMusic() {
  audioManager.playMusic('intro');
}
