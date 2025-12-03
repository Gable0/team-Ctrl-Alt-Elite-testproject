import { test, assert } from 'vitest'
import { createInitialGame } from '../../js/state/gameState.js'
import { checkPlayerEnemyCollision } from '../../js/systems/collision/entityCollisions.js'
import { handlePlayerHit } from '../../js/state/gameState.js'
beforeAll(() => {
    global.canvasRef = { width: 800, height: 600 }
})
test('INTEGRATION: Player rams enemy — BOTH DIE', () => {
    const game = createInitialGame()
    game.player = { x: 400, y: 500, size: 20 }
    game.enemies.push({ x: 400, y: 520, size: 20, state: 'formation' })

    checkPlayerEnemyCollision(game, () => handlePlayerHit(game))

    assert.equal(game.enemies[0].state, 'dying')
    assert.equal(game.lives, 2)
    console.log('KAMIKAZE SUCCESS — BOTH DIED — GALAGA AUTHENTIC')
})