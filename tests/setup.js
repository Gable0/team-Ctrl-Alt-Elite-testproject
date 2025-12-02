import { beforeEach } from 'vitest'

// Mock localStorage for every test
beforeEach(() => {
    global.localStorage = {
        data: {},
        getItem(key) { return this.data[key] ?? null },
        setItem(key, value) { this.data[key] = value },
        removeItem(key) { delete this.data[key] },
        clear() { this.data = {} }
    }
    localStorage.clear()
})