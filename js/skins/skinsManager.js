/**
 * @file Central hub for all skin logic: ownership, equipping, and active state.
 * Scalable for new skins — add to ownedSkins and you're done.
 */

/**
 * Ownership flags for all available skins, loaded from localStorage.
 * @type {Object<string, boolean>}
 */
const ownedSkins = {
  squarePack: localStorage.getItem('squarePackOwned') === 'true',
  starPack: localStorage.getItem('starPackOwned') === 'true',
  prof: localStorage.getItem('profOwned') === 'true'  // ← FIXED: Add Prof here
  // Add new: neonPack: localStorage.getItem('neonPackOwned') === 'true',
};

/**
 * Returns the currently equipped skin name.
 * Defaults to 'default' if none set.
 * @returns {string} Active skin identifier (e.g. 'default', 'squarePack', 'prof')
 */
export function getActiveSkin() {
  return localStorage.getItem('activeSkin') || 'default';
}

/**
 * Checks if the player owns a specific skin.
 * @param {string} skinName - Skin identifier (e.g. 'squarePack', 'prof')
 * @returns {boolean} True if owned
 */
export function isSkinOwned(skinName) {
  return ownedSkins[skinName] || false;
}

/**
 * Equips a skin or reverts to default.
 * Only allows owned skins to be equipped.
 * Updates localStorage immediately.
 * @param {string} skinName - Skin to equip ('default' to unequip)
 * @returns {string} Updated active skin name
 */
export function equipSkin(skinName) {
  if (!isSkinOwned(skinName) || skinName === 'default') {
    localStorage.setItem('activeSkin', 'default');
  } else {
    localStorage.setItem('activeSkin', skinName);
  }
  return getActiveSkin();
}