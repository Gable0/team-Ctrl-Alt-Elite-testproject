// tests/setup.js
import { beforeEach } from 'vitest'

// Mock localStorage
beforeEach(() => {
    global.localStorage = {
        data: {},
        getItem(key) { return this.data[key] ?? null },
        setItem(key, value) { this.data[key] = value },
        removeItem(key) { delete this.data[key] },
        clear() { this.data = {} }
    }
    localStorage.clear()
    global.canvasRef = document.getElementById('game')
})

