// js/systems/audioManager.js
// possibly do a libray. how to load a sound pack for a video game. make it rigid. use .wave instead
// all funny sounds will be in a toggle in fun mode

class AudioManager {
    constructor() {
        this.sounds = {};
        this.enabled = true;
        this.volume = 0.5;
        // Read fun mode from localStorage on initialization
        const savedFunMode = localStorage.getItem('funMode');
        this.funMode = savedFunMode === 'true';
        console.log(`AudioManager initialized - Fun mode: ${this.funMode}`);
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
        if (!this.enabled) {
            console.log('Audio is disabled');
            return;
        }
        
        if (!this.sounds[name]) {
            console.warn(`❌ Sound not found: ${name}`);
            console.log('Available sounds:', Object.keys(this.sounds));
            return;
        }
        
        console.log(`▶️ Actually playing sound: ${name}`);
        
        try {
            const sound = this.sounds[name].cloneNode();
            sound.volume = this.volume;
            sound.play()
                .then(() => console.log(`✅ Successfully played: ${name}`))
                .catch(err => console.warn(`❌ Failed to play: ${name}`, err));
        } catch (error) {
            console.error(`Error playing sound: ${name}`, error);
        }
    }

    playShootSound() {
        // Check fun mode status every time
        const localStorageValue = localStorage.getItem('funMode');
        console.log(`📦 localStorage value for 'funMode': "${localStorageValue}"`);
        console.log(`📦 Type: ${typeof localStorageValue}`);
        
        const currentFunMode = localStorageValue === 'true';
        console.log(`📦 Comparison result (localStorageValue === 'true'): ${currentFunMode}`);
        
        this.funMode = currentFunMode; // Update internal state
        
        const soundName = this.funMode ? 'chloe-shoot' : 'shoot';
        console.log(`🔫 Playing shoot sound: ${soundName} (fun mode: ${this.funMode})`);
        this.playSound(soundName);
    }

    setFunMode(enabled) {
        this.funMode = enabled;
        localStorage.setItem('funMode', String(enabled));
        console.log(`🎉 Fun mode ${enabled ? 'ENABLED' : 'DISABLED'} - Next shot will use ${enabled ? 'Chloe-shooting' : 'normal shoot'} sound`);
    }

    getFunMode() {
        // Always read from localStorage to ensure consistency
        const savedFunMode = localStorage.getItem('funMode') === 'true';
        this.funMode = savedFunMode;
        return this.funMode;
    }
}

export const audioManager = new AudioManager();

export function initAudio() {
    console.log('Initializing audio...');
    // Use relative paths from the HTML file location
    audioManager.loadSound('shoot', 'assets/sounds/shoot.mp3');
    audioManager.loadSound('chloe-shoot', 'assets/sounds/Chloe-shooting.wav');
    console.log(`Audio initialized with fun mode: ${audioManager.getFunMode()}`);
}