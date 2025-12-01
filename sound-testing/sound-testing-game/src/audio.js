class AudioManager {
    constructor() {
        this.sounds = {};
        this.loadSounds();
    }

    loadSounds() {
        this.sounds['shoot'] = new Audio('assets/sounds/sound testing/shoot.wav');
    }

    playSound(soundName) {
        if (this.sounds[soundName]) {
            this.sounds[soundName].currentTime = 0; // Reset sound to start
            this.sounds[soundName].play();
        }
    }
}

export default AudioManager;