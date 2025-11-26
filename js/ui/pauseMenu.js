let isPaused = false;
let pauseMenuElement = null;

export function initPauseMenu(game) {
    // Create pause menu HTML if it doesn't exist
    if (!pauseMenuElement) {
        pauseMenuElement = document.createElement('div');
        pauseMenuElement.id = 'pauseMenu';
        pauseMenuElement.className = 'pause-menu hidden';
        pauseMenuElement.innerHTML = `
            <div class="pause-menu-content">
                <h2>PAUSED</h2>
                <button id="resumeButton" class="pause-menu-button">Resume</button>
                <button id="settingsButton" class="pause-menu-button">Settings</button>
                <button id="exitButton" class="pause-menu-button">Exit to Menu</button>
            </div>
        `;
        document.body.appendChild(pauseMenuElement);

        // Add event listeners
        document.getElementById('resumeButton').addEventListener('click', () => {
            togglePause(game);
        });

        document.getElementById('settingsButton').addEventListener('click', () => {
            // Navigate to settings (you can implement this)
            window.location.href = 'settings.html';
        });

        document.getElementById('exitButton').addEventListener('click', () => {
            if (confirm('Are you sure you want to exit? Progress will be lost.')) {
                window.location.href = 'homepage.html';
            }
        });
    }

    // Listen for ESC key to toggle pause
    window.addEventListener('keydown', (e) => {
        if (e.code === 'Escape' && !game.gameOver) {
            e.preventDefault();
            togglePause(game);
        }
    });
}

export function togglePause(game) {
    isPaused = !isPaused;
    game.paused = isPaused;

    if (isPaused) {
        pauseMenuElement.classList.remove('hidden');
        pauseMenuElement.classList.add('active');
    } else {
        pauseMenuElement.classList.remove('active');
        pauseMenuElement.classList.add('hidden');
    }
}

export function isGamePaused() {
    return isPaused;
}