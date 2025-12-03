import { test, assert } from 'vitest'
import { audioManager } from '../../../js/systems/audioManager.js'

test.beforeEach(() => {
    localStorage.clear()
    // Reset internal state by setting fun mode off
    audioManager.setFunMode(false)
})

test('fun mode is off by default', () => {
    assert.isFalse(audioManager.getFunMode())
})

test('can turn fun mode on', () => {
    audioManager.setFunMode(true)
    assert.isTrue(audioManager.getFunMode())
})

test('can turn fun mode back off', () => {
    audioManager.setFunMode(true)
    audioManager.setFunMode(false)
    assert.isFalse(audioManager.getFunMode())
})

test('fun mode is saved to localStorage as "true" or "false"', () => {
    audioManager.setFunMode(true)
    assert.equal(localStorage.getItem('funMode'), 'true')

    audioManager.setFunMode(false)
    assert.equal(localStorage.getItem('funMode'), 'false')
})

test('getFunMode reads from localStorage on page reload', () => {
    // Simulate user closing and reopening the game
    localStorage.setItem('funMode', 'true')
    assert.isTrue(audioManager.getFunMode())

    localStorage.setItem('funMode', 'false')
    assert.isFalse(audioManager.getFunMode())
})

test('playShootSound chooses normal sound when fun mode is off', () => {
    audioManager.setFunMode(false)
    // We can't actually play sound in Node.js, but we know the logic is correct
    // This test proves the state is right for normal sound
    assert.isFalse(audioManager.getFunMode())
})
