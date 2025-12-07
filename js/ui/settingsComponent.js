// js/ui/settingsComponent.js
// Dynamically injects a settings button + modal into any page that calls injectSettings().

import { applyTranslations } from './translations.js';

export function injectSettings() {
  // Settings button (gear icon)
  const settingsBtn = document.createElement('button');
  settingsBtn.className = 'settings-btn';
  settingsBtn.textContent = '⚙️';

  // Modal overlay
  const modal = document.createElement('settings-modal');
  modal.className = 'settings-modal hidden';
  modal.innerHTML = `
    <div class="settings-content">
      <h2 translate="settings">Settings</h2>

      <label translate="audioVolume">Audio Volume</label>
      <input type="range" min="0" max="100" value="50" id="audio-volume">

      <label translate="sfxVolume">SFX Volume</label>
      <input type="range" min="0" max="100" value="50" id="sfx-volume">

      <label translate="language">Language</label>
      <select id="language-select">
        <option value="en">English</option>
        <option value="es">Español</option>
        <option value="fr">Français</option>
        <option value="zh">中文</option>
      </select>

      <div class="fun-mode-container">
        <label class="fun-mode-label" translate="funModeLabel">
          Fun Mode (Chloe's Shooting Sound) Party
        </label>
        <button class="fun-mode-btn" id="fun-mode-toggle" translate="funModeOff">
          Have Some Fun!
        </button>
      </div>

      <button class="close-settings" translate="close">Close</button>
    </div>
  `;

  // Append to page
  document.body.appendChild(settingsBtn);
  document.body.appendChild(modal);

  applyTranslations(modal);

  modal.querySelector('#language-select').addEventListener('change', e => {
    import('./translations.js').then(({ setLanguage }) => {
      setLanguage(e.target.value); // <- updates localStorage + triggers event
    });
  });

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
