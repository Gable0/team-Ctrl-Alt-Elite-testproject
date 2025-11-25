const pressedKeys = new Set();
let initialized = false;

export function initInput() {
    if (initialized) return;

    window.addEventListener('keydown', (event) => {
        pressedKeys.add(event.code);
    });

    window.addEventListener('keyup', (event) => {
        pressedKeys.delete(event.code);
    });

    initialized = true;
}

export function isKeyPressed(code) {
    return pressedKeys.has(code);
}
