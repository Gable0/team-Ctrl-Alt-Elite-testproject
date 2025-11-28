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
            <h2>Settings</h2>
            <label>
                Audio Volume
                <input type="range" min="0" max="100" value="50" id="audio-volume">
            </label>
            <label>
                SFX Volume
                <input type="range" min="0" max="100" value="50" id="sfx-volume">
            </label>
            <label>
                Language
                <select id="language-select">
                    <option value="en">English</option>
                    <option value="es">Español</option>
                    <option value="fr">Français</option>
                </select>
            </label>
            <button class="close-settings">Close</button>
        </div>
    `;

    // Add to body
    document.body.appendChild(settingsBtn);
    document.body.appendChild(modal);

    // Event listeners
    settingsBtn.addEventListener('click', () => modal.classList.toggle('hidden'));
    modal.querySelector('.close-settings').addEventListener('click', () => modal.classList.add('hidden'));
}
