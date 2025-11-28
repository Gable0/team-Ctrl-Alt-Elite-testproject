// js/skins/skinsManager.js
// Central hub for all skin logic: ownership, equipping, and active state.

const ownedSkins = {
    squarePack: localStorage.getItem('squarePackOwned') === 'true'
    // Add new: neonPack: localStorage.getItem('neonPackOwned') === 'true',
};

export function getActiveSkin() {
    return localStorage.getItem('activeSkin') || 'default';
}

export function isSkinOwned(skinName) {
    return ownedSkins[skinName] || false;
}

export function equipSkin(skinName) {
    if (!isSkinOwned(skinName) || skinName === 'default') {
        localStorage.setItem('activeSkin', 'default');
    } else {
        localStorage.setItem('activeSkin', skinName);
    }
    return getActiveSkin(); // Return updated state
}