/**
 * @file Central hub for all skin logic: ownership, equipping, and active state.
 * Scalable for new skins — add to the ownership check and you're done.
 */

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
 * Reads directly from localStorage to ensure fresh data after navigation.
 * @param {string} skinName - Skin identifier (e.g. 'squarePack', 'prof')
 * @returns {boolean} True if owned
 */
export function isSkinOwned(skinName) {
  // Read directly from localStorage instead of using a cached object
  const storageKey = `${skinName}Owned`;
  return localStorage.getItem(storageKey) === 'true';
}

/**
 * Equips a skin or reverts to default.
 * Only allows owned skins to be equipped.
 * Updates localStorage immediately.
 * @param {string} skinName - Skin to equip ('default' to unequip)
 * @returns {string} Updated active skin name
 */
export function equipSkin(skinName) {
  if (skinName === 'default' || !isSkinOwned(skinName)) {
    localStorage.setItem('activeSkin', 'default');
  } else {
    localStorage.setItem('activeSkin', skinName);
  }
  return getActiveSkin();
}

/**
 * Gets all owned skin names.
 * Useful for rendering skin libraries.
 * @returns {string[]} Array of owned skin identifiers
 */
export function getOwnedSkins() {
  const allSkins = ['squarePack', 'starPack', 'prof'];
  return allSkins.filter(skinName => isSkinOwned(skinName));
}
