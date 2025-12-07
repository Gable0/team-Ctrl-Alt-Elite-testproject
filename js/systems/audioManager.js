// js/systems/audioManager.js

class AudioManager {
    constructor() {
        this.sounds = {};
        this.enabled = true;
        this.volume = 0.5;
        this.musicVolume = 0.3; // Lower volume for background music
        this.currentMusic = null;
        
        // Read fun mode from localStorage on initialization
        const savedFunMode = localStorage.getItem('funMode');
        this.funMode = savedFunMode === 'true';
        console.log(`AudioManager initialized - Fun mode: ${this.funMode}`);
    }

  loadSound(name, path, isMusic = false) {
    try {
      console.log(`Loading sound: ${name} from ${path}`);
      const audio = new Audio(path);
      audio.preload = 'auto';
      audio.volume = isMusic ? this.musicVolume : this.volume;

      if (isMusic) {
        audio.loop = true;
      }

      this.sounds[name] = audio;
    } catch (error) {
      console.error(`Failed to load sound: ${name}`, error);
    }
  }

  playSound(name) {
    if (!this.enabled) {
      console.log('Audio is disabled');
      return;
    }

    if (!this.sounds[name]) {
      console.warn(`❌ Sound not found: ${name}`);
      console.log('Available sounds:', Object.keys(this.sounds));
      return;
    }

    console.log(`▶️ Playing sound: ${name}`);

    try {
      const sound = this.sounds[name].cloneNode();
      sound.volume = this.volume;
      sound
        .play()
        .then(() => console.log(`✅ Successfully played: ${name}`))
        .catch(err => console.warn(`❌ Failed to play: ${name}`, err));
    } catch (error) {
      console.error(`Error playing sound: ${name}`, error);
    }
  }

  playMusic(name) {
    if (!this.enabled) {
      console.log('Audio is disabled');
      return;
    }

    if (!this.sounds[name]) {
      console.warn(`❌ Music not found: ${name}`);
      return;
    }

    // Stop current music if playing
    this.stopMusic();

    console.log(`🎵 Playing music: ${name}`);

    try {
      this.currentMusic = this.sounds[name];
      this.currentMusic.currentTime = 0;
      this.currentMusic.volume = this.musicVolume;
      this.currentMusic
        .play()
        .then(() => console.log(`✅ Successfully started music: ${name}`))
        .catch(err => console.warn(`❌ Failed to play music: ${name}`, err));
    } catch (error) {
      console.error(`Error playing music: ${name}`, error);
    }
  }

  stopMusic() {
    if (this.currentMusic) {
      console.log('⏹️ Stopping current music');
      this.currentMusic.pause();
      this.currentMusic.currentTime = 0;
      this.currentMusic = null;
    }
  }

    playShootSound() {
        // Check fun mode status every time
        const localStorageValue = localStorage.getItem('funMode');
        console.log(`📦 localStorage value for 'funMode': "${localStorageValue}"`);
        
        const currentFunMode = localStorageValue === 'true';
        this.funMode = currentFunMode; // Update internal state
        
        const soundName = this.funMode ? 'chloe-shoot' : 'shoot';
        console.log(`🔫 Playing shoot sound: ${soundName} (fun mode: ${this.funMode})`);
        this.playSound(soundName);
    }

  playKillEnemySound() {
    this.playSound('kill-enemy');
  }

    playGameOverSound() {
        this.stopMusic(); // Stop any background music
        this.playSound('game-over');
    }

    playStartGameSound() {
        this.stopMusic(); // Stop intro music
        this.playSound('start-game');
    }

  setFunMode(enabled) {
    this.funMode = enabled;
    localStorage.setItem('funMode', String(enabled));
    console.log(`🎉 Fun mode ${enabled ? 'ENABLED' : 'DISABLED'}`);
  }

  getFunMode() {
    const savedFunMode = localStorage.getItem('funMode') === 'true';
    this.funMode = savedFunMode;
    return this.funMode;
  }

  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
    console.log(`🔊 Volume set to: ${this.volume}`);
  }

  setMusicVolume(volume) {
    this.musicVolume = Math.max(0, Math.min(1, volume));
    if (this.currentMusic) {
      this.currentMusic.volume = this.musicVolume;
    }
    console.log(`🎵 Music volume set to: ${this.musicVolume}`);
  }
}

export const audioManager = new AudioManager();

export function initAudio() {
    console.log('Initializing audio...');
    
    // Load all sound effects
    audioManager.loadSound('shoot', 'assets/sounds/reg game sounds/shoot.wav');
    audioManager.loadSound('chloe-shoot', 'assets/sounds/Chloe-shooting.wav');
    audioManager.loadSound('kill-enemy', 'assets/sounds/reg game sounds/kill-enemy.wav');
    audioManager.loadSound('game-over', 'assets/sounds/reg game sounds/game-over.wav');
    audioManager.loadSound('start-game', 'assets/sounds/reg game sounds/start-game.wav');
    
    // Load background music (intro) - marked as music for looping
    audioManager.loadSound('intro', 'assets/sounds/reg game sounds/intro.wav', true);
    
    console.log(`Audio initialized with fun mode: ${audioManager.getFunMode()}`);
}

// Play background game music
export function playBackgroundGameMusic() {
    audioManager.playMusic('background-game');
}

// Function to play intro music on homepage - NOT USED, handled by persistentAudio.js
export function playIntroMusic() {
    audioManager.playMusic('intro');
}
