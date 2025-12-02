// tests/unit/systems/powerUps.test.js
import { test, assert } from 'vitest'
import { spawnPowerUp, updatePowerUps } from '../../../js/systems/powerUps.js'

test('spawnPowerUp has ~25% chance to drop', () => {
    const game = { powerUps: [] }
    const enemy = { x: 400, y: 100 }
    let drops = 0
    for (let i = 0; i < 1000; i++) {
        game.powerUps = []
        spawnPowerUp(game, enemy)
        if (game.powerUps.length > 0) drops++
    }
    const rate = drops / 1000
    assert.isAbove(rate, 0.15)
    assert.isBelow(rate, 0.35)
})

test('spawnPowerUp adds power-up at enemy position', () => {
    const game = { powerUps: [] }
    const enemy = { x: 420, y: 150 }
    const realRandom = Math.random
    global.Math.random = () => 0.1
    spawnPowerUp(game, enemy)
    assert.equal(game.powerUps.length, 1)
    assert.closeTo(game.powerUps[0].x, 420, 0.1)
    assert.closeTo(game.powerUps[0].y, 150, 0.1)
    global.Math.random = realRandom
})

test('updatePowerUps moves power-ups down and removes off-screen', () => {
    const game = {
        player: { x: 400, y: 500, speed:0,size: 20 },
        powerUps: [
            { x: 400, y: 200, speed: 80, active: true },
            { x: 500, y: 700, speed: 80, active: true }
        ],
        tripleShotTimer: 0
    }
    updatePowerUps(game, 0.5, { height: 600 })
    assert.closeTo(game.powerUps[0].y, 240, 0.1)
    assert.equal(game.powerUps.length, 1)
})

test('player collects one power-up when touching it (single)', () => {
    const game = {
        player: { x: 400, y: 300, size: 20 },
        powerUps: [
            { x: 400, y: 300, size: 12, speed: 80, active: true }
        ],
        tripleShotTimer: 0
    }

    updatePowerUps(game, 0.1, { height: 600 })

    assert.equal(game.powerUps.length, 0)
    assert.closeTo(game.tripleShotTimer, 30, 0.2)  // allow small floating-point error
})

test('player collects only the power-up they touch when multiple exist', () => {
    const game = {
        player: { x: 400, y: 300, size: 20 },
        powerUps: [
            { x: 400, y: 300, size: 12, speed:0, active: true, id: 'touched' },     // this one
            { x: 600, y: 300, size: 12, speed:0, active: true, id: 'far' }          // this one is 200px away
        ],
        tripleShotTimer: 0
    }

    updatePowerUps(game, 0.1, { height: 600 })

    assert.closeTo(game.tripleShotTimer, 30, 0.2)  // allow small floating-point error
    assert.equal(game.powerUps.length, 1)
    assert.equal(game.powerUps[0].id, 'far')  // only the far one remains
})

test('triple shot timer decreases and stops at 0', () => {
    const game = {
        player: { x: 400, y: 500, size: 20 },
        powerUps: [],
        tripleShotTimer: 10
    }

    updatePowerUps(game, 3, { height: 600 })
    assert.closeTo(game.tripleShotTimer, 7, 0.01)

    updatePowerUps(game, 10, { height: 600 })
    assert.equal(game.tripleShotTimer, 0)
})