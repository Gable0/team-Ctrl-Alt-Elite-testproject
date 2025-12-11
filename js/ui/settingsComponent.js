// js/ui/settingsComponent.js
// Dynamically injects a settings button + modal into any page that calls injectSettings().

import { applyTranslations, getCurrentLanguage } from './translations.js';
import { persistentAudio } from '../core/persistentAudio.js';

export function injectSettings() {
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




     <button class="close-settings" translate="close">Close</button>
   </div>
 `;

  // Append to page
  document.body.appendChild(settingsBtn);
  document.body.appendChild(modal);

  applyTranslations(modal);

  const languageSelect = modal.querySelector('#language-select');
  languageSelect.value = getCurrentLanguage(); // <-- set saved language on load

  languageSelect.addEventListener('change', e => {
    import('./translations.js').then(({ setLanguage }) => {
      setLanguage(e.target.value); // updates localStorage + triggers event
    });
  });

  // Dynamically import audioManager only when the modal is created
  import('../systems/audioManager.js').then(module => {
    const { audioManager } = module;

    const musicSlider = modal.querySelector('#audio-volume'); // Music volume (Background music)
    const sfxSlider = modal.querySelector('#sfx-volume'); // Sound effects

    // Load saved values
    musicSlider.value = Math.round(audioManager.getMusicVolume() * 100);
    sfxSlider.value = Math.round(audioManager.getSFXVolume() * 100);

    // Music volume change
    musicSlider.addEventListener('input', () => {
      const newVol = Number(musicSlider.value) / 100;
      audioManager.setMusicVolume(newVol);
      persistentAudio.setVolume(newVol);
    });

    // SFX volume change
    sfxSlider.addEventListener('input', () => {
      const newVol = Number(sfxSlider.value) / 100;
      audioManager.setVolume(newVol);
    });
  });

  // Open / close modal
  settingsBtn.addEventListener('click', () => modal.classList.toggle('hidden'));
  modal
    .querySelector('.close-settings')
    .addEventListener('click', () => modal.classList.add('hidden'));
}
