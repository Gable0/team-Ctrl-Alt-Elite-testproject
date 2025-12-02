// tests/unit/systems/enemyAttack.test.js
import { test, assert } from 'vitest'
import {
    initEnemyAttack,
    selectAttackingEnemy,
    startEnemyAttack,
    updateAttackingEnemy
} from '../../../js/systems/enemyAttack.js'

beforeAll(() => {
    initEnemyAttack({ width: 800, height: 600 })
})

test('selectAttackingEnemy picks valid enemy', () => {
    const enemies = [
        { state: 'formation', isAttacking: false },
        { state: 'formation', isAttacking: true },
        { state: 'formation', isAttacking: false }
    ]
    const chosen = selectAttackingEnemy(enemies)
    assert.notEqual(chosen, null)
    assert.isFalse(chosen.isAttacking)
})

test('selectAttackingEnemy returns null when none available', () => {
    const enemies = [{ state: 'dying' }, { state: 'formation', isAttacking: true }]
    assert.isNull(selectAttackingEnemy(enemies))
})

test('startEnemyAttack creates 5-point path and sets state', () => {
    const enemy = { x: 400, y: 100, finalX: 400, finalY: 200 }
    const player = { x: 420, y: 500 }

    startEnemyAttack(enemy, player)

    assert.isTrue(enemy.isAttacking)
    assert.equal(enemy.state, 'attacking')
    assert.equal(enemy.attackPath.length, 5)
    assert.equal(enemy.attackPathIndex, 0)
    assert.equal(enemy.attackSpeed, 250)
})

test('updateAttackingEnemy moves along path correctly', () => {
    const enemy = {
        x: 400,
        y: 100,
        attackPath: [
            { x: 400, y: 100 },
            { x: 500, y: 400 },
            { x: 900, y: 700 },
            { x: 400, y: -80 },
            { x: 400, y: 200 }
        ],
        attackPathIndex: 0,
        attackSpeed: 250
    }

    updateAttackingEnemy(enemy, 0.4)

    const dx = 100
    const dy = 300
    const dist = Math.hypot(dx, dy)
    const ratio = 100 / dist
    const expectedX = 400 + dx * ratio
    const expectedY = 100 + dy * ratio

    assert.closeTo(enemy.x, expectedX, 1)
    assert.closeTo(enemy.y, expectedY, 1)
})
