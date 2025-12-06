import { test, assert } from 'vitest';
import { getActiveSkin, equipSkin } from '../../../js/skins/skinsManager.js';

// Clear localStorage before every test
test.beforeEach(() => {
  localStorage.clear();
});

test('starts with default skin', () => {
  assert.equal(getActiveSkin(), 'default');
});

test('equips squarePack when owned', () => {
  localStorage.setItem('squarePackOwned', 'true');
  equipSkin('squarePack');
  assert.equal(getActiveSkin(), 'squarePack');
});

test('does NOT equip squarePack if not owned', () => {
  equipSkin('squarePack');
  assert.equal(getActiveSkin(), 'default');
});

test('can switch back to default skin', () => {
  localStorage.setItem('squarePackOwned', 'true');
  equipSkin('squarePack');
  equipSkin('default');
  assert.equal(getActiveSkin(), 'default');
});

test('refuses to equip random unknown skin', () => {
  equipSkin('rainbow-unicorn-pack');
  assert.equal(getActiveSkin(), 'default');
});
