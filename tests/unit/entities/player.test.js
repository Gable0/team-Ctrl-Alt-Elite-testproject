import { test, assert } from 'vitest'
import { createPlayer, updatePlayer } from '../../../js/entities/player.js'
import { isKeyPressed } from '../../../js/core/input.js'

// Mock input
const keys = new Set()
global.isKeyPressed = (code) => keys.has(code)

const canvas = { width: 800, height: 600 }
const barrierY = 400

test('createPlayer spawns at correct position and size', () => {
    const player = createPlayer(canvas)

    assert.equal(player.x, 400)
    assert.closeTo(player.y, 450, 1)
    assert.equal(player.size, 20)
    assert.equal(player.speed, 220)
})

test('player cannot move left of screen', () => {
    const player = createPlayer(canvas)
    player.x = 10

    keys.add('ArrowLeft')
    for (let i = 0; i < 100; i++) {
        updatePlayer({ player }, 0.016, canvas, barrierY, () => {})
    }
    keys.clear()

    assert.isAtLeast(player.x, player.size)
})

test('player cannot move right of screen', () => {
    const player = createPlayer(canvas)
    player.x = 790

    keys.add('ArrowRight')
    for (let i = 0; i < 100; i++) {
        updatePlayer({ player }, 0.016, canvas, barrierY, () => {})
    }
    keys.clear()

    assert.isAtMost(player.x, canvas.width - player.size)
})

test('player cannot move above bottom barrier', () => {
    const player = createPlayer(canvas)
    player.y = barrierY + player.size + 10

    keys.add('ArrowUp')
    for (let i = 0; i < 100; i++) {
        updatePlayer({ player }, 0.016, canvas, barrierY, () => {})
    }
    keys.clear()

    assert.isAtLeast(player.y, barrierY + player.size)
})