class Game {
    constructor() {
        this.audioManager = new AudioManager();
    }

    shoot() {
        // Logic for shooting
        this.audioManager.playSound('assets/sounds/sound testing/shoot.wav');
    }

    // Other game methods...
}

export default Game;