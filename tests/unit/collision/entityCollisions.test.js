// tests/unit/collision/entityCollisions.test.js
import { test, assert } from 'vitest'
import { checkPlayerEnemyCollision } from '../../../js/systems/collision/entityCollisions.js'

test('player ramming formation enemy kills enemy and calls onPlayerHit', () => {
    const game = {
        player: { x: 400, y: 500, size: 20 },
        enemies: [
            { x: 400, y: 520, size: 20, state: 'formation' }
        ]
    }

    let playerHit = false
    const result = checkPlayerEnemyCollision(game, () => { playerHit = true })

    assert.isTrue(result)
    assert.isTrue(playerHit)
    assert.equal(game.enemies[0].state, 'dying')
    assert.closeTo(game.enemies[0].dyingTimer, 0.3, 0.01)
})

test('dying enemies are ignored', () => {
    const game = {
        player: { x: 400, y: 500, size: 20 },
        enemies: [
            { x: 400, y: 520, size: 20, state: 'dying' }
        ]
    }

    let playerHit = false
    const result = checkPlayerEnemyCollision(game, () => { playerHit = true })

    assert.isFalse(result)
    assert.isFalse(playerHit)
})

test('waiting enemies are ignored', () => {
    const game = {
        player: { x: 400, y: 500, size: 20 },
        enemies: [
            { x: 400, y: 520, size: 20, state: 'waiting' }
        ]
    }

    const result = checkPlayerEnemyCollision(game, () => {})

    assert.isFalse(result)
})

test('attacking enemies kill player on contact', () => {
    const game = {
        player: { x: 400, y: 500, size: 20 },
        enemies: [
            { x: 400, y: 520, size: 20, state: 'attacking' }
        ]
    }

    let playerHit = false
    const result = checkPlayerEnemyCollision(game, () => { playerHit = true })

    assert.isTrue(result)
    assert.isTrue(playerHit)
    assert.equal(game.enemies[0].state, 'dying')
})

test('no collision when far apart', () => {
    const game = {
        player: { x: 400, y: 500, size: 20 },
        enemies: [
            { x: 100, y: 100, size: 20, state: 'formation' }
        ]
    }

    const result = checkPlayerEnemyCollision(game, () => {})

    assert.isFalse(result)
})

test('only first colliding enemy triggers hit', () => {
    const game = {
        player: { x: 400, y: 500, size: 20 },
        enemies: [
            { x: 400, y: 520, size: 20, state: 'formation' },  // this one hits
            { x: 410, y: 520, size: 20, state: 'formation' }   // this one would also hit
        ]
    }

    let hitCount = 0
    checkPlayerEnemyCollision(game, () => { hitCount++ })

    assert.equal(hitCount, 1)  // only called once
    assert.equal(game.enemies[0].state, 'dying')
    assert.equal(game.enemies[1].state, 'formation')  // second one untouched
})