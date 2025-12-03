import { test, assert } from 'vitest'
import {
    getEnemyHitbox,
    getPlayerHitbox,
    getShotHitbox,
    getEnemyShotHitbox
} from '../../../js/systems/collision/hitboxes.js'

test('getEnemyHitbox returns wider and taller box centered on enemy', () => {
    const enemy = { x: 400, y: 200, size: 20 }
    const box = getEnemyHitbox(enemy)

    // width = 20 * 1.7 = 34 → half = 17
    // height = 20 * 1.3 = 26 → half = 13
    assert.closeTo(box.x, 400 - 17, 0.1)
    assert.closeTo(box.y, 200 - 13, 0.1)
    assert.closeTo(box.width, 34, 0.1)
    assert.closeTo(box.height, 26, 0.1)
})

test('getPlayerHitbox returns tall narrow box centered on player', () => {
    const player = { x: 400, y: 500, size: 20 }
    const box = getPlayerHitbox(player)

    // width = 20 * 1.2 = 24 → half = 12
    // height = 20 * 2 = 40 → half = 20
    assert.closeTo(box.x, 400 - 12, 0.1)
    assert.closeTo(box.y, 500 - 20, 0.1)
    assert.closeTo(box.width, 24, 0.1)
    assert.closeTo(box.height, 40, 0.1)
})

test('getShotHitbox returns vertical rectangle for active player shot', () => {
    const shot = { x: 400, y: 300, active: true }
    const box = getShotHitbox(shot)

    assert.equal(box.width, 5)
    assert.equal(box.height, 26)
    assert.equal(box.x, 400 - 2.5)
    assert.equal(box.y, 300 - 13)
})

test('getShotHitbox returns null for inactive shot', () => {
    const shot = { x: 400, y: 300, active: false }
    const box = getShotHitbox(shot)
    assert.isNull(box)
})

test('getEnemyShotHitbox returns perfect circle hitbox centered on shot', () => {
    const shot = { x: 400, y: 200, size: 6 }
    const box = getEnemyShotHitbox(shot)

    // diameter = 12 → radius = 6
    assert.equal(box.width, 12)
    assert.equal(box.height, 12)
    assert.equal(box.x, 400 - 6)
    assert.equal(box.y, 200 - 6)
})

test('getEnemyShotHitbox handles null shot', () => {
    const box = getEnemyShotHitbox(null)
    assert.isNull(box)
})