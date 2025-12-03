// tests/integration/04-level-progression.test.js
import { test, assert } from 'vitest'
import { createInitialGame, handleLevelProgression, updateLevelTransition } from '../../js/state/gameState.js'
import { spawnEnemyWave, updateEnemies, initEnemyModule } from '../../js/entities/enemyManager.js'

test('Level 1 → kill all enemies → level becomes 2', () => {
    const game = createInitialGame()
    initEnemyModule({ width: 800, height: 600 }, {})

    spawnEnemyWave(game)
    assert.equal(game.level, 1)

    // Kill and remove all enemies
    game.enemies.forEach(e => {
        e.state = 'dying'
        e.dyingTimer = 0
    })
    updateEnemies(game, 100)
    assert.equal(game.enemies.length, 0)

    // Run progression ONLY until level changes — no more
    let attempts = 0
    while (game.level === 1 && attempts < 100) {
        updateLevelTransition(game, 0.1)
        handleLevelProgression(game, 0.1, spawnEnemyWave)
        attempts++
    }

    assert.equal(game.level, 2)
    console.log(`LEVEL 2 REACHED after ${attempts} attempts — PERFECT`)
})