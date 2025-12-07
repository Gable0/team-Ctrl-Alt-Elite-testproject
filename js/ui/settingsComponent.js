// js/ui/settingsComponent.js
// Dynamically injects a settings button + modal into any page that calls injectSettings().

export function injectSettings() {
    // Settings button (gear icon)
    const settingsBtn = document.createElement('button');
    settingsBtn.className = 'settings-btn';
    settingsBtn.textContent = "⚙️";

    // Modal overlay
    const modal = document.createElement('settings-modal');
    modal.className = 'settings-modal hidden';
    modal.innerHTML = `
    <div class="settings-content">
      <h2 style="font-family: 'Jersey 10', monospace !important;">Settings</h2>

      <label style="font-family: 'Jersey 10', monospace !important;">
        Audio Volume
        <input type="range" min="0" max="100" value="50" id="audio-volume">
      </label>

      <label style="font-family: 'Jersey 10', monospace !important;">
        SFX Volume
        <input type="range" min="0" max="100" value="50" id="sfx-volume">
      </label>

      <label style="font-family: 'Jersey 10', monospace !important;">
        Language
        <select id="language-select">
          <option value="en">English</option>
          <option value="es">Español</option>
          <option value="fr">Français</option>
        </select>
      </label>

      <div class="fun-mode-container">
        <label class="fun-mode-label" style="font-family: 'Jersey 10', monospace !important;">
          Fun Mode (Chloe's Shooting Sound) Party 🎉
        </label>
        <button class="fun-mode-btn" id="fun-mode-toggle">Have Some Fun!</button>
      </div>

      <button class="close-settings">Close</button>
    </div>
  `;

    // Append to page
    document.body.appendChild(settingsBtn);
    document.body.appendChild(modal);

    // Dynamically import audioManager only when the modal is created
    import('../systems/audioManager.js').then(module => {
        const { audioManager } = module;

        const funModeBtn = document.getElementById('fun-mode-toggle');

        // Reflect current fun-mode state
        updateFunModeButton(funModeBtn, audioManager.getFunMode());

        // Toggle fun mode on click
        funModeBtn.addEventListener('click', () => {
            const newState = !audioManager.getFunMode();
            audioManager.setFunMode(newState);
            updateFunModeButton(funModeBtn, newState);
        });
    });

    // Open / close modal
    settingsBtn.addEventListener('click', () => modal.classList.toggle('hidden'));
    modal
        .querySelector('.close-settings')
        .addEventListener('click', () => modal.classList.add('hidden'));
}

/**
 * Updates the Fun Mode button text and active class.
 *
 * @param {HTMLButtonElement} button
 * @param {boolean} isFunMode
 */
function updateFunModeButton(button, isFunMode) {
    if (isFunMode) {
        button.textContent = '🎉 Fun Mode ON!';
        button.classList.add('active');
    } else {
        button.textContent = 'Have Some Fun!';
        button.classList.remove('active');
    }
}