// js/ui/settingsComponent.js
export function injectSettings() {
  // Create settings button
  const settingsBtn = document.createElement('button');
  settingsBtn.className = 'settings-btn';
  settingsBtn.textContent = '⚙️';

  // Create modal container
  const modal = document.createElement('settings-modal');
  modal.className = 'settings-modal hidden';
  modal.innerHTML = `
        <div class="settings-content">
            <h2 style="font-family: 'Jersey 10', monospace !important;">Settings</h2>
            <label style="font-family: 'Jersey 10', monospace !important;">
                Audio Volume
                <input type="range" min="0" max="100" value="50" id="audio-volume" style="font-family: 'Jersey 10', monospace !important;">
            </label>
            <label style="font-family: 'Jersey 10', monospace !important;">
                SFX Volume
                <input type="range" min="0" max="100" value="50" id="sfx-volume" style="font-family: 'Jersey 10', monospace !important;">
            </label>
            <label style="font-family: 'Jersey 10', monospace !important;">
                Language
                <select id="language-select" style="font-family: 'Jersey 10', monospace !important;">
                    <option value="en">English</option>
                    <option value="es">Español</option>
                    <option value="fr">Français</option>
                </select>
            </label>
            <div class="fun-mode-container">
                <label class="fun-mode-label" style="font-family: 'Jersey 10', monospace !important;">
                    Fun Mode (Chloe's Shooting Sound) 🎉
                </label>
                <button class="fun-mode-btn" id="fun-mode-toggle" style="font-family: 'Jersey 10', monospace !important;">Have Some Fun!</button>
            </div>
            <button class="close-settings" style="font-family: 'Jersey 10', monospace !important;">Close</button>
        </div>
    `;

  // Add to body
  document.body.appendChild(settingsBtn);
  document.body.appendChild(modal);

  // Import audio manager dynamically to toggle fun mode
  import('../systems/audioManager.js').then(module => {
    const { audioManager } = module;

    const funModeBtn = document.getElementById('fun-mode-toggle');

    // Set initial button state
    updateFunModeButton(funModeBtn, audioManager.getFunMode());

    // Toggle fun mode on click
    funModeBtn.addEventListener('click', () => {
      const newFunMode = !audioManager.getFunMode();
      audioManager.setFunMode(newFunMode);
      updateFunModeButton(funModeBtn, newFunMode);
    });
  });

  // Event listeners
  settingsBtn.addEventListener('click', () => modal.classList.toggle('hidden'));
  modal
    .querySelector('.close-settings')
    .addEventListener('click', () => modal.classList.add('hidden'));
}

function updateFunModeButton(button, isFunMode) {
  if (isFunMode) {
    button.textContent = '🎉 Fun Mode ON!';
    button.classList.add('active');
  } else {
    button.textContent = 'Have Some Fun!';
    button.classList.remove('active');
  }
}
