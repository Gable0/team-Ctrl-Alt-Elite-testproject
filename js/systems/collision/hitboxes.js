export function getEnemyHitbox(enemy) {
  const width = enemy.size * 1.7;
  const height = enemy.size * 1.3;
  return {
    x: enemy.x - width / 2,
    y: enemy.y - height / 2,
    width,
    height,
  };
}

export function getPlayerHitbox(player) {
  const width = player.size * 1.2;
  const height = player.size * 2;
  return {
    x: player.x - width / 2,
    y: player.y - height / 2,
    width,
    height,
  };
}

export function getShotHitbox(shot) {
  if (!shot || shot.active === false) return null;

  // Player bullet - small vertical rectangle
  const width = 5;
  const height = 26;
  return {
    x: shot.x - width / 2,
    y: shot.y - height / 2,
    width,
    height,
  };
}

export function getEnemyShotHitbox(shot) {
  if (!shot) return null;
  const s = shot.size;
  return {
    x: shot.x - s,
    y: shot.y - s,
    width: s * 2,
    height: s * 2,
  };
}
