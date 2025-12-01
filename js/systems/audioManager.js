// js/systems/audioManager.js

class AudioManager {
    constructor() {
        this.sounds = {};
        this.enabled = true;
        this.volume = 0.5;
    }

    loadSound(name, path) {
        try {
            console.log(`Loading sound: ${name} from ${path}`);
            const audio = new Audio(path);
            audio.preload = 'auto';
            audio.volume = this.volume;
            this.sounds[name] = audio;
        } catch (error) {
            console.error(`Failed to load sound: ${name}`, error);
        }
    }

    playSound(name) {
        if (!this.enabled || !this.sounds[name]) return;
        
        try {
            const sound = this.sounds[name].cloneNode();
            sound.volume = this.volume;
            sound.play().catch(err => console.warn(`Failed to play: ${name}`, err));
        } catch (error) {
            console.error(`Error playing sound: ${name}`, error);
        }
    }
}

export const audioManager = new AudioManager();

export function initAudio() {
    console.log('Initializing audio...');
    audioManager.loadSound('shoot', 'assets/sounds/shoot.mp3');
}