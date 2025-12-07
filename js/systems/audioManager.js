// js/systems/audioManager.js

class AudioManager {
    constructor() {
        this.sounds = {};
        this.enabled = true;
        this.volume = 0.5;
        this.musicVolume = 0.3; // Lower volume for background music
        this.currentMusic = null;
        this.isFading = false;
        
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

      // Add error handler to catch loading issues
      audio.addEventListener('error', (e) => {
        console.error(`❌ Failed to load audio file: ${name}`, e);
        console.error(`Path: ${path}`);
        console.error(`Error code: ${audio.error?.code}, Message: ${audio.error?.message}`);
      });

      audio.addEventListener('canplaythrough', () => {
        console.log(`✅ Audio loaded successfully: ${name}`);
      });

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

  playMusic(name, fadeDuration = 1000) {
    if (!this.enabled) {
      console.log('Audio is disabled');
      return;
    }

    if (!this.sounds[name]) {
      console.warn(`❌ Music not found: ${name}`);
      return;
    }

    // If same music is already playing, don't restart it
    if (this.currentMusic === this.sounds[name] && !this.currentMusic.paused) {
      console.log(`🎵 Music already playing: ${name}`);
      return;
    }

    const newMusic = this.sounds[name];

    // If there's current music playing, fade it out
    if (this.currentMusic && !this.currentMusic.paused) {
      console.log(`🎵 Cross-fading to: ${name}`);
      this.crossFadeMusic(this.currentMusic, newMusic, fadeDuration);
    } else {
      // No current music, just fade in the new music
      console.log(`🎵 Fading in music: ${name}`);
      this.fadeInMusic(newMusic, fadeDuration);
    }
    
    return newMusic; // Return the audio element for event listeners
  }

  fadeInMusic(audio, duration = 1000) {
    audio.volume = 0;
    audio.currentTime = 0;
    
    audio.play()
      .then(() => {
        this.currentMusic = audio;
        console.log(`✅ Started fading in music`);
        
        const steps = 60; // 60 steps for smooth fade
        const stepDuration = duration / steps;
        const volumeIncrement = this.musicVolume / steps;
        let currentStep = 0;

        const fadeInterval = setInterval(() => {
          currentStep++;
          audio.volume = Math.min(currentStep * volumeIncrement, this.musicVolume);

          if (currentStep >= steps) {
            clearInterval(fadeInterval);
            audio.volume = this.musicVolume;
            this.isFading = false;
            console.log(`✅ Fade in complete`);
          }
        }, stepDuration);
      })
      .catch(err => console.warn(`❌ Failed to play music`, err));
  }

  crossFadeMusic(oldAudio, newAudio, duration = 1000) {
    this.isFading = true;
    
    const steps = 60;
    const stepDuration = duration / steps;
    const volumeDecrement = oldAudio.volume / steps;
    const volumeIncrement = this.musicVolume / steps;
    let currentStep = 0;

    // Start new music at volume 0
    newAudio.volume = 0;
    newAudio.currentTime = 0;
    
    newAudio.play()
      .then(() => {
        this.currentMusic = newAudio;
        
        const crossFadeInterval = setInterval(() => {
          currentStep++;
          
          // Fade out old music
          oldAudio.volume = Math.max(oldAudio.volume - volumeDecrement, 0);
          
          // Fade in new music
          newAudio.volume = Math.min(currentStep * volumeIncrement, this.musicVolume);

          if (currentStep >= steps) {
            clearInterval(crossFadeInterval);
            
            // Stop and reset old music
            oldAudio.pause();
            oldAudio.currentTime = 0;
            oldAudio.volume = this.musicVolume;
            
            // Ensure new music is at correct volume
            newAudio.volume = this.musicVolume;
            
            this.isFading = false;
            console.log(`✅ Cross-fade complete`);
          }
        }, stepDuration);
      })
      .catch(err => console.warn(`❌ Failed to cross-fade music`, err));
  }

  stopMusic(fadeDuration = 500) {
    if (this.currentMusic) {
      console.log('⏹️ Fading out and stopping current music');
      
      const steps = 30;
      const stepDuration = fadeDuration / steps;
      const volumeDecrement = this.currentMusic.volume / steps;
      let currentStep = 0;
      
      const fadeOutInterval = setInterval(() => {
        currentStep++;
        this.currentMusic.volume = Math.max(this.currentMusic.volume - volumeDecrement, 0);

        if (currentStep >= steps || this.currentMusic.volume === 0) {
          clearInterval(fadeOutInterval);
          this.currentMusic.pause();
          this.currentMusic.currentTime = 0;
          this.currentMusic.volume = this.musicVolume; // Reset for next time
          this.currentMusic = null;
          console.log(`✅ Music stopped`);
        }
      }, stepDuration);
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

  playBallHitsPlayerSound() {
    this.playSound('ball-hits-player');
  }

  playEnemyHitsPlayerSound() {
    this.playSound('enemy-hits-player');
  }

    playGameOverSound() {
        // This function is no longer used, but keeping it for backwards compatibility
        // The game over sequence is now handled in gameState.js
        this.stopMusic(500);
        setTimeout(() => {
            this.playSound('game-over');
        }, 500);
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
    audioManager.loadSound('ball-hits-player', 'assets/sounds/reg game sounds/ball-hits-player.wav');
    audioManager.loadSound('enemy-hits-player', 'assets/sounds/reg game sounds/enemy-hits-player.wav');
    
    // Load background music (intro) - marked as music for looping
    audioManager.loadSound('intro', 'assets/sounds/reg game sounds/intro.wav', true);
    
    // Load level-specific background music (with renamed files)
    audioManager.loadSound('background-music-1-2', 'assets/sounds/reg game sounds/background-music-1-2.wav', true);
    audioManager.loadSound('background-music-3-4', 'assets/sounds/reg game sounds/background-music-3-4.wav', true);
    audioManager.loadSound('background-music-5', 'assets/sounds/reg game sounds/background-music-5.wav', true);
    
    // Load game over background music
    audioManager.loadSound('game-over-background', 'assets/sounds/reg game sounds/game-over-background.wav', true);
    
    console.log(`Audio initialized with fun mode: ${audioManager.getFunMode()}`);
}

// Play background music based on level
export function playLevelMusic(level) {
    let musicName;
    
    if (level <= 2) {
        musicName = 'background-music-1-2';
    } else if (level <= 4) {
        musicName = 'background-music-3-4';
    } else {
        musicName = 'background-music-5';
    }
    
    console.log(`Playing music for level ${level}: ${musicName}`);
    // Use 1500ms (1.5 seconds) fade duration for smooth level transitions
    audioManager.playMusic(musicName, 1500);
}

// Keep the old function for backwards compatibility
export function playBackgroundGameMusic() {
    audioManager.playMusic('background-music-1-2');
}

// Function to play intro music on homepage - NOT USED, handled by persistentAudio.js
export function playIntroMusic() {
    audioManager.playMusic('intro');
}