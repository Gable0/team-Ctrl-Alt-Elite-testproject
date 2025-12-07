// js/skins/skinsManager.js
// Central hub for all skin logic: ownership, equipping, and active state.

/**
 * Tracks which skin packs the player currently owns.
 * Values are read once from localStorage at module load time.
 * @type {Object<string, boolean>}
 */
const ownedSkins = {
    squarePack: localStorage.getItem('squarePackOwned') === 'true',
    // Add new: neonPack: localStorage.getItem('neonPackOwned') === 'true',
};

/**
 * Retrieves the currently equipped skin.
 *
 * @returns {string} The name of the active skin (e.g. "default", "squarePack", "starPack").
 *                   Falls back to "default" if nothing is stored.
 */
export function getActiveSkin() {
    return localStorage.getItem('activeSkin') || 'default';
}

/**
 * Checks whether the player owns a specific skin pack.
 *
 * @param {string} skinName - Base name of the skin (e.g. "squarePack", "starPack").
 * @returns {boolean} `true` if the skin is owned, otherwise `false`.
 */
export function isSkinOwned(skinName) {
    return localStorage.getItem(skinName + 'Owned') === 'true';
}

/**
 * Equips a skin if the player owns it (or if it is the default skin).
 *
 * @param {string} skinName - The skin to equip ("default" or a valid owned skin name).
 * @returns {string} The name of the now-active skin.
 */
export function equipSkin(skinName) {
    if (skinName === 'default') {
        localStorage.setItem('activeSkin', 'default');
    } else if (isSkinOwned(skinName)) {
        localStorage.setItem('activeSkin', skinName);
    }
    return getActiveSkin();
}